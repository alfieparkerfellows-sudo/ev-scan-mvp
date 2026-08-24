(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const appShell = $('.app-shell');
  const reportView = $('#report-view');
  const scanOverlay = $('#scan-overlay');
  const listingUrl = $('#listing-url');
  const urlHelp = $('#url-help');
  const scanTitle = $('#scan-title');
  const scanCopy = $('#scan-step-copy');
  const scanProgress = $('#scan-progress');
  const scanStageCount = $('#scan-stage-count');
  const finderModal = $('#finder-modal');

  /* Mobile polish + recommendation card rebuild. Kept here so the existing
     static HTML can stay simple while we iterate quickly on the MVP. */
  const polish = document.createElement('style');
  polish.textContent = `
    .report-grid-two.single-column{grid-template-columns:1fr}
    .report-grid-two.single-column>.report-card{width:100%}

    .vehicle-image-demo.has-photo{display:block;min-height:0;aspect-ratio:16/10;background:#111827}
    .vehicle-image-demo.has-photo>img{width:100%;height:100%;object-fit:cover;display:block}
    .vehicle-image-demo.has-photo .vehicle-tag{z-index:3;background:rgba(6,10,18,.82);backdrop-filter:blur(8px)}
    .gallery-thumbs.photo-thumbs span{overflow:hidden;background:#111827}
    .gallery-thumbs.photo-thumbs img{width:100%;height:100%;object-fit:cover;opacity:.9}
    .car-photo-fallback.has-photo{background-size:cover;background-position:center;position:relative;overflow:hidden}
    .car-photo-fallback.has-photo::before{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(4,8,16,.92),rgba(4,8,16,.04) 70%)}
    .car-photo-fallback.has-photo>*{position:relative;z-index:1}

    .recommendation-grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px!important}
    .reco-card{min-width:0;overflow:hidden;border:1px solid var(--border);border-radius:20px;background:linear-gradient(160deg,rgba(255,255,255,.048),rgba(255,255,255,.018));box-shadow:0 18px 60px rgba(0,0,0,.18)}
    .reco-image{height:180px;position:relative;overflow:hidden;background:#111827}
    .reco-image img{width:100%;height:100%;display:block;object-fit:cover}
    .reco-image::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,7,14,.04),rgba(3,7,14,.48))}
    .reco-image>.reco-badge,.reco-image>.reco-score{position:absolute;z-index:2;top:12px;padding:7px 10px;border-radius:999px;font-size:.65rem;font-weight:850;backdrop-filter:blur(10px)}
    .reco-image>.reco-badge{left:12px;background:rgba(7,11,21,.78);color:#fff;border:1px solid rgba(255,255,255,.12)}
    .reco-image>.reco-score{right:12px;background:rgba(71,217,140,.18);color:#72e8a8;border:1px solid rgba(71,217,140,.22)}
    .reco-photo-fallback{width:100%;height:100%;display:grid;place-items:center;color:#aab4c5;background:linear-gradient(145deg,#273247,#101727);font-weight:800}
    .reco-body{padding:18px;display:flex;flex-direction:column;min-height:315px}
    .reco-type{color:var(--pink-2);font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;font-weight:900;margin-bottom:8px}
    .reco-body h3{font-size:1.08rem;line-height:1.18;margin:0 0 8px;letter-spacing:-.025em}
    .reco-sub{font-size:.78rem;color:var(--muted);margin-bottom:14px}
    .reco-price-row{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:12px}
    .reco-price-row strong{font-size:1.45rem;letter-spacing:-.04em;color:#fff}
    .reco-price-row span{font-size:.72rem;color:var(--green)}
    .reco-reason{margin:0 0 16px;color:var(--muted);font-size:.8rem;line-height:1.5;flex:1}
    .reco-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .reco-actions button{min-height:44px;padding:0 12px}
    .reco-detail{margin-top:12px;padding-top:12px;border-top:1px solid var(--border)}
    .demo-photo-credit{margin:14px 2px 0;color:var(--muted-2);font-size:.68rem;line-height:1.45}
    .demo-photo-credit a{text-decoration:underline;text-underline-offset:2px}

    @media(max-width:1050px){.recommendation-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:720px){
      .steps-grid{gap:14px!important}
      .metric-grid{gap:14px!important}
      .report-grid-two{gap:14px!important;margin-top:14px!important}
      .report-metrics{gap:14px!important;margin-top:14px!important}
      .quick-verdict,.effective-card,.fit-score-card,.limits-card{margin-top:14px!important}
      .content-section{padding-top:52px!important;padding-bottom:14px!important}
      .report-preview{padding-top:52px!important;padding-bottom:14px!important}
      .finder-section{padding-top:14px!important;padding-bottom:14px!important}
      .trust-section{padding-top:14px!important;padding-bottom:40px!important}
      .recommendations-section{margin-top:28px!important}
      .recommendation-grid{grid-template-columns:1fr!important;gap:14px!important}
      .reco-card{border-radius:20px}
      .reco-image{height:205px}
      .reco-body{min-height:0;padding:18px}
      .reco-body h3{font-size:1.2rem}
      .reco-price-row strong{font-size:1.55rem}
    }
  `;
  document.head.appendChild(polish);

  const PHOTO = {
    ioniq: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/2022_Hyundai_Ioniq_5.jpg',
    tesla: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/2021_Tesla_Model_3.jpg',
    kia: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Kia_EV6.png',
    skoda: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Skoda_Enyaq.jpg',
    mg4: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/MG4_EV.jpg'
  };

  function photoFor(name) {
    const n = name.toLowerCase();
    if (n.includes('ioniq 5')) return PHOTO.ioniq;
    if (n.includes('tesla')) return PHOTO.tesla;
    if (n.includes('kia ev6')) return PHOTO.kia;
    if (n.includes('skoda') || n.includes('enyaq')) return PHOTO.skoda;
    if (n.includes('mg4') || n.includes('mg 4')) return PHOTO.mg4;
    return PHOTO.ioniq;
  }

  function installDemoPhotos() {
    const vehicle = $('.vehicle-image-demo');
    if (vehicle) {
      const tag = $('.vehicle-tag', vehicle)?.outerHTML || '<div class="vehicle-tag">DEMO VEHICLE</div>';
      vehicle.classList.add('has-photo');
      vehicle.innerHTML = `${tag}<img src="${PHOTO.ioniq}" alt="Hyundai Ioniq 5 representative demo photo">`;
    }

    const thumbs = $('.gallery-thumbs');
    if (thumbs) {
      thumbs.classList.add('photo-thumbs');
      thumbs.innerHTML = `
        <span><img src="${PHOTO.ioniq}" alt="Hyundai Ioniq 5 demo thumbnail"></span>
        <span><img src="${PHOTO.ioniq}" alt="Hyundai Ioniq 5 demo thumbnail"></span>
        <span><img src="${PHOTO.ioniq}" alt="Hyundai Ioniq 5 demo thumbnail"></span>
        <span class="more-thumb">+12</span>`;
    }

    const preview = $('.car-photo-fallback');
    if (preview) {
      preview.classList.add('has-photo');
      preview.style.backgroundImage = `url("${PHOTO.ioniq}")`;
    }
  }

  function removeReplyChecker() {
    const reply = $('.reply-card');
    if (!reply) return;
    const row = reply.parentElement;
    reply.remove();
    row?.classList.add('single-column');
  }

  installDemoPhotos();
  removeReplyChecker();

  const scanStages = [
    ['Reading the listing…','Pulling out the vehicle, price, mileage and seller information.'],
    ['Identifying the exact EV…','Matching the model, trim, battery and drivetrain.'],
    ['Checking the price…','Comparing this demo vehicle against similar examples.'],
    ['Reviewing battery expectations…','Estimating a sensible health range for this age and mileage.'],
    ['Analysing MOT patterns…','Looking for repeated advisories and unusual mileage changes.'],
    ['Checking EV-specific details…','Range, charging, warranty and specification traps.'],
    ['Finding the unknowns…','Spotting important information the advert does not clearly answer.'],
    ['Preparing your verdict…','Turning the findings into clear next steps and seller questions.']
  ];

  function looksLikeUrl(value) {
    const v = (value || '').trim();
    if (!v) return false;
    try {
      const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
      return !!(u.hostname && u.hostname.includes('.'));
    } catch { return false; }
  }

  function openReport() {
    scanOverlay.hidden = true;
    document.body.classList.remove('modal-open');
    appShell.hidden = true;
    reportView.hidden = false;
    window.scrollTo({top:0,behavior:'auto'});
  }

  function closeReport() {
    reportView.hidden = true;
    appShell.hidden = false;
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function runDemoScan(value) {
    if (value && !looksLikeUrl(value)) {
      if (urlHelp) {
        urlHelp.textContent = 'Paste a normal web link, for example https://example.com/car-listing';
        urlHelp.classList.add('error');
      }
      listingUrl?.focus();
      return;
    }
    urlHelp?.classList.remove('error');
    if (urlHelp) urlHelp.textContent = 'Demo mode is on for now — the report uses clearly labelled sample data.';
    scanOverlay.hidden = false;
    document.body.classList.add('modal-open');
    let stage = 0;
    const show = () => {
      const [title, copy] = scanStages[stage];
      scanTitle.textContent = title;
      scanCopy.textContent = copy;
      scanStageCount.textContent = `${stage + 1} of ${scanStages.length}`;
      scanProgress.style.width = `${Math.round(((stage + 1) / scanStages.length) * 100)}%`;
    };
    show();
    const timer = setInterval(() => {
      stage += 1;
      if (stage >= scanStages.length) {
        clearInterval(timer);
        setTimeout(openReport, 350);
        return;
      }
      show();
    }, 480);
  }

  $('#scan-form')?.addEventListener('submit', e => { e.preventDefault(); runDemoScan(listingUrl.value); });
  $$('[data-demo-scan]').forEach(b => b.addEventListener('click', () => runDemoScan('https://example.com/demo-ev')));
  $$('[data-close-report]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); closeReport(); }));
  $$('[data-scroll-home]').forEach(b => b.addEventListener('click', () => $('#home')?.scrollIntoView({behavior:'smooth'})));

  $('#rescan-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#rescan-url');
    if (!looksLikeUrl(input.value)) {
      input.setCustomValidity('Paste a valid-looking listing link.');
      input.reportValidity();
      input.setCustomValidity('');
      return;
    }
    reportView.hidden = true;
    appShell.hidden = false;
    runDemoScan(input.value);
  });

  const trims = {
    ultimate:{meta:'34,200 miles · Electric · Automatic · 77.4 kWh · RWD',range:'238 mi',speed:'7.3 sec',charge:'~233 kW',drive:'RWD',soh:'90–94%',main:'238 miles',summer:'257 mi',typical:'238 mi',winter:'205 mi',explain:'The Ultimate RWD balances range, equipment and performance without paying for the AWD powertrain.',verdict:'For most buyers, this trim avoids paying extra for AWD while keeping the strong long-distance charging experience.'},
    premium:{meta:'34,200 miles · Electric · Automatic · 77.4 kWh · RWD',range:'240 mi',speed:'7.3 sec',charge:'~233 kW',drive:'RWD',soh:'90–94%',main:'240 miles',summer:'260 mi',typical:'240 mi',winter:'207 mi',explain:'The Premium RWD keeps almost the same range and charging performance while usually costing less than Ultimate.',verdict:'This is likely the value sweet spot if you care more about range than top-spec equipment.'},
    awd:{meta:'34,200 miles · Electric · Automatic · 77.4 kWh · AWD',range:'224 mi',speed:'5.1 sec',charge:'~233 kW',drive:'AWD',soh:'90–94%',main:'224 miles',summer:'243 mi',typical:'224 mi',winter:'193 mi',explain:'The AWD version is much quicker and adds extra traction, but it uses more energy and normally costs more.',verdict:'Choose AWD for performance or traction. For a normal first-time EV buyer, RWD is usually the more rational value choice.'}
  };

  function updateTrim(key) {
    const t = trims[key] || trims.ultimate;
    const values = {
      '#trim-meta':t.meta,'#trim-range':t.range,'#trim-speed':t.speed,'#trim-charge':t.charge,'#trim-drive':t.drive,
      '#battery-soh':t.soh,'#range-main':t.main,'#range-summer':t.summer,'#range-typical':t.typical,'#range-winter':t.winter,'#trim-explainer':t.explain
    };
    Object.entries(values).forEach(([s,v]) => { const el=$(s); if(el) el.textContent=v; });
    const verdict = $('#trim-verdict');
    if (verdict) verdict.innerHTML = `<b>Our take:</b> ${t.verdict}`;
  }
  $('#trim-select')?.addEventListener('change', e => updateTrim(e.target.value));

  $('#copy-message')?.addEventListener('click', async () => {
    const area = $('#seller-message');
    const status = $('#copy-status');
    let copied = false;
    try { await navigator.clipboard.writeText(area.value); copied = true; } catch {}
    if (!copied) {
      area.focus(); area.select();
      try { copied = document.execCommand('copy'); } catch {}
    }
    if (status) status.textContent = copied ? 'Copied — ready to send.' : 'Select the message and copy it manually.';
    setTimeout(() => { if(status) status.textContent=''; }, 2600);
  });

  const fitToggle = $('#quick-fit-toggle');
  const fitForm = $('#quick-fit-form');
  const fitResult = $('#fit-result');
  fitToggle?.addEventListener('click', () => {
    fitForm.hidden = !fitForm.hidden;
    fitToggle.textContent = fitForm.hidden ? 'Check my fit' : 'Hide questions';
  });
  fitForm?.addEventListener('submit', e => {
    e.preventDefault();
    const daily=Number($('#fit-daily').value), long=Number($('#fit-long').value), home=$('#fit-home').value, motorway=$('#fit-motorway').value;
    let score=94; const notes=[];
    if(daily>90){score-=7;notes.push('Your daily mileage makes range efficiency more important.');} else notes.push('Your normal daily driving is comfortably inside this car’s expected range.');
    if(long>230){score-=7;notes.push('Your longest regular journey will probably need a rapid-charge stop in winter.');} else if(long>150) notes.push('Your longer trips are realistic, with some winter planning.'); else notes.push('Your regular long journeys should be easy for this EV.');
    if(home==='no'){score-=9;notes.push('Without home charging, public charging convenience matters much more.');} else notes.push('Home charging means you probably do not need to pay extra for the biggest battery.');
    if(motorway==='often'){score-=3;notes.push('The fast DC charging is especially useful for your motorway use.');}
    score=Math.max(55,Math.min(98,score));
    const verdict=score>=90?'Excellent fit':score>=80?'Strong fit':score>=70?'Reasonable fit':'Think carefully';
    fitResult.hidden=false;
    fitResult.innerHTML=`<div class="fit-score-number">${score}</div><div><h3>${verdict}</h3><p>${notes.join(' ')}</p></div>`;
  });

  function openFinder(){finderModal.hidden=false;document.body.classList.add('modal-open');}
  function closeFinder(){finderModal.hidden=true;document.body.classList.remove('modal-open');}
  $$('[data-open-finder]').forEach(b=>b.addEventListener('click',openFinder));
  $$('[data-close-finder]').forEach(b=>b.addEventListener('click',closeFinder));
  finderModal?.addEventListener('click',e=>{if(e.target===finderModal)closeFinder();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!finderModal?.hidden)closeFinder();if(scanOverlay&&!scanOverlay.hidden){scanOverlay.hidden=true;document.body.classList.remove('modal-open');}}});

  $('#finder-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const budget=Number($('#finder-budget').value), daily=Number($('#finder-daily').value), longest=Number($('#finder-long').value), home=$('#finder-home').value, priority=$('#finder-priority').value;
    const needed=Math.min(310,Math.max(150,longest+(home==='no'?55:30)));
    const rapid=longest>160||home==='no';
    const large=daily>80||longest>210||home==='no';
    const picks={
      value:[['MG4 Long Range','Great value and efficient'],['Kia e-Niro','Proven, efficient all-rounder'],['Tesla Model 3 RWD','Efficient with strong charging']],
      range:[['Tesla Model 3 Long Range','Long range and efficient'],['Hyundai Ioniq 6','Very efficient motorway EV'],['Kia EV6','Strong range with rapid charging']],
      space:[['Skoda Enyaq','Excellent family practicality'],['Hyundai Ioniq 5','Very spacious inside'],['Kia EV6','Practical with fast charging']],
      comfort:[['Polestar 2','Premium-feeling cabin'],['BMW i4','Comfortable and refined'],['Hyundai Ioniq 5','Relaxed, spacious interior']],
      performance:[['Tesla Model 3 Long Range','Fast without Performance-car pricing'],['Polestar 2 Dual Motor','Strong performance and quality'],['Kia EV6 AWD','Fast and very quick to charge']]
    };
    const out=$('#finder-results'); out.hidden=false;
    out.innerHTML=`<h3>We’d look for roughly ${needed}+ miles of realistic range.</h3><p>Based on your answers, ${large?'a medium-to-large battery makes sense':'you probably do not need to pay extra for the biggest battery'}. ${rapid?'Fast rapid charging should be a priority for you.':'Extreme rapid-charging performance does not need to dominate your decision.'} With a £${budget.toLocaleString('en-GB')} ceiling, these are good starting points:</p><div class="finder-picks">${picks[priority].map(([n,r],i)=>`<div><strong>${i+1}</strong><span><b>${n}</b><small>${r}</small></span></div>`).join('')}</div><p><b>Production goal:</b> turn these normal-life answers into live marketplace filters automatically.</p>`;
  });

  const recommendationData = [
    {type:'Same car, better listing',name:'2022 Hyundai Ioniq 5 Ultimate',sub:'31,000 miles · RWD',price:21950,score:91,delta:'£1,045 less',reason:'Same trim with lower mileage and a stronger demo price position.'},
    {type:'Save money',name:'2021 Tesla Model 3 RWD',sub:'39,500 miles · RWD',price:18950,score:88,delta:'£4,045 less',reason:'Smaller and less SUV-like, but very efficient with strong long-distance charging.'},
    {type:'Better fit',name:'2022 Kia EV6 Air',sub:'35,800 miles · RWD',price:22500,score:90,delta:'£495 less',reason:'Similar charging hardware and practicality with a slightly sharper driving feel.'},
    {type:'Worth stretching for',name:'2023 Hyundai Ioniq 5 Premium',sub:'24,300 miles · RWD',price:24450,score:93,delta:'+£1,455',reason:'Newer example with less mileage; worth considering if the extra spend buys more warranty and condition.'},
    {type:'Wildcard',name:'2022 Skoda Enyaq 80',sub:'36,000 miles · RWD',price:20950,score:86,delta:'£2,045 less',reason:'Slower to rapid-charge, but excellent space and a calmer family-car experience.'},
    {type:'Save money',name:'2022 MG4 Trophy Long Range',sub:'28,000 miles · RWD',price:16450,score:89,delta:'£6,545 less',reason:'A big saving if premium cabin feel and SUV space are not priorities.'}
  ];

  const recommendationGrid=$('#recommendation-grid');
  function attachRecoPhotoFallbacks(){
    $$('.reco-image img',recommendationGrid).forEach(img=>img.addEventListener('error',()=>{const box=img.parentElement;img.remove();const f=document.createElement('div');f.className='reco-photo-fallback';f.textContent='Vehicle photo unavailable';box.prepend(f);}));
  }

  function renderRecommendations(budget){
    if(!recommendationGrid)return;
    const lower=Math.max(5000,budget-8000), upper=budget+2000;
    let options=recommendationData.filter(c=>c.price>=lower&&c.price<=upper).sort((a,b)=>Math.abs(a.price-budget)-Math.abs(b.price-budget)).slice(0,4);
    if(!options.length)options=recommendationData.slice(0,4);
    recommendationGrid.innerHTML=options.map((car,index)=>`<article class="reco-card" data-reco-index="${index}"><div class="reco-image"><img src="${photoFor(car.name)}" alt="${car.name} representative demo photo"><span class="reco-badge">${car.type}</span><span class="reco-score">${car.score}/100</span></div><div class="reco-body"><div class="reco-type">${car.type}</div><h3>${car.name}</h3><div class="reco-sub">${car.sub}</div><div class="reco-price-row"><strong>£${car.price.toLocaleString('en-GB')}</strong><span>${car.delta}</span></div><p class="reco-reason">${car.reason}</p><div class="reco-actions"><button class="primary-button" type="button" data-reco-detail="${index}">Why this one?</button><button class="ghost-button" type="button" data-reco-compare="${index}">Compare</button></div><div class="reco-detail" hidden></div></div></article>`).join('');
    attachRecoPhotoFallbacks();
    $$('[data-reco-detail]',recommendationGrid).forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.recoDetail),card=b.closest('.reco-card'),d=$('.reco-detail',card),car=options[i];d.hidden=!d.hidden;d.innerHTML=`<p style="margin:0;color:#9ba7ba;font-size:.76rem;line-height:1.5"><b style="color:#fff">Why it surfaced:</b> ${car.reason} The live version will personalise this to your driving and budget.</p>`;b.textContent=d.hidden?'Why this one?':'Hide reason';}));
    $$('[data-reco-compare]',recommendationGrid).forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.recoCompare),card=b.closest('.reco-card'),d=$('.reco-detail',card),car=options[i],diff=car.price-22995,priceText=diff<0?`£${Math.abs(diff).toLocaleString('en-GB')} cheaper`:`£${diff.toLocaleString('en-GB')} more`;d.hidden=false;d.innerHTML=`<p style="margin:0;color:#9ba7ba;font-size:.76rem;line-height:1.5"><b style="color:#fff">Quick comparison:</b> ${car.name} is ${priceText} than the scanned demo Ioniq 5 and scores ${car.score}/100 versus 87/100.</p>`;}));
  }

  const budgetRange=$('#budget-range'), budgetValue=$('#budget-value');
  function updateBudget(){const n=Number(budgetRange?.value||23000);if(budgetValue)budgetValue.textContent=`£${n.toLocaleString('en-GB')}`;renderRecommendations(n);}
  budgetRange?.addEventListener('input',updateBudget);
  updateBudget();

  if(recommendationGrid && !$('.demo-photo-credit')){
    const credit=document.createElement('p');
    credit.className='demo-photo-credit';
    credit.innerHTML='Representative demo photos via <a href="https://commons.wikimedia.org/" target="_blank" rel="noopener">Wikimedia Commons</a> (CC-licensed). The live product should use the actual photos attached to each marketplace listing.';
    recommendationGrid.insertAdjacentElement('afterend',credit);
  }
})();
