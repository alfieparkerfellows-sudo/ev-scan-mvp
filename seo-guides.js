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

export const guides = [
  {
    slug: 'how-long-do-electric-car-batteries-last',
    category: 'Battery health',
    title: 'How Long Do Electric Car Batteries Last?',
    metaTitle: 'How Long Do Electric Car Batteries Last? | EV Scan',
    metaDescription: 'How long do EV batteries really last? Learn what battery ageing means, what affects degradation and what to check before buying a used electric car.',
    answer: 'Most modern electric-car batteries are designed to last for many years, and capacity usually fades gradually rather than suddenly failing at a set age or mileage.',
    answerDetail: 'For a used EV buyer, the useful question is not “is the battery old?” but “how much usable capacity is likely to remain, what evidence is available, and is the battery warranty still relevant?”',
    keyPoints: [
      'Battery ageing is normally gradual, not an on/off failure.',
      'Age, mileage, temperature and charging history can all affect degradation.',
      'A measured battery-health report is stronger evidence than an estimate.'
    ],
    sections: [
      {
        heading: 'EV battery life and battery degradation are not the same thing',
        paragraphs: [
          'An EV battery can lose some usable capacity and still work perfectly well for everyday driving. Degradation means the car may travel fewer miles on a full charge than it did when new; it does not automatically mean the battery needs replacing.',
          'That distinction matters when shopping used. A six-year-old EV with sensible remaining range can still be a very usable car, especially if your normal journeys are short.'
        ]
      },
      {
        heading: 'What makes an EV battery age faster?',
        paragraphs: [
          'Battery chemistry, thermal management, climate, mileage and charging behaviour all matter. Cars with effective battery temperature management can handle repeated use more consistently than older designs with simpler cooling systems.'
        ],
        bullets: [
          'Very high mileage and heavy use can add battery cycles.',
          'Long periods at extremely high or low charge can be harder on some batteries.',
          'Repeated extreme heat can accelerate ageing.',
          'Different battery chemistries naturally age at different rates.'
        ]
      },
      {
        heading: 'What should you check on a used EV?',
        paragraphs: [
          'Start with the car’s current usable range, battery warranty, service history and any battery-health evidence the seller can provide. Do not treat a dashboard range number on its own as a laboratory battery test because temperature and recent driving can change that number.',
          'If the car is expensive or the battery is a major concern, an independent diagnostic battery test can be worth more than arguing over a guessed percentage.'
        ]
      },
      {
        heading: 'When should battery condition worry you?',
        bullets: [
          'Range is dramatically lower than comparable cars in similar conditions.',
          'The car reports battery or charging faults.',
          'Rapid charging behaviour is abnormal or repeatedly interrupted.',
          'The seller makes precise battery-health claims but cannot show supporting evidence.',
          'The remaining range no longer suits your actual driving needs.'
        ]
      }
    ],
    cta: {
      eyebrow: 'Found one for sale?',
      title: 'Worried about the battery on a used EV?',
      copy: 'Paste the advert into EV Scan. We’ll separate what is known, what is estimated and what you should ask the seller before viewing it.',
      button: 'Scan the EV you found',
      href: '/#home'
    },
    related: ['what-is-good-battery-health-for-used-ev', 'how-to-check-electric-car-battery-health-before-buying', 'how-much-do-ev-batteries-degrade']
  },
  {
    slug: 'how-much-do-ev-batteries-degrade',
    category: 'Battery health',
    title: 'How Much Do EV Batteries Degrade?',
    metaTitle: 'How Much Do EV Batteries Degrade? Used EV Guide | EV Scan',
    metaDescription: 'Understand EV battery degradation in plain English, what changes it and how to judge battery ageing when buying a used electric car.',
    answer: 'EV batteries normally lose usable capacity slowly over time. There is no single degradation percentage that applies to every electric car because battery chemistry, age, mileage, temperature and use all matter.',
    answerDetail: 'A small amount of degradation is normal. What matters is whether the remaining capacity and real-world range are sensible for that exact model, age and your own driving.',
    keyPoints: [
      'Some loss of usable capacity is normal as an EV ages.',
      'Do not compare different models using one universal degradation rule.',
      'Use a range or confidence estimate unless you have a measured battery report.'
    ],
    sections: [
      {
        heading: 'What battery degradation actually changes',
        paragraphs: [
          'As usable capacity falls, the main thing a driver notices is less range between charges. A car that originally suited a 200-mile routine may become less convenient if its usable range falls, while exactly the same degradation could be irrelevant to someone driving 25 miles a day.',
          'That is why a battery percentage without context can be misleading. The practical effect matters more than the headline number.'
        ]
      },
      {
        heading: 'Why two identical-looking EVs can age differently',
        bullets: [
          'One may have covered far more charge cycles.',
          'One may have spent years in a hotter climate.',
          'Battery software or thermal-management updates may differ.',
          'Charging habits and long-term storage conditions can differ.',
          'A previous battery repair or replacement may change the picture completely.'
        ]
      },
      {
        heading: 'How to judge degradation when buying used',
        paragraphs: [
          'Compare the car with the expected real-world range for the exact battery and trim, not just the manufacturer’s original test figure. Then ask whether the seller has battery diagnostics, recent charging information or warranty paperwork.',
          'If there is no measured evidence, describe the result honestly as estimated. A precise-looking number does not become accurate simply because it has a percentage sign.'
        ]
      },
      {
        heading: 'A beginner-friendly rule',
        paragraphs: [
          'Ask one simple question: if this car had a little less range in three years than it has today, would it still comfortably do the journeys you buy it for? If the answer is yes, normal degradation may not be a major buying issue.'
        ]
      }
    ],
    cta: {
      eyebrow: 'Check the actual car',
      title: 'Don’t guess battery degradation from age alone.',
      copy: 'Scan the listing and EV Scan will show you the battery information we can support, what is still unknown and the questions worth asking next.',
      button: 'Check a used EV listing',
      href: '/#home'
    },
    related: ['how-long-do-electric-car-batteries-last', 'what-is-good-battery-health-for-used-ev', 'how-much-electric-car-range-do-i-need']
  },
  {
    slug: 'what-is-good-battery-health-for-used-ev',
    category: 'Battery health',
    title: 'What Is Good Battery Health for a Used EV?',
    metaTitle: 'What Is Good Battery Health for a Used EV? | EV Scan',
    metaDescription: 'What battery health is good when buying a used EV? Learn how to interpret State of Health, remaining range and battery evidence without false precision.',
    answer: 'Good battery health is battery condition that is sensible for the car’s age and mileage and still gives you enough usable range. There is no single percentage that makes every used EV “good” or “bad”.',
    answerDetail: 'A measured State of Health figure is useful when you know how it was produced. An estimated figure should be treated as a range or confidence signal, not a guaranteed measurement.',
    keyPoints: [
      'Judge battery health against the exact model, age and mileage.',
      'A battery can be usable even after some capacity loss.',
      'Measured diagnostic evidence is more valuable than a seller guess.'
    ],
    sections: [
      {
        heading: 'What does State of Health mean?',
        paragraphs: [
          'State of Health, often shortened to SoH, is a way of describing how much useful battery capability remains compared with when the battery was new. Different diagnostic systems can calculate it differently, so two percentages are not always directly comparable.',
          'For a buyer, it is best used alongside real-world range, charging behaviour, faults and warranty status.'
        ]
      },
      {
        heading: 'Why “90% battery health” is not automatically good or bad',
        paragraphs: [
          'A figure needs context. A relatively new low-mileage car with unexpectedly weak battery evidence deserves more investigation than an older high-mileage EV whose remaining range is still perfectly suitable for the buyer.',
          'You should also ask whether the figure came from a proper diagnostic test, an app estimate, the dashboard or simply the seller’s opinion.'
        ]
      },
      {
        heading: 'What we would want to know before buying',
        bullets: [
          'Exact battery size and version of the car.',
          'Current realistic range in normal conditions.',
          'Any battery diagnostic or health report.',
          'Remaining battery warranty and its conditions.',
          'Any charging, battery or thermal-management faults.'
        ]
      },
      {
        heading: 'When a battery-health number is missing',
        paragraphs: [
          'Missing battery-health data does not automatically make the car bad. It simply means confidence should be lower until you have more evidence. That is more honest than inventing an exact percentage from age and mileage alone.'
        ]
      }
    ],
    cta: {
      eyebrow: 'Battery confidence, not fake precision',
      title: 'Found an EV but the advert says nothing about battery health?',
      copy: 'EV Scan can flag the missing evidence and turn it into a simple question for the seller instead of pretending we know what we don’t.',
      button: 'Scan the advert',
      href: '/#home'
    },
    related: ['how-to-check-electric-car-battery-health-before-buying', 'how-long-do-electric-car-batteries-last', 'how-much-do-ev-batteries-degrade']
  },
  {
    slug: 'should-i-buy-high-mileage-electric-car',
    category: 'Buying a used EV',
    title: 'Should I Buy a High-Mileage Electric Car?',
    metaTitle: 'Should I Buy a High-Mileage Electric Car? | EV Scan',
    metaDescription: 'Is a high-mileage EV a bad buy? Learn what mileage does and does not tell you, plus the battery, MOT, charging and condition checks that matter more.',
    answer: 'A high-mileage electric car can be a good buy if the price reflects the mileage and the battery, tyres, suspension, charging system and general condition are healthy.',
    answerDetail: 'Mileage is useful context, but it should not be used as a shortcut for condition. A well-maintained motorway EV can be a stronger purchase than a lower-mileage car with poor history or unresolved faults.',
    keyPoints: [
      'High mileage does not automatically mean a worn-out battery.',
      'Check wear items and MOT patterns as carefully as battery condition.',
      'The discount needs to compensate you for mileage and future resale.'
    ],
    sections: [
      {
        heading: 'What high mileage can affect on an EV',
        paragraphs: [
          'Electric cars have fewer traditional engine components than petrol or diesel cars, but they still have tyres, brakes, suspension, wheel bearings, air-conditioning, electronics, charging hardware and interior wear.',
          'Heavy use can also mean more battery cycles. That is worth investigating, but mileage by itself cannot tell you the battery’s measured condition.'
        ]
      },
      {
        heading: 'Look at the pattern, not just the odometer',
        bullets: [
          'Repeated tyre or suspension advisories in MOT history.',
          'Uneven tyre wear that could suggest alignment issues.',
          'Charging faults or slow/failed rapid charging.',
          'Missing service or repair documentation.',
          'A selling price too close to lower-mileage alternatives.'
        ]
      },
      {
        heading: 'When high mileage can actually work in your favour',
        paragraphs: [
          'Used-car buyers often pay a noticeable premium for low mileage. If two cars are otherwise similar, a higher-mileage EV can sometimes deliver much more car for the money, especially if your own annual mileage will be modest.',
          'The decision becomes a value question: is the saving large enough to compensate for additional wear and possibly weaker resale value later?'
        ]
      },
      {
        heading: 'What we would do before buying one',
        paragraphs: [
          'Check the full MOT history, inspect tyres and suspension, confirm charging works properly, understand the remaining battery warranty and ask for battery evidence if the vehicle’s value justifies it. Then compare the effective price with lower-mileage cars, not just the sticker price.'
        ]
      }
    ],
    cta: {
      eyebrow: 'Mileage is only one signal',
      title: 'Found a high-mileage EV that looks suspiciously cheap?',
      copy: 'Scan it and we’ll help you separate a genuine value opportunity from a car that simply has more unknowns.',
      button: 'Check the high-mileage EV',
      href: '/#home'
    },
    related: ['what-to-check-before-buying-used-electric-car', 'are-used-electric-cars-reliable', 'is-buying-a-used-electric-car-worth-it']
  },
  {
    slug: 'can-you-own-an-electric-car-without-home-charging',
    category: 'Living with an EV',
    title: 'Can You Own an Electric Car Without Home Charging?',
    metaTitle: 'Can You Own an Electric Car Without Home Charging? | EV Scan',
    metaDescription: 'Can you realistically own an EV without a driveway or home charger? See when public charging works well and when it can become inconvenient or expensive.',
    answer: 'Yes, you can own an electric car without home charging, but it is much easier if reliable charging is available where you regularly park, work, shop or travel.',
    answerDetail: 'The right answer depends less on battery size and more on your weekly mileage, local charging access, how often you can leave the car charging and how much public charging costs where you live.',
    keyPoints: [
      'You do not need to rapid-charge every time you need electricity.',
      'Reliable local or workplace charging matters more than theoretical charger counts.',
      'High weekly mileage makes poor charging access much more noticeable.'
    ],
    sections: [
      {
        heading: 'When EV ownership without a driveway works well',
        bullets: [
          'You have dependable workplace charging.',
          'There are destination or overnight chargers near places you already spend time.',
          'Your weekly mileage is low enough that charging is occasional rather than constant.',
          'You can comfortably use public charging prices within your budget.'
        ]
      },
      {
        heading: 'When it can become frustrating',
        paragraphs: [
          'If you drive long distances every day and the only practical option is waiting at expensive rapid chargers, the convenience and running-cost advantage can shrink quickly. A large battery helps reduce how often you stop, but it does not fix unreliable local charging.',
          'For beginners, this is why “what battery size do you want?” is the wrong first question. Your routine should decide the technical requirements.'
        ]
      },
      {
        heading: 'Questions to answer before buying',
        bullets: [
          'How many miles do you actually drive in a normal week?',
          'Where does the car sit for several hours at a time?',
          'Which chargers near those places are genuinely available to you?',
          'What do those chargers cost?',
          'How often do you make long motorway trips?'
        ]
      },
      {
        heading: 'The car still matters',
        paragraphs: [
          'If you depend on public charging, real-world range and charging speed become more important. A car with a good charging curve may be easier to live with than one that advertises a high peak charging figure but cannot sustain it for long.'
        ]
      }
    ],
    cta: {
      eyebrow: 'Don’t choose the battery first',
      title: 'Tell us how you drive. We’ll work out the EV requirements.',
      copy: 'Use Find My EV and answer normal questions about your journeys and charging access. We’ll translate them into the range and charging capability you actually need.',
      button: 'Find an EV that fits me',
      href: '/#find-my-ev'
    },
    related: ['how-much-electric-car-range-do-i-need', 'why-does-electric-car-range-drop-in-winter', 'is-buying-a-used-electric-car-worth-it']
  },
  {
    slug: 'how-much-electric-car-range-do-i-need',
    category: 'Range & charging',
    title: 'How Much Electric Car Range Do I Actually Need?',
    metaTitle: 'How Much Electric Car Range Do I Need? | EV Scan',
    metaDescription: 'Work out how much EV range you really need based on daily driving, longer trips, winter range and charging access instead of chasing the biggest battery.',
    answer: 'You need enough real-world range to cover your normal driving comfortably, with extra margin for cold weather, motorway speeds and days when you cannot charge as planned.',
    answerDetail: 'The best range target comes from your actual journeys. Buying the biggest battery possible can mean paying for weight, cost and capacity you rarely use.',
    keyPoints: [
      'Start with your longest regular journey, not your average day alone.',
      'Use realistic winter and motorway range, not only the official test figure.',
      'Home charging can reduce how much range you need to feel comfortable.'
    ],
    sections: [
      {
        heading: 'Start with three journeys',
        paragraphs: [
          'Think about your normal daily drive, your longest journey in a typical month and the occasional trip you are willing to stop and charge on. Those three scenarios tell you far more than choosing a battery capacity from a filter.'
        ]
      },
      {
        heading: 'Why official range is not your guaranteed range',
        paragraphs: [
          'Real driving changes with temperature, speed, wind, rain, heating, tyres, wheels, payload and driving style. Motorway driving in cold weather is usually a tougher range scenario than warm mixed driving.',
          'That means a sensible buyer leaves margin rather than planning every regular journey around the final few miles shown on the dashboard.'
        ]
      },
      {
        heading: 'More range is not always better value',
        paragraphs: [
          'Larger-battery versions can cost more to buy and may carry extra weight. If you can charge at home every night and drive relatively short distances, a smaller-battery car may be cheaper and still feel effortless to own.'
        ]
      },
      {
        heading: 'A better way to shop for an EV',
        bullets: [
          'Choose the journeys first.',
          'Allow a winter/motorway safety margin.',
          'Consider where you can charge.',
          'Then filter cars by realistic range and charging ability.',
          'Finally compare price, condition and battery confidence.'
        ]
      }
    ],
    cta: {
      eyebrow: 'Skip the battery-size jargon',
      title: 'Not sure how much range you need?',
      copy: 'Tell EV Scan how far you drive and where you can charge. We’ll work out the technical filters behind the scenes.',
      button: 'Work out my EV requirements',
      href: '/#find-my-ev'
    },
    related: ['can-you-own-an-electric-car-without-home-charging', 'why-does-electric-car-range-drop-in-winter', 'how-long-do-electric-car-batteries-last']
  },
  {
    slug: 'why-does-electric-car-range-drop-in-winter',
    category: 'Range & charging',
    title: 'Why Does Electric Car Range Drop in Winter?',
    metaTitle: 'Why Does EV Range Drop in Winter? | EV Scan',
    metaDescription: 'Why do electric cars lose range in cold weather? Learn how battery temperature, cabin heating and motorway driving affect winter EV range.',
    answer: 'Electric-car range drops in winter because cold batteries are less efficient and the car must also use energy to heat the battery and cabin.',
    answerDetail: 'The amount varies by vehicle, journey and temperature. Short trips can look especially inefficient because the car repeatedly warms itself up, while sustained high-speed motorway driving adds another large energy demand.',
    keyPoints: [
      'Winter range loss is normal and does not automatically mean the battery is faulty.',
      'Heat pumps and battery preconditioning can improve cold-weather efficiency and charging.',
      'Use cold motorway range when judging whether a used EV suits long winter journeys.'
    ],
    sections: [
      {
        heading: 'Cold batteries behave differently',
        paragraphs: [
          'Battery chemistry works best within a temperature window. In cold conditions the car may use energy to bring the pack to a better operating temperature, and the battery can temporarily deliver energy less efficiently.'
        ]
      },
      {
        heading: 'Heating the cabin also uses energy',
        paragraphs: [
          'A petrol or diesel car can use waste engine heat for the cabin. An EV must provide cabin heat from stored electrical energy. Efficient heat-pump systems can reduce that demand in suitable conditions, but they do not remove it entirely.'
        ]
      },
      {
        heading: 'Motorway speed compounds the problem',
        paragraphs: [
          'Air resistance rises rapidly with speed. A cold motorway journey therefore combines several difficult conditions: battery temperature, cabin heating and sustained high-speed energy use. That is why EV Scan treats cold motorway range separately from a warm-weather figure.'
        ]
      },
      {
        heading: 'What to check when buying used',
        bullets: [
          'Does this trim have a heat pump, and was it standard or optional?',
          'Can the car precondition the battery before rapid charging?',
          'What is a realistic cold motorway range for this exact battery and wheel size?',
          'Does that winter range still cover your regular long trips comfortably?'
        ]
      }
    ],
    cta: {
      eyebrow: 'Buying for real British weather?',
      title: 'Check the range that matters, not just the brochure figure.',
      copy: 'Scan the EV you are considering and we’ll show realistic range context wherever we have enough model information to support it.',
      button: 'Check an EV listing',
      href: '/#home'
    },
    related: ['how-much-electric-car-range-do-i-need', 'can-you-own-an-electric-car-without-home-charging', 'what-to-check-before-buying-used-electric-car']
  },
  {
    slug: 'how-much-does-electric-car-insurance-cost',
    category: 'Running costs',
    title: 'How Much Does Electric Car Insurance Cost?',
    metaTitle: 'How Much Does Electric Car Insurance Cost? | EV Scan',
    metaDescription: 'What affects EV insurance prices in the UK? Learn why driver age, postcode, model, mileage, use and repair risk matter before buying an electric car.',
    answer: 'There is no accurate single price for electric-car insurance. Your premium depends on the driver, postcode, exact car, claims and licence history, annual mileage, use, parking, excess and many other insurer rating factors.',
    answerDetail: 'That is why a useful EV insurance estimate needs information about you as well as the car. A cheap used EV can still be expensive to insure for a particular driver.',
    keyPoints: [
      'Insurance is personal: the same EV can produce very different premiums for two drivers.',
      'Get or estimate insurance before committing to a car, especially for younger drivers.',
      'An estimate is not an insurer quote and should be labelled clearly.'
    ],
    sections: [
      {
        heading: 'What can change an EV insurance price?',
        bullets: [
          'Your age and how long you have held your licence.',
          'Your postcode and where the car is parked overnight.',
          'No-claims history, claims and driving convictions.',
          'The exact make, model, trim and performance level.',
          'Annual mileage and whether the car is used for commuting or business.',
          'Modifications, excess and additional drivers.'
        ]
      },
      {
        heading: 'Why the exact EV matters',
        paragraphs: [
          'Insurers consider repair costs, performance, parts, theft risk and claims experience. Two EVs with similar used prices can therefore have very different insurance outcomes. Performance versions may also cost noticeably more to insure than slower trims.'
        ]
      },
      {
        heading: 'Check insurance before you fall in love with the advert',
        paragraphs: [
          'First-time buyers often spend hours comparing battery size and range, then only discover the insurance problem at the end. Put insurance into the buying decision early so you compare the true cost of ownership rather than only the purchase price.'
        ]
      },
      {
        heading: 'Estimate versus quote',
        paragraphs: [
          'A budgeting tool can give you an indicative range, but only an insurer or authorised comparison provider can give you the actual quote available to you. EV Scan deliberately describes its current result as an estimate rather than pretending it is a guaranteed premium.'
        ]
      }
    ],
    cta: {
      eyebrow: 'One more cost to check',
      title: 'Want a rough insurance estimate for the EV you found?',
      copy: 'Scan the car and use EV Scan’s insurance estimator to enter your driver details and get a budgeting range before you go any further.',
      button: 'Scan the car and estimate insurance',
      href: '/#home'
    },
    related: ['is-buying-a-used-electric-car-worth-it', 'should-i-buy-high-mileage-electric-car', 'what-to-check-before-buying-used-electric-car']
  },
  {
    slug: 'what-to-check-before-buying-used-electric-car',
    category: 'Buying a used EV',
    title: 'What Should I Check Before Buying a Used Electric Car?',
    metaTitle: 'What to Check Before Buying a Used Electric Car | EV Scan',
    metaDescription: 'A beginner-friendly used EV buying checklist covering battery condition, range, charging, MOT history, tyres, warranty, seller evidence and price.',
    answer: 'Before buying a used electric car, check the exact battery and trim, realistic range, charging capability, battery evidence, MOT history, tyres, warranty, service history, seller claims and whether the price is fair for comparable cars.',
    answerDetail: 'You do not need to become an EV expert. The goal is to separate verified information from estimates, seller claims and things nobody has confirmed yet.',
    keyPoints: [
      'Confirm the exact version because battery, range and charging can vary within one model.',
      'Treat battery-health claims as evidence only when you know where the number came from.',
      'A good advert can still leave important information unknown.'
    ],
    sections: [
      {
        heading: '1. Confirm exactly which EV you are looking at',
        paragraphs: [
          'A model name alone is not enough. Battery size, usable capacity, drivetrain, wheel size, heat pump and charging hardware can change between trims and model years. Make sure the advert actually describes the car in front of you.'
        ]
      },
      {
        heading: '2. Check the battery and realistic range',
        bullets: [
          'Ask for any measured battery-health evidence.',
          'Compare realistic range, not just the original official figure.',
          'Check for battery or charging warnings.',
          'Understand any remaining battery warranty.'
        ]
      },
      {
        heading: '3. Read the MOT history as a pattern',
        paragraphs: [
          'One old tyre advisory may mean very little. Repeated tyre, suspension or braking issues can tell a more useful story about maintenance and wear. Mileage changes also deserve attention if they do not make sense.'
        ]
      },
      {
        heading: '4. Check the practical EV equipment',
        bullets: [
          'Charging cables and adapters that should be included.',
          'Rapid-charging operation.',
          'Both keys where applicable.',
          'Tyres, wheel damage and uneven wear.',
          'Software features that may be optional, subscription-based or locked to the account.'
        ]
      },
      {
        heading: '5. Judge the whole deal, not one headline number',
        paragraphs: [
          'A cheap asking price can be cancelled out by tyres, missing cables, overdue servicing or weak battery evidence. Compare the effective purchase cost and the amount of uncertainty, not simply which advert has the lowest price.'
        ]
      }
    ],
    cta: {
      eyebrow: 'Turn the checklist into a report',
      title: 'Already found an EV for sale?',
      copy: 'Paste the listing into EV Scan and we’ll organise the important checks, unknowns and seller questions into one simple report.',
      button: 'Scan the EV before you buy',
      href: '/#home'
    },
    related: ['how-to-check-electric-car-battery-health-before-buying', 'should-i-buy-high-mileage-electric-car', 'are-used-electric-cars-reliable']
  },
  {
    slug: 'are-used-electric-cars-reliable',
    category: 'Buying a used EV',
    title: 'Are Used Electric Cars Reliable?',
    metaTitle: 'Are Used Electric Cars Reliable? What to Check | EV Scan',
    metaDescription: 'Are second-hand electric cars reliable? Understand EV battery, charging, electronics and normal wear issues before buying a used electric car.',
    answer: 'Used electric cars can be very reliable, but reliability varies by model and a simpler electric drivetrain does not mean there is nothing to inspect.',
    answerDetail: 'EVs remove many traditional engine-related components, but battery systems, charging hardware, electronics, suspension, tyres, brakes, climate control and model-specific faults can still create expensive problems.',
    keyPoints: [
      'Judge reliability by the exact model and year, not “EVs” as one category.',
      'Battery condition is important, but it is not the only expensive system on the car.',
      'MOT patterns, service history and known model issues are useful together.'
    ],
    sections: [
      {
        heading: 'What EVs simplify',
        paragraphs: [
          'Electric drivetrains remove components such as conventional engine oil systems, exhausts and many multi-speed gearbox parts. That can reduce some maintenance requirements, but it does not remove normal vehicle wear.'
        ]
      },
      {
        heading: 'What can still go wrong',
        bullets: [
          '12-volt battery problems and electrical faults.',
          'Charging-port or onboard-charger issues.',
          'Battery thermal-management faults.',
          'Suspension, tyres, wheel bearings and alignment.',
          'Heating, air-conditioning and heat-pump systems.',
          'Model-specific software, recall or hardware issues.'
        ]
      },
      {
        heading: 'The battery should not dominate every reliability decision',
        paragraphs: [
          'Battery replacement is the dramatic failure everyone worries about, but a used-EV assessment should be broader. A car with normal battery ageing but unresolved suspension or charging faults may be a worse buy than a slightly lower-range example with excellent history.'
        ]
      },
      {
        heading: 'How to research reliability properly',
        paragraphs: [
          'Look for official recalls and manufacturer information first, then use reputable owner data to understand patterns rather than treating one forum post as proof. Finally compare those known issues with the exact advert, MOT history and seller evidence for the car you are considering.'
        ]
      }
    ],
    cta: {
      eyebrow: 'Reliability is model-specific',
      title: 'Found a used EV and want to know what deserves attention?',
      copy: 'Scan the exact car so EV Scan can combine its available vehicle evidence with the model-specific things worth checking.',
      button: 'Check the EV I found',
      href: '/#home'
    },
    related: ['what-to-check-before-buying-used-electric-car', 'should-i-buy-high-mileage-electric-car', 'is-buying-a-used-electric-car-worth-it']
  },
  {
    slug: 'how-to-check-electric-car-battery-health-before-buying',
    category: 'Battery health',
    title: 'How to Check Electric Car Battery Health Before Buying',
    metaTitle: 'How to Check EV Battery Health Before Buying | EV Scan',
    metaDescription: 'How do you check a used EV battery before buying? Learn the difference between measured battery tests, estimates, dashboard range and seller claims.',
    answer: 'The strongest way to check a used EV battery is with a proper diagnostic battery-health test. If you do not have one, combine realistic range, charging behaviour, warranty information and model/age expectations, and label the result as an estimate.',
    answerDetail: 'Do not treat the dashboard’s predicted range or a seller’s claimed percentage as a verified State of Health unless there is evidence showing how it was measured.',
    keyPoints: [
      'Measured diagnostic evidence is the best option when battery certainty matters.',
      'Dashboard range is influenced by weather and recent driving.',
      'A missing battery report should lower confidence, not create a made-up percentage.'
    ],
    sections: [
      {
        heading: 'Best option: a measured diagnostic battery test',
        paragraphs: [
          'A specialist battery test can inspect information from the vehicle and produce much stronger evidence than age-based modelling. The exact method varies by provider and vehicle, so read what the test actually measures before relying on the headline percentage.'
        ]
      },
      {
        heading: 'Useful supporting evidence',
        bullets: [
          'Current realistic range in comparable weather and driving.',
          'Rapid-charging behaviour and any charging errors.',
          'Battery warranty documents and repair history.',
          'Vehicle age, mileage, battery chemistry and thermal management.',
          'Any manufacturer diagnostic information available for that model.'
        ]
      },
      {
        heading: 'What is not a battery-health test?',
        paragraphs: [
          'The predicted range shown after a full charge is useful context, but it changes with recent efficiency, climate and driving style. Likewise, a seller saying “the battery is perfect” is a seller claim, not a measurement.'
        ]
      },
      {
        heading: 'What to ask the seller',
        paragraphs: [
          'Ask whether they have any battery-health report, whether the car has had battery repairs or warranty work, whether rapid charging works normally and whether there are any battery or charging warnings. A clear answer is useful even when the seller does not have a formal report.'
        ]
      }
    ],
    cta: {
      eyebrow: 'No battery report in the advert?',
      title: 'We’ll turn missing battery evidence into the right seller questions.',
      copy: 'Paste the listing into EV Scan and we’ll clearly separate measured facts, estimates, seller claims and unknowns.',
      button: 'Check the battery evidence',
      href: '/#home'
    },
    related: ['what-is-good-battery-health-for-used-ev', 'how-long-do-electric-car-batteries-last', 'how-much-do-ev-batteries-degrade']
  },
  {
    slug: 'is-buying-a-used-electric-car-worth-it',
    category: 'Buying a used EV',
    title: 'Is Buying a Used Electric Car Worth It?',
    metaTitle: 'Is Buying a Used Electric Car Worth It? | EV Scan',
    metaDescription: 'Is a used EV worth buying? Compare purchase price, charging, insurance, range, battery condition and your own driving before deciding.',
    answer: 'A used electric car can be excellent value if it fits your journeys, charging situation and insurance budget and the specific car has sensible battery condition, history and price.',
    answerDetail: 'It is not automatically the cheapest option for everyone. The right decision depends on the whole ownership picture rather than fuel savings or purchase price alone.',
    keyPoints: [
      'Your charging access can make or break the ownership experience.',
      'Compare insurance and likely running costs before buying.',
      'Used EV value is strongest when the car fits your actual driving rather than a theoretical range target.'
    ],
    sections: [
      {
        heading: 'When a used EV makes a lot of sense',
        bullets: [
          'You can charge conveniently at home, work or regular destinations.',
          'The realistic range comfortably covers your normal journeys.',
          'The purchase price is competitive against alternatives.',
          'Insurance is affordable for you.',
          'Battery condition and vehicle history give you enough confidence.'
        ]
      },
      {
        heading: 'When you should think more carefully',
        paragraphs: [
          'If public charging is inconvenient or expensive where you live, you drive unusually long distances every day, or insurance is disproportionately high, an apparently cheap EV can become a poor fit. The same car can therefore be brilliant for one buyer and frustrating for another.'
        ]
      },
      {
        heading: 'Used EVs have a different buying checklist',
        paragraphs: [
          'Traditional used-car checks still matter, but you should add battery evidence, charging performance, exact battery/trim identification, realistic winter range, cable/equipment checks and any model-specific EV faults.'
        ]
      },
      {
        heading: 'Do the maths on the real car, not an average EV',
        paragraphs: [
          'Compare the asking price, insurance estimate, likely charging costs, immediate maintenance and the car’s remaining usable range. That gives you a much better answer than asking whether “EVs” as a category are worth it.'
        ]
      }
    ],
    cta: {
      eyebrow: 'Make it personal',
      title: 'Not sure whether an EV actually suits you?',
      copy: 'Use Find My EV if you are still choosing, or scan a listing if you have already found a car. We’ll translate the EV jargon into the decision you actually need to make.',
      button: 'Find the right EV for me',
      href: '/#find-my-ev'
    },
    related: ['can-you-own-an-electric-car-without-home-charging', 'how-much-electric-car-range-do-i-need', 'what-to-check-before-buying-used-electric-car']
  }
];

const guideBySlug = new Map(guides.map(guide => [guide.slug, guide]));

function schemaForGuide(guide) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: guide.title,
        description: guide.metaDescription,
        datePublished: UPDATED,
        dateModified: UPDATED,
        mainEntityOfPage: absolute(`/ev-guides/${guide.slug}`),
        author: { '@type': 'Organization', name: 'EV Scan', url: SITE_URL },
        publisher: { '@type': 'Organization', name: 'EV Scan', url: SITE_URL }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'EV Scan', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'EV Guides', item: absolute('/ev-guides/') },
          { '@type': 'ListItem', position: 3, name: guide.title, item: absolute(`/ev-guides/${guide.slug}`) }
        ]
      }
    ]
  }).replaceAll('<', '\\u003c');
}

function head({ title, description, canonical, type = 'website', schema = null }) {
  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <link rel="canonical" href="${esc(canonical)}">
  <meta property="og:type" content="${esc(type)}">
  <meta property="og:site_name" content="EV Scan">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(canonical)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/seo.css">
  ${schema ? `<script type="application/ld+json">${schema}</script>` : ''}
</head>`;
}

function brandHeader() {
  return `<header class="seo-header">
    <a class="seo-brand" href="/" aria-label="EV Scan home"><span class="seo-brand-mark">⚡</span><span>EV Scan</span></a>
    <nav aria-label="Guide navigation"><a href="/ev-guides/">EV Guides</a><a href="/#find-my-ev">Find my EV</a><a class="seo-nav-cta" href="/#home">Scan a car</a></nav>
  </header>`;
}

function footer() {
  return `<footer class="seo-footer">
    <div><a class="seo-brand" href="/"><span class="seo-brand-mark">⚡</span><span>EV Scan</span></a><p>Beginner-friendly used-EV buying help. Verified facts stay verified, estimates stay estimated, and unknowns stay unknown.</p></div>
    <div class="seo-footer-links"><a href="/ev-guides/">EV Guides</a><a href="/privacy.html">Privacy</a><a href="/cookies.html">Cookies</a><a href="/terms.html">Terms</a><a href="/affiliate-disclosure.html">Affiliate disclosure</a></div>
  </footer>`;
}

function renderKeyPoints(items) {
  return `<div class="seo-keypoints">${items.map(item => `<div><span>✓</span><p>${esc(item)}</p></div>`).join('')}</div>`;
}

function renderSections(sections) {
  return sections.map(section => `<section class="seo-article-section">
    <h2>${esc(section.heading)}</h2>
    ${(section.paragraphs || []).map(paragraph => `<p>${esc(paragraph)}</p>`).join('')}
    ${section.bullets?.length ? `<ul>${section.bullets.map(item => `<li>${esc(item)}</li>`).join('')}</ul>` : ''}
  </section>`).join('');
}

function relatedGuides(guide) {
  const related = guide.related.map(slug => guideBySlug.get(slug)).filter(Boolean);
  if (!related.length) return '';
  return `<section class="seo-related"><div class="seo-section-label">Related EV guides</div><div class="seo-related-grid">${related.map(item => `<a href="/ev-guides/${esc(item.slug)}"><span>${esc(item.category)}</span><strong>${esc(item.title)}</strong><em>Read guide →</em></a>`).join('')}</div></section>`;
}

export function renderGuide(slug) {
  const guide = guideBySlug.get(slug);
  if (!guide) return null;
  const canonical = absolute(`/ev-guides/${guide.slug}`);
  return `${head({ title: guide.metaTitle, description: guide.metaDescription, canonical, type: 'article', schema: schemaForGuide(guide) })}
<body class="seo-page">
  ${brandHeader()}
  <main class="seo-main">
    <nav class="seo-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>›</span><a href="/ev-guides/">EV Guides</a><span>›</span><span>${esc(guide.category)}</span></nav>
    <article>
      <header class="seo-article-hero">
        <div class="seo-kicker">${esc(guide.category)} · Beginner guide</div>
        <h1>${esc(guide.title)}</h1>
        <div class="seo-direct-answer"><span>Short answer</span><strong>${esc(guide.answer)}</strong><p>${esc(guide.answerDetail)}</p></div>
        ${renderKeyPoints(guide.keyPoints)}
        <div class="seo-updated">Updated ${UPDATED} · UK used-EV guidance</div>
      </header>
      <div class="seo-article-body">${renderSections(guide.sections)}</div>
      <section class="seo-problem-cta">
        <div><span>${esc(guide.cta.eyebrow)}</span><h2>${esc(guide.cta.title)}</h2><p>${esc(guide.cta.copy)}</p></div>
        <a href="${esc(guide.cta.href)}">${esc(guide.cta.button)} →</a>
      </section>
      ${relatedGuides(guide)}
      <aside class="seo-method-note"><strong>How EV Scan handles uncertain information</strong><p>We separate <b>verified</b> information from <b>estimated</b> information, seller claims and unknowns. Battery condition, range, insurance and ownership costs can vary by vehicle and person, so estimates are never presented as guaranteed measurements or quotes.</p></aside>
    </article>
  </main>
  ${footer()}
</body>
</html>`;
}

export function renderGuideHub() {
  const canonical = absolute('/ev-guides/');
  const categories = [...new Set(guides.map(guide => guide.category))];
  const itemList = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'EV Scan used electric car guides',
    itemListElement: guides.map((guide, index) => ({ '@type': 'ListItem', position: index + 1, name: guide.title, url: absolute(`/ev-guides/${guide.slug}`) }))
  }).replaceAll('<', '\\u003c');
  return `${head({
    title: 'EV Guides: Used Electric Car Buying Advice | EV Scan',
    description: 'Simple UK used-EV buying guides covering battery health, real-world range, charging, insurance, reliability and what to check before buying an electric car.',
    canonical,
    schema: itemList
  })}
<body class="seo-page">
  ${brandHeader()}
  <main class="seo-main seo-hub-main">
    <section class="seo-hub-hero">
      <div class="seo-kicker">EV Guides</div>
      <h1>Used EV advice without the jargon.</h1>
      <p>Clear answers for people buying an electric car for the first time. Start with the question you actually have — we’ll explain the technical bits only when they matter.</p>
      <a href="/#home">Already found an EV? Scan it →</a>
    </section>
    ${categories.map(category => {
      const items = guides.filter(guide => guide.category === category);
      return `<section class="seo-hub-section"><div class="seo-hub-heading"><span>${esc(category)}</span><h2>${esc(category)}</h2></div><div class="seo-guide-grid">${items.map(guide => `<a class="seo-guide-card" href="/ev-guides/${esc(guide.slug)}"><span>${esc(guide.category)}</span><h3>${esc(guide.title)}</h3><p>${esc(guide.answer)}</p><em>Read the simple answer →</em></a>`).join('')}</div></section>`;
    }).join('')}
    <section class="seo-problem-cta seo-hub-cta"><div><span>Not sure what to search for?</span><h2>Tell us how you use your car instead.</h2><p>Find My EV asks normal questions about your journeys, budget and charging access, then works out the EV requirements behind the scenes.</p></div><a href="/#find-my-ev">Find my EV →</a></section>
  </main>
  ${footer()}
</body>
</html>`;
}

export function renderSitemap() {
  const urls = [
    { loc: SITE_URL, priority: '1.0' },
    { loc: absolute('/ev-guides/'), priority: '0.9' },
    ...guides.map(guide => ({ loc: absolute(`/ev-guides/${guide.slug}`), priority: '0.8' }))
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(item => `  <url><loc>${esc(item.loc)}</loc><lastmod>${UPDATED}</lastmod><priority>${item.priority}</priority></url>`).join('\n')}\n</urlset>`;
}

export function renderRobots() {
  return `User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nSitemap: ${absolute('/sitemap.xml')}\n`;
}

export function renderGuide404() {
  return `${head({ title: 'EV Guide Not Found | EV Scan', description: 'That EV Scan guide could not be found.', canonical: absolute('/ev-guides/') })}
<body class="seo-page"><main class="seo-main"><section class="seo-hub-hero"><div class="seo-kicker">404</div><h1>We couldn’t find that EV guide.</h1><p>Try the guide library instead, or scan the car you are researching.</p><div class="seo-404-actions"><a href="/ev-guides/">Browse EV Guides</a><a href="/#home">Scan a car</a></div></section></main>${footer()}</body></html>`;
}
