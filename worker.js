import { autotraderConfigured, searchPublicEvListings } from './autotrader.js';
import { renderGuide, renderGuideHub, renderGuide404, renderRobots, renderSitemap } from './seo-guides.js';
import { renderHomeHead, renderHomeFaq } from './home-seo.js';

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
  'x-robots-tag': 'noindex, nofollow'
};

let tokenState = { token: null, expiresAt: 0 };

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: JSON_HEADERS });
}

function seoResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=900, stale-while-revalidate=86400',
      'x-content-type-options': 'nosniff'
    }
  });
}

function cleanRegistration(value = '') {
  return String(value ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
}

function configured(env = {}) {
  return Boolean(env.DVSA_CLIENT_ID && env.DVSA_CLIENT_SECRET && env.DVSA_TOKEN_URL && env.DVSA_API_KEY);
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error('Upstream service timed out.');
      timeoutError.stage = 'timeout';
      timeoutError.upstreamStatus = 504;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function parseUpstream(text = '') {
  try { return JSON.parse(text); } catch { return {}; }
}

function upstreamCodeFrom(text = '') {
  const parsed = parseUpstream(text);
  return String(parsed.errorCode || parsed.code || parsed.error || '').trim() || null;
}

function aadstsCodeFrom(text = '') {
  const parsed = parseUpstream(text);
  const source = `${parsed.error_description || ''} ${parsed.error || ''}`;
  const match = source.match(/AADSTS\d+/i);
  return match ? match[0].toUpperCase() : null;
}

function dvsaFailureMessage(error) {
  const stage = error?.stage || 'unknown';
  const code = error?.upstreamCode || null;
  const aadsts = error?.aadstsCode || null;
  if (stage === 'timeout') return 'DVSA took too long to respond. Please try again — the rest of EV Scan is still available.';
  if (stage === 'authentication') {
    const detail = [code, aadsts].filter(Boolean).join(' / ');
    return `DVSA authentication failed${detail ? ` (${detail})` : ''}. The issued API access needs checking.`;
  }
  const messages = {
    'MOTH-UA-01': 'DVSA rejected the authorisation for this request.',
    'MOTH-FB-01': 'DVSA says this account does not have permission to use this endpoint.',
    'MOTH-FB-02': 'The DVSA access token expired before the vehicle request completed.',
    'MOTH-FB-03': 'DVSA did not recognise the API key.',
    'MOTH-FB-04': 'DVSA says the access token was missing from the request.',
    'MOTH-RL-01': 'The DVSA daily API allowance has been reached.',
    'MOTH-RL-02': 'DVSA is rate-limiting requests. Wait a few minutes and try again.',
    'MOTH-IV-03': 'DVSA says that registration number is invalid.',
    'MOTH-NF-01': 'DVSA could not find a vehicle for that registration.',
    'MOTH-NF-02': 'DVSA could not find the API endpoint requested.'
  };
  return messages[code] || `DVSA vehicle lookup failed${code ? ` (${code})` : ''}. Please try again later.`;
}

async function getAccessToken(env) {
  const now = Date.now();
  if (tokenState.token && tokenState.expiresAt > now + 60_000) return tokenState.token;

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: String(env.DVSA_CLIENT_ID || ''),
    client_secret: String(env.DVSA_CLIENT_SECRET || ''),
    scope: env.DVSA_SCOPE || 'https://tapi.dvsa.gov.uk/.default'
  });

  const response = await fetchWithTimeout(env.DVSA_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const error = new Error('DVSA access-token request failed.');
    error.stage = 'authentication';
    error.upstreamStatus = response.status;
    error.upstreamCode = upstreamCodeFrom(text);
    error.aadstsCode = aadstsCodeFrom(text);
    throw error;
  }

  let data = {};
  try { data = await response.json(); } catch {}
  if (!data?.access_token) {
    const error = new Error('DVSA token response did not contain an access token.');
    error.stage = 'authentication';
    error.upstreamStatus = response.status;
    error.upstreamCode = 'TOKEN_MISSING';
    throw error;
  }

  const expiresIn = Math.max(300, Number(data.expires_in || 3600));
  tokenState = { token: data.access_token, expiresAt: now + Math.max(60, expiresIn - 60) * 1000 };
  return tokenState.token;
}

async function fetchMotVehicle(env, registration) {
  const token = await getAccessToken(env);
  const base = String(env.DVSA_API_BASE || 'https://history.mot.api.gov.uk').replace(/\/$/, '');
  const url = `${base}/v1/trade/vehicles/registration/${encodeURIComponent(registration)}`;
  const response = await fetchWithTimeout(url, {
    headers: { Authorization: `Bearer ${token}`, 'X-API-Key': env.DVSA_API_KEY, accept: 'application/json' }
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const error = new Error('DVSA vehicle request failed.');
    error.stage = 'vehicle_lookup';
    error.upstreamStatus = response.status;
    error.upstreamCode = upstreamCodeFrom(text);
    throw error;
  }
  try { return await response.json(); }
  catch {
    const error = new Error('DVSA returned unreadable vehicle data.');
    error.stage = 'vehicle_lookup';
    error.upstreamStatus = 502;
    error.upstreamCode = 'INVALID_RESPONSE';
    throw error;
  }
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function normalizeDefect(defect = {}) {
  const item = defect && typeof defect === 'object' ? defect : {};
  return {
    type: String(item.type || item.defectType || 'UNKNOWN').toUpperCase(),
    dangerous: Boolean(item.dangerous),
    text: String(item.text || item.description || '').trim()
  };
}

function normalizeMotTest(test = {}) {
  const item = test && typeof test === 'object' ? test : {};
  const defects = toArray(item.defects || item.rfrAndComments || item.advisoryItems).map(normalizeDefect);
  const odometer = Number(item.odometerValue || item.odometer || 0);
  return {
    completedDate: item.completedDate || item.testDate || item.completed_date || null,
    expiryDate: item.expiryDate || item.expiry_date || null,
    result: String(item.testResult || item.result || '').toUpperCase(),
    odometerValue: Number.isFinite(odometer) && odometer > 0 ? odometer : null,
    odometerUnit: item.odometerUnit || item.odometerResultType || 'mi',
    motTestNumber: item.motTestNumber || item.testNumber || null,
    defects
  };
}

const DEFECT_THEMES = [
  ['tyre', /tyre|tire|tread|wheel\b/i],
  ['brake', /brake|disc|pad|parking brake/i],
  ['suspension', /suspension|shock|spring|arm|bush|ball joint/i],
  ['steering', /steering|track rod|rack/i],
  ['lighting', /lamp|light|headlamp|indicator|reflector/i],
  ['windscreen', /windscreen|windshield|wiper|washer/i],
  ['body', /corrosion|body|structure|chassis|subframe/i]
];

function themeFor(text) {
  for (const [name, regex] of DEFECT_THEMES) if (regex.test(String(text || ''))) return name;
  return 'other';
}

function analyseMot(motTests = []) {
  const tests = toArray(motTests).filter(Boolean).sort((a, b) => {
    const ad = new Date(a.completedDate || 0).getTime();
    const bd = new Date(b.completedDate || 0).getTime();
    return (Number.isFinite(bd) ? bd : 0) - (Number.isFinite(ad) ? ad : 0);
  });
  let score = 100, failCount = 0, advisoryCount = 0, dangerousCount = 0, mileageAnomalies = 0;
  const themeCounts = {}, messages = [];

  for (const test of tests) {
    const result = String(test.result || '');
    if (result.includes('FAIL')) { failCount += 1; score -= 4; }
    for (const defect of toArray(test.defects)) {
      const type = String(defect?.type || '');
      if (defect?.dangerous || type.includes('DANGEROUS')) { dangerousCount += 1; score -= 10; }
      else if (type.includes('MAJOR')) score -= 5;
      else if (type.includes('ADVISORY') || type.includes('MINOR')) { advisoryCount += 1; score -= 1; }
      const theme = themeFor(defect?.text);
      themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    }
  }

  const chronological = [...tests].reverse().filter(t => Number.isFinite(Number(t.odometerValue)));
  for (let i = 1; i < chronological.length; i += 1) {
    if (Number(chronological[i].odometerValue) + 100 < Number(chronological[i - 1].odometerValue)) { mileageAnomalies += 1; score -= 20; }
  }

  const repeatedThemes = Object.entries(themeCounts).filter(([theme, count]) => theme !== 'other' && count >= 2).sort((a, b) => b[1] - a[1]);
  score -= repeatedThemes.length * 4;
  score = Math.max(0, Math.min(100, Math.round(score)));
  if (mileageAnomalies) messages.push('The recorded mileage appears to move backwards at least once. This needs checking before purchase.');
  if (dangerousCount) messages.push(`There ${dangerousCount === 1 ? 'is' : 'are'} ${dangerousCount} dangerous defect record${dangerousCount === 1 ? '' : 's'} in the MOT history. Older repairs may already be resolved, but the history deserves closer inspection.`);
  if (repeatedThemes.length) {
    const [theme, count] = repeatedThemes[0];
    messages.push(`${theme.charAt(0).toUpperCase() + theme.slice(1)}-related issues appear ${count} times in the MOT history. Repetition matters more than a one-off advisory, so we would check this area at the viewing.`);
  }
  if (!messages.length && tests.length) messages.push('We cannot see a repeated MOT pattern that stands out as a clear red flag. A physical inspection is still recommended.');
  if (!tests.length) messages.push('No MOT test history was returned for this vehicle.');
  return { score, failCount, advisoryCount, dangerousCount, mileageAnomalies, repeatedThemes: repeatedThemes.map(([theme, count]) => ({ theme, count })), summary: messages[0], notes: messages };
}

function normalizeVehicle(raw, registration) {
  const candidate = Array.isArray(raw) ? raw[0] : raw;
  const vehicle = candidate && typeof candidate === 'object' ? candidate : null;
  if (!vehicle) return null;
  const motTests = toArray(vehicle.motTests).map(normalizeMotTest);
  const mot = analyseMot(motTests);
  const fuelType = String(vehicle.fuelType || '').trim();
  return {
    registration: vehicle.registration || registration || null,
    make: vehicle.make || null,
    model: vehicle.model || null,
    fuelType: fuelType || null,
    primaryColour: vehicle.primaryColour || null,
    firstUsedDate: vehicle.firstUsedDate || vehicle.registrationDate || vehicle.manufactureDate || null,
    manufactureDate: vehicle.manufactureDate || null,
    engineSize: vehicle.engineSize || null,
    dataSource: vehicle.dataSource || 'dvsa',
    isLikelyEv: /electric/i.test(fuelType) && !/petrol|diesel/i.test(fuelType),
    motTests,
    motIntelligence: mot
  };
}

function scoreDeal(parts = {}) {
  const source = parts && typeof parts === 'object' ? parts : {};
  const weights = { price: 30, mot: 20, battery: 20, condition: 15, warranty: 10, listingQuality: 5 };
  const normalized = {};
  let weightedTotal = 0, availableWeight = 0;
  for (const [key, weight] of Object.entries(weights)) {
    const raw = source[key];
    if (raw == null || Number.isNaN(Number(raw))) continue;
    const value = Math.max(0, Math.min(100, Number(raw)));
    normalized[key] = value; weightedTotal += value * weight; availableWeight += weight;
  }
  const score = availableWeight ? Math.round(weightedTotal / availableWeight) : null;
  return { score, completeness: Math.round(availableWeight), weights, components: normalized, label: score == null ? 'Not enough data' : score >= 85 ? 'Strong candidate' : score >= 70 ? 'Worth considering' : score >= 55 ? 'Investigate first' : 'High risk' };
}

function getInputMode(body = {}) {
  const source = body && typeof body === 'object' ? body : {};
  const registration = cleanRegistration(source.registration);
  const listingUrl = String(source.listingUrl || '').trim();
  if (registration) return { type: 'registration', registration };
  if (listingUrl) return { type: 'listingUrl', listingUrl };
  return { type: 'none' };
}

async function handleScan(request, env) {
  let body = {};
  try { body = await request.json(); } catch { return json({ ok: false, code: 'INVALID_JSON', message: 'Send a valid request.' }, 400); }
  if (!body || typeof body !== 'object') body = {};
  const input = getInputMode(body);
  if (input.type === 'none') return json({ ok: false, code: 'MISSING_INPUT', message: 'Provide either a registration or a listing URL.' }, 400);
  if (input.type === 'listingUrl') return json({ ok: false, code: 'LISTING_PROVIDER_NOT_CONNECTED', message: 'Live marketplace listing ingestion is not enabled yet. You can still use a registration for the MOT check.', nextSupportedInput: 'registration' }, 422);
  if (!configured(env)) return json({ ok: false, code: 'DVSA_NOT_CONFIGURED', message: 'Live MOT access is temporarily unavailable. The rest of EV Scan remains usable.', requiredSecrets: ['DVSA_CLIENT_ID','DVSA_CLIENT_SECRET','DVSA_TOKEN_URL','DVSA_API_KEY'] }, 503);

  try {
    const raw = await fetchMotVehicle(env, input.registration);
    if (!raw) return json({ ok: false, code: 'VEHICLE_NOT_FOUND', message: 'DVSA did not return a vehicle for that registration.' }, 404);
    const vehicle = normalizeVehicle(raw, input.registration);
    if (!vehicle) return json({ ok: false, code: 'DVSA_INVALID_RESPONSE', message: 'DVSA returned vehicle data we could not read safely. Please try again later.' }, 502);
    const deal = scoreDeal({ mot: vehicle.motIntelligence?.score });
    return json({
      ok: true,
      mode: 'live-registration',
      evidence: { vehicle: 'VERIFIED', mot: 'VERIFIED', price: body.askingPrice ? 'USER_SUPPLIED' : 'UNKNOWN', battery: 'UNKNOWN', listing: 'UNKNOWN' },
      vehicle,
      scoring: { deal, decisionConfidence: { score: Math.min(65, 35 + Math.round((deal.completeness || 0) * 0.3)), reason: 'Vehicle identity and MOT history are verified, but price, battery condition and listing evidence are not yet connected.' } },
      limitations: ['This does not verify outstanding finance, theft, write-off or accident history.','Battery State of Health is not measured by the MOT API.','A physical inspection is still recommended before purchase.']
    });
  } catch (error) {
    const upstreamStatus = Number(error.upstreamStatus) || 502;
    return json({ ok: false, code: 'DVSA_UPSTREAM_ERROR', message: dvsaFailureMessage(error), diagnostic: { stage: error.stage || 'unknown', upstreamStatus, upstreamCode: error.upstreamCode || null, aadstsCode: error.aadstsCode || null } }, upstreamStatus >= 400 && upstreamStatus < 600 ? upstreamStatus : 502);
  }
}

async function handleAutotraderSearch(request, env) {
  if (!autotraderConfigured(env)) return json({ ok: false, code: 'AUTOTRADER_NOT_CONFIGURED', message: 'Auto Trader access is not connected yet.', requiredSecrets: ['AUTOTRADER_KEY','AUTOTRADER_SECRET'] }, 503);
  let filters = {};
  try { filters = await request.json(); } catch {}
  if (!filters || typeof filters !== 'object' || Array.isArray(filters)) filters = {};
  try {
    const data = await searchPublicEvListings(env, filters);
    return json({ ok: true, mode: 'autotrader-public-search', ...data });
  } catch (error) {
    return json({ ok: false, code: 'AUTOTRADER_UPSTREAM_ERROR', message: 'Auto Trader search is temporarily unavailable. The report can continue with whatever information is available.', detail: String(error.detail || error.message || error).slice(0, 500), cfRay: error.cfRay || null }, Number(error.status) || 502);
  }
}

async function serveAsset(request, env, url) {
  try {
    const response = await env.ASSETS.fetch(request);
    if (url.pathname !== '/' && url.pathname !== '/index.html') return response;
    if (!response.ok) return response;
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;
    let html = await response.text();
    html = html.replace('<html lang="en">', '<html lang="en-GB">');
    html = html.replace(/<title>[^<]*<\/title>/i, '<title>EV Scan — Check a Used Electric Car Before You Buy</title>');
    html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/i, '<meta name="description" content="Free UK used EV buying assistant. Paste an electric-car listing or enter a registration to understand price, battery, real-world range, MOT history, insurance and what to check before buying.">');
    const headMarkup = renderHomeHead();
    if (!html.includes('rel="canonical"')) html = html.replace('</head>', `${headMarkup}\n</head>`);
    const faqMarkup = renderHomeFaq();
    if (!html.includes('id="evscan-faq"')) html = html.replace('</main>', `${faqMarkup}\n    </main>`);
    const scripts = [
      ['/resilience.js', '<script src="/resilience.js"></script>'],
      ['/live.js', '<script src="/live.js"></script>'],
      ['/insurance.js', '<script src="/insurance.js"></script>'],
      ['/partners.js', '<script src="/partners.js"></script>'],
      ['/feedback.js', '<script src="/feedback.js"></script>']
    ];
    for (const [needle, tag] of scripts) if (!html.includes(needle)) html = html.replace('</body>', `  ${tag}\n</body>`);
    const headers = new Headers(response.headers);
    headers.delete('content-length'); headers.set('cache-control', 'no-cache');
    return new Response(html, { status: response.status, headers });
  } catch {
    return new Response('EV Scan is temporarily unavailable. Please refresh in a moment.', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8', 'retry-after': '30', 'x-robots-tag': 'noindex' } });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/robots.txt') {
      return new Response(renderRobots(), { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
    }
    if (url.pathname === '/sitemap.xml') {
      return new Response(renderSitemap(), { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
    }
    if (url.pathname === '/ev-guides' || url.pathname === '/ev-guides/') {
      return seoResponse(renderGuideHub());
    }
    if (url.pathname.startsWith('/ev-guides/')) {
      const slug = decodeURIComponent(url.pathname.slice('/ev-guides/'.length).replace(/\/$/, ''));
      const page = renderGuide(slug);
      if (page) return seoResponse(page);
      const response = seoResponse(renderGuide404(), 404);
      response.headers.set('x-robots-tag', 'noindex,follow');
      return response;
    }

    if (url.pathname === '/api/health') return json({ ok: true, service: 'EV Scan API', version: '0.4.2', liveMotConfigured: configured(env), autoTraderConfigured: autotraderConfigured(env), capabilities: { staticFrontend: true, motByRegistration: true, autoTraderPublicSearchAdapter: true, listingUrlIngestion: false, marketPricing: false, liveRecommendations: autotraderConfigured(env), gracefulFallbacks: true, seoGuides: true, homepageFaq: true } });
    if (url.pathname === '/api/scoring-preview' && request.method === 'POST') {
      try { const body = await request.json(); return json({ ok: true, ...scoreDeal(body) }); }
      catch { return json({ ok: false, code: 'INVALID_JSON', message: 'Could not read the scoring input.' }, 400); }
    }
    if (url.pathname === '/api/scan') {
      if (request.method !== 'POST') return json({ ok: false, code: 'METHOD_NOT_ALLOWED' }, 405);
      return handleScan(request, env);
    }
    if (url.pathname === '/api/autotrader/status') return json({ ok: true, configured: autotraderConfigured(env), environment: env.AUTOTRADER_API_BASE?.includes('api.autotrader.co.uk') ? 'production' : 'sandbox', message: autotraderConfigured(env) ? 'Auto Trader credentials are configured.' : 'Waiting for Auto Trader Connect sandbox credentials.' });
    if (url.pathname === '/api/autotrader/search') {
      if (request.method !== 'POST') return json({ ok: false, code: 'METHOD_NOT_ALLOWED' }, 405);
      return handleAutotraderSearch(request, env);
    }
    return serveAsset(request, env, url);
  }
};