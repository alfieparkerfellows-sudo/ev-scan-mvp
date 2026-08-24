import { autotraderConfigured, searchPublicEvListings } from './autotrader.js';

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff'
};

let tokenState = { token: null, expiresAt: 0 };

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: JSON_HEADERS });
}

function cleanRegistration(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
}

function configured(env) {
  return Boolean(
    env.DVSA_CLIENT_ID &&
    env.DVSA_CLIENT_SECRET &&
    env.DVSA_TOKEN_URL &&
    env.DVSA_API_KEY
  );
}

function upstreamCodeFrom(text = '') {
  try {
    const parsed = JSON.parse(text);
    return String(parsed.errorCode || parsed.code || parsed.error || '').trim() || null;
  } catch {
    return null;
  }
}

function dvsaFailureMessage(error) {
  const stage = error?.stage || 'unknown';
  const code = error?.upstreamCode || null;

  if (stage === 'authentication') {
    return `DVSA authentication failed${code ? ` (${code})` : ''}. The token credentials or token URL need checking.`;
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

  return messages[code] || `DVSA vehicle lookup failed${code ? ` (${code})` : ''}.`;
}

async function getAccessToken(env) {
  const now = Date.now();
  if (tokenState.token && tokenState.expiresAt > now + 60_000) return tokenState.token;

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: env.DVSA_CLIENT_ID,
    client_secret: env.DVSA_CLIENT_SECRET,
    scope: env.DVSA_SCOPE || 'https://tapi.dvsa.gov.uk/.default'
  });

  const response = await fetch(env.DVSA_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body
  });

  if (!response.ok) {
    const text = await response.text();
    const error = new Error('DVSA access-token request failed.');
    error.stage = 'authentication';
    error.upstreamStatus = response.status;
    error.upstreamCode = upstreamCodeFrom(text);
    throw error;
  }

  const data = await response.json();
  if (!data?.access_token) {
    const error = new Error('DVSA token response did not contain an access token.');
    error.stage = 'authentication';
    error.upstreamStatus = response.status;
    error.upstreamCode = 'TOKEN_MISSING';
    throw error;
  }

  const expiresIn = Math.max(300, Number(data.expires_in || 3600));
  tokenState = {
    token: data.access_token,
    expiresAt: now + Math.max(60, expiresIn - 60) * 1000
  };
  return tokenState.token;
}

async function fetchMotVehicle(env, registration) {
  const token = await getAccessToken(env);
  const base = env.DVSA_API_BASE || 'https://history.mot.api.gov.uk';
  const url = `${base}/v1/trade/vehicles/registration/${encodeURIComponent(registration)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-API-Key': env.DVSA_API_KEY,
      accept: 'application/json'
    }
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    const text = await response.text();
    const error = new Error('DVSA vehicle request failed.');
    error.stage = 'vehicle_lookup';
    error.upstreamStatus = response.status;
    error.upstreamCode = upstreamCodeFrom(text);
    throw error;
  }

  return response.json();
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function normalizeDefect(defect = {}) {
  return {
    type: String(defect.type || defect.defectType || 'UNKNOWN').toUpperCase(),
    dangerous: Boolean(defect.dangerous),
    text: String(defect.text || defect.description || '').trim()
  };
}

function normalizeMotTest(test = {}) {
  const defects = toArray(test.defects || test.rfrAndComments || test.advisoryItems).map(normalizeDefect);
  return {
    completedDate: test.completedDate || test.testDate || test.completed_date || null,
    expiryDate: test.expiryDate || test.expiry_date || null,
    result: String(test.testResult || test.result || '').toUpperCase(),
    odometerValue: Number(test.odometerValue || test.odometer || 0) || null,
    odometerUnit: test.odometerUnit || test.odometerResultType || 'mi',
    motTestNumber: test.motTestNumber || test.testNumber || null,
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
  for (const [name, regex] of DEFECT_THEMES) if (regex.test(text)) return name;
  return 'other';
}

function analyseMot(motTests = []) {
  const tests = [...motTests].sort((a, b) => {
    const ad = new Date(a.completedDate || 0).getTime();
    const bd = new Date(b.completedDate || 0).getTime();
    return bd - ad;
  });

  let score = 100;
  let failCount = 0;
  let advisoryCount = 0;
  let dangerousCount = 0;
  let mileageAnomalies = 0;
  const themeCounts = {};
  const messages = [];

  for (const test of tests) {
    const result = test.result;
    if (result.includes('FAIL')) {
      failCount += 1;
      score -= 4;
    }

    for (const defect of test.defects) {
      const type = defect.type;
      if (defect.dangerous || type.includes('DANGEROUS')) {
        dangerousCount += 1;
        score -= 10;
      } else if (type.includes('MAJOR')) {
        score -= 5;
      } else if (type.includes('ADVISORY') || type.includes('MINOR')) {
        advisoryCount += 1;
        score -= 1;
      }

      const theme = themeFor(defect.text);
      themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    }
  }

  const chronological = [...tests].reverse().filter(t => t.odometerValue != null);
  for (let i = 1; i < chronological.length; i += 1) {
    if (chronological[i].odometerValue + 100 < chronological[i - 1].odometerValue) {
      mileageAnomalies += 1;
      score -= 20;
    }
  }

  const repeatedThemes = Object.entries(themeCounts)
    .filter(([theme, count]) => theme !== 'other' && count >= 2)
    .sort((a, b) => b[1] - a[1]);

  score -= repeatedThemes.length * 4;
  score = Math.max(0, Math.min(100, Math.round(score)));

  if (mileageAnomalies) {
    messages.push('The recorded mileage appears to move backwards at least once. This needs checking before purchase.');
  }
  if (dangerousCount) {
    messages.push(`There ${dangerousCount === 1 ? 'is' : 'are'} ${dangerousCount} dangerous defect record${dangerousCount === 1 ? '' : 's'} in the MOT history. Older repairs may already be resolved, but the history deserves closer inspection.`);
  }
  if (repeatedThemes.length) {
    const [theme, count] = repeatedThemes[0];
    messages.push(`${theme.charAt(0).toUpperCase() + theme.slice(1)}-related issues appear ${count} times in the MOT history. Repetition matters more than a one-off advisory, so we would check this area at the viewing.`);
  }
  if (!messages.length && tests.length) {
    messages.push('We cannot see a repeated MOT pattern that stands out as a clear red flag. A physical inspection is still recommended.');
  }
  if (!tests.length) messages.push('No MOT test history was returned for this vehicle.');

  return {
    score,
    failCount,
    advisoryCount,
    dangerousCount,
    mileageAnomalies,
    repeatedThemes: repeatedThemes.map(([theme, count]) => ({ theme, count })),
    summary: messages[0],
    notes: messages
  };
}

function normalizeVehicle(raw, registration) {
  const vehicle = Array.isArray(raw) ? raw[0] : raw;
  if (!vehicle) return null;

  const motTests = toArray(vehicle.motTests).map(normalizeMotTest);
  const mot = analyseMot(motTests);
  const fuelType = String(vehicle.fuelType || '').trim();
  const likelyEv = /electric/i.test(fuelType) && !/petrol|diesel/i.test(fuelType);

  return {
    registration: vehicle.registration || registration,
    make: vehicle.make || null,
    model: vehicle.model || null,
    fuelType: fuelType || null,
    primaryColour: vehicle.primaryColour || null,
    firstUsedDate: vehicle.firstUsedDate || vehicle.registrationDate || vehicle.manufactureDate || null,
    manufactureDate: vehicle.manufactureDate || null,
    engineSize: vehicle.engineSize || null,
    dataSource: vehicle.dataSource || 'dvsa',
    isLikelyEv: likelyEv,
    motTests,
    motIntelligence: mot
  };
}

function scoreDeal(parts = {}) {
  const weights = {
    price: 30,
    mot: 20,
    battery: 20,
    condition: 15,
    warranty: 10,
    listingQuality: 5
  };

  const normalized = {};
  let weightedTotal = 0;
  let availableWeight = 0;

  for (const [key, weight] of Object.entries(weights)) {
    const raw = parts[key];
    if (raw == null || Number.isNaN(Number(raw))) continue;
    const value = Math.max(0, Math.min(100, Number(raw)));
    normalized[key] = value;
    weightedTotal += value * weight;
    availableWeight += weight;
  }

  const score = availableWeight ? Math.round(weightedTotal / availableWeight) : null;
  const completeness = Math.round(availableWeight);

  return {
    score,
    completeness,
    weights,
    components: normalized,
    label: score == null ? 'Not enough data' : score >= 85 ? 'Strong candidate' : score >= 70 ? 'Worth considering' : score >= 55 ? 'Investigate first' : 'High risk'
  };
}

function getInputMode(body) {
  const registration = cleanRegistration(body.registration);
  const listingUrl = String(body.listingUrl || '').trim();
  if (registration) return { type: 'registration', registration };
  if (listingUrl) return { type: 'listingUrl', listingUrl };
  return { type: 'none' };
}

async function handleScan(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: 'INVALID_JSON', message: 'Send a JSON body.' }, 400);
  }

  const input = getInputMode(body);

  if (input.type === 'none') {
    return json({ ok: false, code: 'MISSING_INPUT', message: 'Provide either a registration or a listingUrl.' }, 400);
  }

  if (input.type === 'listingUrl') {
    return json({
      ok: false,
      code: 'LISTING_PROVIDER_NOT_CONNECTED',
      message: 'The backend is ready, but live marketplace listing ingestion is intentionally not enabled yet. Auto Trader Connect onboarding is required before we can legally and reliably ingest public advert data.',
      nextSupportedInput: 'registration'
    }, 422);
  }

  if (!configured(env)) {
    return json({
      ok: false,
      code: 'DVSA_NOT_CONFIGURED',
      message: 'The live MOT endpoint is built but DVSA credentials have not been added to Cloudflare yet.',
      requiredSecrets: ['DVSA_CLIENT_ID', 'DVSA_CLIENT_SECRET', 'DVSA_TOKEN_URL', 'DVSA_API_KEY'],
      optionalSecrets: ['DVSA_SCOPE', 'DVSA_API_BASE']
    }, 503);
  }

  try {
    const raw = await fetchMotVehicle(env, input.registration);
    if (!raw) {
      return json({ ok: false, code: 'VEHICLE_NOT_FOUND', message: 'DVSA did not return a vehicle for that registration.' }, 404);
    }

    const vehicle = normalizeVehicle(raw, input.registration);
    const deal = scoreDeal({ mot: vehicle.motIntelligence.score });

    return json({
      ok: true,
      mode: 'live-registration',
      evidence: {
        vehicle: 'VERIFIED',
        mot: 'VERIFIED',
        price: body.askingPrice ? 'USER_SUPPLIED' : 'UNKNOWN',
        battery: 'UNKNOWN',
        listing: 'UNKNOWN'
      },
      vehicle,
      scoring: {
        deal,
        decisionConfidence: {
          score: Math.min(65, 35 + Math.round(deal.completeness * 0.3)),
          reason: 'Vehicle identity and MOT history are verified, but price, battery condition and listing evidence are not yet connected.'
        }
      },
      limitations: [
        'This does not verify outstanding finance, theft, write-off or accident history.',
        'Battery State of Health is not measured by the MOT API.',
        'A physical inspection is still recommended before purchase.'
      ]
    });
  } catch (error) {
    const upstreamStatus = Number(error.upstreamStatus) || null;
    const message = dvsaFailureMessage(error);
    return json({
      ok: false,
      code: 'DVSA_UPSTREAM_ERROR',
      message,
      diagnostic: {
        stage: error.stage || 'unknown',
        upstreamStatus,
        upstreamCode: error.upstreamCode || null
      }
    }, upstreamStatus && upstreamStatus >= 400 && upstreamStatus < 600 ? upstreamStatus : 502);
  }
}

async function handleAutotraderSearch(request, env) {
  if (!autotraderConfigured(env)) {
    return json({
      ok: false,
      code: 'AUTOTRADER_NOT_CONFIGURED',
      message: 'Auto Trader Connect support is coded, but sandbox credentials have not been issued yet.',
      requiredSecrets: ['AUTOTRADER_KEY', 'AUTOTRADER_SECRET'],
      optionalSecrets: ['AUTOTRADER_API_BASE']
    }, 503);
  }

  let filters = {};
  try { filters = await request.json(); } catch {}

  try {
    const data = await searchPublicEvListings(env, filters);
    return json({ ok: true, mode: 'autotrader-public-search', ...data });
  } catch (error) {
    return json({
      ok: false,
      code: 'AUTOTRADER_UPSTREAM_ERROR',
      message: 'Auto Trader search could not be completed.',
      detail: String(error.detail || error.message || error).slice(0, 500),
      cfRay: error.cfRay || null
    }, Number(error.status) || 502);
  }
}

async function serveAsset(request, env, url) {
  const response = await env.ASSETS.fetch(request);
  if (url.pathname !== '/' && url.pathname !== '/index.html') return response;
  if (!response.ok) return response;

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;

  let html = await response.text();
  const scripts = [
    ['/live.js', '<script src="/live.js"></script>'],
    ['/insurance.js', '<script src="/insurance.js"></script>'],
    ['/partners.js', '<script src="/partners.js"></script>'],
    ['/feedback.js', '<script src="/feedback.js"></script>']
  ];
  for (const [needle, tag] of scripts) {
    if (!html.includes(needle)) html = html.replace('</body>', `  ${tag}\n</body>`);
  }

  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.set('cache-control', 'no-cache');
  return new Response(html, { status: response.status, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
      return json({
        ok: true,
        service: 'EV Scan API',
        version: '0.2.1',
        liveMotConfigured: configured(env),
        autoTraderConfigured: autotraderConfigured(env),
        capabilities: {
          staticFrontend: true,
          motByRegistration: true,
          autoTraderPublicSearchAdapter: true,
          listingUrlIngestion: false,
          marketPricing: false,
          liveRecommendations: autotraderConfigured(env)
        }
      });
    }

    if (url.pathname === '/api/scoring-preview' && request.method === 'POST') {
      try {
        const body = await request.json();
        return json({ ok: true, ...scoreDeal(body) });
      } catch {
        return json({ ok: false, code: 'INVALID_JSON' }, 400);
      }
    }

    if (url.pathname === '/api/scan') {
      if (request.method !== 'POST') return json({ ok: false, code: 'METHOD_NOT_ALLOWED' }, 405);
      return handleScan(request, env);
    }

    if (url.pathname === '/api/autotrader/status') {
      return json({
        ok: true,
        configured: autotraderConfigured(env),
        environment: env.AUTOTRADER_API_BASE?.includes('api.autotrader.co.uk') ? 'production' : 'sandbox',
        message: autotraderConfigured(env) ? 'Auto Trader credentials are configured.' : 'Waiting for Auto Trader Connect sandbox credentials.'
      });
    }

    if (url.pathname === '/api/autotrader/search') {
      if (request.method !== 'POST') return json({ ok: false, code: 'METHOD_NOT_ALLOWED' }, 405);
      return handleAutotraderSearch(request, env);
    }

    return serveAsset(request, env, url);
  }
};