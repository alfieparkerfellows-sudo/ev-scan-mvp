(() => {
  const $ = (sel, root = document) => root?.querySelector?.(sel) || null;
  const $$ = (sel, root = document) => root?.querySelectorAll ? [...root.querySelectorAll(sel)] : [];
  const R = window.EVScanResilience || {};
  const safeArray = R.safeArray || ((value) => Array.isArray(value) ? value : []);
  const safeText = R.safeText || ((value, fallback = 'Unknown') => {
    const text = value == null ? '' : String(value).trim();
    return text || fallback;
  });
  const safeNumber = R.safeNumber || ((value, fallback = null) => Number.isFinite(Number(value)) ? Number(value) : fallback);
  const escapeHtml = R.escapeHtml || ((value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char])));
  const fetchJson = R.fetchJson || (async (url, options = {}, timeoutMs = 12000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      const text = await response.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { ok: false, message: 'The data provider returned an unreadable response.' }; }
      return { response, data };
    } finally { clearTimeout(timer); }
  });

  const listingInput = $('#listing-url');
  const rescanInput = $('#rescan-url');
  const help = $('#url-help');
  let health = null;

  function cleanRegistration(value = '') {
    return String(value ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  }

  function looksLikeRegistration(value = '') {
    const reg = cleanRegistration(value);
    if (reg.length < 5 || reg.length > 8) return false;
    if (!/[A-Z]/.test(reg) || !/[0-9]/.test(reg)) return false;
    return !String(value).includes('.') && !String(value).includes('/');
  }

  function setInputModes() {
    [listingInput, rescanInput].filter(Boolean).forEach((input) => {
      input.type = 'text';
      input.removeAttribute('inputmode');
      input.autocapitalize = 'characters';
      input.spellcheck = false;
    });
    if (listingInput) listingInput.placeholder = 'Paste an EV listing link or registration…';
    if (rescanInput) rescanInput.placeholder = 'Listing link or registration…';
  }

  async function loadHealth() {
    try {
      const { response, data } = await fetchJson('/api/health', { headers: { accept: 'application/json' } }, 8000);
      if (!response.ok || !data || typeof data !== 'object') return;
      health = data;
      if (health.liveMotConfigured && help) {
        help.textContent = 'Paste an EV listing link, or enter a UK registration for a live MOT check.';
        help.classList.remove('error');
      }
    } catch {
      if (help) help.textContent = 'Live checks are temporarily unavailable. You can still open the demo report.';
    }
  }

  function showRegistrationError(message) {
    if (!help) return;
    help.textContent = safeText(message, 'We could not check that registration right now.');
    help.classList.add('error');
    listingInput?.focus();
  }

  function showOverlay() {
    const overlay = $('#scan-overlay');
    if (!overlay) return;
    overlay.hidden = false;
    document.body.classList.add('modal-open');
    const title = $('#scan-title'), copy = $('#scan-step-copy'), progress = $('#scan-progress'), count = $('#scan-stage-count');
    if (title) title.textContent = 'Checking the registration…';
    if (copy) copy.textContent = 'Fetching verified vehicle and MOT information from DVSA.';
    if (progress) progress.style.width = '42%';
    if (count) count.textContent = 'Live MOT lookup';
  }

  function hideOverlay() {
    const overlay = $('#scan-overlay');
    if (overlay) overlay.hidden = true;
    document.body.classList.remove('modal-open');
  }

  function openReport() {
    const shell = $('.app-shell'), report = $('#report-view');
    if (shell) shell.hidden = true;
    if (report) report.hidden = false;
    hideOverlay();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function yearFromDate(value) {
    if (!value) return '';
    const year = new Date(value).getFullYear();
    return Number.isFinite(year) ? String(year) : '';
  }

  function latestMileage(tests = []) {
    const item = safeArray(tests).find((test) => safeNumber(test?.odometerValue) != null);
    return item ? safeNumber(item.odometerValue) : null;
  }

  function formatDate(value) {
    if (!value) return 'Date unavailable';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Date unavailable';
    return new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'short' }).format(date);
  }

  function motRow(test = {}) {
    const defects = safeArray(test?.defects);
    const advisories = defects.filter((d) => /ADVISORY|MINOR/i.test(safeText(d?.type, ''))).length;
    const serious = defects.filter((d) => d?.dangerous || /DANGEROUS|MAJOR/i.test(safeText(d?.type, ''))).length;
    let detail = 'No recorded defects';
    if (serious) detail = `${serious} major/dangerous issue${serious === 1 ? '' : 's'} recorded`;
    else if (advisories) detail = `${advisories} advisory/minor item${advisories === 1 ? '' : 's'}`;
    return `<div class="timeline-item"><i></i><div><b>${escapeHtml(formatDate(test?.completedDate))} · ${escapeHtml(safeText(test?.result, 'Result unavailable'))}</b><span>${escapeHtml(detail)}</span></div></div>`;
  }

  function setUnknownCard(card, value = 'Unknown', explanation = 'This information was not available from the data we received.') {
    if (!card) return;
    const metricValue = $('.metric-value', card);
    if (metricValue) metricValue.textContent = value;
    const paragraphs = $$('p', card);
    if (paragraphs[0]) paragraphs[0].textContent = explanation;
    const tag = $('.data-tag', card);
    if (tag && !/DVSA VERIFIED/i.test(tag.textContent || '')) {
      tag.textContent = 'UNKNOWN';
      tag.className = 'data-tag estimated';
    }
  }

  function hideOptional(selector) {
    const node = $(selector);
    if (node) node.hidden = true;
  }

  function applyMinimalFallback(payload = {}) {
    openReport();
    const vehicle = payload?.vehicle && typeof payload.vehicle === 'object' ? payload.vehicle : {};
    const reg = safeText(vehicle.registration, 'Registration checked');
    const select = $('#trim-select');
    if (select) { select.innerHTML = `<option>${escapeHtml(reg)}</option>`; select.disabled = true; }
    const meta = $('#trim-meta');
    if (meta) meta.textContent = 'Some vehicle details were unavailable from the provider.';
    const price = $('.asking-price');
    if (price) price.innerHTML = '<span>Asking price</span><strong>Unknown</strong><small>Not supplied</small>';
    const bigScore = $('.big-score');
    if (bigScore) bigScore.innerHTML = '<span class="mini-label">Deal score</span><strong>—</strong><em style="color:#ffc459">Not enough reliable data</em>';
    $$('.report-metrics .metric-rich').forEach((card) => setUnknownCard(card));
    ['.degradation-card','.trim-card','.xray-card','.seller-card','.change-score-card','.effective-card','.insurance-card','.fit-score-card','.recommendations-section'].forEach(hideOptional);
    const quick = $('.quick-verdict');
    if (quick) {
      const title = $('h2', quick), copy = $('p', quick);
      if (title) title.textContent = 'We found the vehicle, but some data could not be read safely.';
      if (copy) copy.textContent = 'EV Scan has kept the report open and marked unavailable information as unknown instead of guessing.';
    }
  }

  function applyLiveRegistrationReport(payload = {}) {
    const vehicle = payload?.vehicle && typeof payload.vehicle === 'object' ? payload.vehicle : {};
    const mot = vehicle?.motIntelligence && typeof vehicle.motIntelligence === 'object' ? vehicle.motIntelligence : {};
    const tests = safeArray(vehicle?.motTests);
    const year = yearFromDate(vehicle?.firstUsedDate);
    const reg = safeText(vehicle?.registration, 'Registration unavailable');
    const make = safeText(vehicle?.make, 'Make unavailable');
    const model = safeText(vehicle?.model, 'Model unavailable');
    const name = [year, vehicle?.make, vehicle?.model].filter((x) => safeText(x, '')).join(' ') || reg;
    const mileage = latestMileage(tests);

    const tag = $('.vehicle-tag'); if (tag) tag.textContent = 'DVSA VERIFIED';
    const source = $('.source-note'); if (source) source.textContent = 'Live DVSA vehicle + MOT data';

    const gallery = $('.vehicle-image-demo');
    if (gallery) {
      gallery.classList.remove('has-photo');
      gallery.innerHTML = `<div class="vehicle-tag">DVSA VERIFIED</div><div style="min-height:240px;display:grid;place-items:center;padding:28px;text-align:center;color:#9ba7ba;background:linear-gradient(145deg,#273247,#101727)"><div><strong style="display:block;color:#fff;font-size:1.25rem;margin-bottom:8px">${escapeHtml(name)}</strong><span>Listing photo unavailable. The report can still continue without it.</span></div></div>`;
    }
    const thumbs = $('.gallery-thumbs'); if (thumbs) thumbs.innerHTML = '<span></span><span></span><span></span><span class="more-thumb">No photos</span>';

    const select = $('#trim-select');
    if (select) { select.innerHTML = `<option>${escapeHtml(name)}</option>`; select.disabled = true; }
    const meta = $('#trim-meta');
    if (meta) {
      const unit = safeText(tests[0]?.odometerUnit, 'mi');
      const bits = [reg, mileage != null ? `${mileage.toLocaleString('en-GB')} ${unit} at latest MOT` : 'Mileage unavailable', vehicle?.fuelType || null, vehicle?.primaryColour || null].filter(Boolean);
      meta.textContent = bits.join(' · ');
    }

    const price = $('.asking-price'); if (price) price.innerHTML = '<span>Asking price</span><strong>Unknown</strong><small style="color:#9ba7ba">Not supplied by this data source</small>';
    const bigScore = $('.big-score'); if (bigScore) bigScore.innerHTML = '<span class="mini-label">Deal score</span><strong>—</strong><em style="color:#ffc459">Need price + battery data</em>';

    const confidenceRing = $('.confidence-ring');
    const confidence = Math.max(0, Math.min(100, safeNumber(payload?.scoring?.decisionConfidence?.score, 40)));
    if (confidenceRing) { confidenceRing.style.setProperty('--value', String(confidence)); const span = $('span', confidenceRing); if (span) span.textContent = `${confidence}%`; }
    const confidenceText = $('.decision-confidence > div:last-child');
    if (confidenceText) confidenceText.innerHTML = `<span class="mini-label">Decision confidence</span><strong>Verified MOT, incomplete deal data</strong><small>${escapeHtml(safeText(payload?.scoring?.decisionConfidence?.reason, 'We still need listing, market and battery information.'))}</small>`;

    const quick = $('.quick-verdict');
    if (quick) {
      const title = $('h2', quick), copy = $('p', quick);
      if (title) title.textContent = 'MOT history checked — we still need the advert to judge the deal.';
      if (copy) copy.textContent = safeText(mot?.summary, 'The registration lookup worked. Price, battery and listing analysis are still unknown.');
      const likes = $('.likes-checks', quick);
      if (likes) likes.innerHTML = `<div><h3>✓ Verified</h3><ul><li>${escapeHtml(reg)}</li><li>${escapeHtml(`${make} ${model}`)}</li><li>${tests.length} MOT record${tests.length === 1 ? '' : 's'} returned</li></ul></div><div><h3>👀 Still needed</h3><ul><li>Actual listing + asking price</li><li>Battery evidence / estimate</li><li>Listing photos and seller claims</li></ul></div>`;
    }

    const metricCards = $$('.report-metrics .metric-rich');
    setUnknownCard(metricCards[0], 'Unknown', 'No asking price or market-comparable feed was supplied.');

    const batteryCard = metricCards[1];
    if (batteryCard) {
      const status = $('.battery-status strong', batteryCard), soh = $('.battery-status span', batteryCard), bar = $('.battery-visual span', batteryCard), p = $('p', batteryCard), dataTag = $('.data-tag', batteryCard);
      if (status) status.textContent = 'Unknown';
      if (soh) soh.textContent = 'No measured battery evidence';
      if (bar) bar.style.width = '0%';
      if (p) p.textContent = 'MOT history cannot tell us battery State of Health. EV Scan will not invent an exact figure.';
      if (dataTag) { dataTag.textContent = 'UNKNOWN'; dataTag.className = 'data-tag estimated'; }
    }

    const rangeCard = metricCards[2];
    if (rangeCard) {
      const main = $('#range-main'); if (main) main.textContent = 'Unknown';
      const bars = $('.range-bars', rangeCard); if (bars) bars.innerHTML = '<div><span>Exact EV specification data unavailable</span></div>';
      const p = $('.plain-explain', rangeCard); if (p) p.innerHTML = '<b>What this means:</b> we have verified the vehicle/MOT identity, but not enough model-specific data to estimate range responsibly.';
      const dataTag = $('.data-tag', rangeCard); if (dataTag) { dataTag.textContent = 'UNKNOWN'; dataTag.className = 'data-tag estimated'; }
    }

    const motCard = metricCards[3];
    if (motCard) {
      const tagEl = $('.data-tag', motCard); if (tagEl) { tagEl.textContent = 'DVSA VERIFIED'; tagEl.className = 'data-tag verified'; }
      const timeline = $('.timeline', motCard); if (timeline) timeline.innerHTML = tests.slice(0, 5).map(motRow).join('') || '<p>No MOT test records were returned. This can be normal for some newer vehicles.</p>';
      const take = $('.plain-explain', motCard); if (take) take.innerHTML = `<b>Our take:</b> ${escapeHtml(safeText(mot?.summary, 'No MOT pattern could be assessed from the available records.'))}`;
    }

    ['.degradation-card','.trim-card','.xray-card','.seller-card','.change-score-card','.effective-card','.insurance-card','.fit-score-card','.recommendations-section'].forEach(hideOptional);

    const limits = $('.limits-card');
    if (limits) { const p = $('p', limits); if (p) p.textContent = 'This registration check verifies only the information DVSA returned. Missing fields remain unknown. We still need the advert, battery evidence, provenance checks and a physical inspection before making a buying decision.'; }
  }

  async function runRegistrationScan(value) {
    const registration = cleanRegistration(value);
    if (!registration) { showRegistrationError('Enter a valid UK registration.'); return; }
    showOverlay();
    try {
      const { response, data: payload } = await fetchJson('/api/scan', {
        method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ registration })
      }, 15000);
      if (!response.ok || !payload?.ok) {
        hideOverlay();
        if (payload?.code === 'DVSA_NOT_CONFIGURED') showRegistrationError('The live MOT service is temporarily unavailable. You can still use EV Scan’s demo features.');
        else showRegistrationError(payload?.message || 'We could not check that registration right now. Please try again.');
        return;
      }
      try { openReport(); applyLiveRegistrationReport(payload); }
      catch (renderError) { console.error('Live report render fallback:', renderError); applyMinimalFallback(payload); }
    } catch (error) {
      hideOverlay();
      const timedOut = error?.name === 'AbortError';
      showRegistrationError(timedOut ? 'The live vehicle service took too long to respond. Please try again.' : 'The live vehicle service is temporarily unavailable. The rest of EV Scan still works.');
    }
  }

  function interceptRegistration(form, input) {
    form?.addEventListener('submit', (event) => {
      if (!looksLikeRegistration(input?.value)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!health?.liveMotConfigured) { showRegistrationError('Live MOT lookup is unavailable right now. Please try again shortly.'); return; }
      runRegistrationScan(input.value);
    }, true);
  }

  setInputModes();
  interceptRegistration($('#scan-form'), listingInput);
  interceptRegistration($('#rescan-form'), rescanInput);
  loadHealth();
})();