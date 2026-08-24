const SITE_URL = 'https://ev-scan-mvp.alfieparkerfellows.workers.dev';
const UPDATED = '2026-08-24';

function esc(v=''){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;')}
function absolute(path='/'){return `${SITE_URL}${path.startsWith('/')?path:`/${path}`}`}

const comparisons = [
  {
    slug:'hyundai-ioniq-5-vs-kia-ev6',
    title:'Hyundai Ioniq 5 vs Kia EV6: Which Is Better Used?',
    meta:'Hyundai Ioniq 5 vs Kia EV6 Used: Which Should You Buy? | EV Scan',
    description:'Comparing a used Hyundai Ioniq 5 and Kia EV6? See the beginner-friendly differences in space, comfort, performance, rapid charging and used-car checks.',
    answer:'Choose the Hyundai Ioniq 5 if you prioritise cabin space, comfort and a more relaxed feel. Choose the Kia EV6 if you prefer a lower, sportier driving position and styling. Both use closely related fast-charging technology, so the condition and value of the individual used car can matter more than the badge.',
    left:{name:'Hyundai Ioniq 5',href:'/cars/hyundai/ioniq-5',wins:['Airier cabin and rear-seat space','More relaxed, comfort-led character','Distinctive practical interior'],watch:['Check applicable ICCU/charging campaigns','Large-wheel tyre condition','Exact battery and trim']},
    right:{name:'Kia EV6',href:'/cars/kia/ev6',wins:['Sportier driving position','Strong long-distance charging','Performance-focused variants available'],watch:['Check applicable ICCU recall completion','Tyres on powerful versions','RWD/AWD/GT insurance difference']},
    verdicts:[['For family space','Ioniq 5'],['For a sportier feel','EV6'],['For rapid charging','Very close — inspect the exact car'],['For value','Whichever comparable example is priced and documented better']],
    cta:'Found one of them for sale? Scan the exact advert instead of choosing from reputation alone.'
  },
  {
    slug:'tesla-model-3-vs-polestar-2',
    title:'Tesla Model 3 vs Polestar 2: Which Is Better Used?',
    meta:'Tesla Model 3 vs Polestar 2 Used Comparison | EV Scan',
    description:'Tesla Model 3 or Polestar 2 used? Compare efficiency, charging, cabin feel, software, practicality and buying checks in plain English.',
    answer:'A used Tesla Model 3 usually makes more sense if efficiency, charging convenience and a minimalist software-led experience are priorities. A Polestar 2 is often the better fit if you prefer a more conventional premium cabin and driving feel.',
    left:{name:'Tesla Model 3',href:'/cars/tesla/model-3',wins:['Very efficient drivetrain','Strong long-distance charging ecosystem','Large used supply'],watch:['Exact battery/version changes by year','Tyres and body condition','Account/app transfer']},
    right:{name:'Polestar 2',href:'/cars/polestar/2',wins:['More conventional premium interior','Google-based infotainment','Solid motorway feel'],watch:['Software/connectivity operation','Exact motor/battery generation','Wheel and tyre costs']},
    verdicts:[['For efficiency','Model 3'],['For conventional premium feel','Polestar 2'],['For charging simplicity','Model 3'],['For the best used deal','Compare exact age, mileage, variant and condition']],
    cta:'If you have two listings open, scan the one you are most likely to buy first and compare the evidence.'
  },
  {
    slug:'mg4-vs-volkswagen-id3',
    title:'MG4 vs Volkswagen ID.3: Which Is Better Used?',
    meta:'MG4 vs Volkswagen ID.3 Used EV Comparison | EV Scan',
    description:'MG4 or Volkswagen ID.3? Compare used value, battery choices, practicality, software, charging and what first-time EV buyers should check.',
    answer:'The MG4 is usually the stronger choice when purchase price and value are the priority. The Volkswagen ID.3 can make more sense if you prefer its cabin, dealer network and more conventional Volkswagen feel. Exact battery size and software condition matter on both.',
    left:{name:'MG4 EV',href:'/cars/mg/mg4-ev',wins:['Strong value for money','Rear-wheel-drive hatchback layout','Good choice for budget-conscious first EV buyers'],watch:['Software/infotainment behaviour','Driver-assistance settings','Exact Standard/Long Range/XPOWER version']},
    right:{name:'Volkswagen ID.3',href:'/cars/volkswagen/id-3',wins:['Familiar family-hatchback proposition','Broad battery/version choice','Established VW support network'],watch:['Software status on early cars','Exact equipment packs','Charging and warning messages']},
    verdicts:[['For lowest purchase cost','Often MG4'],['For familiar VW ownership feel','ID.3'],['For performance','MG4 XPOWER if you actually need it'],['For everyday value','Compare exact battery, mileage and asking price']],
    cta:'A cheap badge price can hide a worse trim or weaker battery choice. Scan the exact listing before deciding.'
  },
  {
    slug:'tesla-model-y-vs-skoda-enyaq',
    title:'Tesla Model Y vs Škoda Enyaq: Which Is Better Used?',
    meta:'Tesla Model Y vs Skoda Enyaq Used Comparison | EV Scan',
    description:'Choosing between a used Tesla Model Y and Skoda Enyaq? Compare family space, charging, comfort, software and used-EV buying checks.',
    answer:'Choose a Tesla Model Y if software, charging integration and performance matter most. Choose a Škoda Enyaq if you want a more conventional family-car experience, comfort and familiar controls. Both can be excellent family EVs when bought in the right version.',
    left:{name:'Tesla Model Y',href:'/cars/tesla/model-y',wins:['Excellent charging integration','Strong performance and efficiency','Very large practical load space'],watch:['Tyres and wheel size','Exact RWD/Long Range/Performance version','Insurance cost']},
    right:{name:'Škoda Enyaq',href:'/cars/skoda/enyaq',wins:['Comfort-led family-car feel','Conventional controls and cabin','Useful range and luggage space'],watch:['Battery size versus your real need','Software status','Remaining battery warranty']},
    verdicts:[['For charging ecosystem','Model Y'],['For traditional family-car feel','Enyaq'],['For performance','Model Y'],['For comfort/value','Depends heavily on the exact used examples']],
    cta:'Family EVs are expensive enough that the exact advert matters. Scan the car before you commit to the badge.'
  },
  {
    slug:'nissan-leaf-vs-kia-e-niro',
    title:'Nissan Leaf vs Kia e-Niro: Which Is Better Used?',
    meta:'Nissan Leaf vs Kia e-Niro Used: Which Should You Buy? | EV Scan',
    description:'Compare a used Nissan Leaf and Kia e-Niro in plain English: range, charging connectors, motorway use, practicality and what to check before buying.',
    answer:'A Nissan Leaf can be the cheaper, simpler option for local driving and home charging. A Kia e-Niro is usually the stronger all-rounder for longer journeys because it combines good efficiency with CCS rapid charging. Price can still make a well-kept Leaf the smarter local-use purchase.',
    left:{name:'Nissan Leaf',href:'/cars/nissan/leaf',wins:['Often affordable used','Simple local-use EV','Good fit for home charging'],watch:['CHAdeMO rapid-charging compatibility','Battery condition and heat history','Successive rapid charging can slow']},
    right:{name:'Kia e-Niro / Niro EV',href:'/cars/kia/niro-ev',wins:['Strong efficiency and range','CCS rapid charging','Practical crossover shape'],watch:['Charging is not class-leading by newest-EV standards','Exact generation/trim','Warranty/service history']},
    verdicts:[['For cheapest local EV','Leaf can win'],['For long-distance flexibility','e-Niro'],['For public rapid-charger compatibility','e-Niro'],['For home-charged commuting','Either — compare price and battery condition']],
    cta:'If the Leaf is much cheaper, EV Scan can help you decide whether the saving is worth the charging compromise.'
  }
];

const useCases = [
  {
    slug:'first-used-electric-car',
    title:'Best Used Electric Cars for First-Time EV Buyers',
    meta:'Best Used Electric Cars for First-Time EV Buyers UK | EV Scan',
    description:'The best used EVs for first-time electric-car buyers in the UK, chosen for usability, charging, range, value and how easy they are to understand and live with.',
    answer:'For a first used EV, prioritise a car that comfortably covers your normal journeys, charges where you actually park, has clear battery/warranty information and does not force you to pay for performance or range you will never use.',
    picks:[
      ['Kia e-Niro / Niro EV','Strong range, efficiency and straightforward crossover practicality.','/cars/kia/niro-ev'],
      ['MG4 EV','Strong value and a good route into a modern EV without premium pricing.','/cars/mg/mg4-ev'],
      ['Volkswagen ID.3','Familiar family-hatchback size and a broad used market.','/cars/volkswagen/id-3'],
      ['Tesla Model 3','Excellent efficiency and charging if you like its screen-led interface.','/cars/tesla/model-3'],
      ['Nissan Leaf','Can be a very affordable local-use first EV if CHAdeMO suits your charging needs.','/cars/nissan/leaf']
    ],
    rules:['Buy for your real weekly driving, not the biggest battery you can afford.','Check home/work/public charging before choosing a model.','Get an insurance estimate before falling in love with a performance version.','Treat missing battery evidence as an unknown, not an automatic disaster.'],
    cta:'Don’t know which of these fits you? Tell EV Scan how far you drive, where you charge and what you can spend.'
  },
  {
    slug:'used-electric-car-for-motorway-driving',
    title:'Best Used Electric Cars for Motorway Driving',
    meta:'Best Used Electric Cars for Motorway Driving UK | EV Scan',
    description:'Best used EVs for UK motorway driving, focusing on real-world range, rapid charging speed, comfort and what actually reduces long-distance journey time.',
    answer:'For motorway driving, do not choose an EV from battery size alone. The best used motorway EVs combine enough cold-weather range with fast, repeatable rapid charging, sensible efficiency and comfortable high-speed cruising.',
    picks:[
      ['Hyundai Ioniq 5','Very fast charging platform and a spacious, comfortable cabin.','/cars/hyundai/ioniq-5'],
      ['Kia EV6','Fast charging with a slightly sportier long-distance character.','/cars/kia/ev6'],
      ['Tesla Model 3 Long Range','Efficient motorway performance with strong charging integration.','/cars/tesla/model-3'],
      ['Tesla Model Y Long Range','Useful for families needing space as well as long-distance ability.','/cars/tesla/model-y'],
      ['Škoda Enyaq long-range versions','Comfortable family SUV with useful battery capacity.','/cars/skoda/enyaq']
    ],
    rules:['Compare cold motorway range, not only WLTP.','Average charging speed matters more than one peak-kW number.','Preconditioning can make winter rapid charging much better.','Large wheels and roof boxes can reduce efficiency.'],
    cta:'Found a motorway-friendly EV? Scan the exact car and we’ll show whether its range, price and condition still make sense.'
  },
  {
    slug:'used-electric-car-without-home-charging',
    title:'Best Used Electric Cars If You Cannot Charge at Home',
    meta:'Best Used EVs Without Home Charging UK | EV Scan',
    description:'Which used EVs work best without a driveway or home charger? Focus on real range, public charging, rapid-charge speed and how often you actually need to plug in.',
    answer:'Without home charging, prioritise reliable public-charging compatibility, useful real-world range and a strong charging curve. A cheap EV that needs frequent slow public stops can be more frustrating than a slightly more expensive car that charges quickly and less often.',
    picks:[
      ['Hyundai Ioniq 5','Fast rapid charging can reduce the inconvenience of relying on public infrastructure.','/cars/hyundai/ioniq-5'],
      ['Kia EV6','Strong public rapid-charging capability for people who travel regularly.','/cars/kia/ev6'],
      ['Tesla Model 3','Efficient and easy to route through compatible rapid chargers.','/cars/tesla/model-3'],
      ['Polestar 2 Long Range','Useful range and strong motorway ability for drivers without nightly charging.','/cars/polestar/2'],
      ['MG4 Long Range','Can offer a useful balance of purchase price and fewer charging stops.','/cars/mg/mg4-ev']
    ],
    rules:['Check the chargers near places you already spend time.','Compare public charging prices before assuming an EV will be cheap to run.','Avoid depending on one local charger.','Prioritise charging speed more heavily if your annual mileage is high.'],
    cta:'Tell EV Scan that you cannot charge at home and we’ll filter recommendations around the way you actually live.'
  },
  {
    slug:'used-electric-car-for-families',
    title:'Best Used Electric Cars for Families',
    meta:'Best Used Electric Cars for Families UK | EV Scan',
    description:'Best used family EVs in the UK, focusing on cabin space, luggage, range, charging, comfort and the buying checks that matter with children and regular trips.',
    answer:'The best used family EV is not automatically the biggest SUV. Choose enough rear-seat and luggage space for your real life, then make sure the car can handle your longest regular trip without turning every family journey into a charging plan.',
    picks:[
      ['Škoda Enyaq','Comfortable, spacious and easy to understand as a family car.','/cars/skoda/enyaq'],
      ['Hyundai Ioniq 5','Excellent cabin space with very fast charging for longer trips.','/cars/hyundai/ioniq-5'],
      ['Tesla Model Y','Large load space and strong long-distance charging integration.','/cars/tesla/model-y'],
      ['Kia EV6','Good long-distance ability with useful family practicality.','/cars/kia/ev6'],
      ['Kia e-Niro / Niro EV','Efficient, practical and often easier on the used budget.','/cars/kia/niro-ev']
    ],
    rules:['Take your child seats or measure them before buying.','Check boot shape as well as the litre figure.','Winter motorway range matters for family holidays.','Insurance and tyre costs can be materially higher on powerful versions.'],
    cta:'Tell EV Scan what your family actually needs and we’ll work backwards to the range, size and charging requirements.'
  }
];

function head(title,description,canonical,type='Article'){
 const schema={'@context':'https://schema.org','@type':type,headline:title,name:title,description,url:canonical,datePublished:UPDATED,dateModified:UPDATED,author:{'@type':'Organization',name:'EV Scan',url:absolute('/')},publisher:{'@type':'Organization',name:'EV Scan',url:absolute('/')}};
 return `<title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large"><link rel="canonical" href="${esc(canonical)}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(canonical)}"><script type="application/ld+json">${JSON.stringify(schema).replaceAll('<','\\u003c')}</script><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/seo.css"><link rel="stylesheet" href="/seo-models.css">`;
}
function header(){return `<header class="seo-header"><a class="seo-brand" href="/"><span class="seo-brand-mark">⚡</span><span>EV Scan</span></a><nav><a href="/ev-guides/">EV guides</a><a href="/cars/">Model guides</a><a class="seo-nav-cta" href="/#home">Scan a car</a></nav></header>`}
function footer(){return `<footer class="seo-footer"><div><a class="seo-brand" href="/"><span class="seo-brand-mark">⚡</span><span>EV Scan</span></a><p>Beginner-friendly help for choosing and checking a used electric car in the UK.</p></div><div class="seo-footer-links"><a href="/ev-guides/">EV guides</a><a href="/cars/">Model guides</a><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a></div></footer>`}

export function renderComparison(slug=''){
 const p=comparisons.find(x=>x.slug===slug); if(!p)return null; const canonical=absolute(`/compare/${p.slug}`);
 const side=(x)=>`<article class="intent-side"><span>${esc(x.name)}</span><h2>${esc(x.name)}</h2><h3>Where it wins</h3><ul>${x.wins.map(v=>`<li>${esc(v)}</li>`).join('')}</ul><h3>What to check</h3><ul>${x.watch.map(v=>`<li>${esc(v)}</li>`).join('')}</ul><a href="${x.href}">Read ${esc(x.name)} buyer guide →</a></article>`;
 return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${head(p.meta,p.description,canonical)}</head><body class="seo-page">${header()}<main class="seo-main"><nav class="seo-breadcrumb"><a href="/">EV Scan</a><span>›</span><span>EV comparisons</span><span>›</span><span>${esc(p.title)}</span></nav><header class="seo-article-hero"><span class="seo-kicker">Used EV comparison</span><h1>${esc(p.title)}</h1><div class="seo-direct-answer"><span>Quick answer</span><strong>${esc(p.answer)}</strong></div></header><section class="intent-compare-grid">${side(p.left)}${side(p.right)}</section><section class="seo-article-body"><div class="seo-article-section"><h2>Which should you choose?</h2><div class="intent-verdicts">${p.verdicts.map(([q,a])=>`<div><span>${esc(q)}</span><b>${esc(a)}</b></div>`).join('')}</div></div><div class="seo-article-section"><h2>The used-car condition can change the answer</h2><p>These comparisons describe the models in general. A cheaper car with weak history, poor tyres, missing charging information or the wrong battery version can easily be a worse buy than the model that looks weaker on paper.</p><p>That is why EV Scan separates the reputation of the model from the evidence available for the exact car you are considering.</p></div></section><section class="seo-problem-cta"><div><span>Compare the actual advert</span><h2>${esc(p.cta)}</h2><p>Paste a listing and we’ll help you judge the exact price, MOT history, range, insurance and missing seller information.</p></div><a href="/#home">Scan a car</a></section></main>${footer()}</body></html>`;
}

export function renderUseCase(slug=''){
 const p=useCases.find(x=>x.slug===slug); if(!p)return null; const canonical=absolute(`/best/${p.slug}`);
 return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${head(p.meta,p.description,canonical)}</head><body class="seo-page">${header()}<main class="seo-main"><nav class="seo-breadcrumb"><a href="/">EV Scan</a><span>›</span><span>Best used EVs</span><span>›</span><span>${esc(p.title)}</span></nav><header class="seo-article-hero"><span class="seo-kicker">Beginner-friendly shortlist</span><h1>${esc(p.title)}</h1><div class="seo-direct-answer"><span>Quick answer</span><strong>${esc(p.answer)}</strong></div></header><section class="seo-article-body"><div class="seo-article-section"><h2>Our shortlist</h2><div class="intent-picks">${p.picks.map(([name,why,href],i)=>`<a href="${href}"><span>0${i+1}</span><div><h3>${esc(name)}</h3><p>${esc(why)}</p></div><b>Buyer guide →</b></a>`).join('')}</div></div><div class="seo-article-section"><h2>What matters more than the badge</h2><ul>${p.rules.map(v=>`<li>${esc(v)}</li>`).join('')}</ul></div></section><section class="seo-problem-cta"><div><span>Make it personal</span><h2>${esc(p.cta)}</h2><p>We ask normal questions about your journeys and budget, then work out the EV requirements behind the scenes.</p></div><a href="/#find-my-ev">Find my EV</a></section></main>${footer()}</body></html>`;
}

export function renderIntent404(){return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EV Guide Not Found | EV Scan</title><meta name="robots" content="noindex,follow"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/seo.css"></head><body class="seo-page">${header()}<main class="seo-main"><section class="seo-hub-hero"><span class="seo-kicker">Not found</span><h1>That comparison is not available yet.</h1><p>Browse our current used-EV guides or use EV Scan on the car you have found.</p><a href="/cars/">Browse used EV guides</a></section></main>${footer()}</body></html>`}

export function intentSitemapEntries(){
 const paths=[...comparisons.map(x=>`/compare/${x.slug}`),...useCases.map(x=>`/best/${x.slug}`)];
 return paths.map(path=>`<url><loc>${esc(absolute(path))}</loc><lastmod>${UPDATED}</lastmod><changefreq>monthly</changefreq><priority>0.72</priority></url>`).join('');
}

export const intentCounts={comparisons:comparisons.length,useCases:useCases.length};
