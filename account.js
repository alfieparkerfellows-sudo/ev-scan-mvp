(() => {
  const $ = (sel, root = document) => root?.querySelector?.(sel) || null;
  const $$ = (sel, root = document) => [...(root?.querySelectorAll?.(sel) || [])];
  const esc = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  const state = { configured:false, user:null, scans:[], garage:[], activeTab:'overview', compareIds:new Set(), authMode:'login' };

  async function api(path, options = {}) {
    const response = await fetch(path, { credentials:'same-origin', ...options, headers:{ 'content-type':'application/json', ...(options.headers||{}) } });
    let data = {};
    try { data = await response.json(); } catch {}
    if (!response.ok) {
      const error = new Error(data.message || 'That did not work. Please try again.');
      error.status = response.status; error.code = data.code; error.data = data;
      throw error;
    }
    return data;
  }

  function toast(message) {
    const old = $('.account-save-toast'); old?.remove();
    const el = document.createElement('div'); el.className='account-save-toast'; el.textContent=message; document.body.appendChild(el);
    setTimeout(()=>el.remove(),2800);
  }

  function applyProfile(profile = {}) {
    const requested = profile.theme || 'system';
    const theme = requested === 'system' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : requested;
    document.documentElement.dataset.evTheme = theme;
    document.documentElement.dataset.evAccent = profile.accent || 'pink';
    document.documentElement.dataset.evDensity = profile.density || 'comfortable';
    document.documentElement.dataset.evReduceMotion = profile.reduceMotion ? 'true' : 'false';
  }

  function resetProfile() {
    delete document.documentElement.dataset.evTheme;
    delete document.documentElement.dataset.evAccent;
    delete document.documentElement.dataset.evDensity;
    delete document.documentElement.dataset.evReduceMotion;
  }

  function initials() {
    const name = state.user?.profile?.displayName?.trim();
    if (name) return name.split(/\s+/).slice(0,2).map(x=>x[0]?.toUpperCase()).join('');
    return state.user?.email?.[0]?.toUpperCase() || 'E';
  }

  function installHeaderButtons() {
    const header = $('.site-header');
    if (header && !$('.account-entry', header)) {
      const wrap = document.createElement('div'); wrap.className='account-entry'; wrap.innerHTML='<button class="account-login-button" type="button" data-account-auth>Log in</button>';
      const scanButton = $('[data-scroll-home]', header);
      header.insertBefore(wrap, scanButton || null);
    }
    const reportHeader = $('.report-header');
    if (reportHeader && !$('.account-report-actions', reportHeader)) {
      const wrap = document.createElement('div'); wrap.className='account-report-actions';
      wrap.innerHTML='<button class="account-mini-button" type="button" data-account-save-scan>♡ Save</button><button class="account-mini-button" type="button" data-account-shortlist>＋ Shortlist</button><button class="account-mini-button accent" type="button" data-account-dashboard>My EV Scan</button>';
      const back = $('[data-close-report]', reportHeader);
      reportHeader.insertBefore(wrap, back || null);
    }
  }

  function installBenefits() {
    if ($('#account-benefits')) return;
    const section = document.createElement('section');
    section.id='account-benefits'; section.className='account-benefits-section';
    section.innerHTML=`<div class="account-benefits-card"><div><div class="eyebrow">Optional account</div><h3>Make EV Scan remember the useful bits.</h3><p>You never need an account to scan a car. Create one only if you want EV Scan to remember your shortlist, driving profile and the EV you eventually buy.</p></div><div class="account-benefit-chips"><span>Saved scans</span><span>Shortlist + compare</span><span>My Garage</span><span>MOT reminders</span><span>Driving profile</span><span>Theme controls</span></div><button class="ghost-button compact account-open-auth" type="button" data-account-auth>Why log in?</button></div>`;
    const faq = $('#evscan-faq');
    if (faq) faq.before(section); else $('.site-footer')?.before(section);
  }

  function authBenefits() {
    return `<div class="account-dialog-benefits"><div class="eyebrow">My EV Scan</div><h2>Useful while you’re buying.<br>Still useful after.</h2><p>Signing in is optional. It simply lets EV Scan remember things between visits and across devices.</p><div class="account-benefit-list">
      <div class="account-benefit-item"><span class="account-benefit-icon">♡</span><div><b>Save scans and build a shortlist</b><small>Come back to cars later instead of starting again.</small></div></div>
      <div class="account-benefit-item"><span class="account-benefit-icon">⇄</span><div><b>Compare the cars you actually found</b><small>Compare deal score, range, battery confidence and other scan results side by side.</small></div></div>
      <div class="account-benefit-item"><span class="account-benefit-icon">⌁</span><div><b>Remember how you drive</b><small>Save your normal mileage, charging access and priorities so future scans can become more personal.</small></div></div>
      <div class="account-benefit-item"><span class="account-benefit-icon">◷</span><div><b>Keep track after you buy</b><small>Move your EV into My Garage and keep MOT, service and warranty dates together.</small></div></div>
      <div class="account-benefit-item"><span class="account-benefit-icon">✦</span><div><b>Make it yours</b><small>Choose light/dark mode, an accent colour, layout density and motion preferences.</small></div></div>
    </div></div>`;
  }

  function installAuthModal() {
    if ($('#account-overlay')) return;
    const overlay = document.createElement('div'); overlay.id='account-overlay'; overlay.className='account-overlay'; overlay.hidden=true;
    overlay.innerHTML=`<div class="account-dialog" role="dialog" aria-modal="true" aria-labelledby="account-auth-title">${authBenefits()}<div class="account-dialog-form"><button class="account-close" type="button" data-account-close aria-label="Close">×</button><div class="account-tabs"><button type="button" class="active" data-auth-mode="login">Log in</button><button type="button" data-auth-mode="register">Create account</button></div><form class="account-auth-form" id="account-auth-form"><h3 id="account-auth-title">Welcome back.</h3><p id="account-auth-copy">Pick up your shortlist, saved scans and garage.</p><label class="account-field"><span>Email</span><input type="email" name="email" autocomplete="email" required placeholder="you@example.com"></label><label class="account-field"><span>Password</span><input type="password" name="password" autocomplete="current-password" required minlength="10" maxlength="128" placeholder="Your password"></label><div class="account-message" id="account-message"></div><button class="primary-button account-submit" type="submit">Log in</button><p class="account-auth-note">Scanning stays free without an account. We only ask you to sign in when you want us to save something.</p></form></div></div>`;
    document.body.appendChild(overlay);
  }

  function setAuthMode(mode='login') {
    state.authMode = mode;
    $$('[data-auth-mode]').forEach(b=>b.classList.toggle('active',b.dataset.authMode===mode));
    const form=$('#account-auth-form'); if(!form) return;
    const register = mode==='register';
    $('#account-auth-title').textContent = register ? 'Create your free account.' : 'Welcome back.';
    $('#account-auth-copy').textContent = register ? 'Two fields. No forced onboarding. Personalise it later if you want.' : 'Pick up your shortlist, saved scans and garage.';
    $('input[name="password"]',form).autocomplete = register ? 'new-password' : 'current-password';
    $('.account-submit',form).textContent = register ? 'Create account' : 'Log in';
    $('#account-message').textContent=''; $('#account-message').className='account-message';
  }

  function openAuth(mode='login') { setAuthMode(mode); $('#account-overlay').hidden=false; document.body.classList.add('modal-open'); }
  function closeAuth() { $('#account-overlay').hidden=true; if($('#scan-overlay')?.hidden!==false && $('#finder-modal')?.hidden!==false) document.body.classList.remove('modal-open'); }

  async function refreshData() {
    if (!state.user) { state.scans=[]; state.garage=[]; return; }
    const [scans,garage] = await Promise.all([api('/api/account/scans').catch(()=>({scans:[]})),api('/api/account/garage').catch(()=>({vehicles:[]}))]);
    state.scans=scans.scans||[]; state.garage=garage.vehicles||[];
  }

  function renderHeaderState() {
    $$('.account-entry').forEach(wrap=>{
      wrap.innerHTML = state.user ? `<button class="account-user-button" type="button" data-account-dashboard><span class="account-avatar">${esc(initials())}</span><span class="account-user-label">My EV Scan</span></button>` : '<button class="account-login-button" type="button" data-account-auth>Log in</button>';
    });
    $$('[data-account-dashboard]').forEach(button=>{ if(button.closest('.account-report-actions')) button.hidden=!state.user; });
  }

  async function handleAuthSubmit(form) {
    const msg=$('#account-message'); const submit=$('.account-submit',form); const fd=new FormData(form);
    msg.textContent=''; msg.className='account-message'; submit.disabled=true; submit.textContent=state.authMode==='register'?'Creating…':'Signing in…';
    try {
      const data=await api(state.authMode==='register'?'/api/auth/register':'/api/auth/login',{method:'POST',body:JSON.stringify({email:fd.get('email'),password:fd.get('password')})});
      state.user=data.user; applyProfile(state.user.profile); await refreshData(); renderHeaderState(); closeAuth();
      toast(state.authMode==='register'?'Account created — welcome to My EV Scan.':'Welcome back.');
      openDashboard(state.authMode==='register'?'overview':state.activeTab);
    } catch(error) {
      msg.textContent=error.message; msg.className='account-message error';
    } finally { submit.disabled=false; submit.textContent=state.authMode==='register'?'Create account':'Log in'; }
  }

  function daysUntil(dateValue) {
    if(!dateValue) return null; const date=new Date(`${dateValue}`.slice(0,10)+'T12:00:00'); if(Number.isNaN(date.getTime())) return null;
    return Math.ceil((date.getTime()-Date.now())/86400000);
  }
  function prettyDate(v){if(!v)return 'Not set';const d=new Date(`${v}`.slice(0,10)+'T12:00:00');return Number.isNaN(d.getTime())?'Not set':d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
  function dueClass(days){return days==null?'':days<0?'overdue':days<=30?'due-soon':''}
  function dueText(days){if(days==null)return 'Date not set';if(days<0)return `${Math.abs(days)} day${Math.abs(days)===1?'':'s'} overdue`;if(days===0)return 'Due today';return `${days} day${days===1?'':'s'} remaining`}

  function reminders() {
    const prefs=state.user?.profile?.notifications||{}; const result=[];
    for(const v of state.garage){
      const items=[['MOT','motExpiry',prefs.mot!==false],['Service','serviceDue',prefs.service!==false],['Battery warranty','batteryWarrantyEnd',prefs.warranty!==false],['Tax / VED','taxDue',true]];
      for(const [label,key,enabled] of items){const date=v[key];const days=daysUntil(date);if(enabled&&date&&days!=null&&days<=60)result.push({vehicle:v,label,key,date,days});}
    }
    return result.sort((a,b)=>a.days-b.days);
  }

  function nav() {
    const tabs=[['overview','Overview'],['saved','Saved scans'],['shortlist','Shortlist'],['compare','Compare'],['garage','My Garage'],['driving','Driving profile'],['preferences','Preferences']];
    return `<aside class="account-sidebar">${tabs.map(([key,label])=>`<button type="button" data-account-tab="${key}" class="${state.activeTab===key?'active':''}">${label}</button>`).join('')}</aside>`;
  }

  function dashboardShell() {
    let root=$('#account-dashboard');
    if(!root){root=document.createElement('div');root.id='account-dashboard';root.className='account-dashboard';root.hidden=true;document.body.appendChild(root);}
    root.dataset.density=state.user?.profile?.density||'comfortable';
    root.innerHTML=`<div class="account-dashboard-shell"><header class="account-dashboard-header"><a class="brand" href="#" data-dashboard-close><span class="brand-mark">⚡</span><span>EV Scan</span></a><div class="account-dashboard-header-actions"><button class="ghost-button compact" type="button" data-dashboard-close>Back to EV Scan</button></div></header><div class="account-dashboard-layout">${nav()}<main class="account-main" id="account-main">${renderActive()}</main></div></div>`;
  }

  function renderActive(){return ({overview:renderOverview,saved:()=>renderScans(false),shortlist:()=>renderScans(true),compare:renderCompare,garage:renderGarage,driving:renderDriving,preferences:renderPreferences}[state.activeTab]||renderOverview)()}

  function renderOverview(){
    const upcoming=reminders(); const name=state.user?.profile?.displayName?.trim()?.split(/\s+/)[0]||'';
    return `<div class="account-page-head"><div><div class="eyebrow">My EV Scan</div><h1>${name?`Hi ${esc(name)}.`:'Your EVs, remembered.'}</h1><p>Everything useful from researching a car through to owning it.</p></div><button class="primary-button compact" type="button" data-dashboard-close>Scan another car</button></div>
      <div class="account-kpi-row"><div class="account-kpi"><span class="account-stat-label">Saved scans</span><b>${state.scans.length}</b></div><div class="account-kpi"><span class="account-stat-label">Shortlisted</span><b>${state.scans.filter(x=>x.shortlist).length}</b></div><div class="account-kpi"><span class="account-stat-label">My Garage</span><b>${state.garage.length}</b></div><div class="account-kpi"><span class="account-stat-label">Upcoming reminders</span><b>${upcoming.length}</b></div></div>
      <div class="account-grid"><section class="account-card full"><div class="account-page-head"><div><h2>What needs your attention</h2><p>MOT, service and warranty dates from My Garage.</p></div><button class="account-mini-button" data-account-tab="garage">Manage garage</button></div>${upcoming.length?`<div class="account-list">${upcoming.slice(0,5).map(reminderHtml).join('')}</div>`:`<div class="account-empty"><b>Nothing due soon.</b>Add an EV to My Garage and its important dates will appear here.</div>`}</section>
      <section class="account-card"><h3>Shortlist</h3><p>Keep the cars you are genuinely considering in one place, then compare the evidence rather than relying on memory.</p><button class="account-mini-button accent" data-account-tab="shortlist">Open shortlist (${state.scans.filter(x=>x.shortlist).length})</button></section>
      <section class="account-card"><h3>Driving profile</h3><p>${profileSummary()}</p><button class="account-mini-button" data-account-tab="driving">${hasDrivingProfile()?'Edit profile':'Set it up'}</button></section></div>`;
  }

  function profileSummary(){const p=state.user?.profile?.drivingProfile||{};if(!Object.keys(p).length)return 'Tell us how far you drive and where you charge. We can reuse it when personalising future EV checks.';const home=p.homeCharging==='yes'?'home charging':p.homeCharging==='no'?'no home charging':'charging not confirmed';return `${p.dailyMiles||'?'} miles on a normal day · ${home} · ${p.motorwayFrequency||'motorway use not set'}.`}
  function hasDrivingProfile(){return Object.keys(state.user?.profile?.drivingProfile||{}).length>0}

  function scanSummary(scan){const s=scan.score||{};return [s.dealScore?`Score ${s.dealScore}`:'',s.askingPrice||'',s.range||'',s.battery||'',scan.registration||''].filter(Boolean)}
  function scanCard(scan, shortlistView=false){return `<article class="saved-scan-card ${scan.shortlist?'shortlisted':''}" data-scan-id="${esc(scan.id)}"><div><h3>${esc(scan.title)}</h3><div class="saved-scan-meta">${scanSummary(scan).map(x=>`<span>${esc(x)}</span>`).join('')}<span>Saved ${new Date(scan.savedAt).toLocaleDateString('en-GB')}</span></div></div><div class="account-card-actions"><button class="account-mini-button ${scan.shortlist?'accent':''}" data-toggle-shortlist="${esc(scan.id)}">${scan.shortlist?'★ Shortlisted':'☆ Shortlist'}</button>${scan.shortlist?`<button class="account-mini-button" data-compare-toggle="${esc(scan.id)}">${state.compareIds.has(scan.id)?'✓ Compare':'Compare'}</button>`:''}<button class="account-mini-button danger" data-delete-scan="${esc(scan.id)}">Remove</button></div></article>`}

  function renderScans(shortlistOnly=false){const list=shortlistOnly?state.scans.filter(x=>x.shortlist):state.scans;return `<div class="account-page-head"><div><div class="eyebrow">${shortlistOnly?'Buying shortlist':'Scan history'}</div><h1>${shortlistOnly?'Cars worth another look':'Saved scans'}</h1><p>${shortlistOnly?'Keep the serious candidates here and compare up to four side by side.':'Save a report when you want to come back to it later.'}</p></div>${shortlistOnly&&list.length>1?'<button class="primary-button compact" data-account-tab="compare">Compare selected</button>':''}</div>${list.length?`<div class="account-list">${list.map(x=>scanCard(x,shortlistOnly)).join('')}</div>`:`<div class="account-empty"><b>${shortlistOnly?'Your shortlist is empty.':'No scans saved yet.'}</b>${shortlistOnly?'Shortlist a saved scan when it is genuinely in the running.':'Open any EV Scan report and tap Save.'}</div>`}`}

  function compareValue(scan,key){const s=scan.score||{};const map={price:s.askingPrice||'Unknown',score:s.dealScore||'Unknown',battery:s.battery||'Unknown',range:s.range||'Unknown',mot:s.mot||'Unknown',confidence:s.decisionConfidence||'Unknown'};return map[key]}
  function renderCompare(){const short=state.scans.filter(x=>x.shortlist);const selected=short.filter(x=>state.compareIds.has(x.id)).slice(0,4);const columns=selected.length||2;return `<div class="account-page-head"><div><div class="eyebrow">Your shortlist</div><h1>Compare your actual cars.</h1><p>Select 2–4 shortlisted scans. This compares the evidence from those reports, not generic model specifications.</p></div></div>${short.length?`<div class="account-card full" style="margin-bottom:14px"><div class="account-list">${short.map(s=>`<label class="account-toggle-row"><div><b>${esc(s.title)}</b><small>${esc(scanSummary(s).join(' · ')||'Saved scan')}</small></div><label class="account-switch"><input type="checkbox" data-compare-checkbox="${esc(s.id)}" ${state.compareIds.has(s.id)?'checked':''}><span></span></label></label>`).join('')}</div></div>`:'<div class="account-empty"><b>Nothing to compare yet.</b>Add two cars to your shortlist first.</div>'}${selected.length>=2?`<div class="account-compare-grid" style="--compare-count:${columns}"><div class="compare-label">Compare</div>${selected.map(s=>`<div class="compare-heading">${esc(s.title)}</div>`).join('')}${[['score','Deal score'],['price','Asking price'],['battery','Battery'],['range','Range'],['mot','MOT'],['confidence','Decision confidence']].map(([key,label])=>`<div class="compare-label">${label}</div>${selected.map(s=>`<div>${esc(compareValue(s,key))}</div>`).join('')}`).join('')}</div>`:short.length?'<div class="account-empty" style="margin-top:14px"><b>Select at least two cars.</b>You can compare up to four at once.</div>':''}`}

  function reminderHtml(item){return `<div class="reminder-row"><div class="reminder-copy"><b>${esc(item.vehicle.nickname||`${item.vehicle.make} ${item.vehicle.model}`)} · ${esc(item.label)}</b><span class="${dueClass(item.days)}">${esc(prettyDate(item.date))} · ${esc(dueText(item.days))}</span></div><button class="account-mini-button" data-calendar-reminder="${esc(item.vehicle.id)}|${esc(item.key)}">Add to calendar</button></div>`}
  function garageCard(v){const dates=[['MOT',v.motExpiry,'motExpiry'],['Service',v.serviceDue,'serviceDue'],['Battery warranty',v.batteryWarrantyEnd,'batteryWarrantyEnd']];return `<article class="garage-card" data-garage-id="${esc(v.id)}"><div class="garage-card-top"><div><span class="account-pill">Owned EV</span><h3>${esc(v.nickname||`${v.make} ${v.model}`||'My EV')}</h3><div class="saved-scan-meta">${v.registration?`<span>${esc(v.registration)}</span>`:''}${v.make||v.model?`<span>${esc(`${v.make} ${v.model}`.trim())}</span>`:''}</div></div><div class="account-card-actions"><button class="account-mini-button danger" data-delete-garage="${esc(v.id)}">Remove</button></div></div><div class="garage-dates">${dates.map(([label,date,key])=>{const days=daysUntil(date);return `<div class="garage-date"><span>${label}</span><b class="${dueClass(days)}">${esc(prettyDate(date))}</b>${date?`<button class="account-mini-button" style="margin-top:8px" data-calendar-reminder="${esc(v.id)}|${key}">Calendar</button>`:''}</div>`}).join('')}</div></article>`}

  function renderGarage(){return `<div class="account-page-head"><div><div class="eyebrow">After you buy</div><h1>My Garage</h1><p>Keep ownership dates somewhere useful. EV Scan will flag upcoming MOT, service and battery-warranty dates when you visit.</p></div><button class="primary-button compact" data-toggle-garage-form>Add an EV</button></div><div class="account-card full" id="garage-add-card" hidden><form id="garage-form" class="account-form-grid"><label class="account-field"><span>Nickname</span><input name="nickname" placeholder="My Model 3"></label><label class="account-field"><span>Registration</span><input name="registration" maxlength="8" placeholder="AB12 CDE"></label><label class="account-field"><span>Make</span><input name="make" placeholder="Tesla"></label><label class="account-field"><span>Model</span><input name="model" placeholder="Model 3"></label><label class="account-field"><span>MOT expiry</span><input name="motExpiry" type="date"></label><label class="account-field"><span>Next service (optional)</span><input name="serviceDue" type="date"></label><label class="account-field"><span>Battery warranty ends (optional)</span><input name="batteryWarrantyEnd" type="date"></label><label class="account-field"><span>Tax / VED renewal (optional)</span><input name="taxDue" type="date"></label><label class="account-field wide"><span>Notes (optional)</span><textarea name="notes" rows="3" placeholder="Anything worth remembering about this EV"></textarea></label><div class="wide"><button class="primary-button compact" type="submit">Add to My Garage</button></div></form></div><div style="height:14px"></div>${state.garage.length?`<div class="account-list">${state.garage.map(garageCard).join('')}</div>`:`<div class="account-empty"><b>No owned EVs added yet.</b>When you buy one, add it here and EV Scan becomes your simple ownership dashboard.</div>`}`}

  function renderDriving(){const p=state.user?.profile?.drivingProfile||{};const priorities=new Set(p.priorities||[]);return `<div class="account-page-head"><div><div class="eyebrow">Reusable preferences</div><h1>Your driving profile</h1><p>Save the things that actually affect whether an EV fits you. We deliberately avoid collecting information we do not need.</p></div></div><section class="account-card full"><form id="driving-profile-form" class="account-form-grid"><label class="account-field"><span>Normal daily mileage</span><input name="dailyMiles" type="number" min="0" max="1000" value="${esc(p.dailyMiles||'')}" placeholder="25"></label><label class="account-field"><span>Annual mileage</span><input name="annualMiles" type="number" min="0" max="100000" value="${esc(p.annualMiles||'')}" placeholder="10000"></label><label class="account-field"><span>Can you charge at home?</span><select name="homeCharging"><option value="" ${!p.homeCharging?'selected':''}>Not set</option><option value="yes" ${p.homeCharging==='yes'?'selected':''}>Yes</option><option value="no" ${p.homeCharging==='no'?'selected':''}>No</option><option value="possible" ${p.homeCharging==='possible'?'selected':''}>Possibly / planned</option></select></label><label class="account-field"><span>Longest regular trip (miles)</span><input name="longestTrip" type="number" min="0" max="1500" value="${esc(p.longestTrip||'')}" placeholder="180"></label><label class="account-field"><span>Motorway use</span><select name="motorwayFrequency"><option value="" ${!p.motorwayFrequency?'selected':''}>Not set</option><option value="rare" ${p.motorwayFrequency==='rare'?'selected':''}>Rarely</option><option value="sometimes" ${p.motorwayFrequency==='sometimes'?'selected':''}>Sometimes</option><option value="often" ${p.motorwayFrequency==='often'?'selected':''}>Often</option><option value="daily" ${p.motorwayFrequency==='daily'?'selected':''}>Most days</option></select></label><label class="account-field"><span>Typical passengers</span><select name="passengers"><option value="" ${!p.passengers?'selected':''}>Not set</option><option value="1" ${p.passengers==='1'?'selected':''}>Just me</option><option value="2" ${p.passengers==='2'?'selected':''}>Two people</option><option value="3-4" ${p.passengers==='3-4'?'selected':''}>3–4 people</option><option value="5+" ${p.passengers==='5+'?'selected':''}>5+ / family</option></select></label><div class="account-field wide"><span>What matters most?</span><div class="account-benefit-chips" id="priority-chips">${[['value','Low purchase cost'],['range','Long range'],['charging','Fast charging'],['space','Space'],['insurance','Lower insurance'],['comfort','Comfort'],['performance','Performance']].map(([key,label])=>`<label><input type="checkbox" name="priority" value="${key}" ${priorities.has(key)?'checked':''}> ${label}</label>`).join('')}</div></div><div class="wide"><button class="primary-button compact" type="submit">Save driving profile</button></div></form></section>`}

  function preferenceToggle(label,copy,key,checked){return `<div class="account-toggle-row"><div><b>${label}</b><small>${copy}</small></div><label class="account-switch"><input type="checkbox" data-pref-toggle="${key}" ${checked?'checked':''}><span></span></label></div>`}
  function renderPreferences(){const p=state.user?.profile||{};return `<div class="account-page-head"><div><div class="eyebrow">Personalise EV Scan</div><h1>Preferences</h1><p>Small controls that make the app feel like yours. They never change a Deal Score.</p></div></div><div class="account-grid"><section class="account-card"><h3>Your profile</h3><label class="account-field"><span>Name shown in My EV Scan</span><input id="display-name" value="${esc(p.displayName||'')}" maxlength="50" placeholder="Your first name is enough"></label><button class="account-mini-button accent" style="margin-top:12px" data-save-display-name>Save name</button></section><section class="account-card"><h3>Appearance</h3><p>Choose a theme. System follows your device.</p><div class="theme-options">${['system','dark','light'].map(x=>`<button type="button" data-theme-choice="${x}" class="${p.theme===x?'active':''}">${x[0].toUpperCase()+x.slice(1)}</button>`).join('')}</div><p style="margin-top:18px">Accent</p><div class="accent-options">${[['pink','EV pink'],['cyan','Electric blue'],['violet','Violet']].map(([key,label])=>`<button type="button" data-accent-choice="${key}" class="${p.accent===key?'active':''}">${label}</button>`).join('')}</div></section><section class="account-card"><h3>Interface</h3>${preferenceToggle('Compact account layout','Fit more saved cars on screen.','density',p.density==='compact')}${preferenceToggle('Reduce motion','Turns off decorative movement and animated transitions.','reduceMotion',p.reduceMotion)}${preferenceToggle('Show advanced EV data','Prefer extra technical detail when we have it.','advancedData',p.advancedData)}</section><section class="account-card"><h3>Ownership reminders</h3>${preferenceToggle('MOT reminders','Show MOT dates approaching in My EV Scan.','notifyMot',p.notifications?.mot!==false)}${preferenceToggle('Service reminders','Show service dates you add to My Garage.','notifyService',p.notifications?.service!==false)}${preferenceToggle('Battery warranty reminders','Flag battery-warranty end dates you save.','notifyWarranty',p.notifications?.warranty!==false)}<p style="font-size:.76rem">These are currently in-app reminders. Calendar export works now; email/push delivery will only be enabled once a reliable notification service is connected.</p></section><section class="account-card full"><h3>Your data</h3><p>You can export what EV Scan stores for your account or delete the account completely.</p><div class="account-card-actions" style="justify-content:flex-start"><button class="account-mini-button" data-export-account>Download my data</button><button class="account-mini-button danger" data-logout>Log out</button><button class="account-mini-button danger" data-delete-account>Delete my account</button></div></section></div>`}

  function renderMain(){const main=$('#account-main');if(main)main.innerHTML=renderActive();$$('[data-account-tab]').forEach(b=>b.classList.toggle('active',b.dataset.accountTab===state.activeTab));}
  function openDashboard(tab='overview'){if(!state.user){openAuth('login');return;}state.activeTab=tab;dashboardShell();$('#account-dashboard').hidden=false;document.body.classList.add('modal-open');}
  function closeDashboard(){$('#account-dashboard').hidden=true;document.body.classList.remove('modal-open')}

  async function saveProfile(patch,message='Preferences saved.') {const data=await api('/api/account/profile',{method:'PUT',body:JSON.stringify(patch)});state.user=data.user;applyProfile(state.user.profile);renderHeaderState();toast(message);return data.user}

  function captureReport(shortlist=false){
    const selected=$('#trim-select option:checked'); const title=selected?.textContent?.trim() || $('.vehicle-summary h1')?.textContent?.trim() || $('.vehicle-title-row strong')?.textContent?.trim() || 'Saved EV';
    const listingUrl=$('#listing-url')?.value?.trim() || $('#rescan-url')?.value?.trim() || '';
    const rawMeta=$('#trim-meta')?.textContent||''; const regMatch=rawMeta.match(/\b[A-Z]{2}\d{2}\s?[A-Z]{3}\b/i);
    const deal=$('.big-score strong')?.textContent?.replace(/\s+/g,' ').trim() || $('.preview-main-score strong')?.textContent?.trim() || '';
    const price=$('.asking-price strong')?.textContent?.trim() || '';
    const battery=$('#battery-soh')?.textContent?.trim() || $('.metric-card:nth-child(2) strong')?.textContent?.trim() || '';
    const range=$('#range-main')?.textContent?.trim() || $('.metric-card:nth-child(3) strong')?.textContent?.trim() || '';
    const mot=$('.mot-score')?.textContent?.trim() || $('.metric-card:nth-child(4) strong')?.textContent?.trim() || '';
    const confidence=$('.decision-confidence strong')?.textContent?.trim() || '';
    return {title,registration:regMatch?.[0]?.replace(/\s/g,'')||null,listingUrl,shortlist,vehicle:{meta:rawMeta},score:{dealScore:deal,askingPrice:price,battery,range,mot,decisionConfidence:confidence}};
  }

  async function saveCurrentReport(shortlist=false){if(!state.user){openAuth('register');toast('Create an account to save this scan.');return;}try{const data=await api('/api/account/scans',{method:'POST',body:JSON.stringify(captureReport(shortlist))});state.scans.unshift(data.scan);toast(shortlist?'Added to your shortlist.':'Scan saved to My EV Scan.');}catch(e){toast(e.message)}}

  async function toggleShortlist(id){const scan=state.scans.find(x=>x.id===id);if(!scan)return;const data=await api(`/api/account/scans/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify({shortlist:!scan.shortlist})});Object.assign(scan,data.scan);if(!scan.shortlist)state.compareIds.delete(id);renderMain();}
  async function deleteScan(id){if(!confirm('Remove this saved scan?'))return;await api(`/api/account/scans/${encodeURIComponent(id)}`,{method:'DELETE'});state.scans=state.scans.filter(x=>x.id!==id);state.compareIds.delete(id);renderMain();}
  async function deleteGarage(id){if(!confirm('Remove this EV from My Garage?'))return;await api(`/api/account/garage/${encodeURIComponent(id)}`,{method:'DELETE'});state.garage=state.garage.filter(x=>x.id!==id);renderMain();}

  function makeCalendar(vehicle,key){const config={motExpiry:['MOT due','MOT'],serviceDue:['Service due','Service'],batteryWarrantyEnd:['Battery warranty ends','Battery warranty'],taxDue:['Tax / VED renewal','Tax / VED']}[key];if(!config)return;const date=vehicle[key];if(!date)return;const start=String(date).slice(0,10).replaceAll('-','');const endDate=new Date(`${date}T12:00:00`);endDate.setDate(endDate.getDate()+1);const end=`${endDate.getFullYear()}${String(endDate.getMonth()+1).padStart(2,'0')}${String(endDate.getDate()).padStart(2,'0')}`;const name=vehicle.nickname||`${vehicle.make} ${vehicle.model}`.trim()||'My EV';const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//EV Scan//Ownership Reminder//EN','BEGIN:VEVENT',`UID:${crypto.randomUUID()}@evscan`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`DTSTART;VALUE=DATE:${start}`,`DTEND;VALUE=DATE:${end}`,`SUMMARY:${config[0]} — ${name}`,`DESCRIPTION:EV Scan reminder for ${name}${vehicle.registration?` (${vehicle.registration})`:''}.`, 'BEGIN:VALARM','TRIGGER:-P30D','ACTION:DISPLAY',`DESCRIPTION:${config[1]} due in 30 days`,'END:VALARM','BEGIN:VALARM','TRIGGER:-P7D','ACTION:DISPLAY',`DESCRIPTION:${config[1]} due in 7 days`,'END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');const blob=new Blob([ics],{type:'text/calendar'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`evscan-${key}-${start}.ics`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Calendar reminder created.');}

  async function exportAccount(){const data=await api('/api/account/export');const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`ev-scan-account-export-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
  async function logout(){await api('/api/auth/logout',{method:'POST'}).catch(()=>{});state.user=null;state.scans=[];state.garage=[];state.compareIds.clear();resetProfile();closeDashboard();renderHeaderState();toast('Logged out. Core EV Scan features are still available.');}
  async function deleteAccount(){if(!confirm('Delete your EV Scan account, saved scans, garage and preferences? This cannot be undone.'))return;await api('/api/account',{method:'DELETE'});state.user=null;state.scans=[];state.garage=[];resetProfile();closeDashboard();renderHeaderState();toast('Your EV Scan account has been deleted.');}

  document.addEventListener('click', async e=>{
    const auth=e.target.closest('[data-account-auth]'); if(auth){openAuth('login');return}
    const close=e.target.closest('[data-account-close]'); if(close){closeAuth();return}
    const mode=e.target.closest('[data-auth-mode]'); if(mode){setAuthMode(mode.dataset.authMode);return}
    const dashboard=e.target.closest('[data-account-dashboard]'); if(dashboard){openDashboard();return}
    if(e.target.closest('[data-dashboard-close]')){e.preventDefault();closeDashboard();return}
    const tab=e.target.closest('[data-account-tab]'); if(tab){state.activeTab=tab.dataset.accountTab;renderMain();return}
    if(e.target.closest('[data-account-save-scan]')){saveCurrentReport(false);return}
    if(e.target.closest('[data-account-shortlist]')){saveCurrentReport(true);return}
    const shortlist=e.target.closest('[data-toggle-shortlist]'); if(shortlist){await toggleShortlist(shortlist.dataset.toggleShortlist);return}
    const del=e.target.closest('[data-delete-scan]'); if(del){await deleteScan(del.dataset.deleteScan);return}
    const delGarage=e.target.closest('[data-delete-garage]'); if(delGarage){await deleteGarage(delGarage.dataset.deleteGarage);return}
    const comp=e.target.closest('[data-compare-toggle]'); if(comp){const id=comp.dataset.compareToggle;if(state.compareIds.has(id))state.compareIds.delete(id);else if(state.compareIds.size<4)state.compareIds.add(id);else toast('Compare up to four cars at once.');renderMain();return}
    if(e.target.closest('[data-toggle-garage-form]')){const card=$('#garage-add-card');if(card)card.hidden=!card.hidden;return}
    const cal=e.target.closest('[data-calendar-reminder]'); if(cal){const [id,key]=cal.dataset.calendarReminder.split('|');const v=state.garage.find(x=>x.id===id);if(v)makeCalendar(v,key);return}
    const theme=e.target.closest('[data-theme-choice]'); if(theme){await saveProfile({theme:theme.dataset.themeChoice});renderMain();return}
    const accent=e.target.closest('[data-accent-choice]'); if(accent){await saveProfile({accent:accent.dataset.accentChoice});renderMain();return}
    if(e.target.closest('[data-save-display-name]')){await saveProfile({displayName:$('#display-name')?.value||''},'Name saved.');renderMain();return}
    if(e.target.closest('[data-export-account]')){await exportAccount();return}
    if(e.target.closest('[data-logout]')){await logout();return}
    if(e.target.closest('[data-delete-account]')){await deleteAccount();return}
  });

  document.addEventListener('change', async e=>{
    const compare=e.target.closest('[data-compare-checkbox]'); if(compare){const id=compare.dataset.compareCheckbox;if(compare.checked){if(state.compareIds.size>=4){compare.checked=false;toast('Compare up to four cars at once.');return}state.compareIds.add(id)}else state.compareIds.delete(id);renderMain();return}
    const pref=e.target.closest('[data-pref-toggle]'); if(pref){const key=pref.dataset.prefToggle;let patch={};if(key==='density')patch.density=pref.checked?'compact':'comfortable';if(key==='reduceMotion')patch.reduceMotion=pref.checked;if(key==='advancedData')patch.advancedData=pref.checked;if(key.startsWith('notify')){const n={...(state.user?.profile?.notifications||{})};if(key==='notifyMot')n.mot=pref.checked;if(key==='notifyService')n.service=pref.checked;if(key==='notifyWarranty')n.warranty=pref.checked;patch.notifications=n}await saveProfile(patch);renderMain()}
  });

  document.addEventListener('submit', async e=>{
    if(e.target.id==='account-auth-form'){e.preventDefault();await handleAuthSubmit(e.target);return}
    if(e.target.id==='garage-form'){e.preventDefault();const fd=new FormData(e.target);const body=Object.fromEntries(fd.entries());try{const data=await api('/api/account/garage',{method:'POST',body:JSON.stringify(body)});state.garage.unshift(data.vehicle);renderMain();toast('Added to My Garage.')}catch(err){toast(err.message)}return}
    if(e.target.id==='driving-profile-form'){e.preventDefault();const fd=new FormData(e.target);const priorities=fd.getAll('priority');const profile={dailyMiles:fd.get('dailyMiles'),annualMiles:fd.get('annualMiles'),homeCharging:fd.get('homeCharging'),longestTrip:fd.get('longestTrip'),motorwayFrequency:fd.get('motorwayFrequency'),passengers:fd.get('passengers'),priorities};await saveProfile({drivingProfile:profile},'Driving profile saved.');renderMain();return}
  });

  window.EVScanAccount = {
    get user(){return state.user},
    get isLoggedIn(){return Boolean(state.user)},
    getDrivingProfile(){return state.user?.profile?.drivingProfile||{}},
    open(){state.user?openDashboard():openAuth('login')},
    saveCurrentReport
  };

  async function init(){
    try{const status=await api('/api/account/status');state.configured=Boolean(status.configured)}catch{return}
    if(!state.configured)return;
    installHeaderButtons();installBenefits();installAuthModal();
    try{const me=await api('/api/auth/me');state.user=me.user;applyProfile(state.user.profile);await refreshData()}catch{state.user=null}
    renderHeaderState();
  }
  init();
})();
