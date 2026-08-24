import baseWorker from './worker-admin.js';
import { accountsConfigured, handleAccountRequest } from './account-api.js';
import { ensureAccountSchema } from './account-schema.js';

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

async function accountReady(env = {}) {
  const accountEnv = withAccountDb(env);
  if (!accountsConfigured(accountEnv)) return { ready: false, env: accountEnv };
  const ready = await ensureAccountSchema(accountEnv.ACCOUNTS_DB);
  return { ready, env: accountEnv };
}

async function injectAccountUi(response) {
  if (!response?.ok) return response;
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) return response;
  let html = await response.text();
  if (!html.includes('/account.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/account.css">\n</head>');
  if (!html.includes('/account.js')) html = html.replace('</body>', '  <script src="/account.js"></script>\n</body>');
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(html, { status: response.status, headers });
}

async function augmentHealth(response, env) {
  try {
    const account = await accountReady(env);
    const data = await response.json();
    data.version = '0.7.0';
    data.accountsConfigured = account.ready;
    data.capabilities = {
      ...(data.capabilities || {}),
      optionalAccounts: true,
      savedScans: account.ready,
      shortlistAndCompare: account.ready,
      drivingProfile: account.ready,
      myGarage: account.ready,
      inAppOwnershipReminders: account.ready,
      accountThemes: account.ready
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
      const account = await accountReady(env);
      if (!account.ready) {
        if (url.pathname === '/api/account/status') return accountUnavailable(200);
        return accountUnavailable(503);
      }
      return handleAccountRequest(request, account.env, url);
    }

    const response = await baseWorker.fetch(request, env, ctx);
    if (url.pathname === '/api/health') return augmentHealth(response, env);
    if (url.pathname === '/' || url.pathname === '/index.html') return injectAccountUi(response);
    return response;
  }
};
