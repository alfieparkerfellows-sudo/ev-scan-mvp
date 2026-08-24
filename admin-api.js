const ADMIN_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
  'x-robots-tag': 'noindex, nofollow'
};

function response(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: ADMIN_HEADERS });
}

function clampText(value, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

function cleanInteger(value, min, max, fallback = null) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
}

function databaseReady(env = {}) {
  return Boolean(env.EVSCAN_DB && typeof env.EVSCAN_DB.prepare === 'function');
}

function collectionEnabled(env = {}) {
  return databaseReady(env) && String(env.DATA_COLLECTION_ENABLED || '').toLowerCase() === 'true';
}

function constantTimeEqual(a = '', b = '') {
  const left = String(a);
  const right = String(b);
  const length = Math.max(left.length, right.length);
  let mismatch = left.length ^ right.length;
  for (let index = 0; index < length; index += 1) {
    mismatch |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return mismatch === 0;
}

function adminAuthorised(request, env = {}) {
  const configured = String(env.ADMIN_TOKEN || '').trim();
  if (!configured) return false;
  const direct = request.headers.get('x-admin-token') || '';
  const auth = request.headers.get('authorization') || '';
  const bearer = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : '';
  return constantTimeEqual(direct || bearer, configured);
}

function safeMetadata(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '{}';
  const clean = {};
  for (const [key, item] of Object.entries(value).slice(0, 20)) {
    if (['registration', 'email', 'name', 'phone', 'address', 'ip'].includes(String(key).toLowerCase())) continue;
    if (typeof item === 'string') clean[key] = item.slice(0, 240);
    else if (typeof item === 'number' || typeof item === 'boolean' || item === null) clean[key] = item;
  }
  return JSON.stringify(clean).slice(0, 3000);
}

function sanitiseEvent(input = {}) {
  const eventType = clampText(input.eventType || input.event_type, 64).toLowerCase().replace(/[^a-z0-9_:-]/g, '_');
  if (!eventType) return null;
  return {
    eventType,
    sessionId: clampText(input.sessionId || input.session_id, 80),
    path: clampText(input.path, 240),
    referrerHost: clampText(input.referrerHost || input.referrer_host, 160),
    deviceType: clampText(input.deviceType || input.device_type, 30),
    source: clampText(input.source, 80),
    scanMode: clampText(input.scanMode || input.scan_mode, 40),
    vehicleMake: clampText(input.vehicleMake || input.vehicle_make, 80),
    vehicleModel: clampText(input.vehicleModel || input.vehicle_model, 100),
    vehicleYear: cleanInteger(input.vehicleYear || input.vehicle_year, 1900, 2200, null),
    success: input.success === true ? 1 : input.success === false ? 0 : null,
    durationMs: cleanInteger(input.durationMs || input.duration_ms, 0, 600000, null),
    errorCode: clampText(input.errorCode || input.error_code, 120),
    metadata: safeMetadata(input.metadata)
  };
}

async function recordEvent(env, input = {}) {
  if (!collectionEnabled(env)) return { stored: false, reason: databaseReady(env) ? 'collection_paused' : 'database_not_connected' };
  const item = sanitiseEvent(input);
  if (!item) return { stored: false, reason: 'invalid_event' };
  await env.EVSCAN_DB.prepare(`
    INSERT INTO events (
      event_type, session_id, path, referrer_host, device_type, source, scan_mode,
      vehicle_make, vehicle_model, vehicle_year, success, duration_ms, error_code, metadata
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    item.eventType, item.sessionId, item.path, item.referrerHost, item.deviceType, item.source,
    item.scanMode, item.vehicleMake, item.vehicleModel, item.vehicleYear, item.success,
    item.durationMs, item.errorCode, item.metadata
  ).run();
  return { stored: true };
}

async function recordReview(env, input = {}) {
  const rating = cleanInteger(input.rating, 1, 5, null);
  if (!rating) return { ok: false, status: 400, message: 'Choose a rating from 1 to 5.' };
  const comment = clampText(input.comment, 700);
  const vehicle = clampText(input.vehicle, 160);
  const sessionId = clampText(input.sessionId || input.session_id, 80);

  if (!collectionEnabled(env)) {
    return {
      ok: true,
      stored: false,
      reason: databaseReady(env) ? 'collection_paused' : 'database_not_connected',
      message: 'Review storage is prepared but not activated yet.'
    };
  }

  const result = await env.EVSCAN_DB.prepare(`
    INSERT INTO reviews (rating, comment, vehicle, session_id)
    VALUES (?, ?, ?, ?)
  `).bind(rating, comment, vehicle, sessionId).run();

  await recordEvent(env, {
    eventType: 'review_submitted',
    sessionId,
    path: '/report',
    success: true,
    metadata: { rating, reviewId: result?.meta?.last_row_id || null }
  });

  return { ok: true, stored: true, reviewId: result?.meta?.last_row_id || null };
}

async function tableExists(env, name) {
  if (!databaseReady(env)) return false;
  try {
    const row = await env.EVSCAN_DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").bind(name).first();
    return Boolean(row?.name);
  } catch {
    return false;
  }
}

async function publicStats(env) {
  const ready = databaseReady(env) && await tableExists(env, 'events') && await tableExists(env, 'reviews');
  if (!ready) {
    return response({
      ok: true,
      connected: false,
      collectionEnabled: false,
      stats: { scans: 0, uniqueVehicles: 0, reviews: 0, averageRating: null }
    });
  }

  const enabled = collectionEnabled(env);
  const scanRow = await env.EVSCAN_DB.prepare(`
    SELECT
      SUM(CASE WHEN event_type = 'scan_completed' AND success = 1 THEN 1 ELSE 0 END) AS scans,
      COUNT(DISTINCT CASE WHEN event_type = 'scan_completed' AND success = 1 AND vehicle_make <> '' AND vehicle_model <> '' THEN vehicle_make || '|' || vehicle_model END) AS unique_vehicles
    FROM events
  `).first();
  const reviewRow = await env.EVSCAN_DB.prepare(`
    SELECT COUNT(*) AS reviews, ROUND(AVG(rating), 2) AS average_rating
    FROM reviews WHERE approved = 1 AND hidden = 0
  `).first();

  return response({
    ok: true,
    connected: true,
    collectionEnabled: enabled,
    stats: {
      scans: Number(scanRow?.scans || 0),
      uniqueVehicles: Number(scanRow?.unique_vehicles || 0),
      reviews: Number(reviewRow?.reviews || 0),
      averageRating: reviewRow?.average_rating == null ? null : Number(reviewRow.average_rating)
    }
  });
}

async function overviewData(env, days) {
  const modifier = `-${days} days`;
  const overview = await env.EVSCAN_DB.prepare(`
    SELECT
      SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS pageviews,
      COUNT(DISTINCT CASE WHEN event_type = 'page_view' AND session_id <> '' THEN session_id END) AS sessions,
      SUM(CASE WHEN event_type = 'scan_completed' THEN 1 ELSE 0 END) AS scans,
      SUM(CASE WHEN event_type = 'scan_completed' AND success = 1 THEN 1 ELSE 0 END) AS successful_scans,
      SUM(CASE WHEN event_type = 'app_error' THEN 1 ELSE 0 END) AS errors,
      SUM(CASE WHEN event_type = 'partner_click' THEN 1 ELSE 0 END) AS partner_clicks
    FROM events WHERE created_at >= datetime('now', ?)
  `).bind(modifier).first();

  const reviews = await env.EVSCAN_DB.prepare(`
    SELECT COUNT(*) AS reviews, ROUND(AVG(rating), 2) AS average_rating,
      SUM(CASE WHEN approved = 0 AND hidden = 0 THEN 1 ELSE 0 END) AS awaiting_approval
    FROM reviews WHERE created_at >= datetime('now', ?)
  `).bind(modifier).first();

  const trend = await env.EVSCAN_DB.prepare(`
    SELECT substr(created_at, 1, 10) AS day,
      SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS pageviews,
      SUM(CASE WHEN event_type = 'scan_completed' THEN 1 ELSE 0 END) AS scans,
      SUM(CASE WHEN event_type = 'app_error' THEN 1 ELSE 0 END) AS errors
    FROM events WHERE created_at >= datetime('now', ?)
    GROUP BY substr(created_at, 1, 10) ORDER BY day ASC
  `).bind(modifier).all();

  const reviewTrend = await env.EVSCAN_DB.prepare(`
    SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS reviews
    FROM reviews WHERE created_at >= datetime('now', ?)
    GROUP BY substr(created_at, 1, 10) ORDER BY day ASC
  `).bind(modifier).all();

  const funnel = await env.EVSCAN_DB.prepare(`
    SELECT
      COUNT(DISTINCT CASE WHEN event_type = 'page_view' THEN session_id END) AS visitors,
      COUNT(DISTINCT CASE WHEN event_type = 'scan_started' THEN session_id END) AS scan_started,
      COUNT(DISTINCT CASE WHEN event_type = 'scan_completed' AND success = 1 THEN session_id END) AS scan_success,
      COUNT(DISTINCT CASE WHEN event_type = 'report_viewed' THEN session_id END) AS report_viewed,
      COUNT(DISTINCT CASE WHEN event_type = 'partner_click' THEN session_id END) AS partner_click,
      COUNT(DISTINCT CASE WHEN event_type = 'review_submitted' THEN session_id END) AS review_submitted
    FROM events WHERE created_at >= datetime('now', ?)
  `).bind(modifier).first();

  const vehicles = await env.EVSCAN_DB.prepare(`
    SELECT vehicle_make AS make, vehicle_model AS model, COUNT(*) AS scans,
      ROUND(AVG(CASE WHEN success IS NOT NULL THEN success * 100.0 END), 1) AS success_rate
    FROM events
    WHERE created_at >= datetime('now', ?) AND event_type = 'scan_completed'
      AND vehicle_make <> '' AND vehicle_model <> ''
    GROUP BY vehicle_make, vehicle_model ORDER BY scans DESC LIMIT 10
  `).bind(modifier).all();

  const pages = await env.EVSCAN_DB.prepare(`
    SELECT path, COUNT(*) AS views, COUNT(DISTINCT session_id) AS visitors
    FROM events WHERE created_at >= datetime('now', ?) AND event_type = 'page_view' AND path <> ''
    GROUP BY path ORDER BY views DESC LIMIT 10
  `).bind(modifier).all();

  const sources = await env.EVSCAN_DB.prepare(`
    SELECT CASE WHEN source = '' THEN 'Direct / unknown' ELSE source END AS source, COUNT(*) AS sessions
    FROM (
      SELECT session_id, MIN(source) AS source
      FROM events WHERE created_at >= datetime('now', ?) AND event_type = 'page_view' AND session_id <> ''
      GROUP BY session_id
    ) GROUP BY source ORDER BY sessions DESC LIMIT 8
  `).bind(modifier).all();

  const devices = await env.EVSCAN_DB.prepare(`
    SELECT CASE WHEN device_type = '' THEN 'Unknown' ELSE device_type END AS device, COUNT(DISTINCT session_id) AS sessions
    FROM events WHERE created_at >= datetime('now', ?) AND event_type = 'page_view'
    GROUP BY device_type ORDER BY sessions DESC
  `).bind(modifier).all();

  const api = await env.EVSCAN_DB.prepare(`
    SELECT source AS provider, COUNT(*) AS calls,
      ROUND(AVG(CASE WHEN success = 1 THEN 100.0 ELSE 0 END), 1) AS success_rate,
      ROUND(AVG(duration_ms), 0) AS avg_ms,
      SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) AS failures
    FROM events WHERE created_at >= datetime('now', ?) AND event_type = 'api_call'
    GROUP BY source ORDER BY calls DESC
  `).bind(modifier).all();

  const errors = await env.EVSCAN_DB.prepare(`
    SELECT created_at, error_code, path, source, COUNT(*) OVER (PARTITION BY error_code) AS occurrences
    FROM events WHERE created_at >= datetime('now', ?) AND event_type = 'app_error'
    ORDER BY created_at DESC LIMIT 20
  `).bind(modifier).all();

  const activity = await env.EVSCAN_DB.prepare(`
    SELECT id, created_at, event_type, path, source, scan_mode, vehicle_make, vehicle_model, vehicle_year, success, error_code
    FROM events ORDER BY id DESC LIMIT 30
  `).all();

  const latestReviews = await env.EVSCAN_DB.prepare(`
    SELECT id, created_at, rating, comment, vehicle, approved, hidden
    FROM reviews ORDER BY id DESC LIMIT 40
  `).all();

  return {
    overview: {
      pageviews: Number(overview?.pageviews || 0),
      sessions: Number(overview?.sessions || 0),
      scans: Number(overview?.scans || 0),
      successfulScans: Number(overview?.successful_scans || 0),
      scanSuccessRate: Number(overview?.scans || 0) ? Math.round(Number(overview.successful_scans || 0) / Number(overview.scans) * 1000) / 10 : null,
      errors: Number(overview?.errors || 0),
      partnerClicks: Number(overview?.partner_clicks || 0),
      reviews: Number(reviews?.reviews || 0),
      averageRating: reviews?.average_rating == null ? null : Number(reviews.average_rating),
      awaitingApproval: Number(reviews?.awaiting_approval || 0)
    },
    trend: trend.results || [],
    reviewTrend: reviewTrend.results || [],
    funnel: funnel || {},
    vehicles: vehicles.results || [],
    pages: pages.results || [],
    sources: sources.results || [],
    devices: devices.results || [],
    api: api.results || [],
    errors: errors.results || [],
    activity: activity.results || [],
    reviews: latestReviews.results || []
  };
}

async function dashboard(request, env, url) {
  if (!String(env.ADMIN_TOKEN || '').trim()) {
    return response({ ok: false, code: 'ADMIN_NOT_CONFIGURED', message: 'Admin authentication has not been activated yet.' }, 503);
  }
  if (!adminAuthorised(request, env)) {
    return response({ ok: false, code: 'UNAUTHORISED', message: 'Enter the EV Scan admin access key.' }, 401);
  }
  const ready = databaseReady(env) && await tableExists(env, 'events') && await tableExists(env, 'reviews');
  if (!ready) {
    return response({
      ok: true,
      connected: false,
      collectionEnabled: false,
      days: cleanInteger(url.searchParams.get('days'), 1, 365, 30),
      message: 'The dashboard is ready, but the EV Scan database has not been connected yet.',
      data: null
    });
  }
  const days = cleanInteger(url.searchParams.get('days'), 1, 365, 30);
  const data = await overviewData(env, days);
  return response({ ok: true, connected: true, collectionEnabled: collectionEnabled(env), days, data });
}

async function moderateReview(request, env, id) {
  if (!adminAuthorised(request, env)) return response({ ok: false, code: 'UNAUTHORISED' }, 401);
  if (!databaseReady(env) || !await tableExists(env, 'reviews')) return response({ ok: false, code: 'DATABASE_NOT_CONNECTED' }, 503);
  const reviewId = cleanInteger(id, 1, 999999999, null);
  if (!reviewId) return response({ ok: false, code: 'INVALID_REVIEW' }, 400);
  let body = {};
  try { body = await request.json(); } catch {}
  const action = clampText(body.action, 20).toLowerCase();
  if (action === 'delete') {
    await env.EVSCAN_DB.prepare('DELETE FROM reviews WHERE id = ?').bind(reviewId).run();
  } else if (action === 'approve') {
    await env.EVSCAN_DB.prepare('UPDATE reviews SET approved = 1, hidden = 0 WHERE id = ?').bind(reviewId).run();
  } else if (action === 'unapprove') {
    await env.EVSCAN_DB.prepare('UPDATE reviews SET approved = 0 WHERE id = ?').bind(reviewId).run();
  } else if (action === 'hide') {
    await env.EVSCAN_DB.prepare('UPDATE reviews SET hidden = 1, approved = 0 WHERE id = ?').bind(reviewId).run();
  } else {
    return response({ ok: false, code: 'INVALID_ACTION' }, 400);
  }
  return response({ ok: true, id: reviewId, action });
}

export async function handleDataApi(request, env, url) {
  if (url.pathname === '/api/events' && request.method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch { return response({ ok: false, code: 'INVALID_JSON' }, 400); }
    try {
      const result = await recordEvent(env, body);
      return response({ ok: true, ...result }, 202);
    } catch {
      return response({ ok: true, stored: false, reason: 'storage_error' }, 202);
    }
  }

  if (url.pathname === '/api/reviews' && request.method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch { return response({ ok: false, code: 'INVALID_JSON' }, 400); }
    try {
      const result = await recordReview(env, body);
      return response(result, result.status || (result.ok ? 200 : 400));
    } catch {
      return response({ ok: false, code: 'REVIEW_STORAGE_ERROR', message: 'Your review could not be saved right now.' }, 503);
    }
  }

  if (url.pathname === '/api/public-stats' && request.method === 'GET') {
    try { return await publicStats(env); }
    catch { return response({ ok: true, connected: false, collectionEnabled: false, stats: { scans: 0, uniqueVehicles: 0, reviews: 0, averageRating: null } }); }
  }

  if (url.pathname === '/api/admin/dashboard' && request.method === 'GET') {
    try { return await dashboard(request, env, url); }
    catch (error) { return response({ ok: false, code: 'ADMIN_QUERY_ERROR', message: 'Dashboard data could not be loaded.', detail: String(error?.message || '').slice(0, 180) }, 500); }
  }

  const reviewMatch = url.pathname.match(/^\/api\/admin\/reviews\/(\d+)$/);
  if (reviewMatch && request.method === 'PATCH') {
    try { return await moderateReview(request, env, reviewMatch[1]); }
    catch { return response({ ok: false, code: 'REVIEW_UPDATE_ERROR' }, 500); }
  }

  return null;
}
