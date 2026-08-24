let tokenState = { token: null, expiresAt: 0 };

export function autotraderConfigured(env) {
  return Boolean(env.AUTOTRADER_KEY && env.AUTOTRADER_SECRET);
}

function apiBase(env) {
  return (env.AUTOTRADER_API_BASE || 'https://api-sandbox.autotrader.co.uk').replace(/\/$/, '');
}

async function getToken(env) {
  if (!autotraderConfigured(env)) {
    const error = new Error('Auto Trader credentials are not configured.');
    error.code = 'AUTOTRADER_NOT_CONFIGURED';
    throw error;
  }

  const now = Date.now();
  if (tokenState.token && tokenState.expiresAt > now + 30_000) return tokenState.token;

  const response = await fetch(`${apiBase(env)}/authenticate`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      key: env.AUTOTRADER_KEY,
      secret: env.AUTOTRADER_SECRET
    })
  });

  if (!response.ok) {
    const error = new Error(`Auto Trader authentication failed (${response.status}).`);
    error.status = response.status;
    error.cfRay = response.headers.get('cf-ray');
    throw error;
  }

  const payload = await response.json();
  const expiresAt = Date.parse(payload.expires_at || '') || (now + 14 * 60 * 1000);
  tokenState = { token: payload.access_token, expiresAt };
  return tokenState.token;
}

function setIfPresent(params, key, value) {
  if (value === undefined || value === null || value === '') return;
  params.set(key, String(value));
}

const ALLOWED_SORTS = new Set([
  'totalPriceAsc',
  'totalPriceDesc',
  'suppliedPriceAsc',
  'suppliedPriceDesc',
  'vehicleAgeAsc',
  'vehicleAgeDesc',
  'odometerReadingMilesAsc',
  'odometerReadingMilesDesc',
  'distance'
]);

function buildPublicSearchParams(filters = {}) {
  const params = new URLSearchParams({
    searchType: 'public',
    advertisingLocation: 'autotraderCars',
    vehicleType: 'Car',
    ownershipCondition: 'Used',
    standardFuelType: 'Electric',
    page: String(Math.max(1, Number(filters.page || 1))),
    pageSize: String(Math.min(20, Math.max(1, Number(filters.pageSize || 12))))
  });

  setIfPresent(params, 'standardMake', filters.make);
  setIfPresent(params, 'standardModel', filters.model);
  setIfPresent(params, 'standardTrim', filters.trim);
  setIfPresent(params, 'standardBodyType', filters.bodyType);
  setIfPresent(params, 'standardDrivetrain', filters.drivetrain);
  setIfPresent(params, 'standardTransmissionType', filters.transmissionType);
  setIfPresent(params, 'postcode', filters.postcode);
  setIfPresent(params, 'distance', filters.distance);
  setIfPresent(params, 'minTotalPrice', filters.minPrice);
  setIfPresent(params, 'maxTotalPrice', filters.maxPrice);
  setIfPresent(params, 'minOdometerReadingMiles', filters.minMileage);
  setIfPresent(params, 'maxOdometerReadingMiles', filters.maxMileage);
  setIfPresent(params, 'minManufacturedYear', filters.minYear);
  setIfPresent(params, 'maxManufacturedYear', filters.maxYear);
  setIfPresent(params, 'minSeats', filters.minSeats);
  setIfPresent(params, 'maxSeats', filters.maxSeats);
  setIfPresent(params, 'keywords', filters.keywords);

  if (filters.sort && ALLOWED_SORTS.has(filters.sort)) params.set('sort', filters.sort);

  return params;
}

function resizeImage(href, size = 'w800h600') {
  if (!href) return null;
  return String(href).replace('{resize}', size);
}

function normalizeListing(record = {}) {
  const vehicle = record.vehicle || {};
  const adverts = record.adverts || {};
  const retail = adverts.retailAdverts || {};
  const media = record.media || {};
  const metadata = record.metadata || {};
  const advertiser = record.advertiser || {};
  const images = Array.isArray(media.images) ? media.images : [];

  return {
    provider: 'autotrader',
    searchId: metadata.searchId || record.searchId || null,
    stockId: metadata.stockId || record.stockId || null,
    registration: vehicle.registration || null,
    make: vehicle.make || vehicle.standard?.make || null,
    model: vehicle.model || vehicle.standard?.model || null,
    trim: vehicle.trim || vehicle.standard?.trim || null,
    derivative: vehicle.derivative || vehicle.standard?.derivative || null,
    derivativeId: vehicle.derivativeId || null,
    year: vehicle.yearOfManufacture || vehicle.firstRegistrationDate?.slice?.(0, 4) || null,
    mileage: vehicle.odometerReadingMiles ?? null,
    fuelType: vehicle.fuelType || vehicle.standard?.fuelType || null,
    drivetrain: vehicle.drivetrain || vehicle.standard?.drivetrain || null,
    transmissionType: vehicle.transmissionType || vehicle.standard?.transmissionType || null,
    bodyType: vehicle.bodyType || vehicle.standard?.bodyType || null,
    seats: vehicle.seats ?? null,
    batteryRangeMiles: vehicle.batteryRangeMiles ?? null,
    batteryCapacityKWH: vehicle.batteryCapacityKWH ?? null,
    batteryUsableCapacityKWH: vehicle.batteryUsableCapacityKWH ?? null,
    batteryWarrantyYears: vehicle.manufacturerWarrantyBatteryDurationYears ?? null,
    batteryWarrantyMiles: vehicle.manufacturerWarrantyBatteryDistanceMiles ?? null,
    price: retail.totalPrice?.amountGBP ?? adverts.forecourtPrice?.amountGBP ?? retail.suppliedPrice?.amountGBP ?? null,
    priceIndicatorRating: retail.priceIndicatorRating || null,
    description: retail.description2 || retail.description || null,
    sellerHighlights: [
      retail.advertiserVehicleHighlight1,
      retail.advertiserVehicleHighlight2,
      retail.advertiserVehicleHighlight3
    ].filter(Boolean),
    dealer: {
      name: advertiser.name || null,
      segment: advertiser.segment || null,
      phone: advertiser.phone || null,
      postcode: advertiser.location?.postCode || null
    },
    images: images.map(image => ({
      id: image.imageId || null,
      href: resizeImage(image.href),
      thumbnail: resizeImage(image.href, 'w340h255'),
      tags: Array.isArray(image.classificationTags) ? image.classificationTags : []
    })).filter(image => image.href),
    history: record.history || null,
    provenance: record.check || null,
    rawEvidence: {
      vehicle: 'PROVIDER_DATA',
      listing: 'PROVIDER_DATA',
      photos: images.length ? 'PROVIDER_DATA' : 'UNKNOWN'
    }
  };
}

export async function searchPublicEvListings(env, filters = {}) {
  const token = await getToken(env);
  const params = buildPublicSearchParams(filters);
  const response = await fetch(`${apiBase(env)}/search?${params.toString()}`, {
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/json'
    }
  });

  if (!response.ok) {
    const error = new Error(`Auto Trader search failed (${response.status}).`);
    error.status = response.status;
    error.cfRay = response.headers.get('cf-ray');
    try { error.detail = (await response.text()).slice(0, 500); } catch {}
    throw error;
  }

  const payload = await response.json();
  const results = Array.isArray(payload.results) ? payload.results : [];
  return {
    totalResults: Number(payload.totalResults || results.length),
    page: Number(filters.page || 1),
    pageSize: Math.min(20, Math.max(1, Number(filters.pageSize || 12))),
    results: results.map(normalizeListing)
  };
}

export async function findPublicAdvert(env, query = {}) {
  const filters = {
    page: 1,
    pageSize: 20,
    make: query.make,
    model: query.model,
    trim: query.trim,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    minMileage: query.minMileage,
    maxMileage: query.maxMileage,
    postcode: query.postcode,
    distance: query.distance
  };

  const response = await searchPublicEvListings(env, filters);
  return response.results;
}
