const SITE_URL = 'https://ev-scan-mvp.alfieparkerfellows.workers.dev';
const UPDATED = '2026-08-25';

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
  },
  {
    make: 'BMW', model: 'i3', slug: 'bmw/i3',
    title: 'Used BMW i3 Buyer’s Guide',
    metaTitle: 'Used BMW i3 Buyer’s Guide: Battery, REx & Checks | EV Scan',
    metaDescription: 'Buying a used BMW i3 in the UK? Compare battery generations and Range Extender cars, then check battery health, charging, tyres, warranty and condition.',
    answer: 'A used BMW i3 remains a clever premium city EV, but the battery generation and whether it is a pure-electric or Range Extender car change the ownership experience. Buy on verified specification, current usable range and condition—not the badge alone.',
    bestFor: ['City and suburban driving', 'Distinctive compact EV design', 'Buyers who value a light, premium cabin'],
    versions: ['Early smaller-battery pure-electric cars', '94Ah and later 120Ah pure-electric cars', 'Range Extender (REx) versions'],
    sections: [
      { heading: 'Battery generation changes the value', paragraphs: ['The i3 received larger batteries during its life, so age is not enough to tell you the useful range. Confirm the battery version from the vehicle record and specification, then judge whether its present-day range fits your regular journeys.', 'BMW says its Approved Used electric cars can receive a Battery Health Quick Report. For any i3, ask for battery-health evidence or a manufacturer assessment rather than trying to infer health from one dashboard estimate.'] },
      { heading: 'Pure electric or Range Extender?', paragraphs: ['A REx car adds a small petrol engine that generates electricity when the battery is low. It can reduce range anxiety, but it also adds an engine, fuel system, exhaust and servicing needs that a pure-electric i3 does not have.', 'If considering a REx, check it has been run and maintained correctly, starts without warnings and is appropriate for how you intend to use it.'] },
      { heading: 'Model-specific used checks', bullets: ['Confirm the battery generation and BEV/REx status.', 'Inspect the tall, narrow tyres for age, damage and matching specification.', 'Test AC and DC charging, noting that charging capability varies by age/specification.', 'Check the lightweight body panels, doors, screens, climate control and all warning messages.', 'Confirm remaining high-voltage battery warranty with BMW for the exact registration.'] },
      { heading: 'Battery and warranty context', paragraphs: ['BMW currently describes high-voltage battery cover for its electric vehicles as up to eight years or 100,000 miles from first registration, subject to the applicable terms. An older i3 may be near or beyond that limit, so obtain the exact warranty position before relying on it.'] }
    ],
    sources: [['BMW UK Approved Used electric cars','https://www.bmw.co.uk/en_GB/electric-cars/used-cars.html'],['BMW UK warranties','https://www.bmw.co.uk/en/topics/owners/service-workshop/warranties.html']],
    related: ['nissan/leaf','renault/zoe','mini/electric'],
    cta: { eyebrow: 'Found an i3?', title: 'Check its battery generation, history and value together.', copy: 'Paste the advert into EV Scan and we’ll help you assess the exact i3, its MOT pattern, expected range, price, insurance and questions for the seller.', button: 'Scan this BMW i3', href: '/#home' }
  },
  {
    make: 'Renault', model: 'Zoe', slug: 'renault/zoe',
    title: 'Used Renault Zoe Buyer’s Guide',
    metaTitle: 'Used Renault Zoe Buyer’s Guide: Battery Lease & Checks | EV Scan',
    metaDescription: 'Buying a used Renault Zoe? Check battery ownership or lease status, battery generation, charging compatibility, warranty, safety history and real-world range.',
    answer: 'A used Renault Zoe can be an affordable, easy-to-drive small EV, but you must establish whether the traction battery is owned or leased and identify the exact battery and charging version. Those details can matter more than trim level.',
    bestFor: ['Affordable local driving', 'Small-car practicality', 'Regular home or workplace charging'],
    versions: ['Early cars with smaller batteries', 'ZE40-era cars', 'Later ZE50 cars', 'Battery-owned and battery-leased examples'],
    sections: [
      { heading: 'Resolve battery ownership before anything else', paragraphs: ['Earlier Zoes were sold with separate battery-rental agreements as well as battery-owned arrangements. Do not assume the battery is included simply because the advert does not mention a lease.', 'Ask for written evidence of battery ownership or the current lease position. Renault’s warranty terms distinguish owned “i” batteries from batteries subject to a lease agreement.'] },
      { heading: 'Charging capability varies between Zoes', paragraphs: ['Zoe versions can differ in AC charging speed and whether they support DC rapid charging. Check the exact derivative and test the type of charging you expect to use; a headline battery size does not tell the whole charging story.', 'For a car used mostly around town, dependable AC charging may matter more than occasional rapid charging.'] },
      { heading: 'Model-specific used checks', bullets: ['Written proof that the battery is owned or details of any live lease.', 'Exact battery generation and current usable range.', 'AC charging on a suitable charge point and DC capability where fitted.', 'Dashboard warnings, climate control, infotainment and supplied cables.', 'Registration-specific recall status and service history.'] },
      { heading: 'Warranty and battery-health context', paragraphs: ['Renault’s published terms say owned Zoe batteries registered from 1 March 2020 can have cover for eight years or 100,000 miles, subject to the detailed conditions. Earlier and leased batteries can have different terms, so verify the individual car with Renault.'] }
    ],
    sources: [['Renault UK Z.E. battery warranty terms','https://www.renault.co.uk/warranty/renault-ze-warranty-dec2019.html'],['UK vehicle recall checker','https://www.check-vehicle-recalls.service.gov.uk/']],
    related: ['nissan/leaf','bmw/i3','vauxhall/corsa-electric'],
    cta: { eyebrow: 'Looking at a Zoe?', title: 'Confirm what you are actually buying before you view it.', copy: 'EV Scan can help you turn the advert into battery-ownership, range, MOT, price, insurance and seller questions for that exact Zoe.', button: 'Check this Renault Zoe', href: '/#home' }
  },
  {
    make: 'Hyundai', model: 'Kona Electric', slug: 'hyundai/kona-electric',
    title: 'Used Hyundai Kona Electric Buyer’s Guide',
    metaTitle: 'Used Hyundai Kona Electric Buyer’s Guide & Checks | EV Scan',
    metaDescription: 'Buying a used Hyundai Kona Electric? Compare battery versions and generations, then check recall completion, battery history, charging, warranty and tyres.',
    answer: 'A used Hyundai Kona Electric can deliver excellent efficiency and useful range in a compact crossover, especially in larger-battery form. Early cars require a registration-specific battery recall check, not a guess based only on model year.',
    bestFor: ['Range-conscious buyers', 'Efficient commuting', 'Compact crossover practicality'],
    versions: ['First-generation smaller-battery cars', 'First-generation larger-battery cars', 'Later second-generation Kona Electric'],
    sections: [
      { heading: 'Do not confuse the two generations', paragraphs: ['The newer Kona Electric is a substantially different car from the first generation, while first-generation adverts may use similar trim names across different battery sizes. Confirm generation, battery and equipment before comparing prices.'] },
      { heading: 'Battery recall completion is essential evidence', paragraphs: ['The UK recall database records battery-related action for certain Kona EVs, including battery-management software inspection and, where required, module or battery-assembly replacement. This does not mean every Kona has an unresolved problem.', 'Check the exact registration or VIN with Hyundai and ask for evidence that every applicable campaign has been completed.'] },
      { heading: 'Model-specific used checks', bullets: ['Registration/VIN recall and campaign status.', 'Evidence of any battery inspection or replacement work.', 'AC and DC charging, charge-port operation and supplied cables.', 'Tyre wear, wheel condition and any repeated MOT advisories.', 'Exact battery, trim, heat-pump and equipment specification.'] },
      { heading: 'Range, charging and warranty', paragraphs: ['The larger-battery first-generation Kona is attractive for drivers who want distance without a large car, but peak charging speed is only one part of a journey. Compare realistic motorway range and charging time with newer alternatives.', 'Ask Hyundai to confirm the remaining vehicle and high-voltage battery cover for the individual car, including how any battery replacement affected its records.'] }
    ],
    sources: [['GOV.UK Kona EV recall information','https://www.check-vehicle-recalls.service.gov.uk/recall-type/vehicle/make/HYUNDAI/model/KONA%20EV/year/2018/recalls'],['Hyundai UK Kona Electric','https://www.hyundai.com/uk/en/models/kona-electric.html']],
    related: ['kia/niro-ev','mg/mg4-ev','volkswagen/id-3'],
    cta: { eyebrow: 'Found a Kona Electric?', title: 'Check the battery history and exact version before committing.', copy: 'Scan the advert for a clear view of price, MOT history, range expectations, insurance and the recall evidence to request from the seller.', button: 'Scan this Kona Electric', href: '/#home' }
  },
  {
    make: 'Vauxhall', model: 'Corsa Electric', slug: 'vauxhall/corsa-electric',
    title: 'Used Vauxhall Corsa Electric Buyer’s Guide',
    metaTitle: 'Used Vauxhall Corsa Electric Buyer’s Guide | EV Scan',
    metaDescription: 'Buying a used Corsa-e or Corsa Electric? Compare versions, battery and charging, heat-pump equipment, warranty, software, tyres and used-car checks.',
    answer: 'A used Corsa-e or Corsa Electric is a straightforward small EV with familiar controls and CCS rapid charging. The strongest buys have a clear service history, reliable charging, the equipment you need and a price advantage over closely related rivals.',
    bestFor: ['Familiar small-car driving', 'Urban and commuter use', 'Buyers wanting CCS rapid charging'],
    versions: ['Earlier Corsa-e models', 'Later Corsa Electric badging and trims', 'Newer higher-output/larger-battery versions'],
    sections: [
      { heading: 'Compare it with its close relatives', paragraphs: ['The Corsa Electric shares core electric-car technology with models such as the Peugeot e-208. That gives used buyers useful alternatives, but trim, cabin layout, wheel size, equipment and price still differ.', 'Judge the exact car against those alternatives rather than assuming the Vauxhall or Peugeot badge is automatically better value.'] },
      { heading: 'Charging and range checks', paragraphs: ['Confirm AC charging works without warnings and test DC charging where practical. Ask which cable is supplied and whether the car has the on-board charging specification advertised.', 'Range varies with battery version, weather, speed, heating use and battery condition. Use the seller’s display as context, not a guaranteed real-world figure.'] },
      { heading: 'Model-specific used checks', bullets: ['Exact battery/motor version and original equipment.', 'AC/DC charging operation and charge scheduling.', 'Heat-pump presence where it matters to you; do not assume from trim alone.', 'Infotainment, app connectivity, cabin heating and warning messages.', 'Tyres, wheels, MOT history and registration-specific recall status.'] },
      { heading: 'Battery warranty context', paragraphs: ['Vauxhall publishes an eight-year or 100,000-mile electric-vehicle battery warranty, with detailed terms applying. Confirm the first-registration date, mileage and remaining cover on the individual used car.'] }
    ],
    sources: [['Vauxhall Corsa Electric','https://www.vauxhall.co.uk/content/vauxhall/worldwide/uk/en/index/cars/new-corsa/electric.html'],['Vauxhall warranty information','https://www.vauxhall.co.uk/content/vauxhall/worldwide/uk/en/index/owners/insurance-and-warranty/warranty.html']],
    related: ['peugeot/e-208','renault/zoe','fiat/500e'],
    cta: { eyebrow: 'Found a Corsa Electric?', title: 'See whether this one is better value than its rivals.', copy: 'Paste the advert and EV Scan will help you judge its exact version, price, MOT pattern, range, insurance and missing seller information.', button: 'Check this Corsa Electric', href: '/#home' }
  },
  {
    make: 'Peugeot', model: 'e-208', slug: 'peugeot/e-208',
    title: 'Used Peugeot e-208 Buyer’s Guide',
    metaTitle: 'Used Peugeot e-208 Buyer’s Guide: What to Check | EV Scan',
    metaDescription: 'Buying a used Peugeot e-208? Check battery and motor version, charging, heat-pump equipment, i-Cockpit driving position, warranty, software and tyres.',
    answer: 'A used Peugeot e-208 is a stylish, compact EV that can suit commuting and town use well. Before buying, make sure its i-Cockpit driving position works for you, then verify the exact electric version, charging behaviour, equipment and warranty.',
    bestFor: ['Stylish small-EV buyers', 'Commuting and town use', 'Drivers who like the i-Cockpit layout'],
    versions: ['Earlier 50 kWh-class cars', 'Different Active, Allure and GT-era trims', 'Later revised motor/battery versions'],
    sections: [
      { heading: 'Sit in it before choosing it', paragraphs: ['The small steering wheel and high-set instrument display suit some drivers better than others. Adjust the seat and wheel properly and make sure you can read the display comfortably before the rest of the test drive.'] },
      { heading: 'Exact version and equipment matter', paragraphs: ['Powertrain and trim specifications changed through the e-208’s life. Verify the derivative, first-registration date and fitted equipment rather than copying specifications from a current new-car page.', 'Compare it directly with a Corsa Electric of similar age because the two cars share important underlying EV technology but can differ in price and cabin experience.'] },
      { heading: 'Model-specific used checks', bullets: ['AC and DC charging without warning messages.', 'Cabin heating, pre-conditioning and heat-pump specification.', 'Infotainment, phone connection, cameras and driver-assistance systems.', 'Tyres, wheels and repeated MOT advisories.', 'Service history, recall status and remaining battery warranty.'] },
      { heading: 'Battery warranty and realistic range', paragraphs: ['Peugeot states that the e-208 traction battery is covered for eight years or 100,000 miles with a minimum-capacity condition, subject to its terms. Confirm what remains for the exact car.', 'Real-world range depends on speed, temperature, heating, load and battery condition, so use a journey-based requirement rather than one optimistic advert number.'] }
    ],
    sources: [['Peugeot e-208 FAQ and battery warranty','https://www.peugeot.co.uk/models/peugeot-208/faq.html'],['Peugeot e-208 official information','https://www.peugeot.co.uk/models/peugeot-208/electric.html']],
    related: ['vauxhall/corsa-electric','fiat/500e','mini/electric'],
    cta: { eyebrow: 'Found an e-208?', title: 'Check the exact car—not a generic new-car specification.', copy: 'EV Scan will help you assess the listing price, MOT history, expected range, insurance and the questions its advert has not answered.', button: 'Scan this Peugeot e-208', href: '/#home' }
  },
  {
    make: 'Fiat', model: '500e', slug: 'fiat/500e',
    title: 'Used Fiat 500e Buyer’s Guide',
    metaTitle: 'Used Fiat 500e Buyer’s Guide: Battery & Checks | EV Scan',
    metaDescription: 'Buying a used Fiat 500e? Compare battery versions, hatchback and convertible cars, then check charging, range, warranty, tyres, software and condition.',
    answer: 'A used Fiat 500e is at its best as a compact, characterful city EV. The larger-battery car is usually more flexible, but the smaller-battery version can be good value when your mileage is predictable and home charging is easy.',
    bestFor: ['City parking and short trips', 'Style-led small-EV buyers', 'Second-car duties'],
    versions: ['Smaller-battery entry versions', 'Larger-battery versions', 'Hatchback and convertible body styles'],
    sections: [
      { heading: 'Choose the battery for your real routine', paragraphs: ['The two battery choices create meaningfully different used-car propositions. A lower purchase price is not a bargain if the smaller battery makes your regular journeys awkward; equally, paying for range you never use can waste budget.'] },
      { heading: 'The convertible needs an extra inspection', paragraphs: ['If viewing the fabric-roof convertible, operate the roof fully more than once and inspect its seals, condition and drainage areas. Check for warning messages and signs of water entry rather than treating the roof as a cosmetic option.'] },
      { heading: 'Model-specific used checks', bullets: ['Exact battery size, trim and body style.', 'AC/DC charging, port operation and supplied cable.', 'Infotainment, phone pairing, app features and cabin heating.', 'Tyres, small-car parking damage and wheel condition.', 'Roof operation and evidence of leaks on convertibles.'] },
      { heading: 'Battery warranty and charging context', paragraphs: ['Fiat states that the 500 Electric battery is covered for eight years or 100,000 miles, subject to its warranty conditions. Confirm remaining cover using the car’s first-registration date and mileage.', 'The 500e can rapid-charge, but battery size and conditions affect charging performance. For city-focused owners, dependable overnight AC charging may be the more important test.'] }
    ],
    sources: [['Fiat UK 500 Electric','https://www.fiat.co.uk/models/fiat-500-electric'],['UK vehicle recall checker','https://www.check-vehicle-recalls.service.gov.uk/']],
    related: ['mini/electric','peugeot/e-208','vauxhall/corsa-electric'],
    cta: { eyebrow: 'Found a 500e?', title: 'Check whether its battery and price fit your life.', copy: 'Scan the listing for a clearer view of version, value, MOT history, realistic range, insurance and seller questions.', button: 'Check this Fiat 500e', href: '/#home' }
  },
  {
    make: 'MINI', model: 'Electric', slug: 'mini/electric',
    title: 'Used MINI Electric Buyer’s Guide',
    metaTitle: 'Used MINI Electric Buyer’s Guide: Range & Checks | EV Scan',
    metaDescription: 'Buying a used MINI Electric? Understand the earlier hatchback’s range limits, then check battery health, charging, tyres, equipment, warranty and condition.',
    answer: 'The earlier used MINI Electric is fun, compact and easy to place, but its modest range makes it a specialist choice rather than a universal first EV. It works best when your routine is predictable and you can charge conveniently.',
    bestFor: ['Short predictable journeys', 'Drivers who value compact handling', 'Home-charged second-car use'],
    versions: ['Earlier F56-generation MINI Electric / Cooper SE', 'Different Level and trim packages', 'New-generation all-electric MINI Cooper'],
    sections: [
      { heading: 'Separate the two generations', paragraphs: ['Used adverts may now mix the earlier MINI Electric with the newer all-electric MINI Cooper. They have different batteries, range and technology, so verify generation and derivative before comparing prices.', 'This guide’s range caution is particularly important for the earlier F56-based car.'] },
      { heading: 'Range fit matters more than performance', paragraphs: ['The earlier MINI Electric can be excellent for commuting and local journeys, but buyers who frequently need long motorway trips should compare a longer-range alternative. Winter, motorway speed and heating can all reduce the distance available.', 'Plan around your difficult weekly journey, not your easiest daily trip.'] },
      { heading: 'Model-specific used checks', bullets: ['Battery generation and current usable range.', 'AC/DC charging and supplied cables.', 'Tyres, wheels, suspension and parking damage.', 'Climate control, infotainment, app connectivity and warning messages.', 'Exact trim/equipment and remaining warranty.'] },
      { heading: 'Battery warranty context', paragraphs: ['MINI describes high-voltage battery protection for its electric vehicles for up to eight years or 100,000 miles from first registration, subject to warranty conditions. Confirm the exact remaining cover with a MINI retailer.'] }
    ],
    sources: [['MINI UK electric warranty','https://www.mini.co.uk/en_GB/home/owners/mini-warranties.html/1000'],['MINI Approved Used Electric','https://www.mini.co.uk/en_GB/home/range/approved-used-electric.html']],
    related: ['bmw/i3','fiat/500e','peugeot/e-208'],
    cta: { eyebrow: 'Found a MINI Electric?', title: 'Make sure its real range is enough before the test drive wins you over.', copy: 'EV Scan can help you assess the advert, price, MOT history, range fit, insurance and missing seller information.', button: 'Scan this MINI Electric', href: '/#home' }
  },
  {
    make: 'Audi', model: 'e-tron', slug: 'audi/e-tron',
    title: 'Used Audi e-tron Buyer’s Guide',
    metaTitle: 'Used Audi e-tron Buyer’s Guide: Battery & Checks | EV Scan',
    metaDescription: 'Buying a used Audi e-tron SUV? Compare 50, 55 and S versions, then check battery health, charging, warranty, tyres, suspension, equipment and history.',
    answer: 'A used Audi e-tron can offer a quiet, spacious premium-EV experience for much less than its original price, but efficiency, tyre cost and complex equipment make condition and warranty especially important. Compare like-for-like 50, 55 and S cars.',
    bestFor: ['Quiet premium motorway travel', 'Large-cabin comfort', 'Buyers with reliable home charging'],
    versions: ['e-tron 50 quattro', 'e-tron 55 quattro', 'e-tron S', 'SUV and Sportback body styles'],
    sections: [
      { heading: 'Low used price does not mean low running-cost risk', paragraphs: ['The e-tron is a large, heavy premium SUV. Tyres, wheels, insurance and out-of-warranty repairs can still reflect that, even when depreciation has made the purchase price tempting.', 'Obtain an insurance quote and inspect every expensive feature rather than budgeting from the price alone.'] },
      { heading: 'Battery and charging evidence', paragraphs: ['Audi says fully electric Approved Used cars under eight years old receive a battery health certificate. If buying elsewhere, ask what battery-health evidence is available and verify current range through a representative drive.', 'Test both charge-port operation and AC charging; where practical, confirm DC rapid charging and check for charge-related warnings.'] },
      { heading: 'Model-specific used checks', bullets: ['Exact 50, 55 or S derivative and body style.', 'Battery-health evidence and remaining high-voltage battery warranty.', 'Both charge ports/doors where fitted, cables and charging behaviour.', 'Air suspension operation where fitted, tyres and wheel damage.', 'Climate control, cameras, screens, driver assistance and all warning messages.'] },
      { heading: 'Warranty context', paragraphs: ['Audi describes e-tron battery cover for up to eight years or 100,000 miles, whichever comes first, subject to terms. Approved Used cover is separate, so establish exactly which warranty applies and for how long.'] }
    ],
    sources: [['Audi UK Approved Used electric cars','https://www.audi.co.uk/en/used-cars/used-electric-and-hybrid/'],['Audi UK e-tron service and battery warranty','https://www.audi.co.uk/en/owners/service-and-maintenance/service-plans/e-tron/']],
    related: ['jaguar/i-pace','tesla/model-y','skoda/enyaq'],
    cta: { eyebrow: 'Found a depreciated e-tron?', title: 'Check whether the car is affordable to own, not only to buy.', copy: 'Scan the advert for price context, MOT patterns, expected range, insurance and the evidence you should request before viewing.', button: 'Check this Audi e-tron', href: '/#home' }
  },
  {
    make: 'Jaguar', model: 'I-PACE', slug: 'jaguar/i-pace',
    title: 'Used Jaguar I-PACE Buyer’s Guide',
    metaTitle: 'Used Jaguar I-PACE Buyer’s Guide: Recall & Checks | EV Scan',
    metaDescription: 'Buying a used Jaguar I-PACE? Check battery recall status, software, charging, battery health, warranty, tyres, suspension and premium-car running costs.',
    answer: 'A used Jaguar I-PACE can be a compelling performance EV at its depreciated price, but it is not a car to buy without registration-specific battery recall evidence, battery and charging checks, a complete history and a realistic repair budget.',
    bestFor: ['Premium performance and comfort', 'Drivers wanting a distinctive EV', 'Buyers with strong warranty/history evidence'],
    versions: ['EV400-era S, SE and HSE trims', 'Later model-year equipment revisions', 'Special and high-specification editions'],
    sections: [
      { heading: 'Battery recall status is a first-line check', paragraphs: ['I-PACE battery campaigns have made registration/VIN-specific recall checking essential. Do not rely on a seller saying “all updates done” without documentary evidence or confirmation from Jaguar.', 'Use the UK recall checker and ask a Jaguar retailer to confirm every applicable campaign, software update, inspection or remedy for the exact car.'] },
      { heading: 'Depreciation does not remove premium-car costs', paragraphs: ['An I-PACE may cost less used than a newer mainstream EV, but tyres, insurance, suspension and complex electrical equipment can still carry premium-car costs. A strong warranty can therefore be materially valuable.', 'Check the warranty’s exclusions and claim limit rather than accepting the word “warranty” as enough.'] },
      { heading: 'Model-specific used checks', bullets: ['VIN-specific battery recall/campaign status and written completion evidence.', 'Battery-health assessment, charging behaviour and realistic current range.', 'AC/DC charging, port operation and supplied cables.', 'Tyres, wheels, suspension, brakes and repeated MOT advisories.', 'Screens, cameras, climate control, keys, app connectivity and warning history.'] },
      { heading: 'Battery warranty context', paragraphs: ['Jaguar states that the I-PACE battery warranty is limited to eight years or 100,000 miles and includes a State of Health condition, subject to the detailed terms. Verify age, mileage, measured battery status and remaining cover on the exact car.'] }
    ],
    sources: [['UK vehicle recall checker','https://www.check-vehicle-recalls.service.gov.uk/'],['Jaguar UK I-PACE battery warranty information','https://buy.jaguar.co.uk/page/terms-and-conditions']],
    related: ['audi/e-tron','tesla/model-y','polestar/2'],
    cta: { eyebrow: 'Considering an I-PACE?', title: 'Make the battery history and recall evidence part of the price decision.', copy: 'EV Scan can help you organise the advert, MOT record, range, insurance, value and seller questions before you risk premium-car money.', button: 'Scan this Jaguar I-PACE', href: '/#home' }
  },
  {
    make: 'Volkswagen', model: 'ID.4', slug: 'volkswagen/id-4',
    title: 'Used Volkswagen ID.4 Buyer’s Guide',
    metaTitle: 'Used Volkswagen ID.4 Buyer’s Guide: What to Check | EV Scan',
    metaDescription: 'Buying a used VW ID.4? Compare battery and drivetrain versions, then check software, charging, tyres, warranty, equipment and family-EV value.',
    answer: 'A used Volkswagen ID.4 is a practical family EV with a broad choice of batteries and drivetrains. The best buys have the right battery for your journeys, current software, reliable charging and a clear price advantage over closely related alternatives.',
    bestFor: ['Family space', 'Comfortable everyday driving', 'Buyers wanting a mainstream electric SUV'],
    versions: ['Smaller-battery Pure-era cars', 'Pro / Pro Performance versions', 'GTX all-wheel-drive versions'],
    sections: [
      { heading: 'Battery and drivetrain names need decoding', paragraphs: ['Used ID.4 adverts can mix trim, battery and performance labels. Confirm the usable battery class, rear- or all-wheel drive, model year and original equipment before comparing price or range.', 'A larger battery helps on long journeys, while a smaller-battery car can be the better-value family EV when daily mileage is modest.'] },
      { heading: 'Software is a used-car inspection item', paragraphs: ['Check the software version, infotainment response, navigation, cameras, phone connection, charging schedules and whether any warning messages return after a restart.', 'Ask whether applicable software campaigns have been completed and verify the position with Volkswagen for the registration.'] },
      { heading: 'Model-specific used checks', bullets: ['Exact battery, motor, trim and model year.', 'Software/campaign status and infotainment stability.', 'AC/DC charging, port operation and supplied cables.', 'Tyres, wheels, suspension and MOT pattern.', 'Remaining vehicle and high-voltage battery warranty.'] },
      { heading: 'Battery warranty and related alternatives', paragraphs: ['Volkswagen states that its pure-electric cars have an eight-year or 100,000-mile high-voltage battery warranty, with a capacity threshold and detailed conditions. Confirm the car’s remaining cover.', 'Also compare the Škoda Enyaq, which shares key platform technology but offers a different cabin and ownership proposition.'] }
    ],
    sources: [['Volkswagen UK battery warranty','https://www.volkswagen.co.uk/en/owners-and-services/my-car/warranties.html/__layer/layers/owners/my-car/warranties/understanding-battery-degradation/master.layer'],['Volkswagen ID.4 official information','https://www.volkswagen.co.uk/en/electric-and-hybrid/electric-cars/id4.html']],
    related: ['skoda/enyaq','volkswagen/id-3','tesla/model-y'],
    cta: { eyebrow: 'Found an ID.4?', title: 'Check the exact battery, software and value before viewing.', copy: 'Paste the advert and EV Scan will help you assess price, MOT history, realistic range, insurance and the gaps in the seller’s description.', button: 'Check this Volkswagen ID.4', href: '/#home' }
  },
  {
    make: 'Cupra', model: 'Born', slug: 'cupra/born',
    title: 'Used Cupra Born Buyer’s Guide',
    metaTitle: 'Used Cupra Born Buyer’s Guide: Battery, Range & Checks | EV Scan',
    metaDescription: 'Buying a used Cupra Born in the UK? Compare battery and e-Boost versions, real-world range, charging, warranty, software, tyres and insurance checks.',
    answer: 'A used Cupra Born is a strong electric hatchback if you want Volkswagen ID.3 fundamentals with sportier styling. Confirm the battery, power output and equipment first: similar-looking cars can differ materially in range, charging, performance and insurance cost.',
    bestFor: ['Sporty electric hatchback buyers', 'Everyday family use', 'Drivers comparing an ID.3 or MG4'],
    versions: ['58 kWh-class rear-wheel-drive versions', 'e-Boost performance versions', '77 kWh-class V3 editions'],
    sections: [
      { heading: 'Battery, range and charging differences', paragraphs: ['Most early UK cars use the mid-size battery, while larger-battery editions trade extra purchase price and weight for longer official range. Real range will be lower than WLTP in cold, fast or heavily loaded driving.', 'Check AC and DC charging, the charge-port lock, scheduled charging and any supplied cable. Peak charging speed is not the same as a flat charging curve, so judge the car against your normal stops.'] },
      { heading: 'Software, trim and running costs', paragraphs: ['Confirm the exact V1, V2 or V3-era specification and whether later software campaigns or updates have been applied. Test the infotainment, phone connection, navigation, climate controls, cameras and driver-assistance settings.', 'Large wheels and e-Boost performance can raise tyre and insurance costs. Obtain a quote for the exact registration before paying a deposit.'] },
      { heading: 'What to inspect on a used Cupra Born', bullets: ['Battery and power version shown by the VIN/build data.', 'Software version, warning history and campaign status.', 'AC/DC charging and cable condition.', 'Tyres, wheel damage, alignment and repeated MOT advisories.', 'Remaining vehicle and high-voltage battery warranty.'] },
      { heading: 'Who does the Born suit?', paragraphs: ['It suits buyers who want a compact EV with useful rear space and a more characterful cabin than an ID.3. Compare it directly with the ID.3 and MG4: the best choice is the individual car with the right equipment, insurance and price, not automatically the sportiest badge.'] }
    ],
    sources: [['CUPRA UK EV range and charging guidance','https://www.cupraofficial.co.uk/electric-and-hybrid/is-ev-right-for-me'],['CUPRA UK warranty terms','https://www.cupraofficial.co.uk/owners/care-and-maintenance/cupra-warranty'],['UK vehicle recall checker','https://www.check-vehicle-recalls.service.gov.uk/']],
    related: ['volkswagen/id-3','mg/mg4-ev','mini/electric'],
    cta: { eyebrow: 'Found a Cupra Born?', title: 'Check the exact Born, not just the advert badge.', copy: 'EV Scan will help you assess its price, MOT pattern, battery and range fit, insurance and the questions the seller has not answered.', button: 'Scan this Cupra Born', href: '/#home' }
  },
  {
    make: 'BMW', model: 'i4', slug: 'bmw/i4',
    title: 'Used BMW i4 Buyer’s Guide',
    metaTitle: 'Used BMW i4 Buyer’s Guide: eDrive35, eDrive40 & M50 Checks | EV Scan',
    metaDescription: 'Buying a used BMW i4? Compare eDrive35, eDrive40 and M50 versions, battery and charging, range, warranty, tyres, options and running costs.',
    answer: 'The BMW i4 is one of the most convincing used electric executive cars, but version and options matter. An eDrive40 is the long-range sweet spot for many buyers; eDrive35 can be better value, while M50 performance brings higher tyre and insurance exposure.',
    bestFor: ['Long-distance executive driving', 'Drivers who value handling', 'Tesla Model 3 alternatives'],
    versions: ['eDrive35 rear-wheel drive', 'eDrive40 rear-wheel drive', 'M50 xDrive high-performance all-wheel drive'],
    sections: [
      { heading: 'Choose the version around your journeys', paragraphs: ['The smaller-battery eDrive35 can suit commuting and regular home charging. The eDrive40 generally offers the strongest range balance, while the M50 is for buyers who deliberately want its performance.', 'Wheel size, temperature and motorway speed materially affect real range. Compare the dashboard estimate with recent consumption and your own worst regular journey.'] },
      { heading: 'Charging, warranty and options', paragraphs: ['Test both AC and DC charging where practical, inspect the port and confirm supplied cables. BMW’s UK warranty booklet states battery cover is subject to detailed terms for eight years or 100,000 miles from first registration.', 'Options such as adaptive suspension, upgraded audio, driving assistance and comfort equipment can affect value. Verify equipment through the VIN rather than trusting copied advert text.'] },
      { heading: 'Model-specific checks', bullets: ['Exact eDrive35, eDrive40 or M50 identity and factory options.', 'Tyre brand, tread, inner-edge wear and wheel damage.', 'Charging, preconditioning, app and infotainment functions.', 'Service, warning and recall/campaign history.', 'Insurance quote and remaining battery/vehicle warranty.'] },
      { heading: 'Ownership costs can still be premium', paragraphs: ['Used depreciation can make an i4 look affordable, but tyres, body repairs, insurance and complex optional equipment remain premium-car costs. Inspect brakes and suspension as well as the EV system, and price any missing second key or charging cable.'] }
    ],
    sources: [['BMW UK i4 technical information','https://www.bmw.co.uk/en/all-models/m-models/bmw-i4-m60/bmw-i4-m60-xdrive-gran-coupe-technical-data.html'],['BMW UK vehicle warranty booklet','https://www.bmw.co.uk/content/dam/bmw/marketGB/bmw_co_uk/owners/service-workshop/bmw-warranties/BMW_Warranty_Booklet_EAA_Compliant.pdf.asset.1764772884104.pdf'],['UK vehicle recall checker','https://www.check-vehicle-recalls.service.gov.uk/']],
    related: ['tesla/model-3','polestar/2','bmw/i3'],
    cta: { eyebrow: 'Considering a BMW i4?', title: 'Check whether this i4’s version and options justify the price.', copy: 'Scan the advert for a clearer view of value, MOT history, range fit, insurance and the evidence to request before viewing.', button: 'Scan this BMW i4', href: '/#home' }
  },
  {
    make: 'BMW', model: 'iX3', slug: 'bmw/ix3',
    title: 'Used BMW iX3 Buyer’s Guide',
    metaTitle: 'Used BMW iX3 Buyer’s Guide: Range, Charging & Checks | EV Scan',
    metaDescription: 'Buying the first-generation used BMW iX3? Check battery range, rear-wheel drive, charging, warranty, tyres, options and premium-SUV running costs.',
    answer: 'A first-generation used BMW iX3 is a refined, practical premium EV with a straightforward rear-wheel-drive layout. Do not confuse it with the all-new 2026 iX3: used examples have different technology, range and charging performance.',
    bestFor: ['Comfortable family motorway use', 'Traditional BMW controls', 'Premium SUV buyers with home charging'],
    versions: ['Premier Edition / Premier Edition Pro early cars', 'M Sport', 'M Sport Pro'],
    sections: [
      { heading: 'Separate the used iX3 from the new generation', paragraphs: ['Most current used UK stock is the earlier G08-based iX3. New-generation specifications published for 2026 do not describe those cars, so identify model year and factory equipment before comparing range or charging claims.', 'The earlier car is rear-wheel drive rather than xDrive. That helps efficiency, but buyers who specifically need all-wheel drive should choose accordingly.'] },
      { heading: 'Range, charging and battery cover', paragraphs: ['Use recent consumption and a realistic cold-motorway scenario instead of the advert’s maximum range. Test AC and DC charging, charging schedules, preconditioning and the BMW app.', 'BMW’s UK warranty booklet describes high-voltage battery cover for eight years or 100,000 miles, subject to its terms. Verify the first-registration date, mileage and remaining cover.'] },
      { heading: 'What to inspect', bullets: ['Correct first-generation model identity and exact trim.', 'Tyres, large alloy wheels, brakes and suspension.', 'Charging port, cables, app, cameras and infotainment.', 'Service history and outstanding recalls/campaigns.', 'Panoramic roof, powered tailgate and all costly options.'] },
      { heading: 'Who should buy one?', paragraphs: ['The iX3 suits a buyer who values comfort, cabin familiarity and a useful boot more than dramatic EV styling. Compare it with an Audi Q4 e-tron, Mercedes EQB and Tesla Model Y, including insurance and warranty rather than purchase price alone.'] }
    ],
    sources: [['BMW UK vehicle warranty booklet','https://www.bmw.co.uk/content/dam/bmw/marketGB/bmw_co_uk/owners/service-workshop/bmw-warranties/BMW_Warranty_Booklet_EAA_Compliant.pdf.asset.1764772884104.pdf'],['UK vehicle recall checker','https://www.check-vehicle-recalls.service.gov.uk/']],
    related: ['tesla/model-y','audi/e-tron','volkswagen/id-4'],
    cta: { eyebrow: 'Found a used iX3?', title: 'Check the generation, range fit and premium-car costs together.', copy: 'EV Scan can organise its advert, MOT history, expected range, insurance and seller questions before you book a viewing.', button: 'Scan this BMW iX3', href: '/#home' }
  },
  {
    make: 'Audi', model: 'Q4 e-tron', slug: 'audi/q4-e-tron',
    title: 'Used Audi Q4 e-tron Buyer’s Guide',
    metaTitle: 'Used Audi Q4 e-tron Buyer’s Guide: Battery & Checks | EV Scan',
    metaDescription: 'Buying a used Audi Q4 e-tron? Compare 35, 40, 45 and 50 quattro versions, range, charging, software, warranty, trim and family-EV costs.',
    answer: 'A used Audi Q4 e-tron is a polished family EV, but its badge numbers changed alongside battery, motor and charging updates. Confirm the exact model year and powertrain before comparing price, range or warranty.',
    bestFor: ['Premium family practicality', 'Comfortable commuting', 'Buyers comparing Enyaq and ID.4'],
    versions: ['Early 35 e-tron smaller-battery cars', '40 / later 45 rear-wheel-drive cars', '50 / later 55 quattro cars', 'SUV and Sportback body styles'],
    sections: [
      { heading: 'Decode the badge and model year', paragraphs: ['Q4 e-tron names do not all mean the same battery or performance. Later powertrain revisions improved some range and charging figures, so use VIN/build data and the registration year instead of assuming every Q4 with a similar badge matches.', 'Sportback shape, wheel size and quattro drive also influence space, efficiency, tyres and insurance.'] },
      { heading: 'Charging, software and warranty', paragraphs: ['Test AC and DC charging, the port lock, route planning, preconditioning where fitted and scheduled charging. Check infotainment, cameras, phone integration and whether relevant software campaigns are complete.', 'Audi states e-tron high-voltage battery warranty cover runs for up to eight years or 100,000 miles, subject to the detailed terms. Confirm what remains on the exact car.'] },
      { heading: 'Model-specific inspection list', bullets: ['Exact battery, motor, body style, trim and model year.', 'Software and service-campaign status.', 'Tyres, wheel damage, alignment and suspension noises.', 'AC/DC charging and supplied cables.', 'Heat pump and other advertised options actually fitted.'] },
      { heading: 'Price it against its platform relatives', paragraphs: ['The Q4 shares underlying technology with the Volkswagen ID.4, Škoda Enyaq and Cupra Born. Audi finish and equipment may justify a premium, but compare usable space, warranty, options and condition before paying for the badge.'] }
    ],
    sources: [['Audi UK Q4 e-tron battery and powertrain information','https://www.audi.co.uk/en/models/q4/q4-e-tron/layers/battery-and-powertrain/'],['Audi UK e-tron battery warranty and service plans','https://www.audi.co.uk/en/owners/service-and-maintenance/service-plans/e-tron/'],['UK vehicle recall checker','https://www.check-vehicle-recalls.service.gov.uk/']],
    related: ['skoda/enyaq','volkswagen/id-4','audi/e-tron'],
    cta: { eyebrow: 'Looking at a Q4 e-tron?', title: 'Check the exact powertrain before paying the Audi premium.', copy: 'Scan the car to assess price, MOT history, realistic range, insurance and missing specification evidence.', button: 'Scan this Audi Q4 e-tron', href: '/#home' }
  },
  {
    make: 'Mercedes-Benz', model: 'EQA', slug: 'mercedes-benz/eqa',
    title: 'Used Mercedes EQA Buyer’s Guide',
    metaTitle: 'Used Mercedes EQA Buyer’s Guide: Range, Charging & Checks | EV Scan',
    metaDescription: 'Buying a used Mercedes EQA? Compare EQA 250 and 4MATIC versions, battery range, charging, warranty, trim, software and premium running costs.',
    answer: 'A used Mercedes EQA is an easy transition into a premium EV, especially for urban and mixed driving. Its compact-SUV packaging and real range need checking against rivals, and the exact 250, 250+ or 4MATIC version matters.',
    bestFor: ['Compact premium SUV buyers', 'Comfort-led commuting', 'Drivers wanting familiar Mercedes controls'],
    versions: ['EQA 250 front-wheel drive', 'Later EQA 250+ long-range version', 'EQA 300 / 350 4MATIC'],
    sections: [
      { heading: 'Match the derivative to your use', paragraphs: ['The common EQA 250 is likely to be the value choice, while later 250+ cars target longer range. 4MATIC models add traction and performance but usually increase weight, energy use, tyres and insurance.', 'Check model year as well as badge because battery, equipment and efficiency evolved during the car’s life.'] },
      { heading: 'Range, charging and warranty evidence', paragraphs: ['Check recent energy consumption, cold-weather motorway suitability and whether the charging speed fits your normal stops. Test AC and DC charging, pre-entry climate control, navigation and app access.', 'Ask Mercedes-Benz to confirm remaining high-voltage battery and vehicle cover for the VIN; warranty terms can differ by registration date and derivative.'] },
      { heading: 'What to inspect on an EQA', bullets: ['Exact 250, 250+ or 4MATIC derivative and trim.', 'MBUX, cameras, sensors, app and both keys.', 'Charging port, cables and charge scheduling.', 'Tyres, wheel damage, suspension and brakes.', 'Service history and open recall/campaign status.'] },
      { heading: 'Running-cost reality', paragraphs: ['An attractively depreciated EQA still carries premium-brand tyre, bodywork and insurance exposure. Check rear-seat and boot space in person, then compare it with the Q4 e-tron, iX3 and Volvo XC40 Recharge on whole-life fit.'] }
    ],
    sources: [['Mercedes-Benz UK EQA specifications','https://www.mercedes-benz.co.uk/passengercars/models/suv/eqa/overview.html'],['UK vehicle recall checker','https://www.check-vehicle-recalls.service.gov.uk/']],
    related: ['audi/q4-e-tron','volkswagen/id-4','bmw/ix3'],
    cta: { eyebrow: 'Found a Mercedes EQA?', title: 'Check whether its version, range and price fit your real life.', copy: 'EV Scan helps turn the advert into clear MOT, battery/range, insurance, value and seller checks.', button: 'Scan this Mercedes EQA', href: '/#home' }
  },
  {
    make: 'Mercedes-Benz', model: 'EQB', slug: 'mercedes-benz/eqb',
    title: 'Used Mercedes EQB Buyer’s Guide',
    metaTitle: 'Used Mercedes EQB Buyer’s Guide: Seven Seats & Checks | EV Scan',
    metaDescription: 'Buying a used Mercedes EQB? Check five- or seven-seat specification, battery range, charging, warranty, 250 and 4MATIC versions, tyres and costs.',
    answer: 'A used Mercedes EQB is unusual because some versions offer seven seats in a relatively compact electric SUV. Confirm the actual seating layout first, then check derivative, usable range with passengers, charging and premium running costs.',
    bestFor: ['Families needing occasional seven seats', 'Comfort-focused school-run use', 'Compact electric SUV buyers'],
    versions: ['EQB 250 / 250+ front-wheel-drive versions', 'EQB 300 4MATIC', 'EQB 350 4MATIC', 'Five- and seven-seat specifications'],
    sections: [
      { heading: 'Seven seats are not automatic', paragraphs: ['Do not assume every EQB advertised is a seven-seater. Inspect the exact seating layout and test third-row access, passenger limits and boot space with the seats in use.', 'A heavily loaded family journey reduces range, so plan against passengers, luggage, winter temperature and motorway speed rather than an ideal official figure.'] },
      { heading: 'Battery, charging and version choice', paragraphs: ['Front-wheel-drive versions usually make most sense for efficiency and value. 4MATIC cars suit buyers who genuinely need extra traction or performance and accept higher running costs.', 'Test AC/DC charging, route planning, preconditioning if fitted, charge scheduling and the Mercedes app. Verify battery and vehicle warranty against the VIN and first-registration date.'] },
      { heading: 'What to inspect', bullets: ['Five- or seven-seat layout and all seat mechanisms.', 'Exact derivative, model year and factory equipment.', 'Tyres, wheels, suspension and family-use interior wear.', 'MBUX, cameras, sensors, charging and both keys.', 'Service, recall/campaign and warranty records.'] },
      { heading: 'Who should buy an EQB?', paragraphs: ['It is most compelling when occasional third-row flexibility solves a real need. If you only need five seats, compare a roomier or more efficient Enyaq, ID.4, Model Y, Q4 e-tron or iX3 before accepting the Mercedes premium.'] }
    ],
    sources: [['Mercedes-Benz UK electric SUV range','https://www.mercedes-benz.co.uk/passengercars/models/suv.html/'],['UK vehicle recall checker','https://www.check-vehicle-recalls.service.gov.uk/']],
    related: ['skoda/enyaq','tesla/model-y','audi/q4-e-tron'],
    cta: { eyebrow: 'Considering an EQB?', title: 'Check the seats, range and exact derivative before viewing.', copy: 'Scan the listing for a clearer view of MOT history, family range, insurance, price and missing evidence.', button: 'Scan this Mercedes EQB', href: '/#home' }
  },
  {
    make: 'Volvo', model: 'XC40 Recharge / EX40', slug: 'volvo/xc40-recharge',
    title: 'Used Volvo XC40 Recharge / EX40 Buyer’s Guide',
    metaTitle: 'Used Volvo XC40 Recharge / EX40 Buyer’s Guide | EV Scan',
    metaDescription: 'Buying a used electric Volvo XC40 Recharge or EX40? Compare single- and twin-motor versions, range, charging, battery warranty, software and costs.',
    answer: 'The electric Volvo XC40 Recharge—renamed EX40—is a quick, practical premium compact SUV. Used buyers must distinguish early twin-motor cars from later, more efficient single-motor versions and verify software, charging and tyre condition.',
    bestFor: ['Compact family SUV use', 'Strong performance and safety focus', 'Buyers wanting Google-based infotainment'],
    versions: ['Early Recharge Twin all-wheel drive', 'Single Motor front- or later rear-wheel-drive versions', 'Extended Range and later EX40 derivatives'],
    sections: [
      { heading: 'The name and drivetrain changed', paragraphs: ['Volvo confirms the EX40 is the same model line previously called XC40 Recharge Pure Electric. Do not confuse either with the XC40 plug-in hybrid.', 'Early twin-motor cars are very quick but can use more energy and tyres. Later single-motor and extended-range versions may be the smarter choice for buyers prioritising distance and running cost.'] },
      { heading: 'Charging, software and warranty', paragraphs: ['Test AC and DC charging, Google Maps route planning, battery preconditioning, the Volvo app, cameras and software updates. Real charging time varies with temperature, battery condition and charger output.', 'Volvo states high-voltage battery cover is eight years or 100,000 miles with detailed conditions including a 70% State-of-Health threshold. Verify remaining cover for the car.'] },
      { heading: 'Model-specific used checks', bullets: ['Pure-electric identity, model year and exact single/twin-motor version.', 'Tyre wear, wheel damage, alignment and suspension.', 'Infotainment, app, cameras, climate and software state.', 'Charging port, cables and 12-volt warning history.', 'Service, recall/campaign and warranty evidence.'] },
      { heading: 'Insurance and running costs', paragraphs: ['Performance, weight and large wheels can make insurance and tyres expensive. Quote the registration before buying and compare a single-motor car with EQA, Q4 e-tron and iX3 alternatives rather than assuming every XC40 Recharge drives or costs the same.'] }
    ],
    sources: [['Volvo UK EX40 and XC40 Recharge naming information','https://www.volvocars.com/uk/cars/ex40-electric/'],['Volvo UK electric battery warranty','https://www.volvocars.com/uk/cars/electrification/battery/'],['UK vehicle recall checker','https://www.check-vehicle-recalls.service.gov.uk/']],
    related: ['audi/q4-e-tron','bmw/ix3','mercedes-benz/eqa'],
    cta: { eyebrow: 'Found an electric XC40 or EX40?', title: 'Check the motor, battery and ownership costs on this exact car.', copy: 'EV Scan will help assess its advert, MOT pattern, expected range, insurance and the questions worth asking.', button: 'Scan this Volvo XC40 Recharge', href: '/#home' }
  },
  {
    make: 'Ford', model: 'Mustang Mach-E', slug: 'ford/mustang-mach-e',
    title: 'Used Ford Mustang Mach-E Buyer’s Guide',
    metaTitle: 'Used Ford Mustang Mach-E Buyer’s Guide: Battery & Checks | EV Scan',
    metaDescription: 'Buying a used Ford Mustang Mach-E? Compare Standard and Extended Range, RWD, AWD and GT, charging, battery warranty, recalls, tyres and insurance.',
    answer: 'A used Mustang Mach-E is a spacious, distinctive long-range family EV. The exact Standard or Extended Range battery and RWD, AWD or GT drivetrain materially changes range, pace, tyres and insurance, so decode the advert before comparing price.',
    bestFor: ['Distinctive family EV buyers', 'Long-distance driving', 'Drivers wanting a large practical cabin'],
    versions: ['Standard Range RWD or AWD', 'Extended Range RWD or AWD', 'GT high-performance AWD', 'Later Standard Range LFP-battery cars'],
    sections: [
      { heading: 'Battery and drivetrain are the buying decision', paragraphs: ['Extended Range RWD is attractive for long-distance efficiency, while AWD adds traction and performance. GT should be chosen deliberately because tyres, insurance and ride priorities differ.', 'Ford identifies LFP batteries on certain later Standard Range cars and gives battery-specific charging guidance. Confirm chemistry and model year rather than applying one charging routine to every Mach-E.'] },
      { heading: 'Charging, warranty and recall checks', paragraphs: ['Test AC/DC charging, route planning, battery preconditioning where supported, Ford app access and the charge-port door. Ask about software updates and any high-voltage or 12-volt warning history.', 'Ford states high-voltage battery cover lasts eight years or 100,000 miles, subject to detailed capacity and warranty terms. Check the VIN for open recalls and completion evidence.'] },
      { heading: 'What to inspect', bullets: ['Standard/Extended Range, battery chemistry, RWD/AWD/GT identity.', 'Tyres, wheels, brakes, suspension and alignment.', 'SYNC screen, cameras, driver assistance, app and both keys.', 'Charging cables, port and AC/DC operation.', 'Service, software, recall and battery-warranty records.'] },
      { heading: 'Running-cost and suitability check', paragraphs: ['The Mach-E’s size and performance can produce expensive tyres and insurance, particularly on AWD and GT versions. Check parking fit and ride comfort, then compare it with Model Y, EV6, Enyaq and ID.4 on real family journeys.'] }
    ],
    sources: [['Ford UK EV battery warranty guidance','https://www.ford.co.uk/support/how-tos/warranty/warranties-and-coverage/how-long-do-ford-electric-vehicle-batteries-last'],['Ford UK Mustang Mach-E LFP battery guidance','https://www.ford.co.uk/support/how-tos/electric-vehicles/mustang-mach-e/lithium-iron-phosphate-electric-vehicle-batteries'],['UK vehicle recall checker','https://www.check-vehicle-recalls.service.gov.uk/']],
    related: ['tesla/model-y','kia/ev6','skoda/enyaq'],
    cta: { eyebrow: 'Found a Mustang Mach-E?', title: 'Check the exact battery and drivetrain before you fall for the styling.', copy: 'EV Scan can assess its price, MOT history, realistic range, insurance and missing seller evidence.', button: 'Scan this Mustang Mach-E', href: '/#home' }
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
  const description = 'Beginner-friendly UK used EV buyer guides covering major electric cars from Tesla, BMW, Hyundai, Kia, Volkswagen, Nissan, Renault, MG and more.';
  const schema = { '@context':'https://schema.org', '@type':'CollectionPage', name:title, description, url:canonical, isPartOf:{'@type':'WebSite',name:'EV Scan',url:absolute('/')} };
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}">${baseHead({title,description,canonical,schema})}<link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/seo.css"></head><body class="seo-page">${header()}<main class="seo-main seo-hub-main"><section class="seo-hub-hero"><span class="seo-kicker">Used EV model guides</span><h1>Know the EV before you buy the advert.</h1><p>Pick the electric car you are researching. We explain what versions exist, what matters when buying used and the checks we would make before viewing one.</p><a href="/#home">Already found a car? Scan it</a></section><section class="seo-hub-section"><div class="seo-hub-heading"><span>Start with the model</span><h2>Popular used EVs in the UK</h2></div><div class="seo-guide-grid">${models.map(card).join('')}</div></section><section class="seo-article-section"><h2>Before you choose a model</h2><p>Not sure how much battery or range you need? Start with our <a href="/ev-guides/how-much-electric-car-range-do-i-need">range guide</a>, learn <a href="/ev-guides/how-to-check-electric-car-battery-health-before-buying">how to check battery health</a>, or use the full <a href="/ev-guides/what-to-check-before-buying-used-electric-car">used-EV viewing checklist</a>.</p></section><section class="seo-problem-cta seo-hub-cta"><div><span>Not sure which model?</span><h2>Tell us how you drive instead.</h2><p>You do not need to know what battery size or charging speed you want. EV Scan’s beginner-friendly finder starts with your budget and real journeys.</p></div><a href="/#find-my-ev">Find my EV</a></section></main>${footer()}</body></html>`;
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
  const related = (model.related || []).map(modelByPath).filter(Boolean);
  const comparisons = related.length ? related : models.filter(x=>x.slug!==model.slug).slice(0,3);
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}">${baseHead({title,description,canonical,schema})}<link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/seo.css"></head><body class="seo-page">${header()}<main class="seo-main"><nav class="seo-breadcrumb"><a href="/">EV Scan</a><span>›</span><a href="/cars/">Used EV guides</a><span>›</span><span>${esc(model.make)} ${esc(model.model)}</span></nav><article><header class="seo-article-hero"><span class="seo-kicker">Used ${esc(model.make)} ${esc(model.model)} guide</span><h1>${esc(model.title)}</h1><div class="seo-direct-answer"><span>Quick answer</span><strong>${esc(model.answer)}</strong></div><div class="seo-model-fit"><span>Best for</span>${model.bestFor.map(item => `<b>${esc(item)}</b>`).join('')}</div><p class="seo-updated">Updated ${UPDATED} · UK used-EV buyer guide</p></header><div class="seo-article-body"><section class="seo-article-section"><h2>Which ${esc(model.model)} versions will you see used?</h2><p>The exact derivative matters when comparing price, range and insurance. Common used-market versions include:</p><ul>${model.versions.map(item => `<li>${esc(item)}</li>`).join('')}</ul></section>${model.sections.map(section => `<section class="seo-article-section"><h2>${esc(section.heading)}</h2>${(section.paragraphs||[]).map(p=>`<p>${esc(p)}</p>`).join('')}${section.bullets?.length?`<ul>${section.bullets.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:''}</section>`).join('')}<section class="seo-article-section"><h2>Useful checks for any used EV</h2><p>Read how to <a href="/ev-guides/how-to-check-electric-car-battery-health-before-buying">check battery health before buying</a>, decide <a href="/ev-guides/how-much-electric-car-range-do-i-need">how much range you need</a>, and use our <a href="/ev-guides/what-to-check-before-buying-used-electric-car">complete used-EV checklist</a>.</p></section></div><section class="seo-problem-cta"><div><span>${esc(model.cta.eyebrow)}</span><h2>${esc(model.cta.title)}</h2><p>${esc(model.cta.copy)}</p></div><a href="${esc(model.cta.href)}">${esc(model.cta.button)}</a></section>${sourceList(model)}<section class="seo-related"><span class="seo-section-label">Compare other used EVs</span><div class="seo-related-grid">${comparisons.map(x=>`<a href="${modelPath(x)}"><span>${esc(x.make)}</span><strong>${esc(x.model)}</strong><em>Read buyer’s guide →</em></a>`).join('')}</div></section></article></main>${footer()}</body></html>`;
}

export function renderModel404() {
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Used EV Guide Not Found | EV Scan</title><meta name="robots" content="noindex,follow"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/seo.css"></head><body class="seo-page">${header()}<main class="seo-main"><section class="seo-hub-hero"><span class="seo-kicker">Guide not found</span><h1>We have not built that EV guide yet.</h1><p>Browse the current used-EV guides or scan the exact car you have found.</p><div class="seo-404-actions"><a href="/cars/">Browse model guides</a><a href="/#home">Scan a car</a></div></section></main>${footer()}</body></html>`;
}

export function modelSitemapEntries() {
  const paths = ['/cars/', ...models.map(modelPath)];
  return paths.map(path => `<url><loc>${esc(absolute(path))}</loc><lastmod>${UPDATED}</lastmod><changefreq>weekly</changefreq><priority>${path==='/cars/'?'0.8':'0.75'}</priority></url>`).join('');
}

