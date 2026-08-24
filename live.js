(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const listingInput = $('#listing-url');
  const rescanInput = $('#rescan-url');
  const help = $('#url-help');
  let health = null;

  function cleanRegistration(value = '') {
    return String(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
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
      const response = await fetch('/api/health', { headers: { accept: 'application/json' } });
      if (!response.ok) return;
      health = await response.json();
      if (health.liveMotConfigured && help) {
        help.textContent = 'Paste an EV listing link, or enter a UK registration for a live MOT check.';
        help.classList.remove('error');
      }
    } catch {
      // The static demo remains fully usable if the API is unavailable.
    }
  }

  function showRegistrationError(message) {
    if (!help) return;
    help.textContent = message;
    help.classList.add('error');
    listingInput?.focus();
  }

  function showOverlay() {
    const overlay = $('#scan-overlay');
    if (!overlay) return;
    overlay.hidden = false;
    document.body.classList.add('modal-open');
    const title = $('#scan-title');
    const copy = $('#scan-step-copy');
    const progress = $('#scan-progress');
    const count = $('#scan-stage-count');
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
    const shell = $('.app-shell');
    const report = $('#report-view');
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
    const item = tests.find((test) => test.odometerValue != null);
    if (!item) return null;
    const number = Number(item.odometerValue);
    return Number.isFinite(number) ? number : null;
  }

  function formatDate(value) {
    if (!value) return 'Date unavailable';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'short' }).format(date);
  }

  function motRow(test) {
    const defects = Array.isArray(test.defects) ? test.defects : [];
    const advisories = defects.filter((d) => /ADVISORY|MINOR/i.test(d.type || '')).length;
    const serious = defects.filter((d) => d.dangerous || /DANGEROUS|MAJOR/i.test(d.type || '')).length;
    let detail = 'No recorded defects';
    if (serious) detail = `${serious} major/dangerous issue${serious === 1 ? '' : 's'} recorded`;
    else if (advisories) detail = `${advisories} advisory/minor item${advisories === 1 ? '' : 's'}`;
    return `<div class="timeline-item"><i></i><div><b>${formatDate(test.completedDate)} · ${test.result || 'Result unavailable'}</b><span>${detail}</span></div></div>`;
  }

  function setUnknownCard(card, value = 'Unknown', explanation = 'We need the listing or another trusted data source before we can answer this reliably.') {
    if (!card) return;
    const metricValue = $('.metric-value', card);
    if (metricValue) metricValue.textContent = value;
    const paragraphs = $$('p', card);
    if (paragraphs[0]) paragraphs[0].textContent = explanation;
  }

  function applyLiveRegistrationReport(payload) {
    const vehicle = payload.vehicle;
    const mot = vehicle.motIntelligence || {};
    const tests = vehicle.motTests || [];
    const year = yearFromDate(vehicle.firstUsedDate);
    const name = [year, vehicle.make, vehicle.model].filter(Boolean).join(' ') || vehicle.registration;
    const mileage = latestMileage(tests);

    const tag = $('.vehicle-tag');
    if (tag) tag.textContent = 'DVSA VERIFIED';
    const source = $('.source-note');
    if (source) source.textContent = 'Live DVSA vehicle + MOT data';

    const gallery = $('.vehicle-image-demo');
    if (gallery) {
      gallery.classList.remove('has-photo');
      gallery.innerHTML = `<div class="vehicle-tag">DVSA VERIFIED</div><div style="min-height:240px;display:grid;place-items:center;padding:28px;text-align:center;color:#9ba7ba;background:linear-gradient(145deg,#273247,#101727)"><div><strong style="display:block;color:#fff;font-size:1.25rem;margin-bottom:8px">${name}</strong><span>Actual listing photos will appear here when marketplace ingestion is connected.</span></div></div>`;
    }
    const thumbs = $('.gallery-thumbs');
    if (thumbs) thumbs.innerHTML = '<span></span><span></span><span></span><span class="more-thumb">Photos</span>';

    const select = $('#trim-select');
    if (select) {
      select.innerHTML = `<option>${name}</option>`;
      select.disabled = true;
    }
    const meta = $('#trim-meta');
    if (meta) {
      const bits = [vehicle.registration, mileage ? `${mileage.toLocaleString('en-GB')} ${tests[0]?.odometerUnit || 'mi'} at latest MOT` : null, vehicle.fuelType, vehicle.primaryColour].filter(Boolean);
      meta.textContent = bits.join(' · ');
    }

    const price = $('.asking-price');
    if (price) price.innerHTML = '<span>Asking price</span><strong>Not supplied</strong><small style="color:#9ba7ba">Paste-listing pricing comes next</small>';

    const bigScore = $('.big-score');
    if (bigScore) bigScore.innerHTML = '<span class="mini-label">Deal score</span><strong>—</strong><em style="color:#ffc459">Need price + battery data</em>';

    const confidenceRing = $('.confidence-ring');
    const confidence = payload.scoring?.decisionConfidence?.score ?? 40;
    if (confidenceRing) {
      confidenceRing.style.setProperty('--value', String(confidence));
      const span = $('span', confidenceRing);
      if (span) span.textContent = `${confidence}%`;
    }
    const confidenceText = $('.decision-confidence > div:last-child');
    if (confidenceText) confidenceText.innerHTML = `<span class="mini-label">Decision confidence</span><strong>Verified MOT, incomplete deal data</strong><small>${payload.scoring?.decisionConfidence?.reason || 'We still need listing, market and battery information.'}</small>`;

    const quick = $('.quick-verdict');
    if (quick) {
      const title = $('h2', quick);
      const copy = $('p', quick);
      if (title) title.textContent = 'MOT history checked — we still need the advert to judge the deal.';
      if (copy) copy.textContent = mot.summary || 'The registration lookup worked. Price, battery and listing analysis are still unknown.';
      const likes = $('.likes-checks', quick);
      if (likes) likes.innerHTML = `<div><h3>✓ Verified</h3><ul><li>${vehicle.registration}</li><li>${vehicle.make || ''} ${vehicle.model || ''}</li><li>${tests.length} MOT record${tests.length === 1 ? '' : 's'} returned</li></ul></div><div><h3>👀 Still needed</h3><ul><li>Actual listing + asking price</li><li>Battery evidence / estimate</li><li>Actual listing photos and seller claims</li></ul></div>`;
    }

    const metricCards = $$('.report-metrics .metric-rich');
    setUnknownCard(metricCards[0], 'Unknown', 'No asking price or market-comparable feed has been supplied yet.');

    const batteryCard = metricCards[1];
    if (batteryCard) {
      const status = $('.battery-status strong', batteryCard);
      const soh = $('.battery-status span', batteryCard);
      const bar = $('.battery-visual span', batteryCard);
      if (status) status.textContent = 'Unknown';
      if (soh) soh.textContent = 'No measured battery evidence';
      if (bar) bar.style.width = '0%';
      const p = $('p', batteryCard);
      if (p) p.textContent = 'MOT history cannot tell us the battery State of Health. We will never invent an exact SoH from MOT data.';
    }

    const rangeCard = metricCards[2];
    if (rangeCard) {
      const main = $('#range-main');
      if (main) main.textContent = 'Unknown';
      const bars = $('.range-bars', rangeCard);
      if (bars) bars.innerHTML = '<div><span>Waiting for exact EV specification data</span></div>';
      const p = $('.plain-explain', rangeCard);
      if (p) p.innerHTML = '<b>What this means:</b> we have verified the vehicle/MOT identity, but not enough model-specific data to estimate range responsibly.';
    }

    const motCard = metricCards[3];
    if (motCard) {
      const tagEl = $('.data-tag', motCard);
      if (tagEl) { tagEl.textContent = 'DVSA VERIFIED'; tagEl.className = 'data-tag verified'; }
      const timeline = $('.timeline', motCard);
      if (timeline) timeline.innerHTML = tests.slice(0, 5).map(motRow).join('') || '<p>No MOT tests returned.</p>';
      const take = $('.plain-explain', motCard);
      if (take) take.innerHTML = `<b>Our take:</b> ${mot.summary || 'No clear pattern identified.'}`;
    }

    ['.degradation-card','.trim-card','.xray-card','.seller-card','.change-score-card','.effective-card','.fit-score-card','.recommendations-section'].forEach((selector) => {
      const node = $(selector);
      if (node) node.hidden = true;
    });

    const limits = $('.limits-card');
    if (limits) {
      const p = $('p', limits);
      if (p) p.textContent = 'This registration check verifies vehicle/MOT information only. We still need the actual advert, battery evidence, provenance checks and a physical inspection before making a buying decision.';
    }
  }

  async function runRegistrationScan(value) {
    const registration = cleanRegistration(value);
    showOverlay();
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ registration })
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        hideOverlay();
        if (payload.code === 'DVSA_NOT_CONFIGURED') {
          showRegistrationError('The live MOT backend is built, but DVSA access has not been connected yet. Paste a listing link to use demo mode for now.');
          return;
        }
        showRegistrationError(payload.message || 'We could not check that registration right now.');
        return;
      }
      openReport();
      applyLiveRegistrationReport(payload);
    } catch {
      hideOverlay();
      showRegistrationError('The live vehicle service is temporarily unavailable. Paste a listing link to use demo mode.');
    }
  }

  function interceptRegistration(form, input) {
    form?.addEventListener('submit', (event) => {
      if (!looksLikeRegistration(input?.value)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!health?.liveMotConfigured) {
        showRegistrationError('The registration lookup is ready in the backend but DVSA credentials still need to be connected.');
        return;
      }
      runRegistrationScan(input.value);
    }, true);
  }

  setInputModes();
  interceptRegistration($('#scan-form'), listingInput);
  interceptRegistration($('#rescan-form'), rescanInput);
  loadHealth();
})();
