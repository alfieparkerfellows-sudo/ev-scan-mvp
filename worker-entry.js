import baseWorker from './worker-providers.js';
import { accountsConfigured, handleAccountRequest } from './account-api.js';
import { ensureAccountSchema } from './account-schema.js';

const VERSION = '0.8.4';

function withAccountDb(env = {}) {
  if (env.ACCOUNTS_DB) return env;
  if (!env.EVSCAN_DB) return env;
  return Object.assign({}, env, { ACCOUNTS_DB: env.EVSCAN_DB });
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'x-robots-tag': 'noindex, nofollow'
    }
  });
}

function accountUnavailable(status = 503) {
  return jsonResponse({
    ok: status < 400,
    configured: false,
    code: 'ACCOUNTS_NOT_READY',
    message: 'EV Scan accounts are being connected. Core scanning remains available without an account.'
  }, status);
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
  return jsonResponse({ ok:false, code:'CROSS_ORIGIN_DENIED', message:'That account request was blocked.' }, 403);
}

function retiredAutoTraderRoute() {
  return jsonResponse({
    ok: false,
    code: 'AUTOTRADER_DIRECT_INTEGRATION_RETIRED',
    message: 'EV Scan no longer depends on direct Auto Trader API access. Vehicle listings are handled through the multi-provider verification pipeline.'
  }, 410);
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
      'Paste the listing. We’ll cross-check the advert against available vehicle and MOT evidence — and only show a report when we can verify enough to trust it.'
    )
    .replace(
      'Demo mode is on for now — any valid-looking link will open the example report.',
      'EV Scan only shows a live report when the advert passes its verification checks.'
    )
    .replace(
      'Price, battery confidence, realistic range, MOT patterns, model-specific risks and missing seller information.',
      'Asking price, vehicle identity, MOT patterns, model-specific risks and seller information — only when the evidence is strong enough.'
    )
    .replace('Battery confidence <b>High</b>', 'Evidence check <b>Strict</b>')
    .replace('£1,120 below market</div>', 'Market pricing shown only when independently verified</div>')
    .replace(
      '<small>Good car, a few things still need confirming</small>',
      '<small>Example only · live reports must pass the evidence gate</small>'
    )
    .replace(
      '<article class="metric-card"><span>Battery confidence</span><strong>High</strong><small>Expected SoH 90–94% · estimated</small></article>',
      '<article class="metric-card"><span>Battery evidence</span><strong>Measured only</strong><small>State of Health is never guessed from an advert</small></article>'
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

async function augmentHealth(response, env) {
  try {
    const account = await accountReady(env);
    const data = await response.json();
    data.version = VERSION;
    data.accountsConfigured = account.ready;
    data.zeroSpend = {
      enforced: true,
      marketCheckDisabled: true,
      paidFallbacksAllowed: false
    };
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
      persistentProviderResponseCache: false,
      zeroSpendProtection: true
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

    const response = await baseWorker.fetch(request, env, ctx);
    if (url.pathname === '/api/health') return augmentHealth(response, env);
    if (url.pathname.startsWith('/admin')) return response;
    return injectAccountUi(response);
  }
};
