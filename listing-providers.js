const PROVIDER_COOLDOWNS = new Map();
const MAX_SOURCE_BYTES = 1_200_000;
const MAX_AI_CHARS = 45_000;
const FIRECRAWL_USAGE_TTL_MS = 60_000;
let firecrawlUsageCache = { expiresAt: 0, value: null };

const RESTRICTED_AGGREGATORS = new Set([
  'autotrader.co.uk', 'www.autotrader.co.uk',
  'motors.co.uk', 'www.motors.co.uk',
  'cargurus.co.uk', 'www.cargurus.co.uk',
  'facebook.com', 'www.facebook.com', 'm.facebook.com'
]);

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
function text(value = '') { return value == null ? '' : String(value).trim(); }
function cleanRegistration(value = '') {
  const candidate = text(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
  return candidate.length >= 5 && candidate.length <= 8 ? candidate : null;
}
function providerReady(name) { return Date.now() >= (PROVIDER_COOLDOWNS.get(name) || 0); }
function coolDown(name, response, fallbackSeconds = 300) {
  const retry = Number(response?.headers?.get?.('retry-after'));
  const seconds = Number.isFinite(retry) && retry > 0 ? retry : fallbackSeconds;
  PROVIDER_COOLDOWNS.set(name, Date.now() + seconds * 1000);
}

function safeHttpUrl(value) {
  let url;
  try { url = new URL(text(value)); } catch { return null; }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
  if (url.port && !['80', '443'].includes(url.port)) return null;
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!host || host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) return null;
  if (['0.0.0.0','127.0.0.1','::1','169.254.169.254','100.100.100.200','metadata.google.internal'].includes(host)) return null;
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const parts = ipv4.slice(1).map(Number);
    if (parts.some((part) => part < 0 || part > 255)) return null;
    const [a,b] = parts;
    if (a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) return null;
  }
  if (/^(fc|fd|fe8|fe9|fea|feb)/i.test(host)) return null;
  url.hash = '';
  return url;
}

async function readBodyLimited(response, maxBytes = MAX_SOURCE_BYTES) {
  const length = Number(response.headers?.get?.('content-length'));
  if (Number.isFinite(length) && length > maxBytes) throw new Error('SOURCE_TOO_LARGE');
  const body = await response.text();
  if (new TextEncoder().encode(body).byteLength > maxBytes) throw new Error('SOURCE_TOO_LARGE');
  return body;
}

async function fetchDocument(inputUrl, timeoutMs = 9_000) {
  let current = safeHttpUrl(inputUrl);
  if (!current) throw new Error('UNSAFE_URL');
  for (let redirect = 0; redirect <= 3; redirect += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetch(current.toString(), {
        redirect: 'manual', signal: controller.signal,
        headers: {
          'user-agent': 'EVScan/0.9 (+https://ev-scan-mvp.alfieparkerfellows.workers.dev)',
          accept: 'text/html,application/xhtml+xml,application/json,text/plain;q=0.9,*/*;q=0.5'
        }
      });
    } finally { clearTimeout(timer); }
    if ([301,302,303,307,308].includes(response.status)) {
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
  return text(value).replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'")
    .replaceAll('&apos;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code) || 32));
}
function stripHtml(html = '') {
  return decodeEntities(String(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi,' ')
    .replace(/<[^>]+>/g,' ').replace(/\s+/g,' '));
}
function metaContent(html, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`,'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`,'i')
  ];
  for (const pattern of patterns) { const match = String(html).match(pattern); if (match) return decodeEntities(match[1]); }
  return '';
}
function basicListingFromSource(source = '', url = '', isHtml = false) {
  const raw = String(source || '');
  const clean = isHtml ? stripHtml(raw) : raw.replace(/\s+/g,' ');
  const heading = isHtml ? decodeEntities(raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || metaContent(raw,'og:title')) : text(raw.split('\n').find((line) => line.trim().length > 8) || '');
  const description = isHtml ? (metaContent(raw,'og:description') || metaContent(raw,'description') || clean.slice(0,1500)) : clean.slice(0,1500);
  const priceText = clean.match(/£\s?([0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{2})?|[0-9]{4,6})\b/i)?.[1];
  const mileageText = clean.match(/\b([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{4,6})\s*(?:miles|mile|mi)\b/i)?.[1];
  const regMatch = clean.match(/\b([A-Z]{2}\s?\d{2}\s?[A-Z]{3}|[A-Z]\d{1,3}\s?[A-Z]{3}|[A-Z]{3}\s?\d{1,3}[A-Z]|[A-Z]{3}\s?\d{1,3})\b/i)?.[1];
  const yearMatch = `${heading} ${clean.slice(0,3000)}`.match(/\b(20(?:0[8-9]|1\d|2[0-6]))\b/);
  const image = isHtml ? (metaContent(raw,'og:image') || metaContent(raw,'twitter:image')) : '';
  return {
    sourceUrl:url, heading:heading || null, description:description || null,
    registration:cleanRegistration(regMatch), year:yearMatch ? Number(yearMatch[1]) : null,
    mileage:mileageText ? Number(mileageText.replaceAll(',','')) : null,
    price:priceText ? Number(priceText.replaceAll(',','')) : null,
    isElectric:/\b(electric|battery electric|BEV|EV)\b/i.test(clean), images:image ? [image] : []
  };
}
function parseJsonLoose(value) {
  if (value && typeof value === 'object') return value;
  const raw = text(value).replace(/^```(?:json)?/i,'').replace(/```$/i,'').trim();
  try { return JSON.parse(raw); } catch {}
  const first = raw.indexOf('{'), last = raw.lastIndexOf('}');
  if (first >= 0 && last > first) { try { return JSON.parse(raw.slice(first,last + 1)); } catch {} }
  return null;
}
function normaliseExtracted(raw = {}, seed = {}) {
  const data = raw && typeof raw === 'object' ? raw : {};
  const images = [...(Array.isArray(data.images) ? data.images : []), ...(Array.isArray(seed.images) ? seed.images : [])]
    .map(text).filter((item,index,array) => /^https?:\/\//i.test(item) && array.indexOf(item) === index).slice(0,12);
  const year = finite(data.year ?? seed.year), price = finite(data.price ?? data.askingPrice ?? seed.price), mileage = finite(data.mileage ?? data.miles ?? seed.mileage);
  const battery = finite(data.batteryCapacityKwh ?? data.battery_capacity_kwh ?? data.batteryKwh), range = finite(data.rangeMiles ?? data.evRangeMiles ?? data.range_miles);
  return {
    sourceUrl:text(data.sourceUrl || seed.sourceUrl) || null, heading:text(data.heading || data.title || seed.heading) || null,
    make:text(data.make || data.brand) || null, model:text(data.model) || null, trim:text(data.trim || data.variant || data.derivative) || null,
    derivative:text(data.derivative) || null, year:year && year >= 2008 && year <= 2027 ? Math.round(year) : null,
    mileage:mileage != null && mileage >= 0 && mileage < 1_000_000 ? Math.round(mileage) : null,
    price:price && price >= 500 && price < 500_000 ? Math.round(price) : null,
    registration:cleanRegistration(data.registration || data.vrm || data.vehicleRegistrationMark || seed.registration),
    fuelType:text(data.fuelType || data.fuel || '') || null,
    isElectric:Boolean(data.isElectric ?? seed.isElectric ?? /electric|\bbev\b/i.test(text(data.fuelType || data.fuel))),
    batteryCapacityKwh:battery && battery > 5 && battery < 250 ? battery : null,
    rangeMiles:range && range > 20 && range < 700 ? Math.round(range) : null,
    description:text(data.description || data.sellerDescription || seed.description) || null,
    dealerName:text(data.dealerName || data.sellerName || data.dealer?.name || '') || null,
    dealerPostcode:text(data.dealerPostcode || data.postcode || data.dealer?.postcode || '') || null,
    images
  };
}
async function aiExtract(env, sourceText, seed = {}) {
  if (!env.AI?.run || !sourceText) return normaliseExtracted({}, seed);
  const prompt = `Extract only explicitly-supported factual fields from this UK used EV advert. Return ONLY JSON. Unknown values must be null. Keys: make, model, trim, derivative, year, mileage, price, registration, fuelType, isElectric, batteryCapacityKwh, rangeMiles, description, dealerName, dealerPostcode, images. Do not infer battery/range from general model knowledge.\nSeed:${JSON.stringify(seed)}\nContent:${String(sourceText).slice(0,MAX_AI_CHARS)}`;
  try {
    const result = await env.AI.run('@cf/meta/llama-3.2-3b-instruct', { prompt, max_tokens:900, temperature:0 });
    return normaliseExtracted(parseJsonLoose(result?.response ?? result?.result ?? result) || {}, seed);
  } catch { return normaliseExtracted({}, seed); }
}
function mergeCandidate(base = {}, incoming = {}) {
  const first = (...values) => values.find((value) => value !== null && value !== undefined && value !== '') ?? null;
  return {
    sourceUrl:first(base.sourceUrl,incoming.sourceUrl), heading:first(incoming.heading,base.heading), make:first(incoming.make,base.make),
    model:first(incoming.model,base.model), trim:first(incoming.trim,base.trim), derivative:first(incoming.derivative,base.derivative),
    year:first(incoming.year,base.year), mileage:first(incoming.mileage,base.mileage), price:first(incoming.price,base.price),
    registration:first(incoming.registration,base.registration), fuelType:first(incoming.fuelType,base.fuelType), isElectric:Boolean(incoming.isElectric || base.isElectric),
    batteryCapacityKwh:first(incoming.batteryCapacityKwh,base.batteryCapacityKwh), rangeMiles:first(incoming.rangeMiles,base.rangeMiles),
    description:first(incoming.description,base.description), dealerName:first(incoming.dealerName,base.dealerName), dealerPostcode:first(incoming.dealerPostcode,base.dealerPostcode),
    images:[...(base.images || []),...(incoming.images || [])].filter((item,index,array) => item && array.indexOf(item) === index).slice(0,12)
  };
}
function coreEnough(candidate = {}) { return Boolean(candidate.make && candidate.model && candidate.year && finite(candidate.price) && finite(candidate.mileage)); }

async function directProvider(env, listingUrl) {
  if (!providerReady('direct')) return null;
  const { response, finalUrl } = await fetchDocument(listingUrl);
  if (!response.ok) throw Object.assign(new Error(`DIRECT_${response.status}`), { status:response.status });
  const type = response.headers.get('content-type') || '';
  if (!/text|html|json|javascript/i.test(type)) throw new Error('UNSUPPORTED_CONTENT_TYPE');
  const body = await readBodyLimited(response);
  const isHtml = /html/i.test(type) || /<html/i.test(body);
  const seed = basicListingFromSource(body, finalUrl, isHtml);
  return { provider:'direct', candidate:await aiExtract(env, isHtml ? stripHtml(body) : body, seed), rawChars:body.length };
}

async function firecrawlProvider(env, listingUrl) {
  if (!env.FIRECRAWL_API_KEY || !providerReady('firecrawl')) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  let response;
  try {
    response = await fetch('https://api.firecrawl.dev/v2/scrape', {
      method:'POST', signal:controller.signal,
      headers:{ authorization:`Bearer ${env.FIRECRAWL_API_KEY}`, 'content-type':'application/json', accept:'application/json' },
      body:JSON.stringify({ url:listingUrl, formats:['markdown','images'], onlyMainContent:false, blockAds:true, removeBase64Images:true, timeout:18_000, location:{ country:'GB', languages:['en-GB','en'] } })
    });
  } finally { clearTimeout(timer); }
  if (response.status === 429 || response.status === 402) { coolDown('firecrawl', response, 900); throw Object.assign(new Error('FIRECRAWL_QUOTA'), { status:response.status }); }
  if (!response.ok) throw Object.assign(new Error(`FIRECRAWL_${response.status}`), { status:response.status });
  const payload = await response.json().catch(() => ({}));
  const data = payload?.data && typeof payload.data === 'object' ? payload.data : payload;
  const markdown = text(data?.markdown || data?.content || '');
  const seed = basicListingFromSource(markdown, listingUrl, false);
  if (Array.isArray(data?.images)) seed.images = [...(seed.images || []),...data.images].slice(0,12);
  return { provider:'firecrawl', candidate:await aiExtract(env, `${markdown}\n${JSON.stringify(data?.metadata || {})}`, seed), rawChars:markdown.length };
}

async function browserProvider(env, listingUrl) {
  if (!env.BROWSER?.quickAction || !providerReady('cloudflare-browser')) return null;
  let result;
  try { result = await env.BROWSER.quickAction('markdown', { url:listingUrl }); }
  catch (error) {
    if (/429|limit|quota/i.test(String(error?.message || error))) PROVIDER_COOLDOWNS.set('cloudflare-browser', Date.now() + 15 * 60 * 1000);
    throw error;
  }
  let raw = '';
  if (result instanceof Response) raw = await result.text();
  else if (typeof result === 'string') raw = result;
  else raw = JSON.stringify(result || {});
  let source = raw;
  try {
    const parsed = JSON.parse(raw);
    source = text(parsed?.result || parsed?.data?.result || parsed?.markdown || parsed?.data?.markdown || raw);
  } catch {}
  if (!source) return null;
  const seed = basicListingFromSource(source, listingUrl, false);
  return { provider:'cloudflare-browser', candidate:await aiExtract(env, source, seed), rawChars:source.length };
}

export async function getFirecrawlUsage(env = {}, { force = false } = {}) {
  if (!env.FIRECRAWL_API_KEY) return { configured:false, available:false, known:true, remainingCredits:0, planCredits:null, resetAt:null, reason:'NOT_CONFIGURED' };
  if (!force && firecrawlUsageCache.value && Date.now() < firecrawlUsageCache.expiresAt) return firecrawlUsageCache.value;
  try {
    const response = await fetch('https://api.firecrawl.dev/v2/team/credit-usage', { headers:{ authorization:`Bearer ${env.FIRECRAWL_API_KEY}`, accept:'application/json' } });
    if (!response.ok) throw new Error(`FIRECRAWL_USAGE_${response.status}`);
    const payload = await response.json();
    const data = payload?.data || {};
    const remaining = Math.max(0, Number(data.remainingCredits || 0));
    const value = {
      configured:true, available:remaining > 0, known:true, remainingCredits:remaining,
      planCredits:Number.isFinite(Number(data.planCredits)) ? Number(data.planCredits) : null,
      resetAt:text(data.billingPeriodEnd) || null, periodStart:text(data.billingPeriodStart) || null,
      checkedAt:new Date().toISOString(), reason:remaining > 0 ? null : 'CREDITS_EXHAUSTED'
    };
    firecrawlUsageCache = { value, expiresAt:Date.now() + FIRECRAWL_USAGE_TTL_MS };
    return value;
  } catch (error) {
    return { configured:true, available:false, known:false, remainingCredits:null, planCredits:null, resetAt:null, checkedAt:new Date().toISOString(), reason:'STATUS_UNAVAILABLE' };
  }
}

export function providerConfiguration(env = {}) {
  return {
    direct:true,
    firecrawl:Boolean(env.FIRECRAWL_API_KEY),
    cloudflareBrowser:Boolean(env.BROWSER?.quickAction),
    workersAi:Boolean(env.AI?.run),
    marketcheck:false,
    jina:false,
    reefAutotrader:false
  };
}

export async function resolveListing(env = {}, listingUrl = '') {
  const parsed = safeHttpUrl(listingUrl);
  if (!parsed) return { ok:false, code:'INVALID_LISTING_URL', message:'Paste a normal http or https vehicle listing link.' };
  const hostname = parsed.hostname.toLowerCase();
  if (RESTRICTED_AGGREGATORS.has(hostname)) {
    return { ok:false, code:'SOURCE_REQUIRES_APPROVED_PROVIDER', message:'EV Scan does not currently have an approved data route for this marketplace, so it will not guess or scrape around the restriction.', trace:[] };
  }

  const trace = [];
  let candidate = { sourceUrl:parsed.toString(), images:[] };
  const chain = [
    ['direct', () => directProvider(env, parsed.toString())],
    ['firecrawl', () => firecrawlProvider(env, parsed.toString())],
    ['cloudflare-browser', () => browserProvider(env, parsed.toString())]
  ];
  for (const [name, fn] of chain) {
    try {
      const result = await fn();
      if (!result?.candidate) { trace.push({ provider:name, ok:false, skipped:true }); continue; }
      candidate = mergeCandidate(candidate, result.candidate);
      trace.push({ provider:name, ok:true, coreEnough:coreEnough(candidate) });
      if (coreEnough(candidate) && candidate.registration && candidate.description && candidate.batteryCapacityKwh && candidate.rangeMiles && candidate.images?.length) break;
    } catch (error) {
      trace.push({ provider:name, ok:false, error:text(error?.message || error).slice(0,100) });
    }
  }
  if (!coreEnough(candidate)) return { ok:false, code:'LISTING_NOT_RESOLVED', message:'EV Scan could not read enough reliable information from that advert to analyse it safely. No report was generated.', candidate, trace };
  return { ok:true, listingUrl:parsed.toString(), candidate, trace };
}
