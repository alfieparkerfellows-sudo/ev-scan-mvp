import baseWorker from './worker-admin.js';
import { models } from './seo-models.js';
import { getFirecrawlUsage, providerConfiguration, resolveListing } from './listing-providers.js';

const VERSION = '0.9.0';
const JSON_HEADERS = {
  'content-type':'application/json; charset=utf-8',
  'cache-control':'no-store',
  'x-content-type-options':'nosniff',
  'x-robots-tag':'noindex, nofollow'
};
function json(data, status = 200) { return new Response(JSON.stringify(data,null,2), { status, headers:JSON_HEADERS }); }
function finite(value) { const number = Number(value); return Number.isFinite(number) ? number : null; }
function clean(value = '') { return value == null ? '' : String(value).trim(); }
function words(value = '') { return clean(value).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(); }
function cleanRegistration(value = '') { return clean(value).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8); }
function looksLikeRegistration(value = '') { const v = cleanRegistration(value); return v.length >= 5 && v.length <= 8 && /^[A-Z0-9]+$/.test(v); }

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
  return { title:entry.title, summary:entry.answer, checks, bestFor:Array.isArray(entry.bestFor) ? entry.bestFor.slice(0,3) : [] };
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
  const missing = [];
  const required = [
    ['make',listing.make],['model',listing.model],['year',listing.year],['asking price',finite(listing.price)],
    ['mileage',finite(listing.mileage)],['registration',listing.registration],['battery capacity',finite(listing.batteryCapacityKwh)],
    ['EV range specification',finite(listing.rangeMiles)]
  ];
  for (const [label,value] of required) if (value === null || value === undefined || value === '') missing.push(label);
  if (!listing.description || clean(listing.description).length < 80) missing.push('usable advert description');
  if (!Array.isArray(listing.images) || !listing.images.length) missing.push('vehicle photo');
  if (!dvsa?.ok || !dvsa?.vehicle) missing.push('verified DVSA vehicle/MOT data');
  if (dvsa?.vehicle && !dvsa.vehicle.isLikelyEv) missing.push('confirmed battery-electric identity');
  if (dvsa?.vehicle && !identityMatches(listing,dvsa.vehicle)) missing.push('matching listing and DVSA identity');
  if (!(resolution?.trace || []).some((item) => item?.ok)) missing.push('successful advert extraction');
  const uniqueMissing = [...new Set(missing)];
  const criticalChecks = 14;
  return {
    passed:uniqueMissing.length === 0,
    score:Math.round((Math.max(0,criticalChecks - uniqueMissing.length) / criticalChecks) * 100),
    missing:uniqueMissing,
    rule:'fail-closed',
    marketPricingRequired:false
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
  return questions.slice(0,5);
}
function quickVerdict(mot = {}) {
  const score = Number(mot?.score || 0);
  if (score >= 85) return 'EV Scan verified the advert against the official vehicle/MOT record. The MOT pattern looks strong. We are not claiming a market-price verdict until a suitable independent source is connected.';
  if (score >= 70) return 'EV Scan verified the advert against the official vehicle/MOT record. The MOT pattern is broadly acceptable, with the checks below worth reviewing before you arrange a viewing.';
  return 'EV Scan verified the advert, but the MOT evidence contains enough concerns that we would investigate the points below before travelling to see the car.';
}

function friendlyResetDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-GB',{ day:'numeric', month:'long', year:'numeric', timeZone:'Europe/London' }).format(date);
}
async function listingStatus(env, force = false) {
  const usage = await getFirecrawlUsage(env,{ force });
  const resetDate = friendlyResetDate(usage.resetAt);
  const available = Boolean(usage.configured && usage.known && usage.available && Number(usage.remainingCredits) > 0);
  let message;
  if (!usage.configured) message = 'Listing-link scans are not connected right now. UK registration checks are still available.';
  else if (!usage.known) message = 'EV Scan cannot confirm its listing-search allowance right now, so link scans are temporarily paused. UK registration checks are still available.';
  else if (!available) message = `Listing-link scans have used this period’s free allowance.${resetDate ? ` They are due back on ${resetDate}.` : ''} UK registration checks are still available.`;
  else message = `Listing-link scans available · ${Number(usage.remainingCredits).toLocaleString('en-GB')} free credits remaining${resetDate ? ` · resets ${resetDate}` : ''}.`;
  return { available, remainingCredits:usage.remainingCredits, planCredits:usage.planCredits, resetAt:usage.resetAt, resetDate, statusKnown:usage.known, configured:usage.configured, message };
}
function listingUnavailable(status) {
  return json({ ok:false, code:'LISTING_CREDITS_EXHAUSTED', message:status.message, listingStatus:status, registrationStillAvailable:true },503);
}

async function fetchDvsaForListing(request, env, ctx, registration) {
  const target = new URL('/api/scan',request.url);
  const probe = new Request(target.toString(),{ method:'POST', headers:{'content-type':'application/json',accept:'application/json'}, body:JSON.stringify({ registration }) });
  const response = await baseWorker.fetch(probe,env,ctx);
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
}

async function handleListingScan(request, env, ctx, body) {
  const listingUrl = clean(body?.listingUrl);
  const suppliedRegistration = cleanRegistration(body?.registration);
  if (!listingUrl) return json({ ok:false, code:'FULL_LISTING_REQUIRED', message:'EV Scan requires the vehicle listing link so it can verify the advert before showing a report.' },422);

  const quota = await listingStatus(env,true);
  if (!quota.available) return listingUnavailable(quota);

  const resolution = await resolveListing(env,listingUrl);
  if (!resolution.ok) {
    const quotaFailure = (resolution.trace || []).some((item) => /FIRECRAWL_QUOTA/.test(item?.error || ''));
    if (quotaFailure) return listingUnavailable(await listingStatus(env,true));
    const restricted = resolution.code === 'SOURCE_REQUIRES_APPROVED_PROVIDER';
    const candidate = resolution.candidate || {};
    const missingFields = [
      ['make',candidate.make],['model',candidate.model],['year',candidate.year],['price',finite(candidate.price)],
      ['mileage',finite(candidate.mileage)],['registration',candidate.registration],['batteryCapacityKwh',finite(candidate.batteryCapacityKwh)],
      ['rangeMiles',finite(candidate.rangeMiles)],['description',candidate.description],['images',Array.isArray(candidate.images) && candidate.images.length]
    ].filter(([,value]) => value === null || value === undefined || value === '' || value === false).map(([label]) => label);
    return json({
      ok:false,
      code:resolution.code || 'SCAN_NOT_RELIABLE',
      message:restricted ? resolution.message : (resolution.message || 'EV Scan could not verify this listing strongly enough to show a reliable report.'),
      diagnostics:{ missingFields, providers:(resolution.trace || []).map((item) => ({ provider:item.provider, ok:Boolean(item.ok), skipped:Boolean(item.skipped), error:item.error || null })) },
      registrationStillAvailable:true
    }, restricted ? 422 : 422);
  }

  const extractedRegistration = cleanRegistration(resolution.candidate?.registration);
  const registration = looksLikeRegistration(suppliedRegistration) ? suppliedRegistration : extractedRegistration;
  const registrationSource = looksLikeRegistration(suppliedRegistration) ? 'user' : 'listing';
  if (!looksLikeRegistration(registration)) return json({
    ok:false,
    code:'REGISTRATION_REQUIRED',
    message:'The advert was readable, but eBay did not reveal the registration. Enter the UK registration to verify this exact car against DVSA. No report has been generated yet.',
    registrationRequired:true,
    registrationStillAvailable:true
  },422);
  resolution.candidate.registration = registration;

  const { response:dvsaResponse, payload:dvsa } = await fetchDvsaForListing(request,env,ctx,registration);
  if (!dvsaResponse.ok || !dvsa?.ok) {
    const busy = dvsaResponse.status === 429 || dvsaResponse.status >= 500;
    return json({ ok:false, code:busy ? 'TOO_BUSY':'SCAN_NOT_RELIABLE', message:busy ? 'One of EV Scan’s verification services is temporarily unavailable. No report was generated. Please try again shortly.' : 'EV Scan could not verify this vehicle against the official MOT record, so no report has been generated.', registrationStillAvailable:true },busy ? 503 : 422);
  }

  const quality = strictQualityGate(resolution,dvsa);
  if (!quality.passed) return json({ ok:false, code:'SCAN_NOT_RELIABLE', message:'EV Scan could not gather enough reliable evidence for a complete listing report, so it has not generated one.', quality:{ passed:false, score:quality.score, missingCount:quality.missing.length }, registrationStillAvailable:true },422);

  const listing = resolution.candidate;
  const vehicleName = [listing.year,listing.make,listing.model,listing.trim].filter(Boolean).join(' ');
  const modelGuide = modelContext(listing.make,listing.model);
  const providers = (resolution.trace || []).filter((item) => item.ok).map((item) => item.provider);
  return json({
    ok:true, mode:'live-listing', vehicleName,
    listing:{
      sourceUrl:listing.sourceUrl, heading:listing.heading, registration:listing.registration, make:listing.make, model:listing.model,
      trim:listing.trim, derivative:listing.derivative, year:listing.year, mileage:listing.mileage, price:listing.price,
      fuelType:listing.fuelType || dvsa.vehicle.fuelType, batteryCapacityKwh:listing.batteryCapacityKwh, rangeMiles:listing.rangeMiles,
      description:listing.description, dealerName:listing.dealerName, dealerPostcode:listing.dealerPostcode,
      images:(listing.images || []).filter((item,index,array) => item && array.indexOf(item) === index).slice(0,12)
    },
    verification:{
      dvsa:{ registration:dvsa.vehicle.registration, make:dvsa.vehicle.make, model:dvsa.vehicle.model, firstUsedDate:dvsa.vehicle.firstUsedDate, fuelType:dvsa.vehicle.fuelType },
      extractionProviders:providers,
      registrationSource,
      evidenceLabels:{ listing:'LISTING_SOURCE', vehicleIdentity:registrationSource === 'user' ? 'USER_SUPPLIED_DVSA_VERIFIED' : 'DVSA_VERIFIED', mot:'DVSA_VERIFIED', askingPrice:'LISTING_SOURCE', marketPrice:'NOT_AVAILABLE', batterySpec:'LISTING_SOURCE', batteryHealth:'NOT_MEASURED' }
    },
    market:{ available:false, reason:'No permanent zero-cost independent UK market-comparison source is connected, so EV Scan is not claiming above/below-market value.' },
    battery:{ capacityKwh:listing.batteryCapacityKwh, ratedOrListedRangeMiles:listing.rangeMiles, stateOfHealthMeasured:false, note:'A listing cannot remotely measure battery State of Health. EV Scan does not invent a SoH percentage without measured evidence.' },
    mot:dvsa.vehicle.motIntelligence,
    motTests:Array.isArray(dvsa.vehicle.motTests) ? dvsa.vehicle.motTests.slice(0,6) : [],
    scoring:{ deal:null, decisionConfidence:{ score:Math.max(90,Math.min(99,quality.score)), reason:'This report was released only after the advert and official vehicle/MOT identity passed the strict evidence gate.' } },
    verdict:quickVerdict(dvsa.vehicle.motIntelligence), sellerQuestions:sellerQuestions(listing), modelContext:modelGuide, quality,
    limitations:[
      'EV Scan is not currently judging the asking price against the wider UK market.',
      'Battery State of Health is not remotely measurable from a car advert and is not guessed.',
      'This scan does not replace an independent provenance/finance/write-off check or a physical inspection.'
    ],
    listingStatus:await listingStatus(env,false)
  });
}

async function readScanBody(request) {
  try { const body = await request.clone().json(); return body && typeof body === 'object' && !Array.isArray(body) ? body : {}; }
  catch { return null; }
}

async function augmentHealth(response, env) {
  try {
    const data = await response.json();
    const providers = providerConfiguration(env);
    data.version = VERSION;
    data.providerStack = providers;
    data.listingStatus = await listingStatus(env,false);
    data.capabilities = {
      ...(data.capabilities || {}), listingUrlIngestion:true, registrationLookup:true, strictEvidenceGate:true,
      failClosedScanning:true, incompleteListingReports:false, marketPricing:false, liveRecommendations:false,
      providerFailover:true, liveFirecrawlCreditStatus:true, jinaReaderFallback:providers.jina, cloudflareBrowserFallback:providers.cloudflareBrowser
    };
    return json(data,response.status);
  } catch { return response; }
}

function updateHomepageHtml(html = '') {
  let next = String(html);
  next = next.replace('Paste the listing. We’ll explain the price, battery, range, MOT history and the things worth asking before you go anywhere near the seller.','Paste a listing link or UK registration. Listing reports are only shown when EV Scan can verify enough evidence to trust them.');
  next = next.replace('Demo mode is on for now — any valid-looking link will open the example report.','Paste an EV listing link or enter a UK registration. Registration checks stay available even when the monthly link allowance is paused.');
  next = next.replace('Paste an EV listing link…','Paste an EV listing link or registration…');
  if (!next.includes('/listing-live.js')) next = next.replace('</body>','  <script src="/listing-live.js"></script>\n</body>');
  return next;
}
async function maybeEnhanceHomepage(response,url) {
  if (!response?.ok || !['/','/index.html'].includes(url.pathname)) return response;
  if (!(response.headers.get('content-type') || '').includes('text/html')) return response;
  try {
    const headers = new Headers(response.headers); headers.delete('content-length'); headers.set('cache-control','no-cache');
    return new Response(updateHomepageHtml(await response.text()),{ status:response.status, headers });
  } catch { return response; }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/listing-status') return json({ ok:true, version:VERSION, ...(await listingStatus(env,true)), registrationStillAvailable:true });
    if (url.pathname === '/api/provider-status') return json({ ok:true, version:VERSION, providers:providerConfiguration(env), listingStatus:await listingStatus(env,false), policy:'fail-closed', activeThirdPartyKeys:['FIRECRAWL_API_KEY','JINA_API_KEY'], rejectedProviders:['MarketCheck','Reef as a production dependency'] });
    if (url.pathname === '/api/scan') {
      if (request.method !== 'POST') return json({ ok:false, code:'METHOD_NOT_ALLOWED' },405);
      const body = await readScanBody(request);
      if (body === null) return json({ ok:false, code:'INVALID_JSON', message:'EV Scan could not read that request.' },400);
      if (body.listingUrl) return handleListingScan(request,env,ctx,body);
      if (looksLikeRegistration(body.registration)) return baseWorker.fetch(request,env,ctx);
      return json({ ok:false, code:'SCAN_INPUT_REQUIRED', message:'Paste an EV listing link or enter a UK registration.' },422);
    }
    const response = await baseWorker.fetch(request,env,ctx);
    if (url.pathname === '/api/health') return augmentHealth(response,env);
    return maybeEnhanceHomepage(response,url);
  }
};

