import baseWorker from './worker-providers.js';
import { accountsConfigured, handleAccountRequest } from './account-api.js';
import { ensureAccountSchema } from './account-schema.js';

const SCAN_CACHE_VERSION = '0.8.2';
const SCAN_CACHE_TTL_SECONDS = 30 * 60;

function withAccountDb(env = {}) {
  if (env.ACCOUNTS_DB) return env;
  if (!env.EVSCAN_DB) return env;
  return Object.assign({}, env, { ACCOUNTS_DB: env.EVSCAN_DB });
}

function accountUnavailable(status = 503) {
  return new Response(JSON.stringify({
    ok: status < 400,
    configured: false,
    code: 'ACCOUNTS_NOT_READY',
    message: 'EV Scan accounts are being connected. Core scanning remains available without an account.'
  }, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'x-robots-tag': 'noindex, nofollow'
    }
  });
}

function blockedAccountMutation(request, url) {
  if (['GET','HEAD','OPTIONS'].includes(request.method)) return false;
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) return true;
  const fetchSite = (request.headers.get('sec-fetch-site') || '').toLowerCase();
  if (fetchSite && !['same-origin','same-site','none'].includes(fetchSite)) return true;
  return false;
}

function crossOriginDenied() {
  return new Response(JSON.stringify({ ok:false, code:'CROSS_ORIGIN_DENIED', message:'That account request was blocked.' }), {
    status:403,
    headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','x-robots-tag':'noindex, nofollow'}
  });
}

function retiredAutoTraderRoute() {
  return new Response(JSON.stringify({
    ok: false,
    code: 'AUTOTRADER_DIRECT_INTEGRATION_RETIRED',
    message: 'EV Scan no longer depends on direct Auto Trader API access. Vehicle listings are handled through the multi-provider verification pipeline.'
  }, null, 2), {
    status: 410,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'x-robots-tag': 'noindex, nofollow'
    }
  });
}

async function accountReady(env = {}) {
  const accountEnv = withAccountDb(env);
  if (!accountsConfigured(accountEnv)) return { ready: false, env: accountEnv };
  const ready = await ensureAccountSchema(accountEnv.ACCOUNTS_DB);
  return { ready, env: accountEnv };
}

function alignScannerPromises(html = '') {
  return String(html)
    .replace(
      'Paste the listing. We’ll explain the price, battery, range, MOT history and the things worth asking before you go anywhere near the seller.',
      'Paste the listing. We’ll cross-check the advert against available vehicle, MOT and market evidence — and only show a report when we can verify enough to trust it.'
    )
    .replace(
      'Demo mode is on for now — any valid-looking link will open the example report.',
      'EV Scan only shows a live report when the advert passes its verification checks.'
    )
    .replace(
      'Price, battery confidence, realistic range, MOT patterns, model-specific risks and missing seller information.',
      'Asking price, battery and range specifications, MOT patterns, model-specific risks and seller information — only when the evidence is strong enough.'
    )
    .replace('Battery confidence <b>High</b>', 'Battery spec <b>Verified</b>')
    .replace('£1,120 below market</div>', 'Example: £1,120 below market</div>')
    .replace(
      '<small>Good car, a few things still need confirming</small>',
      '<small>Example only · live reports must pass the evidence gate</small>'
    )
    .replace(
      '<article class="metric-card"><span>Battery confidence</span><strong>High</strong><small>Expected SoH 90–94% · estimated</small></article>',
      '<article class="metric-card"><span>Battery specification</span><strong>77.4 kWh</strong><small>State of Health is not guessed from an advert</small></article>'
    )
    .replace(
      '<article class="metric-card"><span>Typical UK range</span><strong>238 mi</strong><small>About 205 mi cold motorway</small></article>',
      '<article class="metric-card"><span>EV range specification</span><strong>238 mi</strong><small>Provider-backed listed/rated figure</small></article>'
    );
}

async function injectAccountUi(response) {
  if (!response?.ok) return response;
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) return response;
  let html = alignScannerPromises(await response.text());
  if (!html.includes('/finder-v2.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/finder-v2.css">\n</head>');
  if (!html.includes('/account.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/account.css">\n</head>');
  if (!html.includes('/account-polish.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/account-polish.css">\n</head>');
  if (!html.includes('/finder-v2.js')) html = html.replace('</body>', '  <script src="/finder-v2.js"></script>\n</body>');
  if (!html.includes('/account.js')) html = html.replace('</body>', '  <script src="/account.js"></script>\n  <script src="/account-personalisation.js"></script>\n</body>');
  if (!html.includes('/account-polish.js')) html = html.replace('</body>', '  <script src="/account-polish.js"></script>\n</body>');
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(html, { status: response.status, headers });
}

async function ensureScanCache(db) {
  if (!db?.prepare) return false;
  try {
    await db.prepare(`CREATE TABLE IF NOT EXISTS scan_cache (
      cache_key TEXT PRIMARY KEY,
      listing_url TEXT NOT NULL,
      response_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    )`).run();
    return true;
  } catch {
    return false;
  }
}

function canonicalListingUrl(value = '') {
  try {
    const url = new URL(String(value || '').trim());
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    url.hash = '';
    return url.toString();
  } catch {
    return '';
  }
}

async function scanCacheKey(listingUrl) {
  const input = new TextEncoder().encode(`${SCAN_CACHE_VERSION}:${listingUrl}`);
  const digest = await crypto.subtle.digest('SHA-256', input);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function scanRequestListingUrl(request) {
  try {
    const body = await request.clone().json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) return '';
    return canonicalListingUrl(body.listingUrl);
  } catch {
    return '';
  }
}

async function readCachedScan(env, listingUrl) {
  const db = env.EVSCAN_DB;
  if (!listingUrl || !(await ensureScanCache(db))) return null;
  try {
    const key = await scanCacheKey(listingUrl);
    const now = Math.floor(Date.now() / 1000);
    const row = await db.prepare('SELECT response_json, created_at, expires_at FROM scan_cache WHERE cache_key = ?1 AND expires_at > ?2 LIMIT 1').bind(key, now).first();
    if (!row?.response_json) return null;
    const payload = JSON.parse(row.response_json);
    if (!payload?.ok || payload?.quality?.passed !== true) return null;
    payload.cache = { hit: true, ageSeconds: Math.max(0, now - Number(row.created_at || now)), ttlSeconds: SCAN_CACHE_TTL_SECONDS };
    return payload;
  } catch {
    return null;
  }
}

async function writeCachedScan(env, listingUrl, payload) {
  const db = env.EVSCAN_DB;
  if (!listingUrl || !payload?.ok || payload?.quality?.passed !== true || !(await ensureScanCache(db))) return;
  try {
    const key = await scanCacheKey(listingUrl);
    const now = Math.floor(Date.now() / 1000);
    const expires = now + SCAN_CACHE_TTL_SECONDS;
    const clean = { ...payload, cache: { hit: false, ttlSeconds: SCAN_CACHE_TTL_SECONDS } };
    await db.prepare(`INSERT INTO scan_cache (cache_key, listing_url, response_json, created_at, expires_at)
      VALUES (?1, ?2, ?3, ?4, ?5)
      ON CONFLICT(cache_key) DO UPDATE SET listing_url = excluded.listing_url, response_json = excluded.response_json, created_at = excluded.created_at, expires_at = excluded.expires_at`)
      .bind(key, listingUrl, JSON.stringify(clean), now, expires)
      .run();
    if (Math.random() < 0.03) {
      await db.prepare('DELETE FROM scan_cache WHERE expires_at <= ?1').bind(now).run();
    }
  } catch {}
}

function cachedScanResponse(payload) {
  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'x-robots-tag': 'noindex, nofollow'
    }
  });
}

async function augmentHealth(response, env) {
  try {
    const account = await accountReady(env);
    const data = await response.json();
    data.version = SCAN_CACHE_VERSION;
    data.accountsConfigured = account.ready;
    data.capabilities = {
      ...(data.capabilities || {}),
      optionalAccounts: true,
      savedScans: account.ready,
      shortlistAndCompare: account.ready,
      drivingProfile: account.ready,
      myGarage: account.ready,
      inAppOwnershipReminders: account.ready,
      accountThemes: account.ready,
      personalisedEvFinder: true,
      directAutoTraderApi: false,
      verifiedScanCache: Boolean(env.EVSCAN_DB),
      scanCacheTtlSeconds: SCAN_CACHE_TTL_SECONDS
    };
    const headers = new Headers(response.headers);
    headers.set('content-type', 'application/json; charset=utf-8');
    headers.delete('content-length');
    return new Response(JSON.stringify(data, null, 2), { status: response.status, headers });
  } catch { return response; }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/account') || url.pathname.startsWith('/api/auth/')) {
      if (blockedAccountMutation(request, url)) return crossOriginDenied();
      const account = await accountReady(env);
      if (!account.ready) {
        if (url.pathname === '/api/account/status') return accountUnavailable(200);
        return accountUnavailable(503);
      }
      return handleAccountRequest(request, account.env, url);
    }

    if (url.pathname.startsWith('/api/autotrader/')) return retiredAutoTraderRoute();

    if (url.pathname === '/api/scan' && request.method === 'POST') {
      const listingUrl = await scanRequestListingUrl(request);
      if (listingUrl) {
        const cached = await readCachedScan(env, listingUrl);
        if (cached) return cachedScanResponse(cached);
      }
      const scanResponse = await baseWorker.fetch(request, env, ctx);
      if (listingUrl && scanResponse?.ok) {
        try {
          const payload = await scanResponse.clone().json();
          if (payload?.ok && payload?.quality?.passed === true) {
            const task = writeCachedScan(env, listingUrl, payload);
            if (ctx?.waitUntil) ctx.waitUntil(task);
            else await task;
          }
        } catch {}
      }
      return scanResponse;
    }

    const response = await baseWorker.fetch(request, env, ctx);
    if (url.pathname === '/api/health') return augmentHealth(response, env);
    if (url.pathname.startsWith('/admin')) return response;
    return injectAccountUi(response);
  }
};
