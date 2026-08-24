import app from './worker.js';
import { handleDataApi } from './admin-api.js';

function noIndexHeaders(headers = {}) {
  const next = new Headers(headers);
  next.set('x-robots-tag', 'noindex, nofollow, noarchive');
  next.set('cache-control', 'no-store');
  next.set('x-content-type-options', 'nosniff');
  next.delete('content-length');
  return next;
}

async function serveAdmin(request, env) {
  try {
    const target = new URL('/admin.html', request.url);
    const assetRequest = new Request(target.toString(), {
      method: 'GET',
      headers: request.headers
    });
    const asset = await env.ASSETS.fetch(assetRequest);
    if (!asset.ok) return asset;
    return new Response(asset.body, { status: asset.status, headers: noIndexHeaders(asset.headers) });
  } catch {
    return new Response('EV Scan Admin is temporarily unavailable.', {
      status: 503,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'x-robots-tag': 'noindex, nofollow', 'cache-control': 'no-store' }
    });
  }
}

async function injectTelemetry(response, url) {
  if (!response || !response.ok || url.pathname.startsWith('/admin')) return response;
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;
  try {
    const html = await response.text();
    if (html.includes('/telemetry.js')) return new Response(html, { status: response.status, headers: response.headers });
    const enhanced = html.replace('</body>', '  <script src="/telemetry.js"></script>\n</body>');
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    return new Response(enhanced, { status: response.status, headers });
  } catch {
    return response;
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/admin' || url.pathname === '/admin/') {
      return serveAdmin(request, env);
    }

    if (
      url.pathname === '/api/events' ||
      url.pathname === '/api/reviews' ||
      url.pathname === '/api/public-stats' ||
      url.pathname === '/api/admin/dashboard' ||
      url.pathname.startsWith('/api/admin/reviews/')
    ) {
      const handled = await handleDataApi(request, env, url);
      if (handled) return handled;
    }

    const response = await app.fetch(request, env, ctx);
    return injectTelemetry(response, url);
  }
};
