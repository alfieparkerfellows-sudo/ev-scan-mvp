import baseWorker from './worker-admin.js';
import { accountsConfigured, handleAccountRequest } from './account-api.js';

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
    const data = await response.json();
    data.version = '0.7.0';
    data.accountsConfigured = accountsConfigured(env);
    data.capabilities = {
      ...(data.capabilities || {}),
      optionalAccounts: true,
      savedScans: accountsConfigured(env),
      shortlistAndCompare: accountsConfigured(env),
      drivingProfile: accountsConfigured(env),
      myGarage: accountsConfigured(env),
      inAppOwnershipReminders: accountsConfigured(env),
      accountThemes: accountsConfigured(env)
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
      return handleAccountRequest(request, env, url);
    }

    const response = await baseWorker.fetch(request, env, ctx);
    if (url.pathname === '/api/health') return augmentHealth(response, env);
    if (url.pathname === '/' || url.pathname === '/index.html') return injectAccountUi(response);
    return response;
  }
};
