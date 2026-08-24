(() => {
  const $ = (sel, root=document) => root.querySelector(sel);

  function nearestSelect(select, target) {
    if (!select || target == null || target === '') return;
    const number = Number(target);
    if (!Number.isFinite(number)) return;
    const values = [...select.options].map(o => ({ value:o.value, number:Number(o.value) })).filter(x=>Number.isFinite(x.number)).sort((a,b)=>a.number-b.number);
    const choice = values.find(x=>number<=x.number) || values.at(-1);
    if (choice) select.value=choice.value;
  }

  function profile() { return window.EVScanAccount?.getDrivingProfile?.() || {}; }

  function applyFinderProfile() {
    if (!window.EVScanAccount?.isLoggedIn) return;
    const p=profile(); if(!Object.keys(p).length) return;
    nearestSelect($('#finder-daily'), p.dailyMiles);
    nearestSelect($('#finder-long'), p.longestTrip);
    if (p.homeCharging === 'yes' || p.homeCharging === 'no') $('#finder-home').value=p.homeCharging;
    const priorities=Array.isArray(p.priorities)?p.priorities:[];
    const priority=$('#finder-priority');
    const preferred=priorities.find(x=>[...priority?.options||[]].some(o=>o.value===x));
    if(priority&&preferred)priority.value=preferred;
    const dialog=$('.finder-dialog');
    if(dialog&&!$('.account-profile-used',dialog)){
      const note=document.createElement('div');note.className='account-profile-used';note.textContent='✓ Started with your saved Driving Profile — change anything for this search.';
      const form=$('#finder-form');form?.before(note);
    }
  }

  function applyFitProfile() {
    if (!window.EVScanAccount?.isLoggedIn) return;
    const p=profile(); if(!Object.keys(p).length) return;
    nearestSelect($('#fit-daily'), p.dailyMiles);
    nearestSelect($('#fit-long'), p.longestTrip);
    if (p.homeCharging === 'yes' || p.homeCharging === 'no') $('#fit-home').value=p.homeCharging;
    if (['rare','sometimes','often'].includes(p.motorwayFrequency)) $('#fit-motorway').value=p.motorwayFrequency;
    const form=$('#quick-fit-form');
    if(form&&!$('.account-profile-used',form.parentElement)){
      const note=document.createElement('div');note.className='account-profile-used';note.textContent='✓ Using your saved Driving Profile as the starting point.';
      form.before(note);
    }
  }

  function installSeoHeaderLogin() {
    const header=$('.seo-header'); if(!header||$('.account-entry',header)||!window.EVScanAccount)return;
    const nav=$('nav',header); if(!nav)return;
    const wrap=document.createElement('span');wrap.className='account-entry';
    wrap.innerHTML=window.EVScanAccount.isLoggedIn?'<button class="account-user-button" type="button" data-account-dashboard><span class="account-avatar">EV</span><span class="account-user-label">My EV Scan</span></button>':'<button class="account-login-button" type="button" data-account-auth>Log in</button>';
    const cta=$('.seo-nav-cta',nav);nav.insertBefore(wrap,cta||null);
  }

  function installStyle() {
    if($('#account-personalisation-style'))return;
    const style=document.createElement('style');style.id='account-personalisation-style';style.textContent='.account-profile-used{margin:10px 0 16px;padding:10px 12px;border:1px solid var(--border);border-radius:11px;background:var(--account-accent-soft);color:var(--account-accent);font-size:.75rem;font-weight:760}.seo-header .account-entry{display:inline-flex;margin-right:8px}.seo-header .account-login-button,.seo-header .account-user-button{min-height:36px}';document.head.appendChild(style);
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-open-finder]'))setTimeout(applyFinderProfile,20);
    if(e.target.closest('#quick-fit-toggle'))setTimeout(applyFitProfile,20);
  });

  let attempts=0;
  const timer=setInterval(()=>{
    attempts+=1;
    if(window.EVScanAccount){installStyle();installSeoHeaderLogin();applyFinderProfile();applyFitProfile();clearInterval(timer)}
    if(attempts>40)clearInterval(timer);
  },125);
})();
