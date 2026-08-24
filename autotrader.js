let tokenState = { token: null, expiresAt: 0 };

export function autotraderConfigured(env = {}) {
  return Boolean(env.AUTOTRADER_KEY && env.AUTOTRADER_SECRET);
}

function apiBase(env = {}) {
  return String(env.AUTOTRADER_API_BASE || 'https://api-sandbox.autotrader.co.uk').replace(/\/$/, '');
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  catch (error) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error('Auto Trader request timed out.');
      timeoutError.status = 504;
      throw timeoutError;
    }
    throw error;
  } finally { clearTimeout(timer); }
}

async function safeJson(response) {
  try { return await response.json(); }
  catch {
    const error = new Error('Auto Trader returned unreadable data.');
    error.status = 502;
    throw error;
  }
}

async function getToken(env) {
  if (!autotraderConfigured(env)) {
    const error = new Error('Auto Trader credentials are not configured.');
    error.code = 'AUTOTRADER_NOT_CONFIGURED';
    throw error;
  }
  const now = Date.now();
  if (tokenState.token && tokenState.expiresAt > now + 30_000) return tokenState.token;
  const response = await fetchWithTimeout(`${apiBase(env)}/authenticate`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ key: String(env.AUTOTRADER_KEY || ''), secret: String(env.AUTOTRADER_SECRET || '') })
  });
  if (!response.ok) {
    const error = new Error(`Auto Trader authentication failed (${response.status}).`);
    error.status = response.status;
    error.cfRay = response.headers.get('cf-ray');
    throw error;
  }
  const payload = await safeJson(response);
  if (!payload?.access_token) {
    const error = new Error('Auto Trader authentication returned no access token.');
    error.status = 502;
    throw error;
  }
  const expiresAt = Date.parse(payload.expires_at || '') || (now + 14 * 60 * 1000);
  tokenState = { token: payload.access_token, expiresAt };
  return tokenState.token;
}

function setIfPresent(params, key, value) {
  if (value === undefined || value === null || value === '') return;
  params.set(key, String(value));
}

const ALLOWED_SORTS = new Set(['totalPriceAsc','totalPriceDesc','suppliedPriceAsc','suppliedPriceDesc','vehicleAgeAsc','vehicleAgeDesc','odometerReadingMilesAsc','odometerReadingMilesDesc','distance']);

function buildPublicSearchParams(filters = {}) {
  const f = filters && typeof filters === 'object' && !Array.isArray(filters) ? filters : {};
  const page = Math.max(1, Number(f.page || 1) || 1);
  const pageSize = Math.min(20, Math.max(1, Number(f.pageSize || 12) || 12));
  const params = new URLSearchParams({ searchType:'public', advertisingLocation:'autotraderCars', vehicleType:'Car', ownershipCondition:'Used', standardFuelType:'Electric', page:String(page), pageSize:String(pageSize) });
  setIfPresent(params,'standardMake',f.make); setIfPresent(params,'standardModel',f.model); setIfPresent(params,'standardTrim',f.trim); setIfPresent(params,'standardBodyType',f.bodyType); setIfPresent(params,'standardDrivetrain',f.drivetrain); setIfPresent(params,'standardTransmissionType',f.transmissionType); setIfPresent(params,'postcode',f.postcode); setIfPresent(params,'distance',f.distance); setIfPresent(params,'minTotalPrice',f.minPrice); setIfPresent(params,'maxTotalPrice',f.maxPrice); setIfPresent(params,'minOdometerReadingMiles',f.minMileage); setIfPresent(params,'maxOdometerReadingMiles',f.maxMileage); setIfPresent(params,'minManufacturedYear',f.minYear); setIfPresent(params,'maxManufacturedYear',f.maxYear); setIfPresent(params,'minSeats',f.minSeats); setIfPresent(params,'maxSeats',f.maxSeats); setIfPresent(params,'keywords',f.keywords);
  if (f.sort && ALLOWED_SORTS.has(f.sort)) params.set('sort', f.sort);
  return params;
}

function resizeImage(href, size = 'w800h600') {
  if (!href) return null;
  try { return String(href).replace('{resize}', size); } catch { return null; }
}

function object(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }

function normalizeListing(record = {}) {
  const root = object(record), vehicle = object(root.vehicle), adverts = object(root.adverts), retail = object(adverts.retailAdverts), media = object(root.media), metadata = object(root.metadata), advertiser = object(root.advertiser), standard = object(vehicle.standard), location = object(advertiser.location);
  const totalPrice = object(retail.totalPrice), forecourtPrice = object(adverts.forecourtPrice), suppliedPrice = object(retail.suppliedPrice);
  const images = Array.isArray(media.images) ? media.images.filter(Boolean) : [];
  const yearFallback = typeof vehicle.firstRegistrationDate === 'string' ? vehicle.firstRegistrationDate.slice(0,4) : null;
  return {
    provider:'autotrader',
    searchId:metadata.searchId || root.searchId || null,
    stockId:metadata.stockId || root.stockId || null,
    registration:vehicle.registration || null,
    make:vehicle.make || standard.make || null,
    model:vehicle.model || standard.model || null,
    trim:vehicle.trim || standard.trim || null,
    derivative:vehicle.derivative || standard.derivative || null,
    derivativeId:vehicle.derivativeId || null,
    year:vehicle.yearOfManufacture || yearFallback || null,
    mileage:Number.isFinite(Number(vehicle.odometerReadingMiles)) ? Number(vehicle.odometerReadingMiles) : null,
    fuelType:vehicle.fuelType || standard.fuelType || null,
    drivetrain:vehicle.drivetrain || standard.drivetrain || null,
    transmissionType:vehicle.transmissionType || standard.transmissionType || null,
    bodyType:vehicle.bodyType || standard.bodyType || null,
    seats:Number.isFinite(Number(vehicle.seats)) ? Number(vehicle.seats) : null,
    batteryRangeMiles:Number.isFinite(Number(vehicle.batteryRangeMiles)) ? Number(vehicle.batteryRangeMiles) : null,
    batteryCapacityKWH:Number.isFinite(Number(vehicle.batteryCapacityKWH)) ? Number(vehicle.batteryCapacityKWH) : null,
    batteryUsableCapacityKWH:Number.isFinite(Number(vehicle.batteryUsableCapacityKWH)) ? Number(vehicle.batteryUsableCapacityKWH) : null,
    batteryWarrantyYears:Number.isFinite(Number(vehicle.manufacturerWarrantyBatteryDurationYears)) ? Number(vehicle.manufacturerWarrantyBatteryDurationYears) : null,
    batteryWarrantyMiles:Number.isFinite(Number(vehicle.manufacturerWarrantyBatteryDistanceMiles)) ? Number(vehicle.manufacturerWarrantyBatteryDistanceMiles) : null,
    price:Number.isFinite(Number(totalPrice.amountGBP)) ? Number(totalPrice.amountGBP) : Number.isFinite(Number(forecourtPrice.amountGBP)) ? Number(forecourtPrice.amountGBP) : Number.isFinite(Number(suppliedPrice.amountGBP)) ? Number(suppliedPrice.amountGBP) : null,
    priceIndicatorRating:retail.priceIndicatorRating || null,
    description:retail.description2 || retail.description || null,
    sellerHighlights:[retail.advertiserVehicleHighlight1,retail.advertiserVehicleHighlight2,retail.advertiserVehicleHighlight3].filter(Boolean),
    dealer:{ name:advertiser.name || null, segment:advertiser.segment || null, phone:advertiser.phone || null, postcode:location.postCode || null },
    images:images.map((raw) => { const image = object(raw); return { id:image.imageId || null, href:resizeImage(image.href), thumbnail:resizeImage(image.href,'w340h255'), tags:Array.isArray(image.classificationTags) ? image.classificationTags : [] }; }).filter((image) => image.href),
    history:root.history || null,
    provenance:root.check || null,
    rawEvidence:{ vehicle:(vehicle.make || vehicle.model || vehicle.registration) ? 'PROVIDER_DATA' : 'UNKNOWN', listing:(retail.description || retail.totalPrice || adverts.forecourtPrice) ? 'PROVIDER_DATA' : 'PARTIAL', photos:images.length ? 'PROVIDER_DATA' : 'UNKNOWN' }
  };
}

export async function searchPublicEvListings(env, filters = {}) {
  const token = await getToken(env);
  const params = buildPublicSearchParams(filters);
  const response = await fetchWithTimeout(`${apiBase(env)}/search?${params.toString()}`, { headers:{ authorization:`Bearer ${token}`, accept:'application/json' } });
  if (!response.ok) {
    const error = new Error(`Auto Trader search failed (${response.status}).`);
    error.status = response.status;
    error.cfRay = response.headers.get('cf-ray');
    try { error.detail = (await response.text()).slice(0,500); } catch {}
    throw error;
  }
  const payload = await safeJson(response);
  const results = Array.isArray(payload?.results) ? payload.results : [];
  const page = Math.max(1, Number(filters?.page || 1) || 1);
  const pageSize = Math.min(20, Math.max(1, Number(filters?.pageSize || 12) || 12));
  return { totalResults:Number.isFinite(Number(payload?.totalResults)) ? Number(payload.totalResults) : results.length, page, pageSize, results:results.map(normalizeListing).filter(Boolean) };
}

export async function findPublicAdvert(env, query = {}) {
  const q = query && typeof query === 'object' ? query : {};
  const response = await searchPublicEvListings(env, { page:1, pageSize:20, make:q.make, model:q.model, trim:q.trim, minPrice:q.minPrice, maxPrice:q.maxPrice, minMileage:q.minMileage, maxMileage:q.maxMileage, postcode:q.postcode, distance:q.distance });
  return Array.isArray(response?.results) ? response.results : [];
}