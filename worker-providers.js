import baseWorker from './worker-admin.js';
import { models } from './seo-models.js';
import { providerConfiguration, resolveListing } from './listing-providers.js';

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
  'x-robots-tag': 'noindex, nofollow'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: JSON_HEADERS });
}

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clean(value = '') {
  return value == null ? '' : String(value).trim();
}

function words(value = '') {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function money(value) {
  const number = finite(value);
  return number == null ? null : Math.round(number);
}

function modelContext(make, model) {
  const makeKey = words(make), modelKey = words(model);
  const entry = models.find((item) => words(item.make) === makeKey && words(item.model) === modelKey);
  if (!entry) return null;
  const checks = [];
  for (const section of entry.sections || []) {
    for (const bullet of section.bullets || []) {
      if (bullet && !checks.includes(bullet)) checks.push(bullet);
      if (checks.length >= 6) break;
    }
    if (checks.length >= 6) break;
  }
  return {
    title: entry.title,
    summary: entry.answer,
    checks,
    bestFor: Array.isArray(entry.bestFor) ? entry.bestFor.slice(0, 3) : []
  };
}

function identityMatches(listing = {}, dvsaVehicle = {}) {
  const listingMake = words(listing.make), dvsaMake = words(dvsaVehicle.make);
  if (!listingMake || !dvsaMake || !(listingMake.includes(dvsaMake) || dvsaMake.includes(listingMake))) return false;
  const listingModel = words(listing.model), dvsaModel = words(dvsaVehicle.model);
  if (listingModel && dvsaModel && !(listingModel.includes(dvsaModel) || dvsaModel.includes(listingModel))) return false;
  return true;
}

function strictQualityGate(resolution = {}, dvsa = {}) {
  const listing = resolution?.candidate || {};
  const market = resolution?.market || {};
  const missing = [];
  const required = [
    ['make', listing.make],
    ['model', listing.model],
    ['year', listing.year],
    ['asking price', finite(listing.price)],
    ['mileage', finite(listing.mileage)],
    ['registration', listing.registration],
    ['battery capacity', finite(listing.batteryCapacityKwh)],
    ['EV range specification', finite(listing.rangeMiles)]
  ];
  for (const [label, value] of required) if (value === null || value === undefined || value === '') missing.push(label);
  if (!listing.description || clean(listing.description).length < 80) missing.push('usable advert description');
  if (!Array.isArray(listing.images) || !listing.images.length) missing.push('vehicle photo');
  if (!market.configured) missing.push('market comparison provider');
  if (!market.match) missing.push('independent listing match');
  if (!market.stats?.medianPrice || Number(market.stats?.count || 0) < 5) missing.push('enough comparable vehicles');
  if (!dvsa?.ok || !dvsa?.vehicle) missing.push('verified DVSA vehicle/MOT data');
  if (dvsa?.vehicle && !dvsa.vehicle.isLikelyEv) missing.push('confirmed battery-electric identity');
  if (dvsa?.vehicle && !identityMatches(listing, dvsa.vehicle)) missing.push('matching listing and DVSA identity');

  const uniqueMissing = [...new Set(missing)];
  const criticalChecks = 16;
  const passedChecks = Math.max(0, criticalChecks - uniqueMissing.length);
  return {
    passed: uniqueMissing.length === 0,
    score: Math.round((passedChecks / criticalChecks) * 100),
    missing: uniqueMissing,
    rule: 'fail-closed',
    minimumComparableSample: 5
  };
}

function liveDealScore(listing, market, dvsaVehicle, quality) {
  const asking = finite(listing.price);
  const median = finite(market?.stats?.medianPrice);
  const mot = finite(dvsaVehicle?.motIntelligence?.score);
  const priceDeltaPct = asking && median ? (asking - median) / median : 0;
  const priceScore = clamp(Math.round(50 - priceDeltaPct * 250));
  const motScore = clamp(mot ?? 50);
  const evidenceScore = clamp(quality?.score ?? 0);
  const score = Math.round(priceScore * 0.5 + motScore * 0.35 + evidenceScore * 0.15);
  const label = score >= 85 ? 'Strong candidate' : score >= 70 ? 'Worth considering' : score >= 55 ? 'Investigate first' : 'High risk';
  return {
    score,
    label,
    methodology: '50% asking-price position, 35% verified MOT pattern, 15% evidence quality. Battery State of Health is not scored unless measured evidence exists.',
    components: { price: priceScore, mot: motScore, evidence: evidenceScore }
  };
}

function sellerQuestions(listing = {}) {
  const description = clean(listing.description).toLowerCase();
  const questions = [];
  if (!/battery health|state of health|\bsoh\b|battery report|battery certificate/.test(description)) questions.push('Do you have a recent measured battery State of Health report or battery certificate for this exact car?');
  if (!/service history|full service|serviced/.test(description)) questions.push('Can you confirm the service history and provide the service records before I travel to view it?');
  if (!/\b2 keys\b|two keys|2 key|spare key/.test(description)) questions.push('How many keys are supplied with the car?');
  if (!/charging cable|charge cable|type 2 cable|granny cable/.test(description)) questions.push('Which charging cables are included with the car?');
  questions.push('Has the car had any accident, insurance write-off or major body repair history that is not obvious from the advert?');
  return questions.slice(0, 5);
}

function marketPosition(listing, market) {
  const askingPrice = money(listing.price);
  const medianPrice = money(market?.stats?.medianPrice);
  if (askingPrice == null || medianPrice == null) return null;
  const difference = askingPrice - medianPrice;
  const percent = medianPrice ? (difference / medianPrice) * 100 : null;
  return {
    askingPrice,
    medianPrice,
    difference,
    percent: percent == null ? null : Math.round(percent * 10) / 10,
    sampleSize: Math.round(Number(market?.stats?.count || market?.listings?.length || 0))
  };
}

function safeComparable(listing = {}) {
  return {
    heading: clean(listing.heading) || [listing.year, listing.make, listing.model, listing.trim].filter(Boolean).join(' '),
    year: listing.year || null,
    mileage: finite(listing.mileage),
    price: money(listing.price),
    source: clean(listing.source) || null,
    sourceUrl: /^https?:\/\//i.test(clean(listing.sourceUrl)) ? listing.sourceUrl : null,
    image: Array.isArray(listing.images) ? listing.images.find((item) => /^https?:\/\//i.test(clean(item))) || null : null
  };
}

function quickVerdict(score, position, mot) {
  const motScore = Number(mot?.score || 0);
  const difference = Number(position?.difference || 0);
  if (score >= 85 && difference < 0 && motScore >= 80) return 'This advert has cleared EV Scan’s evidence checks and looks like a strong candidate to investigate further.';
  if (score >= 70) return 'This advert has enough reliable evidence for a full scan and is worth considering, with the checks below completed before purchase.';
  if (score >= 55) return 'EV Scan could verify the advert, but the price or MOT pattern gives us reasons to investigate before arranging a viewing.';
  return 'EV Scan could verify the advert, but the evidence suggests this example needs substantial caution.';
}

async function fetchDvsaForListing(request, env, ctx, registration) {
  const target = new URL('/api/scan', request.url);
  const probe = new Request(target.toString(), {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ registration })
  });
  const response = await baseWorker.fetch(probe, env, ctx);
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
}

async function handleListingScan(request, env, ctx) {
  let body = {};
  try { body = await request.json(); }
  catch { return json({ ok: false, code: 'INVALID_JSON', message: 'EV Scan could not read that request.' }, 400); }
  const listingUrl = clean(body?.listingUrl);
  if (!listingUrl) {
    return json({
      ok: false,
      code: 'FULL_LISTING_REQUIRED',
      message: 'EV Scan now requires the vehicle listing link so it can cross-check the whole advert before showing a report.'
    }, 422);
  }

  const resolution = await resolveListing(env, listingUrl);
  if (!resolution.ok) {
    const busy = /TOO_BUSY|RATE|QUOTA|PROVIDER/.test(resolution.code || '');
    return json({ ok: false, code: resolution.code || 'SCAN_NOT_RELIABLE', message: busy ? 'Sorry, EV Scan is handling too many requests right now. Please try this listing again shortly.' : resolution.message || 'EV Scan could not verify this listing strongly enough to show a reliable report.' }, busy ? 503 : 422);
  }

  if (resolution.market?.exhausted) {
    return json({ ok: false, code: 'TOO_BUSY', message: 'Sorry, EV Scan is handling too many requests right now. Please try this listing again later.' }, 503);
  }

  const registration = clean(resolution.candidate?.registration);
  if (!registration) {
    return json({ ok: false, code: 'SCAN_NOT_RELIABLE', message: 'EV Scan could not match this advert to a verified registration with enough confidence, so no report has been generated.' }, 422);
  }

  const { response: dvsaResponse, payload: dvsa } = await fetchDvsaForListing(request, env, ctx, registration);
  if (!dvsaResponse.ok || !dvsa?.ok) {
    const busy = dvsaResponse.status === 429 || dvsaResponse.status >= 500;
    return json({ ok: false, code: busy ? 'TOO_BUSY' : 'SCAN_NOT_RELIABLE', message: busy ? 'Sorry, one of EV Scan’s verification services is busy right now. Please try again shortly.' : 'EV Scan could not verify this vehicle against the official MOT record, so no report has been generated.' }, busy ? 503 : 422);
  }

  const quality = strictQualityGate(resolution, dvsa);
  if (!quality.passed) {
    return json({
      ok: false,
      code: 'SCAN_NOT_RELIABLE',
      message: 'EV Scan could not gather enough reliable evidence for a complete report, so it has not generated one. Please try again later.',
      quality: { passed: false, score: quality.score, missingCount: quality.missing.length }
    }, 422);
  }

  const listing = resolution.candidate;
  const market = marketPosition(listing, resolution.market);
  const deal = liveDealScore(listing, resolution.market, dvsa.vehicle, quality);
  const modelGuide = modelContext(listing.make, listing.model);
  const positionText = market.difference < -100
    ? `£${Math.abs(market.difference).toLocaleString('en-GB')} below the median of comparable adverts`
    : market.difference > 100
      ? `£${Math.abs(market.difference).toLocaleString('en-GB')} above the median of comparable adverts`
      : 'very close to the median comparable asking price';

  const match = resolution.market.match || {};
  const finalImages = [...(listing.images || []), ...(match.images || [])].filter((item, index, array) => item && array.indexOf(item) === index).slice(0, 12);
  const vehicleName = [listing.year, listing.make, listing.model, listing.trim].filter(Boolean).join(' ');
  const comparables = (resolution.market.listings || [])
    .filter((item) => item.id !== match.id)
    .sort((a, b) => Math.abs(Number(a.price || 0) - Number(listing.price || 0)) - Math.abs(Number(b.price || 0) - Number(listing.price || 0)))
    .slice(0, 4)
    .map(safeComparable);

  return json({
    ok: true,
    mode: 'live-listing',
    vehicleName,
    listing: {
      sourceUrl: listing.sourceUrl,
      heading: listing.heading,
      registration: listing.registration,
      make: listing.make,
      model: listing.model,
      trim: listing.trim,
      derivative: listing.derivative,
      year: listing.year,
      mileage: listing.mileage,
      price: listing.price,
      fuelType: listing.fuelType || dvsa.vehicle.fuelType,
      batteryCapacityKwh: listing.batteryCapacityKwh,
      rangeMiles: listing.rangeMiles,
      description: listing.description,
      dealerName: listing.dealerName || match.dealerName,
      dealerPostcode: listing.dealerPostcode || match.dealerPostcode,
      images: finalImages
    },
    verification: {
      dvsa: { registration: dvsa.vehicle.registration, make: dvsa.vehicle.make, model: dvsa.vehicle.model, firstUsedDate: dvsa.vehicle.firstUsedDate, fuelType: dvsa.vehicle.fuelType },
      marketMatchScore: match.matchScore,
      extractionProviders: resolution.trace.filter((item) => item.ok).map((item) => item.provider),
      evidenceLabels: { listing: 'LISTING_SOURCE', vehicleIdentity: 'DVSA_VERIFIED', mot: 'DVSA_VERIFIED', market: 'MARKETCHECK', batterySpec: 'PROVIDER_DATA', batteryHealth: 'NOT_MEASURED' }
    },
    market: { ...market, positionText, comparables },
    battery: {
      capacityKwh: listing.batteryCapacityKwh,
      ratedOrListedRangeMiles: listing.rangeMiles,
      stateOfHealthMeasured: false,
      note: 'A listing link cannot measure battery State of Health. EV Scan does not invent a SoH percentage without measured battery evidence.'
    },
    mot: dvsa.vehicle.motIntelligence,
    motTests: Array.isArray(dvsa.vehicle.motTests) ? dvsa.vehicle.motTests.slice(0, 6) : [],
    scoring: {
      deal,
      decisionConfidence: {
        score: Math.max(90, Math.min(99, 90 + Math.round((quality.score - 90) * 0.5))),
        reason: 'EV Scan only released this report after the advert, market match and official MOT identity passed the strict evidence gate.'
      }
    },
    verdict: quickVerdict(deal.score, market, dvsa.vehicle.motIntelligence),
    sellerQuestions: sellerQuestions(listing),
    modelContext: modelGuide,
    quality,
    limitations: [
      'Battery State of Health is not remotely measurable from a car advert and is not guessed.',
      'This scan does not replace an independent provenance/finance/write-off check or a physical inspection.',
      'Market position is based on current comparable asking prices, not guaranteed sale values.'
    ]
  });
}

async function augmentHealth(response, env) {
  try {
    const data = await response.json();
    const providers = providerConfiguration(env);
    data.version = '0.8.0';
    data.providerStack = providers;
    data.capabilities = {
      ...(data.capabilities || {}),
      listingUrlIngestion: true,
      multiProviderRouting: true,
      strictEvidenceGate: true,
      failClosedScanning: true,
      incompleteReports: false,
      marketPricing: providers.marketcheck,
      liveRecommendations: providers.marketcheck,
      autoTraderPublicSearchAdapter: false,
      autoTraderApprovedResolver: providers.reefAutotrader,
      gracefulFallbacks: false,
      providerFailover: true
    };
    return json(data, response.status);
  } catch { return response; }
}

function updateHomepageHtml(html = '') {
  let next = String(html);
  next = next.replace(
    'Paste the listing. We’ll explain the price, battery, range, MOT history and the things worth asking before you go anywhere near the seller.',
    'Paste the listing. EV Scan cross-checks the advert against available vehicle, MOT and market data — and only returns a report when there is enough reliable evidence.'
  );
  next = next.replace(
    'Demo mode is on for now — any valid-looking link will open the example report.',
    'Paste a used EV listing link. If EV Scan cannot verify the advert strongly enough, it will not generate a report.'
  );
  next = next.replace(
    'Paste an electric-car listing or enter a registration to understand price, battery, real-world range, MOT history, insurance and what to check before buying.',
    'Paste a used EV listing and EV Scan cross-checks the advert, vehicle identity, MOT history and market data before it releases a buying report.'
  );
  if (!next.includes('/listing-live.js')) next = next.replace('</body>', '  <script src="/listing-live.js"></script>\n</body>');
  return next;
}

async function maybeEnhanceHomepage(response, url) {
  if (!response?.ok || !['/', '/index.html'].includes(url.pathname)) return response;
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) return response;
  try {
    const html = updateHomepageHtml(await response.text());
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('cache-control', 'no-cache');
    return new Response(html, { status: response.status, headers });
  } catch { return response; }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/scan') {
      if (request.method !== 'POST') return json({ ok: false, code: 'METHOD_NOT_ALLOWED' }, 405);
      return handleListingScan(request, env, ctx);
    }
    if (url.pathname === '/api/provider-status') {
      const providers = providerConfiguration(env);
      return json({ ok: true, version: '0.8.0', providers, policy: 'fail-closed', requiredForBestCoverage: ['MARKETCHECK_API_KEY', 'FIRECRAWL_API_KEY', 'JINA_API_KEY'], optionalExperimental: ['REEF_API_KEY + REEF_AUTOTRADER_ENABLED=true'] });
    }
    const response = await baseWorker.fetch(request, env, ctx);
    if (url.pathname === '/api/health') return augmentHealth(response, env);
    return maybeEnhanceHomepage(response, url);
  }
};
