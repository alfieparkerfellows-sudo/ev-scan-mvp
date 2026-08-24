(() => {
  const $ = (sel, root = document) => root?.querySelector?.(sel) || null;
  const $$ = (sel, root = document) => [...(root?.querySelectorAll?.(sel) || [])];
  const modal = $('#finder-modal');
  if (!modal) return;

  const MODELS = [
    {name:'MG4 Long Range',floor:10500,range:170,rapid:135,body:'hatch',space:3,comfort:3,performance:3,efficiency:4,premium:2,insurance:3,age:'newer',connector:'CCS',tag:'Value all-rounder'},
    {name:'Kia e-Niro / Niro EV',floor:10500,range:185,rapid:80,body:'crossover',space:4,comfort:4,performance:3,efficiency:5,premium:3,insurance:3,age:'balanced',connector:'CCS',tag:'Efficient and easy to live with'},
    {name:'Hyundai Kona Electric',floor:9500,range:185,rapid:80,body:'crossover',space:3,comfort:3,performance:3,efficiency:5,premium:2,insurance:3,age:'balanced',connector:'CCS',tag:'Efficiency specialist'},
    {name:'Volkswagen ID.3',floor:11000,range:165,rapid:120,body:'hatch',space:4,comfort:4,performance:3,efficiency:4,premium:3,insurance:3,age:'balanced',connector:'CCS',tag:'Comfortable hatchback'},
    {name:'Tesla Model 3 RWD',floor:13500,range:190,rapid:170,body:'saloon',space:3,comfort:3,performance:4,efficiency:5,premium:3,insurance:5,age:'balanced',connector:'CCS',tag:'Long-distance efficiency'},
    {name:'Polestar 2',floor:14500,range:180,rapid:150,body:'saloon',space:3,comfort:4,performance:4,efficiency:3,premium:5,insurance:4,age:'balanced',connector:'CCS',tag:'Premium-feeling choice'},
    {name:'Hyundai Ioniq 5',floor:16000,range:185,rapid:220,body:'crossover',space:5,comfort:5,performance:3,efficiency:3,premium:4,insurance:4,age:'newer',connector:'CCS',tag:'Space and ultra-fast charging'},
    {name:'Kia EV6',floor:16500,range:195,rapid:220,body:'crossover',space:4,comfort:4,performance:4,efficiency:4,premium:4,insurance:4,age:'newer',connector:'CCS',tag:'Fast charging with a sportier feel'},
    {name:'Skoda Enyaq',floor:15000,range:185,rapid:125,body:'suv',space:5,comfort:5,performance:3,efficiency:4,premium:3,insurance:3,age:'newer',connector:'CCS',tag:'Family practicality'},
    {name:'Tesla Model Y',floor:19000,range:205,rapid:170,body:'suv',space:5,comfort:4,performance:4,efficiency:4,premium:3,insurance:5,age:'newer',connector:'CCS',tag:'Space plus charging network ease'},
    {name:'Cupra Born',floor:14000,range:170,rapid:125,body:'hatch',space:4,comfort:4,performance:4,efficiency:4,premium:3,insurance:4,age:'newer',connector:'CCS',tag:'Sportier hatchback'},
    {name:'Nissan Leaf 40/62 kWh',floor:6500,range:120,rapid:50,body:'hatch',space:3,comfort:3,performance:2,efficiency:3,premium:2,insurance:2,age:'older',connector:'CHAdeMO',tag:'Low purchase-cost option'},
    {name:'Renault Zoe ZE50',floor:7000,range:135,rapid:50,body:'hatch',space:2,comfort:3,performance:2,efficiency:4,premium:2,insurance:2,age:'older',connector:'CCS/AC varies',tag:'Compact budget EV'},
    {name:'BMW i3',floor:8000,range:105,rapid:50,body:'hatch',space:2,comfort:4,performance:4,efficiency:5,premium:4,insurance:3,age:'older',connector:'CCS',tag:'Distinctive city-focused EV'},
    {name:'BMW i4',floor:22000,range:220,rapid:200,body:'saloon',space:3,comfort:5,performance:5,efficiency:4,premium:5,insurance:5,age:'newer',connector:'CCS',tag:'Premium long-distance choice'}
  ];

  const bodyAliases = {
    any: [], hatch:['hatch'], saloon:['saloon'], crossover:['crossover','suv'], suv:['suv','crossover']
  };

  let step = 1;

  function closeFinder() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
  }

  function updateHomepageTeaser() {
    const copy = $('.finder-copy p');
    if (copy) copy.textContent = 'Answer a few normal-life questions about budget, journeys, charging and space. EV Scan turns that into the range, charging and type of EV that actually suits you.';
    const button = $('.finder-copy [data-open-finder]');
    if (button) button.textContent = 'Find the right EV for me';
    const pills = $$('.finder-example .question-pill');
    if (pills[0]) pills[0].textContent = 'What is your real budget ceiling?';
    if (pills[1]) pills[1].textContent = 'How far do you drive on a long day?';
    if (pills[2]) pills[2].textContent = 'Where can you realistically charge?';
    const result = $('.finder-example .result-pill');
    if (result) result.textContent = 'We turn your answers into a personalised EV shortlist — and explain the trade-offs.';
  }

  function renderDialog() {
    modal.innerHTML = `
      <div class="finder-dialog finder-v2" role="dialog" aria-modal="true" aria-labelledby="finder-title">
        <header class="fv2-header">
          <div>
            <div class="eyebrow">Find my EV</div>
            <h2 id="finder-title">Find an EV that fits your actual life.</h2>
            <p>No EV jargon. Just tell us how you drive, what you can spend and what you care about.</p>
          </div>
          <button class="modal-close fv2-close" type="button" aria-label="Close finder">×</button>
        </header>

        <div class="fv2-progress" aria-label="Finder progress">
          <div class="fv2-progress-copy"><b id="fv2-step-label">1 of 3</b><span id="fv2-step-title">Budget & driving</span></div>
          <div class="fv2-track"><span id="fv2-progress-bar"></span></div>
        </div>

        <form id="finder-form-v2" class="fv2-form" novalidate>
          <section class="fv2-step" data-fv2-step="1">
            <div class="fv2-question-grid">
              <label class="fv2-field wide">
                <span>What is the most you actually want to spend?</span>
                <small>Use your real ceiling, not the price you hope to find.</small>
                <div class="fv2-money"><span>£</span><input id="finder-budget" name="budget" type="number" min="4000" max="100000" step="500" value="20000" inputmode="numeric"></div>
              </label>
              <label class="fv2-field">
                <span>Would you stretch for the right car?</span>
                <select id="finder-stretch" name="stretch"><option value="0">No — hard ceiling</option><option value="1500">Up to about £1,500</option><option value="3000">Up to about £3,000</option></select>
              </label>
              <label class="fv2-field">
                <span>How far do you drive on a normal day?</span>
                <select id="finder-daily" name="daily"><option value="15">Under 20 miles</option><option value="40">20–50 miles</option><option value="70">50–80 miles</option><option value="110">80–120 miles</option><option value="150">120+ miles</option></select>
              </label>
              <label class="fv2-field">
                <span>On your longest regular day, roughly how many miles do you drive in total?</span>
                <small>Think work trips, family visits or journeys you make often enough to matter.</small>
                <select id="finder-long" name="longest"><option value="60">Under 60 miles</option><option value="100">60–100 miles</option><option value="160">100–160 miles</option><option value="220">160–220 miles</option><option value="300">220–300 miles</option><option value="380">300+ miles</option></select>
              </label>
              <label class="fv2-field">
                <span>How often are you doing longer motorway journeys?</span>
                <select id="finder-motorway" name="motorway"><option value="rare">Rarely</option><option value="monthly">A few times a month</option><option value="weekly">Most weeks</option><option value="frequent">Several times a week</option></select>
              </label>
            </div>
          </section>

          <section class="fv2-step" data-fv2-step="2" hidden>
            <div class="fv2-question-grid">
              <label class="fv2-field">
                <span>Can you normally charge at home overnight?</span>
                <select id="finder-home" name="home"><option value="yes">Yes</option><option value="planned">Not yet, but I expect to</option><option value="no">No</option></select>
              </label>
              <label class="fv2-field">
                <span>Do you have another reliable place to charge?</span>
                <select id="finder-backup" name="backup"><option value="none">No reliable alternative</option><option value="work">Yes — work</option><option value="nearby">Yes — reliable charging very close by</option><option value="family">Yes — somewhere I visit regularly</option></select>
              </label>
              <label class="fv2-field wide">
                <span>How do you feel about public rapid charging?</span>
                <div class="fv2-choice-row" id="finder-public-options">
                  <label><input type="radio" name="publicCharging" value="avoid" checked><span><b>I want to minimise it</b><small>I would rather have more range and charge less often.</small></span></label>
                  <label><input type="radio" name="publicCharging" value="occasional"><span><b>Occasionally is fine</b><small>I do not mind a stop on longer journeys.</small></span></label>
                  <label><input type="radio" name="publicCharging" value="happy"><span><b>I am happy to use it</b><small>Fast charging matters more than maximum range.</small></span></label>
                </div>
              </label>
            </div>
            <div class="fv2-explain"><b>Why we ask this</b><span>No home charging changes the recommendation a lot. Range, charging speed and the type of rapid-charge connector become much more important.</span></div>
          </section>

          <section class="fv2-step" data-fv2-step="3" hidden>
            <div class="fv2-question-grid">
              <label class="fv2-field">
                <span>Who normally needs to fit in the car?</span>
                <select id="finder-passengers" name="passengers"><option value="2">Mostly 1–2 people</option><option value="4">Usually 3–4 people</option><option value="5">A family / 5 people</option><option value="cargo">I regularly carry bulky kit, dogs or lots of luggage</option></select>
              </label>
              <label class="fv2-field">
                <span>Do you care what shape the car is?</span>
                <select id="finder-body" name="body"><option value="any">No preference</option><option value="hatch">Hatchback / smaller car</option><option value="saloon">Saloon / low car</option><option value="crossover">Crossover / SUV</option></select>
              </label>
              <label class="fv2-field">
                <span>How important is keeping insurance down?</span>
                <select id="finder-insurance" name="insurance"><option value="medium">Worth considering</option><option value="high">Very important</option><option value="low">Not a major concern</option></select>
              </label>
              <label class="fv2-field">
                <span>Would you consider an older or higher-mileage EV to save money?</span>
                <select id="finder-age" name="age"><option value="balanced">Yes, if it still makes sense</option><option value="older">Absolutely — value matters most</option><option value="newer">I would rather pay more for newer</option></select>
              </label>
              <fieldset class="fv2-field wide fv2-priorities">
                <legend>Pick up to 3 things that matter most</legend>
                <small>This is where we personalise the ranking rather than just matching range.</small>
                <div class="fv2-chip-grid" id="finder-priority-chips">
                  ${[
                    ['value','Low purchase cost'],['running','Low running cost'],['range','Long real-world range'],['charging','Fast rapid charging'],['space','Space & practicality'],['comfort','Comfort'],['performance','Performance'],['premium','Premium feel'],['insurance','Lower insurance']
                  ].map(([value,label])=>`<label><input type="checkbox" name="priority" value="${value}"><span>${label}</span></label>`).join('')}
                </div>
                <div class="fv2-priority-help" id="fv2-priority-help">Choose up to 3.</div>
              </fieldset>
            </div>
          </section>

          <div class="fv2-actions">
            <button class="ghost-button" type="button" id="fv2-back" hidden>Back</button>
            <button class="primary-button" type="button" id="fv2-next">Continue</button>
            <button class="primary-button" type="submit" id="fv2-submit" hidden>Show my best matches</button>
          </div>
        </form>

        <div id="finder-results" class="fv2-results" hidden></div>
      </div>`;
  }

  function selectedPriorities() {
    return $$('input[name="priority"]:checked', modal).map(x => x.value);
  }

  function setStep(next) {
    step = Math.max(1, Math.min(3, next));
    $$('.fv2-step', modal).forEach(section => { section.hidden = Number(section.dataset.fv2Step) !== step; });
    $('#fv2-back', modal).hidden = step === 1;
    $('#fv2-next', modal).hidden = step === 3;
    $('#fv2-submit', modal).hidden = step !== 3;
    const titles = ['Budget & driving','Charging reality','Space & priorities'];
    $('#fv2-step-label', modal).textContent = `${step} of 3`;
    $('#fv2-step-title', modal).textContent = titles[step - 1];
    $('#fv2-progress-bar', modal).style.width = `${step * 33.333}%`;
    $('.finder-dialog', modal)?.scrollTo({top:0,behavior:'smooth'});
  }

  function answers() {
    const form = $('#finder-form-v2', modal);
    const fd = new FormData(form);
    return {
      budget:Number(fd.get('budget') || 0), stretch:Number(fd.get('stretch') || 0), daily:Number(fd.get('daily') || 0), longest:Number(fd.get('longest') || 0),
      motorway:String(fd.get('motorway') || 'rare'), home:String(fd.get('home') || 'yes'), backup:String(fd.get('backup') || 'none'), publicCharging:String(fd.get('publicCharging') || 'avoid'),
      passengers:String(fd.get('passengers') || '2'), body:String(fd.get('body') || 'any'), insurance:String(fd.get('insurance') || 'medium'), age:String(fd.get('age') || 'balanced'), priorities:fd.getAll('priority')
    };
  }

  function requirementSummary(a) {
    const buffer = 1.08 + (a.home === 'no' ? .10 : a.home === 'planned' ? .05 : 0) + (a.publicCharging === 'avoid' ? .07 : 0);
    const winterTarget = Math.min(310, Math.max(115, Math.round(a.longest * buffer / 5) * 5));
    const rapidImportant = a.home === 'no' || ['weekly','frequent'].includes(a.motorway) || a.longest >= 160;
    const spaceNeed = a.passengers === 'cargo' || a.passengers === '5' ? 5 : a.passengers === '4' ? 4 : 2;
    return {winterTarget, rapidImportant, spaceNeed, effectiveBudget:a.budget + a.stretch};
  }

  function add(items, points, text, kind='positive') { items.push({points,text,kind}); }

  function scoreModel(model, a, req) {
    let score = 52;
    const notes = [];
    const gap = req.effectiveBudget - model.floor;
    if (gap >= 0) add(notes, 15, 'Likely to be achievable inside your stated budget.');
    else if (gap >= -1500 && a.stretch > 0) add(notes, -3, 'May be possible if you use the stretch in your budget.', 'tradeoff');
    else add(notes, -20, 'Usually sits above the budget band we would start with.', 'tradeoff');

    const rangeRatio = model.range / req.winterTarget;
    if (rangeRatio >= 1.15) add(notes, 14, 'Gives you a healthy cold-weather range buffer for your regular long days.');
    else if (rangeRatio >= 1) add(notes, 10, 'Its cold-weather range should broadly match the journey pattern you described.');
    else if (rangeRatio >= .85) add(notes, 0, 'Your longest regular days may need some charging planning.', 'tradeoff');
    else add(notes, -14, 'Its winter range is a weak match for your longest regular days.', 'tradeoff');

    if (req.rapidImportant) {
      if (model.rapid >= 180) add(notes, 9, 'Very fast rapid charging suits your longer-journey pattern.');
      else if (model.rapid >= 120) add(notes, 6, 'Rapid charging is strong enough to make longer trips easier.');
      else if (model.rapid >= 75) add(notes, 1, 'Charging speed is usable, but not a standout strength.');
      else add(notes, -8, 'Rapid charging is relatively slow for the way you plan to use the car.', 'tradeoff');
    }

    if (a.home === 'no') {
      if (a.backup !== 'none') add(notes, 4, 'Your reliable backup charging option makes this easier to own without a home charger.');
      if (model.connector === 'CHAdeMO') add(notes, -9, 'CHAdeMO gives you less rapid-charging choice than CCS in the UK.', 'tradeoff');
      if (model.range >= 180) add(notes, 5, 'A stronger range buffer helps when you cannot simply plug in at home.');
    }

    const motorwayWeight = {rare:0,monthly:1,weekly:2,frequent:3}[a.motorway] || 0;
    if (motorwayWeight) {
      const motorwayFit = model.comfort + model.efficiency;
      add(notes, motorwayWeight * (motorwayFit >= 8 ? 2 : motorwayFit >= 6 ? 1 : -1), motorwayFit >= 8 ? 'Comfort and efficiency suit regular motorway use.' : 'Motorway use is acceptable, but not where this model is strongest.', motorwayFit >= 8 ? 'positive' : 'tradeoff');
    }

    if (req.spaceNeed >= 4) {
      if (model.space >= req.spaceNeed) add(notes, 8, 'Its cabin and luggage space fit the people or kit you need to carry.');
      else add(notes, -8, 'Space may become frustrating for your normal passenger or luggage needs.', 'tradeoff');
    }

    if (a.body !== 'any') {
      const matches = bodyAliases[a.body] || [];
      add(notes, matches.includes(model.body) ? 5 : -3, matches.includes(model.body) ? 'Matches the type of car you said you would prefer.' : 'The body style is not your stated preference.', matches.includes(model.body) ? 'positive' : 'tradeoff');
    }

    if (a.insurance === 'high') {
      if (model.insurance <= 2) add(notes, 7, 'One of the friendlier options here when insurance sensitivity matters.');
      else if (model.insurance >= 5) add(notes, -9, 'Insurance can be a major drawback for the priorities you gave us.', 'tradeoff');
      else if (model.insurance === 4) add(notes, -4, 'Insurance may be worth checking before you get attached to this one.', 'tradeoff');
    }

    if (a.age === 'newer' && model.age === 'older') add(notes, -7, 'This is more of an older-value choice than the newer-car direction you asked for.', 'tradeoff');
    if (a.age === 'older' && model.age === 'older') add(notes, 5, 'Fits your willingness to trade age for a lower purchase price.');

    const priorityScores = {
      value: Math.max(1, 6 - Math.min(5, Math.ceil(model.floor / 5000))),
      running:model.efficiency,
      range:Math.min(5, Math.max(1, Math.round(model.range / 45))),
      charging:Math.min(5, Math.max(1, Math.round(model.rapid / 45))),
      space:model.space,
      comfort:model.comfort,
      performance:model.performance,
      premium:model.premium,
      insurance:6-model.insurance
    };
    const priorityLabels = {value:'purchase price',running:'running costs',range:'range',charging:'rapid charging',space:'space',comfort:'comfort',performance:'performance',premium:'premium feel',insurance:'insurance'};
    for (const p of a.priorities) {
      const v = priorityScores[p] || 3;
      const pts = (v - 3) * 3;
      add(notes, pts, v >= 4 ? `Scores strongly for ${priorityLabels[p]}.` : v <= 2 ? `${priorityLabels[p][0].toUpperCase()+priorityLabels[p].slice(1)} is not one of its strongest areas.` : `A balanced match for ${priorityLabels[p]}.`, v <= 2 ? 'tradeoff' : 'positive');
    }

    score += notes.reduce((sum, n) => sum + n.points, 0);
    score = Math.max(38, Math.min(97, Math.round(score)));
    const positives = notes.filter(n=>n.points>0).sort((a,b)=>b.points-a.points).slice(0,3);
    const tradeoffs = notes.filter(n=>n.points<0 || n.kind==='tradeoff').sort((a,b)=>a.points-b.points).slice(0,2);
    return {...model, score, positives, tradeoffs};
  }

  function fitLabel(score) {
    if (score >= 90) return 'Excellent fit';
    if (score >= 82) return 'Strong fit';
    if (score >= 72) return 'Good fit with trade-offs';
    if (score >= 62) return 'Possible, but check the compromises';
    return 'Weak fit for your brief';
  }

  function budgetLabel(model, req) {
    const gap = req.effectiveBudget - model.floor;
    if (gap >= 2500) return 'Comfortable budget fit';
    if (gap >= 0) return 'Likely budget fit';
    if (gap >= -1500) return 'May need a stretch';
    return 'Usually above this budget';
  }

  function renderResults(a) {
    const req = requirementSummary(a);
    const ranked = MODELS.map(m => scoreModel(m,a,req)).sort((x,y)=>y.score-x.score).slice(0,3);
    const targetText = `${req.winterTarget}+ miles of cold-weather range as a sensible guide`;
    const chargingText = req.rapidImportant ? 'strong rapid charging' : 'rapid charging does not need to dominate the decision';
    const homeText = a.home === 'yes' ? 'home charging available' : a.home === 'planned' ? 'home charging planned' : 'no home charging';
    const resultsEl = $('#finder-results', modal);
    resultsEl.hidden = false;
    $('#finder-form-v2', modal).hidden = true;
    $('.fv2-progress', modal).hidden = true;
    resultsEl.innerHTML = `
      <div class="fv2-results-head">
        <div><div class="eyebrow">Your personalised shortlist</div><h2>These are the models we would investigate first.</h2><p>Based on a £${a.budget.toLocaleString('en-GB')} budget${a.stretch?` (+£${a.stretch.toLocaleString('en-GB')} flexibility)`:''}, ${homeText}, your journey pattern and the priorities you picked.</p></div>
        <button type="button" class="ghost-button compact" id="fv2-edit">Adjust answers</button>
      </div>
      <div class="fv2-brief">
        <div><span>Range target</span><b>${targetText}</b></div>
        <div><span>Charging</span><b>${chargingText}</b></div>
        <div><span>Motorway use</span><b>${a.motorway === 'frequent' ? 'Very frequent' : a.motorway === 'weekly' ? 'Most weeks' : a.motorway === 'monthly' ? 'Occasional' : 'Rare'}</b></div>
      </div>
      <div class="fv2-result-list">
        ${ranked.map((car,index)=>`
          <article class="fv2-result-card ${index===0?'top':''}">
            <div class="fv2-rank"><span>${index===0?'Best match':`#${index+1}`}</span><strong>${car.score}%</strong><small>${fitLabel(car.score)}</small></div>
            <div class="fv2-result-main">
              <div class="fv2-result-title"><div><span>${car.tag}</span><h3>${car.name}</h3></div><span class="fv2-budget-pill">${budgetLabel(car,req)}</span></div>
              <div class="fv2-specs"><span><b>~${car.range} mi</b> cold-weather guide</span><span><b>~${car.rapid} kW</b> rapid-charge guide</span><span><b>${car.connector}</b> connector</span></div>
              <div class="fv2-why"><div><h4>Why it fits</h4><ul>${car.positives.map(n=>`<li>${n.text}</li>`).join('') || '<li>It is a balanced match across your answers.</li>'}</ul></div><div><h4>What to watch</h4><ul>${car.tradeoffs.map(n=>`<li>${n.text}</li>`).join('') || '<li>No major mismatch from the answers you gave us.</li>'}</ul></div></div>
              <button type="button" class="primary-button fv2-scan-choice" data-fv2-scan="${car.name}">Found one? Scan the exact car</button>
            </div>
          </article>`).join('')}
      </div>
      <div class="fv2-data-note"><b>Important:</b> these are model-level guide matches, not live cars for sale. Budget bands and range/charging figures are approximate planning values. We will switch the budget side to live marketplace data once the approved listing API is connected.</div>`;
    $('.finder-dialog', modal)?.scrollTo({top:0,behavior:'smooth'});
  }

  function restoreForm() {
    $('#finder-results', modal).hidden = true;
    $('#finder-form-v2', modal).hidden = false;
    $('.fv2-progress', modal).hidden = false;
    setStep(1);
  }

  function installEvents() {
    $('.fv2-close', modal)?.addEventListener('click', closeFinder);
    modal.addEventListener('click', e => { if (e.target === modal) closeFinder(); });
    $('#fv2-next', modal)?.addEventListener('click', () => setStep(step + 1));
    $('#fv2-back', modal)?.addEventListener('click', () => setStep(step - 1));
    $('#finder-form-v2', modal)?.addEventListener('submit', e => { e.preventDefault(); renderResults(answers()); });
    $('#finder-priority-chips', modal)?.addEventListener('change', e => {
      const checked = selectedPriorities();
      if (checked.length > 3) {
        e.target.checked = false;
        $('#fv2-priority-help', modal).textContent = 'Choose up to 3 — remove one before adding another.';
      } else {
        $('#fv2-priority-help', modal).textContent = `${checked.length}/3 selected.`;
      }
    });
    modal.addEventListener('click', e => {
      if (e.target.closest('#fv2-edit')) { restoreForm(); return; }
      const scan = e.target.closest('[data-fv2-scan]');
      if (scan) {
        closeFinder();
        const home = $('#home');
        home?.scrollIntoView({behavior:'smooth'});
        setTimeout(()=>{
          const input = $('#listing-url');
          input?.focus();
          if (input) input.placeholder = `Paste the ${scan.dataset.fv2Scan} listing or enter its registration…`;
        }, 450);
      }
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeFinder(); });
  }

  function prefillFromAccount() {
    const p = window.EVScanAccount?.getDrivingProfile?.();
    if (!p || !Object.keys(p).length) return;
    const chooseNearest = (selector, value) => {
      const select = $(selector, modal); if (!select || value == null || value === '') return;
      const target = Number(value); if (!Number.isFinite(target)) return;
      const options = [...select.options].map(o=>({o,n:Number(o.value)})).filter(x=>Number.isFinite(x.n));
      const match = options.find(x=>target<=x.n) || options.at(-1); if (match) select.value = match.o.value;
    };
    chooseNearest('#finder-daily', p.dailyMiles);
    chooseNearest('#finder-long', p.longestTrip);
    if (['yes','no'].includes(p.homeCharging)) $('#finder-home', modal).value = p.homeCharging;
    if (p.homeCharging === 'possible') $('#finder-home', modal).value = 'planned';
    const motorwayMap = {rare:'rare',sometimes:'monthly',often:'weekly',daily:'frequent'};
    if (motorwayMap[p.motorwayFrequency]) $('#finder-motorway', modal).value = motorwayMap[p.motorwayFrequency];
    if (p.passengers) {
      const v = p.passengers === '1' || p.passengers === '2' ? '2' : p.passengers === '3-4' ? '4' : p.passengers === '5+' ? '5' : '';
      if (v) $('#finder-passengers', modal).value = v;
    }
    const saved = Array.isArray(p.priorities) ? p.priorities : [];
    saved.slice(0,3).forEach(priority => {
      const box = $(`input[name="priority"][value="${priority}"]`, modal); if (box) box.checked = true;
    });
    if (saved.length) $('#fv2-priority-help', modal).textContent = `${Math.min(3,saved.length)}/3 selected from your saved Driving Profile.`;
    if (!$('.account-profile-used', modal)) {
      const note = document.createElement('div'); note.className = 'account-profile-used';
      note.textContent = '✓ Started with your saved Driving Profile — change anything for this search.';
      $('.fv2-progress', modal)?.insertAdjacentElement('afterend', note);
    }
  }

  updateHomepageTeaser();
  renderDialog();
  installEvents();
  setStep(1);

  document.addEventListener('click', e => {
    if (e.target.closest('[data-open-finder]')) setTimeout(prefillFromAccount, 30);
  });
})();
