const SITE_URL = 'https://ev-scan-mvp.alfieparkerfellows.workers.dev';
const UPDATED = '2026-08-24';

function esc(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function absolute(path = '/') {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export const models = [
  {
    make: 'Tesla', model: 'Model 3', slug: 'tesla/model-3',
    title: 'Used Tesla Model 3 Buyer’s Guide',
    metaTitle: 'Used Tesla Model 3 Buyer’s Guide: What to Check | EV Scan',
    metaDescription: 'Buying a used Tesla Model 3 in the UK? Learn which versions to compare, battery and charging checks, warranty points, common used-car concerns and what to ask before buying.',
    answer: 'A used Tesla Model 3 can be a very strong first EV if the price, battery version, tyres, condition and remaining warranty all make sense. The biggest beginner mistake is assuming every Model 3 with the same badge has the same battery, range or equipment.',
    bestFor: ['Efficient everyday driving', 'Long-distance charging convenience', 'Buyers who like software-led cars'],
    versions: ['Rear-Wheel Drive / Standard Range versions', 'Long Range All-Wheel Drive', 'Performance'],
    sections: [
      { heading: 'What matters most when buying a used Model 3', paragraphs: ['Identify the exact year and version before comparing prices. Battery chemistry, usable range, acceleration, wheels, charging behaviour and warranty mileage limits can differ between variants and production years.', 'Check the car is correctly transferred into your Tesla account after purchase so app access, phone key and software functions work normally.'], bullets: ['Confirm exact variant and original battery/drive-unit warranty.', 'Inspect tyres carefully; powerful versions can be expensive to re-tyre.', 'Check all cameras, screen functions, climate control and charge ports.', 'Look for evidence of previous body repairs rather than relying on panel appearance alone.'] },
      { heading: 'Battery and charging', paragraphs: ['Tesla’s own used-car guidance says battery range is an estimate and changes with conditions and driving. Treat dashboard range as useful context, not a laboratory State of Health test.', 'For a used buyer, the useful questions are whether charging works reliably, whether the remaining real-world range suits your life and how much battery/drive-unit warranty remains.'] },
      { heading: 'Which version should a beginner choose?', paragraphs: ['For many buyers, a Rear-Wheel Drive Model 3 is the simplest value choice. Long Range makes more sense for frequent long trips or buyers who want extra performance and traction. Performance should be bought because you genuinely want the speed and equipment, not because the badge sounds better.'] },
      { heading: 'What EV Scan would check next', bullets: ['Asking price against comparable Model 3 listings.', 'MOT history and repeated tyre or suspension advisories.', 'Exact version and range expectations.', 'Insurance estimate for your age and circumstances.', 'Missing seller information and questions worth asking.'] }
    ],
    sources: [['Tesla UK second-hand purchase guidance','https://www.tesla.com/en_gb/support/second-hand-purchase'],['Tesla UK certified pre-owned information','https://www.tesla.com/en_gb/certified-pre-owned']],
    cta: { eyebrow: 'Found a Model 3 for sale?', title: 'Check the exact Model 3 before you arrange a viewing.', copy: 'Paste the advert into EV Scan and we’ll help you judge the price, MOT history, battery confidence, real-world range, insurance and the questions the seller still needs to answer.', button: 'Scan this Model 3', href: '/#home' }
  },
  {
    make: 'Tesla', model: 'Model Y', slug: 'tesla/model-y',
    title: 'Used Tesla Model Y Buyer’s Guide',
    metaTitle: 'Used Tesla Model Y Buyer’s Guide: What to Check | EV Scan',
    metaDescription: 'Thinking about a used Tesla Model Y? See which versions suit different buyers, what to inspect, battery and warranty questions and how to judge a used Model Y listing.',
    answer: 'A used Tesla Model Y is worth considering if you want Model 3-style EV technology with much more cabin and boot space. The key is buying the right version at the right price rather than paying extra for range or performance you do not need.',
    bestFor: ['Family space', 'Long-distance EV use', 'Buyers wanting a large charging network'],
    versions: ['Rear-Wheel Drive', 'Long Range All-Wheel Drive', 'Performance'],
    sections: [
      { heading: 'What to check on a used Model Y', paragraphs: ['Start with the exact variant, wheel size, mileage and warranty position. Large wheels and higher-performance versions can change ride comfort, tyre cost and efficiency.', 'Inspect the tailgate, cameras, climate system, screen, charging equipment and tyres, then verify any accident or repair history independently.'], bullets: ['Compare like-for-like variants, not just “Model Y” badges.', 'Check tyre condition and matching tyre specification.', 'Confirm app/account transfer and both key-card access methods.', 'Check charging on AC and DC if possible.'] },
      { heading: 'Range and version choice', paragraphs: ['A Long Range car can be valuable for frequent motorway use, but a cheaper Rear-Wheel Drive model may be the smarter buy for normal commuting and home charging. Performance adds pace but can increase purchase, tyre and insurance costs.'] },
      { heading: 'Used Tesla warranty context', paragraphs: ['Tesla says certified pre-owned cars retain any applicable battery and drive-unit coverage, while used-vehicle warranty terms depend on how and where the car is bought. Always check the warranty shown for the exact car rather than assuming every Model Y has the same cover.'] },
      { heading: 'What EV Scan would check next', bullets: ['Whether the asking price is strong for that exact Model Y version.', 'MOT patterns, mileage and tyre-related advisories.', 'Realistic range for your driving.', 'Estimated insurance cost.', 'Similar EVs around the same budget if the Model Y is poor value.'] }
    ],
    sources: [['Tesla UK second-hand purchase guidance','https://www.tesla.com/en_gb/support/second-hand-purchase'],['Tesla UK certified pre-owned information','https://www.tesla.com/en_gb/certified-pre-owned']],
    cta: { eyebrow: 'Already found one?', title: 'Make sure the Model Y is good value, not just a good car.', copy: 'Scan the advert and we’ll turn the listing into a beginner-friendly buying report, including the things the seller has not clearly answered.', button: 'Check this Model Y', href: '/#home' }
  },
  {
    make: 'Hyundai', model: 'Ioniq 5', slug: 'hyundai/ioniq-5',
    title: 'Used Hyundai Ioniq 5 Buyer’s Guide',
    metaTitle: 'Used Hyundai Ioniq 5 Buyer’s Guide & Checks | EV Scan',
    metaDescription: 'Buying a used Hyundai Ioniq 5? Learn about battery versions, rapid charging, ICCU recall checks, trims, range and what to inspect before buying in the UK.',
    answer: 'The Hyundai Ioniq 5 is one of the strongest used EVs for buyers who value space and very fast rapid charging. Before buying, confirm the exact battery/version, charging behaviour, recall status and 12-volt/ICCU history on the individual car.',
    bestFor: ['Fast motorway charging', 'Comfort and cabin space', 'Distinctive family EV'],
    versions: ['Smaller-battery early versions', 'Long-range RWD versions', 'AWD / high-performance versions'],
    sections: [
      { heading: 'Why used buyers like the Ioniq 5', paragraphs: ['Its E-GMP electrical architecture can support very rapid DC charging when the battery and charger conditions are right. That makes it especially attractive to people who regularly travel beyond one charge.', 'The car is also unusually spacious for its footprint, which is useful for families and taller passengers.'] },
      { heading: 'ICCU and recall checks matter', paragraphs: ['Some Ioniq 5 vehicles have been affected by Integrated Charging Control Unit-related campaigns. Do not assume every car is affected or unfixed: check the exact registration/VIN with Hyundai and confirm any applicable recall or campaign work has been completed.', 'Ask specifically about 12-volt battery problems, warning messages or charging interruptions if the seller has experienced them.'] },
      { heading: 'What to inspect', bullets: ['AC and DC charging operation.', '12-volt battery/ICCU history and applicable campaign completion.', 'Tyres and alignment on large-wheel versions.', 'Exact battery size, trim and heat-pump/equipment specification.', 'Service history and remaining manufacturer/battery warranty.'] },
      { heading: 'Which version makes most sense?', paragraphs: ['For many buyers, a long-range rear-wheel-drive version gives the best balance of range, efficiency and equipment. AWD is more attractive if you specifically want the extra performance or traction.'] }
    ],
    sources: [['Hyundai UK charging guidance','https://www.hyundai.com/uk/en/electrification/charging-and-range/charging-guide.html'],['UK vehicle recall checker','https://www.check-vehicle-recalls.service.gov.uk/']],
    cta: { eyebrow: 'Found an Ioniq 5?', title: 'Check the exact car, not just the Ioniq 5 reputation.', copy: 'Paste the listing and EV Scan will help you check its MOT pattern, price, battery/range expectations, insurance and the evidence we would want from the seller.', button: 'Scan this Ioniq 5', href: '/#home' }
  },
  {
    make: 'Kia', model: 'EV6', slug: 'kia/ev6',
    title: 'Used Kia EV6 Buyer’s Guide',
    metaTitle: 'Used Kia EV6 Buyer’s Guide: ICCU, Range & Checks | EV Scan',
    metaDescription: 'Buying a used Kia EV6? Learn what to check for ICCU recall work, battery and charging performance, trim differences, warranty and used-car condition.',
    answer: 'A used Kia EV6 can be an excellent long-distance EV thanks to its fast-charging platform, but buyers should check the exact variant, remaining warranty and whether any applicable ICCU or other recall work has been completed.',
    bestFor: ['Long motorway journeys', 'Fast DC charging', 'Drivers wanting a sportier E-GMP EV'],
    versions: ['RWD versions', 'AWD versions', 'GT high-performance version'],
    sections: [
      { heading: 'The EV6’s biggest strength', paragraphs: ['The EV6 shares an advanced high-voltage platform with other E-GMP cars and can charge very quickly on suitable rapid chargers. Real charging time still depends on temperature, battery state and charger output, so do not judge it from peak kW alone.'] },
      { heading: 'Check recall completion on the individual car', paragraphs: ['The UK recall database lists an EV6 Integrated Charging Control Unit recall affecting certain vehicles. The stated issue can stop the 12-volt battery being charged correctly and may lead to a progressive reduction of motive power.', 'Kia recall work is carried out through the manufacturer/dealer network. Check the exact registration rather than assuming a whole model year is affected or already repaired.'] },
      { heading: 'What we would inspect before buying', bullets: ['Recall/campaign status and service history.', 'AC and DC charging operation.', '12-volt battery warnings or previous charging faults.', 'Tyres, wheels and suspension condition.', 'Exact RWD/AWD/GT specification and insurance cost.'] },
      { heading: 'Is RWD or AWD better used?', paragraphs: ['RWD normally makes more sense if range, efficiency and value matter most. AWD and GT versions are for buyers who genuinely value their extra performance enough to accept the purchase, tyre and insurance implications.'] }
    ],
    sources: [['GOV.UK Kia EV6 recall information','https://www.check-vehicle-recalls.service.gov.uk/recall-type/vehicle/make/KIA/model/EV6/year/2024/recalls'],['Kia UK recall checker','https://www.kia.com/uk/owners/safety-recall/']],
    cta: { eyebrow: 'Looking at an EV6?', title: 'Check whether this particular EV6 deserves a viewing.', copy: 'EV Scan can turn its listing and registration into the price, MOT, range, insurance and seller checks that matter to a first-time EV buyer.', button: 'Scan this EV6', href: '/#home' }
  },
  {
    make: 'MG', model: 'MG4 EV', slug: 'mg/mg4-ev',
    title: 'Used MG4 EV Buyer’s Guide',
    metaTitle: 'Used MG4 EV Buyer’s Guide: What to Check | EV Scan',
    metaDescription: 'Is a used MG4 EV a good buy? Compare battery and trim choices, real-world considerations, software and charging checks, tyres, insurance and used prices.',
    answer: 'The MG4 EV is one of the most interesting used-EV choices when value matters. The main job is identifying the exact battery and trim, then checking software, charging, tyres, driver-assistance behaviour and whether the price saving is large enough versus rivals.',
    bestFor: ['Strong value for money', 'First-time EV buyers', 'Rear-wheel-drive hatchback practicality'],
    versions: ['Standard-range versions', 'Long Range versions', 'Trophy / higher-equipment versions', 'XPOWER performance version'],
    sections: [
      { heading: 'Why the MG4 makes sense used', paragraphs: ['Used examples can offer a lot of EV capability for the money. That makes the MG4 particularly relevant to buyers who care more about range, practicality and purchase price than premium-brand interiors.'] },
      { heading: 'What to check before buying', bullets: ['Exact battery size and trim rather than relying on the advert headline.', 'Infotainment, phone connection and software behaviour.', 'Driver-assistance settings and whether you are comfortable with them.', 'AC/DC charging and supplied cables.', 'Tyres, alignment and wheel condition.'] },
      { heading: 'Do you need Long Range or XPOWER?', paragraphs: ['A Long Range version is useful when your routine genuinely benefits from the extra distance between charges. XPOWER is dramatically quicker, but a normal rear-wheel-drive MG4 is usually the more rational first EV when insurance, tyres and efficiency matter.'] },
      { heading: 'The value check matters most', paragraphs: ['The MG4’s appeal is strongest when it is clearly cheaper than similarly suitable rivals. If a specific example is priced close to a better-equipped, longer-warranty or more efficient alternative, compare the whole ownership proposition rather than the badge.'] }
    ],
    sources: [['MG UK','https://www.mg.co.uk/']],
    cta: { eyebrow: 'Found a cheap MG4?', title: 'Work out whether it is genuinely good value.', copy: 'Paste the listing and EV Scan will help you compare its price, range, MOT history, insurance and missing information before you message the seller.', button: 'Check this MG4', href: '/#home' }
  },
  {
    make: 'Volkswagen', model: 'ID.3', slug: 'volkswagen/id-3',
    title: 'Used Volkswagen ID.3 Buyer’s Guide',
    metaTitle: 'Used Volkswagen ID.3 Buyer’s Guide: What to Check | EV Scan',
    metaDescription: 'Buying a used VW ID.3? Learn which battery versions to compare, software and charging checks, range, tyres, warranty and what matters before buying.',
    answer: 'A used Volkswagen ID.3 can be a sensible all-round first EV, especially if you find a well-priced car with up-to-date software and the battery size that matches your real driving. Early cars deserve extra attention to software history and equipment specification.',
    bestFor: ['Everyday hatchback use', 'Balanced range and practicality', 'Buyers moving from a conventional family hatchback'],
    versions: ['Smaller-battery versions', '58 kWh-class versions', 'Larger-battery long-range versions'],
    sections: [
      { heading: 'Why exact specification matters', paragraphs: ['ID.3 model names, equipment packs and battery sizes changed through its life. Two cars advertised at similar prices can therefore have meaningfully different range, charging, seats or convenience equipment.'] },
      { heading: 'Software is part of the used-car check', paragraphs: ['Earlier ID.3s became known for software-related complaints and later updates improved the platform. Check that the car runs the expected software version, the infotainment behaves normally and there are no persistent warning messages.'] },
      { heading: 'What to inspect', bullets: ['Software version and infotainment stability.', 'Charging on AC and DC.', 'Tyres and suspension/MOT patterns.', 'Exact battery and equipment specification.', 'Remaining battery/vehicle warranty and service campaigns.'] },
      { heading: 'Who should buy one?', paragraphs: ['The ID.3 is strongest for someone who wants a normal-feeling family hatchback rather than a large SUV or ultra-minimalist EV. A mid-size battery is usually enough for everyday use; pay for the bigger one only if your journeys justify it.'] }
    ],
    sources: [['Volkswagen UK','https://www.volkswagen.co.uk/en/electric-and-hybrid/electric-cars/id3.html']],
    cta: { eyebrow: 'Comparing ID.3 adverts?', title: 'Make sure you are comparing the same battery and version.', copy: 'Scan the car and EV Scan will translate the listing into the range, MOT, price, insurance and missing-information checks that actually affect your decision.', button: 'Check this ID.3', href: '/#home' }
  },
  {
    make: 'Nissan', model: 'Leaf', slug: 'nissan/leaf',
    title: 'Used Nissan Leaf Buyer’s Guide',
    metaTitle: 'Used Nissan Leaf Buyer’s Guide: Battery & CHAdeMO Checks | EV Scan',
    metaDescription: 'Buying a used Nissan Leaf? Understand battery condition, CHAdeMO rapid charging, 40 kWh and larger-battery versions, range and what to check before buying.',
    answer: 'A used Nissan Leaf can be a cheap and easy first EV, but it needs more battery and charging-context checking than many newer rivals. Second-generation UK Leafs use CHAdeMO for rapid charging rather than CCS, and repeated rapid charging can be limited when the battery gets hot.',
    bestFor: ['Affordable local driving', 'Simple first-EV ownership', 'Buyers who mainly charge at home'],
    versions: ['40 kWh-class second-generation Leaf', 'Larger-battery Leaf e+ / later versions'],
    sections: [
      { heading: 'CHAdeMO is the first thing beginners should understand', paragraphs: ['Nissan confirms second-generation Leafs from 2018–2024 use CHAdeMO for DC rapid charging rather than CCS. That does not make the car unusable, but CCS is now the more common connector on newer UK EVs, so check the charging network around the journeys you actually make.'] },
      { heading: 'Battery temperature affects repeated rapid charging', paragraphs: ['Nissan’s own manual explains that quick-charging time can increase when battery temperature is high or low, and successive rapid charging can take longer when battery-protection logic activates. This matters more to motorway users than owners who mostly charge overnight at home.'] },
      { heading: 'What to check on a used Leaf', bullets: ['Battery capacity/health information and realistic current range.', 'CHAdeMO availability on routes you use.', 'AC charging operation and supplied cables.', 'Battery warning lights or charging faults.', 'MOT history, tyres, suspension and corrosion/condition as with any used car.'] },
      { heading: 'Who is a Leaf still good for?', paragraphs: ['A Leaf can still make excellent sense for predictable local mileage, especially when home charging removes most dependence on public rapid chargers. It is less compelling for buyers who regularly rely on long motorway journeys and want the broadest possible rapid-charger compatibility.'] }
    ],
    sources: [['Nissan UK charging connector guide','https://www.nissan.co.uk/ev-home-charging/electric-cars-information.html'],['Nissan Leaf quick-charge manual','https://www.nissan.co.uk/owners/car-repair/car-owner-manual/manuals.html/iom/leaf/0ze1/e0/2023/quick-charge-1.shtml']],
    cta: { eyebrow: 'Looking at a used Leaf?', title: 'Check whether its battery and charging setup actually fit your life.', copy: 'EV Scan can help you judge the advert, MOT history, expected range, insurance and whether a different EV around the same budget would suit you better.', button: 'Check this Leaf', href: '/#home' }
  },
  {
    make: 'Polestar', model: '2', slug: 'polestar/2',
    title: 'Used Polestar 2 Buyer’s Guide',
    metaTitle: 'Used Polestar 2 Buyer’s Guide: What to Check | EV Scan',
    metaDescription: 'Considering a used Polestar 2? Compare single and dual motor versions, battery choices, software/connectivity, tyres, charging and what to inspect before buying.',
    answer: 'A used Polestar 2 is a strong choice for buyers who want a more conventional premium-driving feel than many EVs. The main used-car checks are exact battery/motor version, software and connectivity, tyres, charging behaviour and whether the insurance cost suits you.',
    bestFor: ['Premium cabin feel', 'Motorway driving', 'Buyers wanting Google-based infotainment'],
    versions: ['Standard Range Single Motor', 'Long Range Single Motor', 'Long Range Dual Motor / Performance variants'],
    sections: [
      { heading: 'Version changes matter', paragraphs: ['Polestar 2 drivetrains and efficiency changed during the model’s life, including important differences between earlier and later single-motor cars. Compare the exact model year and derivative rather than assuming every Long Range or Single Motor car performs the same.'] },
      { heading: 'Software and connectivity are part of the inspection', paragraphs: ['Check the centre display, Google services, mobile data, phone pairing, cameras and app connectivity during the viewing. Software-led faults can be intermittent, so do not just confirm that the screen turns on.'] },
      { heading: 'Other used checks', bullets: ['Wheel and tyre condition, especially larger wheel options.', 'AC/DC charging operation.', 'Service/repair history and outstanding campaigns.', 'Battery and drivetrain warranty remaining.', 'Insurance quote before committing to a higher-performance version.'] },
      { heading: 'Which version is easiest to recommend?', paragraphs: ['A single-motor version is usually the sensible efficiency/value choice. Dual Motor makes sense when you genuinely value the extra traction and acceleration enough to accept the potential insurance, tyre and energy-cost trade-off.'] }
    ],
    sources: [['Polestar UK','https://www.polestar.com/uk/']],
    cta: { eyebrow: 'Found a Polestar 2?', title: 'Check the exact version before you pay premium-car money.', copy: 'Paste the advert and EV Scan will help you judge its value, MOT history, range expectations, insurance and what the listing still leaves unclear.', button: 'Scan this Polestar 2', href: '/#home' }
  },
  {
    make: 'Skoda', model: 'Enyaq', slug: 'skoda/enyaq',
    title: 'Used Škoda Enyaq Buyer’s Guide',
    metaTitle: 'Used Skoda Enyaq Buyer’s Guide: What to Check | EV Scan',
    metaDescription: 'Buying a used Skoda Enyaq? Compare battery versions, software, range, charging, family practicality, warranty and the checks that matter before buying.',
    answer: 'A used Škoda Enyaq is one of the easiest EVs to recommend to families because it combines a large cabin, conventional controls and useful range. The key used checks are exact battery/version, software status, tyres, charging and remaining battery warranty.',
    bestFor: ['Families and luggage space', 'Comfortable motorway use', 'Buyers wanting a conventional-feeling EV'],
    versions: ['Enyaq 60-class versions', 'Enyaq 80 / 85-class long-range versions', 'SportLine / vRS variants'],
    sections: [
      { heading: 'Why it works well as a first family EV', paragraphs: ['The Enyaq packages its battery into a practical SUV body without making the driving experience unusually complicated. That can make the transition from a petrol or diesel family car feel easier.'] },
      { heading: 'Battery size should follow your journeys', paragraphs: ['The larger-battery versions are attractive for long motorway use, but a smaller-battery Enyaq can be the better-value purchase when daily mileage is modest and home charging is easy.'] },
      { heading: 'What to check used', bullets: ['Current software and infotainment behaviour.', 'AC/DC charging operation.', 'Tyres, wheel condition and repeated MOT advisories.', 'Exact trim/battery specification.', 'Remaining battery warranty and any outstanding service campaigns.'] },
      { heading: 'Battery warranty context', paragraphs: ['Škoda UK documentation states an eight-year or 100,000-mile high-voltage battery warranty for the Enyaq range. Always confirm the exact remaining cover and warranty terms for the individual used car.'] }
    ],
    sources: [['Škoda UK Enyaq battery warranty information','https://www.skoda.co.uk/_doc/ad4c3560-b84c-4cfa-9bde-5f6fee1dcbfb']],
    cta: { eyebrow: 'Found an Enyaq?', title: 'Check whether you actually need the bigger battery.', copy: 'Scan the listing and EV Scan will help you judge the price, real-world range, MOT history, insurance and whether a cheaper version could suit you just as well.', button: 'Check this Enyaq', href: '/#home' }
  },
  {
    make: 'Kia', model: 'e-Niro / Niro EV', slug: 'kia/niro-ev',
    title: 'Used Kia e-Niro & Niro EV Buyer’s Guide',
    metaTitle: 'Used Kia e-Niro / Niro EV Buyer’s Guide | EV Scan',
    metaDescription: 'Buying a used Kia e-Niro or Niro EV? Learn battery, range, warranty, charging and trim checks plus what to inspect before buying a used electric Niro.',
    answer: 'A used Kia e-Niro or Niro EV is a particularly sensible first EV if you value efficiency, useful real-world range and straightforward ownership over ultra-fast charging or sports-car performance.',
    bestFor: ['Efficient everyday use', 'Family practicality', 'Buyers prioritising range-per-pound'],
    versions: ['Earlier e-Niro generation', 'Newer Niro EV generation', 'Different trim/equipment levels'],
    sections: [
      { heading: 'Why it remains a strong used choice', paragraphs: ['The electric Niro became popular because it combines a practical crossover body with good efficiency and a battery large enough for substantial everyday range. Used examples can therefore offer a strong balance of price and usability.'] },
      { heading: 'Charging is good enough for many buyers, not class-leading', paragraphs: ['Compared with newer high-voltage EV platforms, the Niro’s rapid charging is not its headline strength. That matters little to someone who charges at home most nights, but frequent motorway users should compare real charging time rather than just range.'] },
      { heading: 'What to check', bullets: ['Exact generation, trim and battery specification.', 'AC/DC charging operation and supplied cables.', 'Service history needed to support remaining warranty.', 'Tyres, suspension and MOT pattern.', 'Insurance and comparable-car pricing.'] },
      { heading: 'Warranty can add real used-car value', paragraphs: ['Kia’s long new-car warranty has historically been a major reason used examples remain attractive. Coverage depends on age, mileage, maintenance and exact model terms, so confirm what remains on the individual car rather than assuming.'] }
    ],
    sources: [['Kia UK recall information','https://www.kia.com/uk/owners/safety-recall/'],['Kia Niro warranty brochure','https://www.kia.com/content/dam/kwcms/kme/uk/en/assets/vehicles/The_all-new_Niro/specification/Niro_Family_SS_']],
    cta: { eyebrow: 'Found an electric Niro?', title: 'Check whether it is still the best EV for the money.', copy: 'Paste the advert and EV Scan will help you compare price, MOT history, range, insurance and similar alternatives around the same budget.', button: 'Check this Niro EV', href: '/#home' }
  }
];

function modelPath(item) { return `/cars/${item.slug}`; }
function modelByPath(slug = '') { return models.find(item => item.slug === slug) || null; }

function baseHead({ title, description, canonical, schema }) {
  return `<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="article"><meta property="og:site_name" content="EV Scan"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(canonical)}">
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}">
<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<','\\u003c')}</script>`;
}

function header() {
  return `<header class="seo-header"><a class="seo-brand" href="/"><span class="seo-brand-mark">⚡</span><span>EV Scan</span></a><nav><a href="/ev-guides/">EV guides</a><a href="/cars/">Used EV guides</a><a class="seo-nav-cta" href="/#home">Scan a car</a></nav></header>`;
}

function footer() {
  return `<footer class="seo-footer"><div><a class="seo-brand" href="/"><span class="seo-brand-mark">⚡</span><span>EV Scan</span></a><p>Free, beginner-friendly help for UK used-EV buyers. Model guides are general information; always check the individual vehicle, its documentation and any outstanding recalls.</p></div><div class="seo-footer-links"><a href="/ev-guides/">EV guides</a><a href="/cars/">Model guides</a><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a></div></footer>`;
}

function sourceList(model) {
  if (!model.sources?.length) return '';
  return `<section class="seo-model-sources"><span class="seo-section-label">Useful official sources</span><h2>Check the individual car</h2><p>Specifications, recalls and warranty coverage can vary by year and registration. These links are useful starting points:</p><div>${model.sources.map(([label,url]) => `<a href="${esc(url)}" rel="nofollow">${esc(label)} ↗</a>`).join('')}</div></section>`;
}

function card(model) {
  return `<a class="seo-guide-card seo-model-card" href="${modelPath(model)}"><span>${esc(model.make)}</span><h3>${esc(model.model)}</h3><p>${esc(model.answer)}</p><em>Read used buyer’s guide →</em></a>`;
}

export function renderModelHub() {
  const canonical = absolute('/cars/');
  const title = 'Used Electric Car Buyer’s Guides UK | EV Scan';
  const description = 'Beginner-friendly UK used EV buyer guides covering Tesla, Hyundai, Kia, MG, Volkswagen, Nissan, Polestar and Skoda electric cars.';
  const schema = { '@context':'https://schema.org', '@type':'CollectionPage', name:title, description, url:canonical, isPartOf:{'@type':'WebSite',name:'EV Scan',url:absolute('/')} };
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}">${baseHead({title,description,canonical,schema})}<link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/seo.css"></head><body class="seo-page">${header()}<main class="seo-main seo-hub-main"><section class="seo-hub-hero"><span class="seo-kicker">Used EV model guides</span><h1>Know the EV before you buy the advert.</h1><p>Pick the electric car you are researching. We explain what versions exist, what matters when buying used and the checks we would make before viewing one.</p><a href="/#home">Already found a car? Scan it</a></section><section class="seo-hub-section"><div class="seo-hub-heading"><span>Start with the model</span><h2>Popular used EVs in the UK</h2></div><div class="seo-guide-grid">${models.map(card).join('')}</div></section><section class="seo-problem-cta seo-hub-cta"><div><span>Not sure which model?</span><h2>Tell us how you drive instead.</h2><p>You do not need to know what battery size or charging speed you want. EV Scan’s beginner-friendly finder starts with your budget and real journeys.</p></div><a href="/#find-my-ev">Find my EV</a></section></main>${footer()}</body></html>`;
}

export function renderModel(slug = '') {
  const model = modelByPath(slug);
  if (!model) return null;
  const canonical = absolute(modelPath(model));
  const title = model.metaTitle;
  const description = model.metaDescription;
  const schema = {
    '@context':'https://schema.org','@type':'Article',headline:model.title,description,dateModified:UPDATED,datePublished:UPDATED,mainEntityOfPage:canonical,
    author:{'@type':'Organization',name:'EV Scan',url:absolute('/')},publisher:{'@type':'Organization',name:'EV Scan',url:absolute('/')},
    about:{'@type':'Vehicle',name:`${model.make} ${model.model}`},
    breadcrumb:{'@type':'BreadcrumbList',itemListElement:[
      {'@type':'ListItem',position:1,name:'EV Scan',item:absolute('/')},
      {'@type':'ListItem',position:2,name:'Used EV guides',item:absolute('/cars/')},
      {'@type':'ListItem',position:3,name:`${model.make} ${model.model}`,item:canonical}
    ]}
  };
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}">${baseHead({title,description,canonical,schema})}<link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/seo.css"></head><body class="seo-page">${header()}<main class="seo-main"><nav class="seo-breadcrumb"><a href="/">EV Scan</a><span>›</span><a href="/cars/">Used EV guides</a><span>›</span><span>${esc(model.make)} ${esc(model.model)}</span></nav><article><header class="seo-article-hero"><span class="seo-kicker">Used ${esc(model.make)} ${esc(model.model)} guide</span><h1>${esc(model.title)}</h1><div class="seo-direct-answer"><span>Quick answer</span><strong>${esc(model.answer)}</strong></div><div class="seo-model-fit"><span>Best for</span>${model.bestFor.map(item => `<b>${esc(item)}</b>`).join('')}</div><p class="seo-updated">Updated ${UPDATED} · UK used-EV buyer guide</p></header><div class="seo-article-body"><section class="seo-article-section"><h2>Which ${esc(model.model)} versions will you see used?</h2><p>The exact derivative matters when comparing price, range and insurance. Common used-market versions include:</p><ul>${model.versions.map(item => `<li>${esc(item)}</li>`).join('')}</ul></section>${model.sections.map(section => `<section class="seo-article-section"><h2>${esc(section.heading)}</h2>${(section.paragraphs||[]).map(p=>`<p>${esc(p)}</p>`).join('')}${section.bullets?.length?`<ul>${section.bullets.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:''}</section>`).join('')}</div><section class="seo-problem-cta"><div><span>${esc(model.cta.eyebrow)}</span><h2>${esc(model.cta.title)}</h2><p>${esc(model.cta.copy)}</p></div><a href="${esc(model.cta.href)}">${esc(model.cta.button)}</a></section>${sourceList(model)}<section class="seo-related"><span class="seo-section-label">Compare other used EVs</span><div class="seo-related-grid">${models.filter(x=>x.slug!==model.slug).slice(0,3).map(x=>`<a href="${modelPath(x)}"><span>${esc(x.make)}</span><strong>${esc(x.model)}</strong><em>Read buyer’s guide →</em></a>`).join('')}</div></section></article></main>${footer()}</body></html>`;
}

export function renderModel404() {
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Used EV Guide Not Found | EV Scan</title><meta name="robots" content="noindex,follow"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/seo.css"></head><body class="seo-page">${header()}<main class="seo-main"><section class="seo-hub-hero"><span class="seo-kicker">Guide not found</span><h1>We have not built that EV guide yet.</h1><p>Browse the current used-EV guides or scan the exact car you have found.</p><div class="seo-404-actions"><a href="/cars/">Browse model guides</a><a href="/#home">Scan a car</a></div></section></main>${footer()}</body></html>`;
}

export function modelSitemapEntries() {
  const paths = ['/cars/', ...models.map(modelPath)];
  return paths.map(path => `<url><loc>${esc(absolute(path))}</loc><lastmod>${UPDATED}</lastmod><changefreq>weekly</changefreq><priority>${path==='/cars/'?'0.8':'0.75'}</priority></url>`).join('');
}
