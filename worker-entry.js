import baseWorker from './worker-providers.js';
import { accountsConfigured, handleAccountRequest } from './account-api.js';
import { ensureAccountSchema } from './account-schema.js';

const VERSION = '0.9.1';

function withAccountDb(env = {}) {
  if (env.ACCOUNTS_DB) return env;
  if (!env.EVSCAN_DB) return env;
  return Object.assign({},env,{ ACCOUNTS_DB:env.EVSCAN_DB });
}
function jsonResponse(data,status = 200) {
  return new Response(JSON.stringify(data,null,2),{ status, headers:{ 'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','x-robots-tag':'noindex, nofollow' } });
}
function accountUnavailable(status = 503) { return jsonResponse({ ok:status < 400, configured:false, code:'ACCOUNTS_NOT_READY', message:'EV Scan accounts are being connected. Core scanning remains available without an account.' },status); }
function blockedAccountMutation(request,url) {
  if (['GET','HEAD','OPTIONS'].includes(request.method)) return false;
  const origin = request.headers.get('origin'); if (origin && origin !== url.origin) return true;
  const site = (request.headers.get('sec-fetch-site') || '').toLowerCase();
  return Boolean(site && !['same-origin','same-site','none'].includes(site));
}
function crossOriginDenied() { return jsonResponse({ ok:false, code:'CROSS_ORIGIN_DENIED', message:'That account request was blocked.' },403); }
function retiredAutoTraderRoute() { return jsonResponse({ ok:false, code:'AUTOTRADER_DIRECT_INTEGRATION_RETIRED', message:'EV Scan does not have an approved direct Auto Trader data route.' },410); }
async function accountReady(env = {}) {
  const accountEnv = withAccountDb(env);
  if (!accountsConfigured(accountEnv)) return { ready:false, env:accountEnv };
  return { ready:await ensureAccountSchema(accountEnv.ACCOUNTS_DB), env:accountEnv };
}

function alignScannerPromises(html = '') {
  return String(html)
    .replace('Paste the listing. We’ll explain the price, battery, range, MOT history and the things worth asking before you go anywhere near the seller.','Paste a listing link or UK registration. Listing reports are only shown when EV Scan can verify enough evidence to trust them.')
    .replace('Demo mode is on for now — any valid-looking link will open the example report.','Paste an EV listing link or UK registration. Registration checks remain available when the monthly link allowance is paused.')
    .replace('Price, battery confidence, realistic range, MOT patterns, model-specific risks and missing seller information.','Advert details, vehicle identity, MOT patterns, battery/range specifications, model-specific risks and seller information — only where the evidence supports them.')
    .replace('Battery confidence <b>High</b>','Evidence check <b>Strict</b>')
    .replace('£1,120 below market</div>','Market pricing shown only when independently verified</div>')
    .replace('<small>Good car, a few things still need confirming</small>','<small>Example only · live reports must pass the evidence gate</small>')
    .replace('<article class="metric-card"><span>Battery confidence</span><strong>High</strong><small>Expected SoH 90–94% · estimated</small></article>','<article class="metric-card"><span>Battery evidence</span><strong>Measured only</strong><small>State of Health is never guessed from an advert</small></article>')
    .replace('<div class="eyebrow">Built for normal buyers</div>','<div class="eyebrow">Design example · not current live output</div>')
    .replace('Open full demo report','Open design demo')
    .replace('<small class="good">below comparable cars</small>','<small>illustrative future market field</small>')
    .replace('<article class="metric-card"><span>Typical UK range</span><strong>238 mi</strong><small>About 205 mi cold motorway</small></article>','<article class="metric-card"><span>Range evidence</span><strong>Advert/spec data</strong><small>Live reports only show supported figures</small></article>')
    .replace('<p>Advertising and partner links will never change a Deal Score or recommendation. Estimated data is labelled as estimated, seller claims are labelled as seller claims, and unknowns stay unknown until there’s evidence.</p>','<p>Advertising and partner links will never change a report or recommendation. Unsupported claims are left out, and a listing report is refused when the evidence is not strong enough.</p>')
    .replace('<div class="section-heading split-heading">','<div class="section-heading split-heading">',1)
    .replace('<div class="preview-dashboard">','<p class="live-note" style="margin-bottom:16px">This is a visual design mock-up. Fields such as market valuation, Deal Score and estimated battery health are not part of the current live listing report unless a suitable verified source is connected.</p><div class="preview-dashboard">');
}

async function injectAccountUi(response) {
  if (!response?.ok || !(response.headers.get('content-type') || '').includes('text/html')) return response;
  let html = alignScannerPromises(await response.text());
  if (!html.includes('/finder-v2.css')) html = html.replace('</head>','<link rel="stylesheet" href="/finder-v2.css">\n</head>');
  if (!html.includes('/account.css')) html = html.replace('</head>','<link rel="stylesheet" href="/account.css">\n</head>');
  if (!html.includes('/account-polish.css')) html = html.replace('</head>','<link rel="stylesheet" href="/account-polish.css">\n</head>');
  if (!html.includes('/finder-v2.js')) html = html.replace('</body>','  <script src="/finder-v2.js"></script>\n</body>');
  if (!html.includes('/account.js')) html = html.replace('</body>','  <script src="/account.js"></script>\n  <script src="/account-personalisation.js"></script>\n</body>');
  if (!html.includes('/account-polish.js')) html = html.replace('</body>','  <script src="/account-polish.js"></script>\n</body>');
  const headers = new Headers(response.headers); headers.delete('content-length');
  return new Response(html,{ status:response.status, headers });
}

async function augmentHealth(response,env) {
  try {
    const account = await accountReady(env), data = await response.json();
    data.version = VERSION; data.accountsConfigured = account.ready;
    data.zeroSpend = { enforced:true, paidFallbacksAllowed:false, marketCheckDisabled:true };
    data.capabilities = { ...(data.capabilities || {}), optionalAccounts:true, savedScans:account.ready, shortlistAndCompare:account.ready, drivingProfile:account.ready, myGarage:account.ready, inAppOwnershipReminders:account.ready, accountThemes:account.ready, personalisedEvFinder:true, directAutoTraderApi:false, persistentProviderResponseCache:false, zeroSpendProtection:true };
    const headers = new Headers(response.headers); headers.set('content-type','application/json; charset=utf-8'); headers.delete('content-length');
    return new Response(JSON.stringify(data,null,2),{ status:response.status, headers });
  } catch { return response; }
}

export default {
  async fetch(request,env,ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/account') || url.pathname.startsWith('/api/auth/')) {
      if (blockedAccountMutation(request,url)) return crossOriginDenied();
      const account = await accountReady(env);
      if (!account.ready) return url.pathname === '/api/account/status' ? accountUnavailable(200) : accountUnavailable(503);
      return handleAccountRequest(request,account.env,url);
    }
    if (url.pathname.startsWith('/api/autotrader/')) return retiredAutoTraderRoute();
    const response = await baseWorker.fetch(request,env,ctx);
    if (url.pathname === '/api/health') return augmentHealth(response,env);
    if (url.pathname.startsWith('/admin')) return response;
    return injectAccountUi(response);
  }
};
