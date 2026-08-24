const SESSION_COOKIE = 'evscan_session';
const SESSION_DAYS = 30;
const MAX_SCANS = 250;
const MAX_GARAGE = 20;

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'no-referrer',
  'x-robots-tag': 'noindex, nofollow'
};

function response(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: { ...JSON_HEADERS, ...extraHeaders } });
}

export function accountsConfigured(env = {}) {
  return Boolean(env.ACCOUNTS_DB && typeof env.ACCOUNTS_DB.prepare === 'function');
}

function nowIso() { return new Date().toISOString(); }
function futureIso(days) { return new Date(Date.now() + days * 86400000).toISOString(); }
function cleanEmail(value = '') { return String(value).trim().toLowerCase().slice(0, 254); }
function cleanText(value = '', max = 180) { return String(value ?? '').trim().slice(0, max); }
function cleanRegistration(value = '') { return String(value ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || null; }
function bool(value) { return value === true || value === 1 || value === '1'; }
function safeParse(value, fallback = {}) { try { return JSON.parse(value || ''); } catch { return fallback; } }
function safeStringify(value, fallback = '{}') { try { return JSON.stringify(value ?? {}); } catch { return fallback; } }

function base64url(bytes) {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
}

function randomToken(bytes = 32) {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  return base64url(data);
}

async function sha256(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(value)));
  return base64url(new Uint8Array(digest));
}

async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 210000, hash: 'SHA-256' }, key, 256);
  return base64url(new Uint8Array(bits));
}

function constantTimeEqual(a = '', b = '') {
  const x = String(a), y = String(b);
  const len = Math.max(x.length, y.length);
  let diff = x.length ^ y.length;
  for (let i = 0; i < len; i += 1) diff |= (x.charCodeAt(i % Math.max(1, x.length)) || 0) ^ (y.charCodeAt(i % Math.max(1, y.length)) || 0);
  return diff === 0;
}

async function readJson(request) {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > 100000) throw new Error('TOO_LARGE');
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) return {};
    return body;
  } catch { throw new Error('INVALID_JSON'); }
}

function cookieValue(request, name) {
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

function sessionCookie(token, maxAge = SESSION_DAYS * 86400) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function clearCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

async function rateLimitKey(request, email, action) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  return sha256(`${action}|${ip}|${email}`);
}

async function isRateLimited(env, request, email, action, maxAttempts) {
  const key = await rateLimitKey(request, email, action);
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  await env.ACCOUNTS_DB.prepare('DELETE FROM auth_attempts WHERE attempted_at < ?').bind(new Date(Date.now() - 86400000).toISOString()).run().catch(() => {});
  const row = await env.ACCOUNTS_DB.prepare('SELECT COUNT(*) AS count FROM auth_attempts WHERE attempt_key = ? AND attempted_at >= ?').bind(key, since).first();
  return { limited: Number(row?.count || 0) >= maxAttempts, key };
}

async function recordAttempt(env, key) {
  await env.ACCOUNTS_DB.prepare('INSERT INTO auth_attempts (attempt_key, attempted_at) VALUES (?, ?)').bind(key, nowIso()).run();
}

async function createSession(env, userId) {
  const token = randomToken(32);
  const tokenHash = await sha256(token);
  const createdAt = nowIso();
  const expiresAt = futureIso(SESSION_DAYS);
  await env.ACCOUNTS_DB.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').bind(tokenHash, userId, createdAt, expiresAt).run();
  return { token, expiresAt };
}

async function getSessionUser(env, request) {
  const token = cookieValue(request, SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await sha256(token);
  const row = await env.ACCOUNTS_DB.prepare(`
    SELECT u.id, u.email, u.created_at,
           p.display_name, p.theme, p.density, p.accent, p.reduce_motion, p.advanced_data,
           p.driving_profile_json, p.notification_preferences_json
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    LEFT JOIN profiles p ON p.user_id = u.id
    WHERE s.token_hash = ? AND s.expires_at > ?
  `).bind(tokenHash, nowIso()).first();
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    createdAt: row.created_at,
    profile: {
      displayName: row.display_name || '',
      theme: row.theme || 'system',
      density: row.density || 'comfortable',
      accent: row.accent || 'pink',
      reduceMotion: bool(row.reduce_motion),
      advancedData: bool(row.advanced_data),
      drivingProfile: safeParse(row.driving_profile_json, {}),
      notifications: safeParse(row.notification_preferences_json, { mot: true, service: true, warranty: true, leadDays: [30,14,7] })
    }
  };
}

async function requireUser(env, request) {
  const user = await getSessionUser(env, request);
  if (!user) return { error: response({ ok: false, code: 'AUTH_REQUIRED', message: 'Please sign in to use this feature.' }, 401) };
  return { user };
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function publicScan(row) {
  return {
    id: row.id,
    title: row.title,
    registration: row.registration || null,
    listingUrl: row.listing_url || null,
    vehicle: safeParse(row.vehicle_json, {}),
    score: safeParse(row.score_json, {}),
    motExpiry: row.mot_expiry || null,
    shortlist: bool(row.shortlist),
    purchased: bool(row.purchased),
    savedAt: row.saved_at,
    updatedAt: row.updated_at
  };
}

function publicGarage(row) {
  return {
    id: row.id,
    nickname: row.nickname || '',
    registration: row.registration || null,
    make: row.make || '',
    model: row.model || '',
    motExpiry: row.mot_expiry || null,
    taxDue: row.tax_due || null,
    serviceDue: row.service_due || null,
    batteryWarrantyEnd: row.battery_warranty_end || null,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function handleRegister(request, env) {
  const body = await readJson(request);
  const email = cleanEmail(body.email);
  const password = String(body.password || '');
  if (!validateEmail(email)) return response({ ok: false, code: 'INVALID_EMAIL', message: 'Enter a valid email address.' }, 400);
  if (password.length < 10 || password.length > 128) return response({ ok: false, code: 'WEAK_PASSWORD', message: 'Use at least 10 characters for your password.' }, 400);

  const limit = await isRateLimited(env, request, email, 'register', 5);
  if (limit.limited) return response({ ok: false, code: 'RATE_LIMITED', message: 'Too many account attempts. Try again in a little while.' }, 429);
  await recordAttempt(env, limit.key);

  const existing = await env.ACCOUNTS_DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) return response({ ok: false, code: 'ACCOUNT_EXISTS', message: 'An account already exists for this email. Try signing in.' }, 409);

  const id = crypto.randomUUID();
  const salt = randomToken(18);
  const passwordHash = await hashPassword(password, salt);
  const timestamp = nowIso();
  await env.ACCOUNTS_DB.batch([
    env.ACCOUNTS_DB.prepare('INSERT INTO users (id, email, password_hash, password_salt, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id, email, passwordHash, salt, timestamp, timestamp),
    env.ACCOUNTS_DB.prepare('INSERT INTO profiles (user_id, updated_at) VALUES (?, ?)').bind(id, timestamp)
  ]);
  const session = await createSession(env, id);
  const user = await getSessionUser(env, new Request(request.url, { headers: { cookie: `${SESSION_COOKIE}=${session.token}` } }));
  return response({ ok: true, user }, 201, { 'set-cookie': sessionCookie(session.token) });
}

async function handleLogin(request, env) {
  const body = await readJson(request);
  const email = cleanEmail(body.email);
  const password = String(body.password || '');
  if (!validateEmail(email) || !password) return response({ ok: false, code: 'INVALID_LOGIN', message: 'Check your email and password and try again.' }, 400);

  const limit = await isRateLimited(env, request, email, 'login', 12);
  if (limit.limited) return response({ ok: false, code: 'RATE_LIMITED', message: 'Too many sign-in attempts. Try again in a little while.' }, 429);
  await recordAttempt(env, limit.key);

  const userRow = await env.ACCOUNTS_DB.prepare('SELECT id, password_hash, password_salt FROM users WHERE email = ?').bind(email).first();
  const salt = userRow?.password_salt || 'evscan-dummy-auth-salt';
  const candidate = await hashPassword(password, salt);
  if (!userRow || !constantTimeEqual(candidate, userRow.password_hash)) return response({ ok: false, code: 'INVALID_LOGIN', message: 'Check your email and password and try again.' }, 401);

  const session = await createSession(env, userRow.id);
  const user = await getSessionUser(env, new Request(request.url, { headers: { cookie: `${SESSION_COOKIE}=${session.token}` } }));
  return response({ ok: true, user }, 200, { 'set-cookie': sessionCookie(session.token) });
}

async function handleLogout(request, env) {
  const token = cookieValue(request, SESSION_COOKIE);
  if (token) {
    const tokenHash = await sha256(token);
    await env.ACCOUNTS_DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run().catch(() => {});
  }
  return response({ ok: true }, 200, { 'set-cookie': clearCookie() });
}

async function handleProfile(request, env) {
  const auth = await requireUser(env, request);
  if (auth.error) return auth.error;
  if (request.method === 'GET') return response({ ok: true, user: auth.user });
  if (request.method !== 'PUT') return response({ ok: false, code: 'METHOD_NOT_ALLOWED' }, 405);

  const body = await readJson(request);
  const current = auth.user.profile;
  const theme = ['system','dark','light'].includes(body.theme) ? body.theme : current.theme;
  const density = ['comfortable','compact'].includes(body.density) ? body.density : current.density;
  const accent = ['pink','cyan','violet'].includes(body.accent) ? body.accent : current.accent;
  const displayName = body.displayName == null ? current.displayName : cleanText(body.displayName, 50);
  const reduceMotion = body.reduceMotion == null ? current.reduceMotion : bool(body.reduceMotion);
  const advancedData = body.advancedData == null ? current.advancedData : bool(body.advancedData);
  const drivingProfile = body.drivingProfile && typeof body.drivingProfile === 'object' && !Array.isArray(body.drivingProfile) ? body.drivingProfile : current.drivingProfile;
  const notifications = body.notifications && typeof body.notifications === 'object' && !Array.isArray(body.notifications) ? body.notifications : current.notifications;
  const timestamp = nowIso();

  await env.ACCOUNTS_DB.prepare(`UPDATE profiles SET display_name=?, theme=?, density=?, accent=?, reduce_motion=?, advanced_data=?, driving_profile_json=?, notification_preferences_json=?, updated_at=? WHERE user_id=?`)
    .bind(displayName, theme, density, accent, reduceMotion ? 1 : 0, advancedData ? 1 : 0, safeStringify(drivingProfile), safeStringify(notifications), timestamp, auth.user.id).run();
  const updated = await getSessionUser(env, request);
  return response({ ok: true, user: updated });
}

async function handleScans(request, env, url) {
  const auth = await requireUser(env, request);
  if (auth.error) return auth.error;
  const id = url.pathname.startsWith('/api/account/scans/') ? cleanText(decodeURIComponent(url.pathname.slice('/api/account/scans/'.length)), 80) : '';

  if (!id && request.method === 'GET') {
    const result = await env.ACCOUNTS_DB.prepare('SELECT * FROM saved_scans WHERE user_id = ? ORDER BY saved_at DESC LIMIT ?').bind(auth.user.id, MAX_SCANS).all();
    return response({ ok: true, scans: (result.results || []).map(publicScan) });
  }

  if (!id && request.method === 'POST') {
    const count = await env.ACCOUNTS_DB.prepare('SELECT COUNT(*) AS count FROM saved_scans WHERE user_id = ?').bind(auth.user.id).first();
    if (Number(count?.count || 0) >= MAX_SCANS) return response({ ok: false, code: 'SCAN_LIMIT', message: `You can save up to ${MAX_SCANS} scans. Remove an old one first.` }, 409);
    const body = await readJson(request);
    const timestamp = nowIso();
    const scanId = crypto.randomUUID();
    const title = cleanText(body.title || 'Saved EV', 120) || 'Saved EV';
    const registration = cleanRegistration(body.registration);
    const listingUrl = cleanText(body.listingUrl, 1500) || null;
    const motExpiry = cleanText(body.motExpiry, 30) || null;
    const vehicle = body.vehicle && typeof body.vehicle === 'object' ? body.vehicle : {};
    const score = body.score && typeof body.score === 'object' ? body.score : {};
    await env.ACCOUNTS_DB.prepare(`INSERT INTO saved_scans (id,user_id,title,registration,listing_url,vehicle_json,score_json,mot_expiry,shortlist,purchased,saved_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(scanId, auth.user.id, title, registration, listingUrl, safeStringify(vehicle), safeStringify(score), motExpiry, bool(body.shortlist) ? 1 : 0, bool(body.purchased) ? 1 : 0, timestamp, timestamp).run();
    const row = await env.ACCOUNTS_DB.prepare('SELECT * FROM saved_scans WHERE id=? AND user_id=?').bind(scanId, auth.user.id).first();
    return response({ ok: true, scan: publicScan(row) }, 201);
  }

  if (id && request.method === 'PATCH') {
    const body = await readJson(request);
    const existing = await env.ACCOUNTS_DB.prepare('SELECT * FROM saved_scans WHERE id=? AND user_id=?').bind(id, auth.user.id).first();
    if (!existing) return response({ ok: false, code: 'NOT_FOUND' }, 404);
    const title = body.title == null ? existing.title : cleanText(body.title, 120) || existing.title;
    const shortlist = body.shortlist == null ? existing.shortlist : (bool(body.shortlist) ? 1 : 0);
    const purchased = body.purchased == null ? existing.purchased : (bool(body.purchased) ? 1 : 0);
    const motExpiry = body.motExpiry == null ? existing.mot_expiry : (cleanText(body.motExpiry, 30) || null);
    await env.ACCOUNTS_DB.prepare('UPDATE saved_scans SET title=?, shortlist=?, purchased=?, mot_expiry=?, updated_at=? WHERE id=? AND user_id=?')
      .bind(title, shortlist, purchased, motExpiry, nowIso(), id, auth.user.id).run();
    const row = await env.ACCOUNTS_DB.prepare('SELECT * FROM saved_scans WHERE id=? AND user_id=?').bind(id, auth.user.id).first();
    return response({ ok: true, scan: publicScan(row) });
  }

  if (id && request.method === 'DELETE') {
    await env.ACCOUNTS_DB.prepare('DELETE FROM saved_scans WHERE id=? AND user_id=?').bind(id, auth.user.id).run();
    return response({ ok: true });
  }
  return response({ ok: false, code: 'METHOD_NOT_ALLOWED' }, 405);
}

async function handleGarage(request, env, url) {
  const auth = await requireUser(env, request);
  if (auth.error) return auth.error;
  const id = url.pathname.startsWith('/api/account/garage/') ? cleanText(decodeURIComponent(url.pathname.slice('/api/account/garage/'.length)), 80) : '';

  if (!id && request.method === 'GET') {
    const result = await env.ACCOUNTS_DB.prepare('SELECT * FROM garage_vehicles WHERE user_id=? ORDER BY created_at DESC LIMIT ?').bind(auth.user.id, MAX_GARAGE).all();
    return response({ ok: true, vehicles: (result.results || []).map(publicGarage) });
  }

  if (!id && request.method === 'POST') {
    const count = await env.ACCOUNTS_DB.prepare('SELECT COUNT(*) AS count FROM garage_vehicles WHERE user_id=?').bind(auth.user.id).first();
    if (Number(count?.count || 0) >= MAX_GARAGE) return response({ ok: false, code: 'GARAGE_LIMIT', message: `You can keep up to ${MAX_GARAGE} vehicles in My Garage.` }, 409);
    const body = await readJson(request);
    const idNew = crypto.randomUUID();
    const timestamp = nowIso();
    const make = cleanText(body.make, 70);
    const model = cleanText(body.model, 90);
    const nickname = cleanText(body.nickname || `${make} ${model}`.trim() || 'My EV', 90);
    await env.ACCOUNTS_DB.prepare(`INSERT INTO garage_vehicles (id,user_id,nickname,registration,make,model,mot_expiry,tax_due,service_due,battery_warranty_end,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(idNew, auth.user.id, nickname, cleanRegistration(body.registration), make, model, cleanText(body.motExpiry,30)||null, cleanText(body.taxDue,30)||null, cleanText(body.serviceDue,30)||null, cleanText(body.batteryWarrantyEnd,30)||null, cleanText(body.notes,1000), timestamp, timestamp).run();
    const row = await env.ACCOUNTS_DB.prepare('SELECT * FROM garage_vehicles WHERE id=? AND user_id=?').bind(idNew, auth.user.id).first();
    return response({ ok: true, vehicle: publicGarage(row) }, 201);
  }

  if (id && request.method === 'PATCH') {
    const existing = await env.ACCOUNTS_DB.prepare('SELECT * FROM garage_vehicles WHERE id=? AND user_id=?').bind(id, auth.user.id).first();
    if (!existing) return response({ ok: false, code: 'NOT_FOUND' }, 404);
    const body = await readJson(request);
    const values = {
      nickname: body.nickname == null ? existing.nickname : cleanText(body.nickname,90),
      registration: body.registration == null ? existing.registration : cleanRegistration(body.registration),
      make: body.make == null ? existing.make : cleanText(body.make,70),
      model: body.model == null ? existing.model : cleanText(body.model,90),
      motExpiry: body.motExpiry == null ? existing.mot_expiry : (cleanText(body.motExpiry,30)||null),
      taxDue: body.taxDue == null ? existing.tax_due : (cleanText(body.taxDue,30)||null),
      serviceDue: body.serviceDue == null ? existing.service_due : (cleanText(body.serviceDue,30)||null),
      batteryWarrantyEnd: body.batteryWarrantyEnd == null ? existing.battery_warranty_end : (cleanText(body.batteryWarrantyEnd,30)||null),
      notes: body.notes == null ? existing.notes : cleanText(body.notes,1000)
    };
    await env.ACCOUNTS_DB.prepare(`UPDATE garage_vehicles SET nickname=?,registration=?,make=?,model=?,mot_expiry=?,tax_due=?,service_due=?,battery_warranty_end=?,notes=?,updated_at=? WHERE id=? AND user_id=?`)
      .bind(values.nickname,values.registration,values.make,values.model,values.motExpiry,values.taxDue,values.serviceDue,values.batteryWarrantyEnd,values.notes,nowIso(),id,auth.user.id).run();
    const row = await env.ACCOUNTS_DB.prepare('SELECT * FROM garage_vehicles WHERE id=? AND user_id=?').bind(id, auth.user.id).first();
    return response({ ok: true, vehicle: publicGarage(row) });
  }

  if (id && request.method === 'DELETE') {
    await env.ACCOUNTS_DB.prepare('DELETE FROM garage_vehicles WHERE id=? AND user_id=?').bind(id, auth.user.id).run();
    return response({ ok: true });
  }
  return response({ ok: false, code: 'METHOD_NOT_ALLOWED' }, 405);
}

async function handleExport(request, env) {
  const auth = await requireUser(env, request);
  if (auth.error) return auth.error;
  const scans = await env.ACCOUNTS_DB.prepare('SELECT * FROM saved_scans WHERE user_id=? ORDER BY saved_at DESC').bind(auth.user.id).all();
  const garage = await env.ACCOUNTS_DB.prepare('SELECT * FROM garage_vehicles WHERE user_id=? ORDER BY created_at DESC').bind(auth.user.id).all();
  return response({ ok: true, exportedAt: nowIso(), account: auth.user, savedScans: (scans.results||[]).map(publicScan), garage: (garage.results||[]).map(publicGarage) });
}

async function handleDeleteAccount(request, env) {
  const auth = await requireUser(env, request);
  if (auth.error) return auth.error;
  if (request.method !== 'DELETE') return response({ ok: false, code: 'METHOD_NOT_ALLOWED' }, 405);
  await env.ACCOUNTS_DB.batch([
    env.ACCOUNTS_DB.prepare('DELETE FROM sessions WHERE user_id=?').bind(auth.user.id),
    env.ACCOUNTS_DB.prepare('DELETE FROM saved_scans WHERE user_id=?').bind(auth.user.id),
    env.ACCOUNTS_DB.prepare('DELETE FROM garage_vehicles WHERE user_id=?').bind(auth.user.id),
    env.ACCOUNTS_DB.prepare('DELETE FROM profiles WHERE user_id=?').bind(auth.user.id),
    env.ACCOUNTS_DB.prepare('DELETE FROM users WHERE id=?').bind(auth.user.id)
  ]);
  return response({ ok: true, message: 'Your EV Scan account has been deleted.' }, 200, { 'set-cookie': clearCookie() });
}

export async function handleAccountRequest(request, env, url = new URL(request.url)) {
  if (url.pathname === '/api/account/status') return response({ ok: true, configured: accountsConfigured(env), features: { savedScans: true, shortlist: true, compare: true, drivingProfile: true, garage: true, inAppReminders: true, themes: true } });
  if (!accountsConfigured(env)) return response({ ok: false, code: 'ACCOUNTS_NOT_CONFIGURED', message: 'EV Scan accounts are being connected. You can still use every core scan feature without an account.' }, 503);

  try {
    if (url.pathname === '/api/auth/register' && request.method === 'POST') return await handleRegister(request, env);
    if (url.pathname === '/api/auth/login' && request.method === 'POST') return await handleLogin(request, env);
    if (url.pathname === '/api/auth/logout' && request.method === 'POST') return await handleLogout(request, env);
    if (url.pathname === '/api/auth/me' && request.method === 'GET') {
      const user = await getSessionUser(env, request);
      return user ? response({ ok: true, user }) : response({ ok: false, code: 'AUTH_REQUIRED' }, 401);
    }
    if (url.pathname === '/api/account/profile') return await handleProfile(request, env);
    if (url.pathname === '/api/account/scans' || url.pathname.startsWith('/api/account/scans/')) return await handleScans(request, env, url);
    if (url.pathname === '/api/account/garage' || url.pathname.startsWith('/api/account/garage/')) return await handleGarage(request, env, url);
    if (url.pathname === '/api/account/export' && request.method === 'GET') return await handleExport(request, env);
    if (url.pathname === '/api/account' && request.method === 'DELETE') return await handleDeleteAccount(request, env);
    return response({ ok: false, code: 'NOT_FOUND' }, 404);
  } catch (error) {
    const code = String(error?.message || 'ACCOUNT_ERROR');
    if (code === 'INVALID_JSON') return response({ ok: false, code, message: 'Send a valid request.' }, 400);
    if (code === 'TOO_LARGE') return response({ ok: false, code, message: 'That request is too large.' }, 413);
    console.error('EV Scan account error', error);
    return response({ ok: false, code: 'ACCOUNT_ERROR', message: 'That account action did not complete. Please try again.' }, 500);
  }
}
