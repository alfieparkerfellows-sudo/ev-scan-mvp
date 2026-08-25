const PROVIDER_COOLDOWNS = new Map();
const MAX_SOURCE_BYTES = 1_200_000;
const MAX_AI_CHARS = 45_000;
const RESTRICTED_AGGREGATORS = new Set([
  'autotrader.co.uk',
  'www.autotrader.co.uk',
  'motors.co.uk',
  'www.motors.co.uk',
  'cargurus.co.uk',
  'www.cargurus.co.uk',
  'facebook.com',
  'www.facebook.com',
  'm.facebook.com'
]);

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function text(value = '') {
  return value == null ? '' : String(value).trim();
}

function cleanRegistration(value = '') {
  const candidate = text(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
  return candidate.length >= 5 && candidate.length <= 8 ? candidate : null;
}

function normaliseWords(value = '') {
  return text(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function safeHttpUrl(value) {
  let url;
  try { url = new URL(text(value)); } catch { return null; }
  if (!['http:', 'https:'].includes(url.protocol)) return null;
  if (url.username || url.password) return null;
  if (url.port && !['80', '443'].includes(url.port)) return null;
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!host || host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) return null;
  if (['0.0.0.0', '127.0.0.1', '::1', '169.254.169.254', '100.100.100.200', 'metadata.google.internal'].includes(host)) return null;
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const parts = ipv4.slice(1).map(Number);
    if (parts.some((part) => part < 0 || part > 255)) return null;
    const [a, b] = parts;
    if (a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) return null;
  }
  if (/^(fc|fd|fe8|fe9|fea|feb)/i.test(host)) return null;
  url.hash = '';
  return url;
}

function providerReady(name) {
  const until = PROVIDER_COOLDOWNS.get(name) || 0;
  return Date.now() >= until;
}

function monthResetSeconds() {
  const now = new Date();
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 1, 0);
  return Math.max(60, Math.ceil((next - Date.now()) / 1000));
}

function coolDown(name, response, fallbackSeconds = 300) {
  const retry = Number(response?.headers?.get?.('retry-after'));
  const seconds = Number.isFinite(retry) && retry > 0 ? retry : fallbackSeconds;
  PROVIDER_COOLDOWNS.set(name, Date.now() + seconds * 1000);
}

async function readBodyLimited(response, maxBytes = MAX_SOURCE_BYTES) {
  const length = Number(response.headers.get('content-length'));
  if (Number.isFinite(length) && length > maxBytes) throw new Error('SOURCE_TOO_LARGE');
  if (!response.body?.getReader) {
    const body = await response.text();
    if (new TextEncoder().encode(body).byteLength > maxBytes) throw new Error('SOURCE_TOO_LARGE');
    return body;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let output = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      try { await reader.cancel(); } catch {}
      throw new Error('SOURCE_TOO_LARGE');
    }
    output += decoder.decode(value, { stream: true });
  }
  output += decoder.decode();
  return output;
}

async function fetchDocument(inputUrl, options = {}, timeoutMs = 10_000) {
  let current = safeHttpUrl(inputUrl);
  if (!current) throw new Error('UNSAFE_URL');
  for (let redirect = 0; redirect <= 3; redirect += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetch(current.toString(), {
        ...options,
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'user-agent': 'EVScan/0.8 (+https://ev-scan-mvp.alfieparkerfellows.workers.dev)',
          accept: 'text/html,application/xhtml+xml,application/json,text/plain;q=0.9,*/*;q=0.5',
          ...(options.headers || {})
        }
      });
    } finally {
      clearTimeout(timer);
    }
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location || redirect === 3) throw new Error('TOO_MANY_REDIRECTS');
      current = safeHttpUrl(new URL(location, current).toString());
      if (!current) throw new Error('UNSAFE_REDIRECT');
      continue;
    }
    return { response, finalUrl: current.toString() };
  }
  throw new Error('FETCH_FAILED');
}

function decodeEntities(value = '') {
  return text(value)
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code) || 32));
}

function stripHtml(html = '') {
  return decodeEntities(String(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' '));
}

function metaContent(html, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, 'i')
  ];
  for (const pattern of patterns) {
    const match = String(html).match(pattern);
    if (match) return decodeEntities(match[1]);
  }
  return '';
}

function titleFromHtml(html = '') {
  return decodeEntities(String(html).match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || metaContent(html, 'og:title'));
}

function basicListingFromSource(source = '', url = '', isHtml = false) {
  const raw = String(source || '');
  const clean = isHtml ? stripHtml(raw) : raw.replace(/\s+/g, ' ');
  const heading = isHtml ? titleFromHtml(raw) : text(raw.split('\n').find((line) => line.trim().length > 8) || '');
  const description = isHtml ? (metaContent(raw, 'og:description') || metaContent(raw, 'description')) : clean.slice(0, 1_500);
  const priceText = clean.match(/£\s?([0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{2})?|[0-9]{4,6})\b/i)?.[1];
  const mileageText = clean.match(/\b([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{4,6})\s*(?:miles|mile|mi)\b/i)?.[1];
  const regMatch = clean.match(/\b([A-Z]{2}\s?\d{2}\s?[A-Z]{3}|[A-Z]\d{1,3}\s?[A-Z]{3}|[A-Z]{3}\s?\d{1,3}[A-Z]|[A-Z]{3}\s?\d{1,3})\b/i)?.[1];
  const yearMatch = `${heading} ${clean.slice(0, 3_000)}`.match(/\b(20(?:0[8-9]|1\d|2[0-6]))\b/);
  const image = isHtml ? (metaContent(raw, 'og:image') || metaContent(raw, 'twitter:image')) : '';
  return {
    sourceUrl: url,
    heading: heading || null,
    description: description || null,
    registration: cleanRegistration(regMatch),
    year: yearMatch ? Number(yearMatch[1]) : null,
    mileage: mileageText ? Number(mileageText.replaceAll(',', '')) : null,
    price: priceText ? Number(priceText.replaceAll(',', '')) : null,
    isElectric: /\b(electric|battery electric|\bBEV\b|\bEV\b)\b/i.test(clean),
    images: image ? [image] : []
  };
}

function parseJsonLoose(value) {
  if (value && typeof value === 'object') return value;
  const raw = text(value).replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  try { return JSON.parse(raw); } catch {}
  const first = raw.indexOf('{');
  const last = raw.lastIndexOf('}');
  if (first >= 0 && last > first) {
    try { return JSON.parse(raw.slice(first, last + 1)); } catch {}
  }
  return null;
}

function normaliseExtracted(raw = {}, seed = {}) {
  const data = raw && typeof raw === 'object' ? raw : {};
  const images = [
    ...(Array.isArray(data.images) ? data.images : []),
    ...(Array.isArray(seed.images) ? seed.images : [])
  ].map(text).filter((item, index, array) => /^https?:\/\//i.test(item) && array.indexOf(item) === index).slice(0, 12);
  const year = finite(data.year ?? seed.year);
  const price = finite(data.price ?? data.askingPrice ?? seed.price);
  const mileage = finite(data.mileage ?? data.miles ?? seed.mileage);
  const battery = finite(data.batteryCapacityKwh ?? data.battery_capacity_kwh ?? data.batteryKwh);
  const range = finite(data.rangeMiles ?? data.evRangeMiles ?? data.range_miles);
  return {
    sourceUrl: text(data.sourceUrl || seed.sourceUrl) || null,
    heading: text(data.heading || data.title || seed.heading) || null,
    make: text(data.make || data.brand) || null,
    model: text(data.model) || null,
    trim: text(data.trim || data.variant || data.derivative) || null,
    derivative: text(data.derivative) || null,
    year: year && year >= 2008 && year <= 2027 ? Math.round(year) : null,
    mileage: mileage && mileage >= 0 && mileage < 1_000_000 ? Math.round(mileage) : null,
    price: price && price >= 500 && price < 500_000 ? Math.round(price) : null,
    registration: cleanRegistration(data.registration || data.vrm || data.vehicleRegistrationMark || seed.registration),
    fuelType: text(data.fuelType || data.fuel || '') || null,
    isElectric: Boolean(data.isElectric ?? seed.isElectric ?? /electric|\bbev\b/i.test(text(data.fuelType || data.fuel))),
    batteryCapacityKwh: battery && battery > 5 && battery < 250 ? battery : null,
    rangeMiles: range && range > 20 && range < 700 ? Math.round(range) : null,
    description: text(data.description || data.sellerDescription || seed.description) || null,
    dealerName: text(data.dealerName || data.sellerName || data.dealer?.name || '') || null,
    dealerPostcode: text(data.dealerPostcode || data.postcode || data.dealer?.postcode || '') || null,
    images
  };
}

async function aiExtract(env, sourceText, seed = {}) {
  if (!env.AI?.run || !sourceText) return normaliseExtracted({}, seed);
  const prompt = `You extract factual fields from a UK used electric-car advert for EV Scan.\nReturn ONLY valid JSON. Never infer a field that is not explicitly supported by the supplied advert/provider content. Use null when unknown. Do not turn model knowledge into listing facts.\n\nRequired JSON keys: make, model, trim, derivative, year, mileage, price, registration, fuelType, isElectric, batteryCapacityKwh, rangeMiles, description, dealerName, dealerPostcode, images.\n- price is GBP integer.\n- mileage is miles integer.\n- registration is a UK VRM if shown.\n- batteryCapacityKwh and rangeMiles must only be populated if stated in the content.\n- images must be http/https image URLs present in the content.\n\nKnown seed from deterministic parsing (may be incomplete): ${JSON.stringify(seed)}\n\nAdvert/provider content:\n${String(sourceText).slice(0, MAX_AI_CHARS)}`;
  try {
    const result = await env.AI.run('@cf/meta/llama-3.2-3b-instruct', {
      prompt,
      max_tokens: 900,
      temperature: 0
    });
    const payload = parseJsonLoose(result?.response ?? result?.result ?? result);
    return normaliseExtracted(payload || {}, seed);
  } catch {
    return normaliseExtracted({}, seed);
  }
}

function coreEnough(candidate = {}) {
  return Boolean(candidate.make && candidate.model && candidate.year && finite(candidate.price) && finite(candidate.mileage));
}

async function directProvider(env, listingUrl) {
  if (!providerReady('direct')) return null;
  const { response, finalUrl } = await fetchDocument(listingUrl, {}, 9_000);
  if (!response.ok) throw Object.assign(new Error(`DIRECT_${response.status}`), { status: response.status });
  const type = response.headers.get('content-type') || '';
  if (!/text|html|json|javascript/i.test(type)) throw new Error('UNSUPPORTED_CONTENT_TYPE');
  const body = await readBodyLimited(response);
  const seed = basicListingFromSource(body, finalUrl, /html/i.test(type) || /<html/i.test(body));
  const extracted = await aiExtract(env, /html/i.test(type) ? stripHtml(body) : body, seed);
  return { provider: 'direct', candidate: extracted, rawChars: body.length };
}

async function jinaProvider(env, listingUrl) {
  if (!providerReady('jina')) return null;
  const target = `https://r.jina.ai/${listingUrl}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 13_000);
  let response;
  try {
    response = await fetch(target, {
      signal: controller.signal,
      headers: {
        accept: 'text/plain',
        ...(env.JINA_API_KEY ? { authorization: `Bearer ${env.JINA_API_KEY}` } : {})
      }
    });
  } finally { clearTimeout(timer); }
  if (response.status === 429) { coolDown('jina', response, 90); return null; }
  if (!response.ok) throw Object.assign(new Error(`JINA_${response.status}`), { status: response.status });
  const body = await readBodyLimited(response);
  const seed = basicListingFromSource(body, listingUrl, false);
  const extracted = await aiExtract(env, body, seed);
  return { provider: 'jina', candidate: extracted, rawChars: body.length };
}

async function firecrawlProvider(env, listingUrl) {
  if (!env.FIRECRAWL_API_KEY || !providerReady('firecrawl')) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 22_000);
  let response;
  try {
    response = await fetch('https://api.firecrawl.dev/v2/scrape', {
      method: 'POST',
      signal: controller.signal,
      headers: { authorization: `Bearer ${env.FIRECRAWL_API_KEY}`, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        url: listingUrl,
        formats: ['markdown', 'images'],
        onlyMainContent: false,
        blockAds: true,
        removeBase64Images: true,
        maxAge: 1_800_000,
        timeout: 18_000,
        location: { country: 'GB', languages: ['en-GB', 'en'] }
      })
    });
  } finally { clearTimeout(timer); }
  if (response.status === 429) { coolDown('firecrawl', response, 900); return null; }
  if (!response.ok) throw Object.assign(new Error(`FIRECRAWL_${response.status}`), { status: response.status });
  const payload = await response.json().catch(() => ({}));
  const data = payload?.data && typeof payload.data === 'object' ? payload.data : payload;
  const markdown = text(data?.markdown || data?.content || '');
  const seed = basicListingFromSource(markdown, listingUrl, false);
  const extraImages = Array.isArray(data?.images) ? data.images : [];
  seed.images = [...(seed.images || []), ...extraImages].slice(0, 12);
  const extracted = await aiExtract(env, `${markdown}\n${JSON.stringify(data?.metadata || {})}`, seed);
  return { provider: 'firecrawl', candidate: extracted, rawChars: markdown.length };
}

function isAutotrader(url) {
  try { return /(^|\.)autotrader\.co\.uk$/i.test(new URL(url).hostname); } catch { return false; }
}

async function reefAutotraderProvider(env, listingUrl) {
  if (!isAutotrader(listingUrl) || !env.REEF_API_KEY || String(env.REEF_AUTOTRADER_ENABLED || '').toLowerCase() !== 'true' || !providerReady('reef')) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 18_000);
  let response;
  try {
    response = await fetch('https://api.reefapi.com/autotrader/v1/listing_detail', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'x-api-key': env.REEF_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ url: listingUrl, market: 'uk' })
    });
  } finally { clearTimeout(timer); }
  if (response.status === 429) { coolDown('reef', response, 600); return null; }
  if (!response.ok) throw Object.assign(new Error(`REEF_${response.status}`), { status: response.status });
  const payload = await response.json().catch(() => ({}));
  if (payload?.ok === false) return null;
  const data = payload?.data ?? payload;
  const source = JSON.stringify(data).slice(0, MAX_AI_CHARS);
  const extracted = await aiExtract(env, source, { sourceUrl: listingUrl });
  return { provider: 'reef-autotrader', candidate: extracted, rawChars: source.length };
}

function firstUseful(...values) {
  return values.find((value) => value !== null && value !== undefined && value !== '') ?? null;
}

function mergeCandidate(base = {}, incoming = {}) {
  const images = [...(base.images || []), ...(incoming.images || [])].filter((item, index, array) => item && array.indexOf(item) === index).slice(0, 12);
  return {
    sourceUrl: firstUseful(base.sourceUrl, incoming.sourceUrl),
    heading: firstUseful(incoming.heading, base.heading),
    make: firstUseful(incoming.make, base.make),
    model: firstUseful(incoming.model, base.model),
    trim: firstUseful(incoming.trim, base.trim),
    derivative: firstUseful(incoming.derivative, base.derivative),
    year: firstUseful(incoming.year, base.year),
    mileage: firstUseful(incoming.mileage, base.mileage),
    price: firstUseful(incoming.price, base.price),
    registration: firstUseful(incoming.registration, base.registration),
    fuelType: firstUseful(incoming.fuelType, base.fuelType),
    isElectric: Boolean(incoming.isElectric || base.isElectric),
    batteryCapacityKwh: firstUseful(incoming.batteryCapacityKwh, base.batteryCapacityKwh),
    rangeMiles: firstUseful(incoming.rangeMiles, base.rangeMiles),
    description: firstUseful(incoming.description, base.description),
    dealerName: firstUseful(incoming.dealerName, base.dealerName),
    dealerPostcode: firstUseful(incoming.dealerPostcode, base.dealerPostcode),
    images
  };
}

function marketBuild(record = {}) {
  return record?.build && typeof record.build === 'object' ? record.build : {};
}

function normaliseMarketListing(record = {}) {
  const build = marketBuild(record);
  const media = record?.media && typeof record.media === 'object' ? record.media : {};
  const dealer = record?.dealer && typeof record.dealer === 'object' ? record.dealer : {};
  const year = finite(build.year ?? record.year ?? String(record.vehicle_registration_date || '').slice(0, 4));
  return {
    id: text(record.id) || null,
    registration: cleanRegistration(record.vehicle_registration_mark || record.vrm),
    heading: text(record.heading) || null,
    make: text(build.make || record.make) || null,
    model: text(build.model || record.model) || null,
    trim: text(build.trim || build.variant || record.trim || record.variant) || null,
    year: year ? Math.round(year) : null,
    mileage: finite(record.miles),
    price: finite(record.price),
    fuelType: text(build.fuel_type || build.fuelType || record.fuel_type || '') || null,
    batteryCapacityKwh: finite(record.ev_battery_capacity ?? build.ev_battery_capacity ?? build.battery_capacity),
    rangeMiles: finite(record.ev_vehicle_range ?? build.ev_vehicle_range ?? build.range),
    source: text(record.source) || null,
    sourceUrl: text(record.vdp_url) || null,
    dealerName: text(dealer.name || dealer.seller_name || record?.mc_dealership?.seller_name || '') || null,
    dealerPostcode: text(dealer.zip || dealer.postal_code || record?.mc_dealership?.zip || '') || null,
    images: [
      ...(Array.isArray(media.photo_links_cached) ? media.photo_links_cached : []),
      ...(Array.isArray(media.photo_links) ? media.photo_links : [])
    ].map(text).filter((item, index, array) => /^https?:\/\//i.test(item) && array.indexOf(item) === index).slice(0, 12)
  };
}

function candidateMatchScore(candidate = {}, listing = {}) {
  let score = 0;
  const cMake = normaliseWords(candidate.make), lMake = normaliseWords(listing.make || listing.heading);
  const cModel = normaliseWords(candidate.model), lModel = normaliseWords(listing.model || listing.heading);
  if (cMake && lMake && lMake.includes(cMake)) score += 25;
  if (cModel && lModel && lModel.includes(cModel)) score += 30;
  if (candidate.year && listing.year && Number(candidate.year) === Number(listing.year)) score += 12;
  if (candidate.registration && listing.registration && cleanRegistration(candidate.registration) === cleanRegistration(listing.registration)) score += 40;
  if (candidate.dealerName && listing.dealerName) {
    const cDealer = normaliseWords(candidate.dealerName), lDealer = normaliseWords(listing.dealerName);
    if (cDealer && lDealer && (cDealer.includes(lDealer) || lDealer.includes(cDealer))) score += 15;
  }
  if (candidate.price && listing.price) {
    const difference = Math.abs(Number(candidate.price) - Number(listing.price));
    const tolerance = Math.max(250, Number(candidate.price) * 0.025);
    if (difference <= tolerance) score += 18;
    else if (difference <= tolerance * 2) score += 8;
  }
  if (candidate.mileage != null && listing.mileage != null) {
    const difference = Math.abs(Number(candidate.mileage) - Number(listing.mileage));
    const tolerance = Math.max(750, Number(candidate.mileage) * 0.04);
    if (difference <= tolerance) score += 12;
    else if (difference <= tolerance * 2) score += 5;
  }
  if (candidate.sourceUrl && listing.sourceUrl) {
    try {
      const a = new URL(candidate.sourceUrl), b = new URL(listing.sourceUrl);
      if (a.toString().replace(/\/$/, '') === b.toString().replace(/\/$/, '')) score += 30;
      else if (a.hostname === b.hostname) score += 3;
    } catch {}
  }
  return score;
}

function marketParams(candidate = {}) {
  const params = new URLSearchParams();
  params.set('rows', '50');
  params.set('start', '0');
  params.set('stats', 'price');
  if (candidate.make) params.set('make', candidate.make);
  if (candidate.model) params.set('model', candidate.model);
  if (candidate.year) params.set('year', String(candidate.year));
  if (candidate.mileage != null) {
    const span = Math.max(5_000, Math.round(Number(candidate.mileage) * 0.25));
    params.set('miles_range', `${Math.max(0, Number(candidate.mileage) - span)}-${Number(candidate.mileage) + span}`);
  }
  return params;
}

function median(values = []) {
  const nums = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!nums.length) return null;
  const middle = Math.floor(nums.length / 2);
  return nums.length % 2 ? nums[middle] : (nums[middle - 1] + nums[middle]) / 2;
}

async function marketCheckProvider(env, candidate = {}) {
  if (!env.MARKETCHECK_API_KEY || !providerReady('marketcheck')) return { configured: false, listings: [], match: null, stats: null };
  const params = marketParams(candidate);
  params.set('api_key', env.MARKETCHECK_API_KEY);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 13_000);
  let response;
  try {
    response = await fetch(`https://api.marketcheck.com/v2/search/car/uk/active?${params.toString()}`, {
      signal: controller.signal,
      headers: { accept: 'application/json' }
    });
  } finally { clearTimeout(timer); }
  if (response.status === 429) {
    coolDown('marketcheck', response, monthResetSeconds());
    return { configured: true, exhausted: true, listings: [], match: null, stats: null };
  }
  if (!response.ok) throw Object.assign(new Error(`MARKETCHECK_${response.status}`), { status: response.status });
  const payload = await response.json().catch(() => ({}));
  const listings = (Array.isArray(payload?.listings) ? payload.listings : []).map(normaliseMarketListing);
  const ranked = listings.map((listing) => ({ listing, score: candidateMatchScore(candidate, listing) })).sort((a, b) => b.score - a.score);
  const top = ranked[0] || null;
  const second = ranked[1] || null;
  const match = top && top.score >= 70 && (!second || top.score - second.score >= 6 || top.score >= 100) ? { ...top.listing, matchScore: top.score } : null;
  const statMedian = finite(payload?.stats?.price?.median);
  const priceMedian = statMedian ?? median(listings.map((item) => item.price));
  const count = finite(payload?.stats?.price?.count) ?? finite(payload?.num_found) ?? listings.length;
  return {
    configured: true,
    exhausted: false,
    listings,
    match,
    stats: {
      count: Number(count || 0),
      medianPrice: priceMedian ? Math.round(priceMedian) : null,
      meanPrice: finite(payload?.stats?.price?.mean),
      minPrice: finite(payload?.stats?.price?.min),
      maxPrice: finite(payload?.stats?.price?.max)
    }
  };
}

export function providerConfiguration(env = {}) {
  return {
    marketcheck: Boolean(env.MARKETCHECK_API_KEY),
    firecrawl: Boolean(env.FIRECRAWL_API_KEY),
    jina: Boolean(env.JINA_API_KEY),
    jinaAnonymousFallback: true,
    workersAi: Boolean(env.AI?.run),
    reefAutotrader: Boolean(env.REEF_API_KEY && String(env.REEF_AUTOTRADER_ENABLED || '').toLowerCase() === 'true')
  };
}

export async function resolveListing(env = {}, listingUrl = '') {
  const parsed = safeHttpUrl(listingUrl);
  if (!parsed) return { ok: false, code: 'INVALID_LISTING_URL', message: 'Paste a normal http or https vehicle listing link.' };
  const hostname = parsed.hostname.toLowerCase();
  const trace = [];
  let candidate = { sourceUrl: parsed.toString(), images: [] };

  if (isAutotrader(parsed.toString())) {
    try {
      const reef = await reefAutotraderProvider(env, parsed.toString());
      if (reef?.candidate) {
        candidate = mergeCandidate(candidate, reef.candidate);
        trace.push({ provider: reef.provider, ok: true });
      } else trace.push({ provider: 'reef-autotrader', ok: false, skipped: true });
    } catch (error) {
      trace.push({ provider: 'reef-autotrader', ok: false, error: text(error.message).slice(0, 80) });
    }
  } else if (RESTRICTED_AGGREGATORS.has(hostname)) {
    return {
      ok: false,
      code: 'SOURCE_REQUIRES_APPROVED_PROVIDER',
      message: 'EV Scan cannot reliably access this marketplace through an approved provider yet. Please try again later.',
      trace
    };
  } else {
    const chain = [
      ['direct', () => directProvider(env, parsed.toString())],
      ['jina', () => jinaProvider(env, parsed.toString())],
      ['firecrawl', () => firecrawlProvider(env, parsed.toString())]
    ];
    for (const [name, fn] of chain) {
      try {
        const result = await fn();
        if (!result?.candidate) { trace.push({ provider: name, ok: false, skipped: true }); continue; }
        candidate = mergeCandidate(candidate, result.candidate);
        trace.push({ provider: name, ok: true, coreEnough: coreEnough(candidate) });
        if (coreEnough(candidate) && (candidate.registration || candidate.description)) break;
      } catch (error) {
        trace.push({ provider: name, ok: false, error: text(error.message).slice(0, 80) });
      }
    }
  }

  if (!coreEnough(candidate)) {
    return {
      ok: false,
      code: 'LISTING_NOT_RESOLVED',
      message: 'EV Scan could not read enough reliable information from that advert to analyse it safely. Please try again later.',
      candidate,
      trace
    };
  }

  let market;
  try { market = await marketCheckProvider(env, candidate); }
  catch (error) {
    trace.push({ provider: 'marketcheck', ok: false, error: text(error.message).slice(0, 80) });
    market = { configured: Boolean(env.MARKETCHECK_API_KEY), listings: [], match: null, stats: null };
  }
  if (market?.match) {
    candidate = mergeCandidate(candidate, market.match);
    trace.push({ provider: 'marketcheck', ok: true, matchScore: market.match.matchScore, sampleSize: market.stats?.count || 0 });
  } else {
    trace.push({ provider: 'marketcheck', ok: false, exhausted: Boolean(market?.exhausted), sampleSize: market?.stats?.count || 0 });
  }

  return { ok: true, listingUrl: parsed.toString(), candidate, market, trace };
}
