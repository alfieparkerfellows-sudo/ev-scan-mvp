(() => {
  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const escapeHtml = (value = '') => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[char]));
  const money = (value) => Number.isFinite(Number(value)) ? new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(Number(value)) : 'Unavailable';
  const number = (value) => Number.isFinite(Number(value)) ? Number(value).toLocaleString('en-GB') : 'Unavailable';
  const safeUrl = (value) => { try { const url = new URL(String(value || '')); return ['http:','https:'].includes(url.protocol) ? url.toString() : ''; } catch { return ''; } };
  let listingStatus = { loaded:false, available:false, message:'Checking listing-link availability…' };

  const style = document.createElement('style');
  style.textContent = `
    .live-report{max-width:1180px;margin:0 auto;padding:28px 22px 70px;color:var(--text,#fff)}
    .live-report-header{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:20px}.live-report-header .brand{display:flex;align-items:center;gap:8px;text-decoration:none}
    .live-report-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:18px}.live-panel{border:1px solid var(--border,rgba(255,255,255,.1));border-radius:22px;background:rgba(255,255,255,.035);padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.18)}
    .live-hero-photo{overflow:hidden;padding:0;min-height:360px;background:#101827;position:relative}.live-hero-photo img{width:100%;height:100%;min-height:360px;object-fit:cover;display:block}.live-photo-fallback{min-height:360px;display:grid;place-items:center;color:#aab4c5;padding:32px;text-align:center}
    .live-verified{position:absolute;top:14px;left:14px;border-radius:999px;background:rgba(10,17,31,.88);border:1px solid rgba(255,255,255,.16);padding:8px 11px;font-size:.7rem;font-weight:900;letter-spacing:.06em}.live-summary h1{font-size:clamp(1.8rem,4vw,3rem);line-height:1.02;margin:8px 0 12px;letter-spacing:-.045em}
    .live-eyebrow{font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;font-weight:900;color:var(--pink-2,#ff5d93)}.live-meta{color:var(--muted,#9ba7ba);line-height:1.55;margin-bottom:20px}.live-price{display:flex;gap:18px;flex-wrap:wrap;align-items:flex-end;padding:18px 0;border-top:1px solid var(--border,rgba(255,255,255,.1));border-bottom:1px solid var(--border,rgba(255,255,255,.1))}.live-price strong{display:block;font-size:2rem;letter-spacing:-.04em}.live-price span{color:var(--muted,#9ba7ba);font-size:.75rem}
    .live-score-row{display:grid;grid-template-columns:1fr;gap:12px;margin-top:18px}.live-score{border-radius:18px;background:rgba(255,255,255,.04);padding:16px}.live-score b{display:block;font-size:1.8rem}.live-score small{color:var(--muted,#9ba7ba)}.live-verdict{margin-top:18px;font-size:1.05rem;line-height:1.6;color:#e9edf5}
    .live-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:18px}.live-metric h3{font-size:.78rem;color:var(--muted,#9ba7ba);margin:0 0 10px}.live-metric strong{font-size:1.45rem;display:block}.live-metric p{font-size:.78rem;color:var(--muted,#9ba7ba);line-height:1.5;margin:8px 0 0}.live-section{margin-top:18px}.live-section h2{margin:0 0 14px;font-size:1.25rem}.live-section p,.live-section li{color:var(--muted,#9ba7ba);line-height:1.6}.live-list{margin:0;padding-left:20px}.live-list li+li{margin-top:8px}
    .live-evidence{display:flex;gap:8px;flex-wrap:wrap}.live-chip{border:1px solid rgba(102,226,160,.22);background:rgba(102,226,160,.08);color:#77e6aa;border-radius:999px;padding:7px 10px;font-size:.7rem;font-weight:850}.live-chip.estimate{border-color:rgba(255,196,89,.24);background:rgba(255,196,89,.08);color:#ffc459}.live-mot-row{display:grid;grid-template-columns:110px 1fr auto;gap:12px;padding:12px 0;border-bottom:1px solid var(--border,rgba(255,255,255,.08));align-items:center}.live-mot-row:last-child{border-bottom:0}.live-mot-row span{color:var(--muted,#9ba7ba);font-size:.78rem}.live-mot-row b{font-size:.85rem}.live-mot-row em{font-style:normal;font-size:.75rem}.live-note{padding:14px 16px;border-radius:16px;background:rgba(255,196,89,.06);border:1px solid rgba(255,196,89,.18);color:#d9c9a7;line-height:1.55;font-size:.82rem}
    @media(max-width:850px){.live-report-grid{grid-template-columns:1fr}.live-metrics{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){.live-report{padding:18px 14px 55px}.live-panel{padding:17px;border-radius:18px}.live-metrics{grid-template-columns:1fr}.live-hero-photo,.live-hero-photo img,.live-photo-fallback{min-height:245px}}
  `;
  document.head.appendChild(style);

  function looksLikeUrl(value = '') {
    try { const url = new URL(/^https?:\/\//i.test(String(value).trim()) ? String(value).trim() : `https://${String(value).trim()}`); return ['http:','https:'].includes(url.protocol) && url.hostname.includes('.'); } catch { return false; }
  }
  function looksLikeRegistration(value = '') {
    const candidate = String(value || '').toUpperCase().replace(/[^A-Z0-9]/g,'');
    return candidate.length >= 5 && candidate.length <= 8 && /^[A-Z0-9]+$/.test(candidate) && !candidate.includes('.');
  }
  function setHelp(message, error = false) {
    const help = $('#url-help');
    if (!help) return;
    help.textContent = message;
    help.classList.toggle('error',Boolean(error));
  }
  function normaliseInput() {
    [$('#listing-url'),$('#rescan-url')].filter(Boolean).forEach((input) => {
      input.type = 'text'; input.inputMode = 'text'; input.autocapitalize = 'characters'; input.autocomplete = 'off';
      input.placeholder = input.id === 'listing-url' ? 'Paste an EV listing link or registration…' : 'Paste another link or registration…';
    });
    if (listingStatus.loaded) setHelp(listingStatus.message,!listingStatus.available && !/registration/i.test(listingStatus.message));
  }
  async function refreshListingStatus() {
    try {
      const response = await fetch('/api/listing-status',{ headers:{ accept:'application/json' }, cache:'no-store' });
      const data = await response.json();
      listingStatus = { loaded:true, ...data };
    } catch {
      listingStatus = { loaded:true, available:false, message:'Listing-link availability cannot be confirmed right now. UK registration checks are still available.' };
    }
    setHelp(listingStatus.message,!listingStatus.available);
    return listingStatus;
  }

  function showOverlay() {
    const overlay = $('#scan-overlay'); if (!overlay) return;
    overlay.hidden = false; document.body.classList.add('modal-open');
    if ($('#scan-title')) $('#scan-title').textContent = 'Verifying the advert…';
    if ($('#scan-step-copy')) $('#scan-step-copy').textContent = 'Cross-checking the listing against available vehicle and official MOT data.';
    if ($('#scan-progress')) $('#scan-progress').style.width = '68%';
    if ($('#scan-stage-count')) $('#scan-stage-count').textContent = 'Strict evidence check';
  }
  function hideOverlay() { const overlay = $('#scan-overlay'); if (overlay) overlay.hidden = true; document.body.classList.remove('modal-open'); }
  function questionList(items = []) { return (Array.isArray(items) ? items : []).map((item) => `<li>${escapeHtml(item)}</li>`).join(''); }
  function motRows(tests = []) {
    if (!Array.isArray(tests) || !tests.length) return '<p>No MOT rows were returned.</p>';
    return tests.slice(0,6).map((test) => {
      const date = test?.completedDate ? new Date(test.completedDate) : null;
      const label = date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat('en-GB',{month:'short',year:'numeric'}).format(date) : 'Unknown date';
      const defects = Array.isArray(test?.defects) ? test.defects : [];
      const major = defects.filter((item) => item?.dangerous || /MAJOR|DANGEROUS/i.test(String(item?.type || ''))).length;
      const advisory = defects.filter((item) => /ADVISORY|MINOR/i.test(String(item?.type || ''))).length;
      const detail = major ? `${major} major/dangerous` : advisory ? `${advisory} advisory/minor` : 'No recorded defects';
      const mileage = Number.isFinite(Number(test?.odometerValue)) ? `${number(test.odometerValue)} ${escapeHtml(test?.odometerUnit || 'mi')}` : 'Mileage unavailable';
      return `<div class="live-mot-row"><span>${escapeHtml(label)}</span><b>${escapeHtml(test?.result || 'Result unavailable')} · ${escapeHtml(mileage)}</b><em>${escapeHtml(detail)}</em></div>`;
    }).join('');
  }

  function renderLiveReport(payload) {
    if (!payload?.ok || payload?.quality?.passed !== true) throw new Error('QUALITY_GATE_FAILED');
    const report = $('#report-view'), shell = $('.app-shell');
    if (!report || !shell) throw new Error('REPORT_VIEW_MISSING');
    const listing = payload.listing || {}, confidence = payload.scoring?.decisionConfidence || {}, battery = payload.battery || {}, mot = payload.mot || {};
    const image = safeUrl((listing.images || [])[0]), sourceUrl = safeUrl(listing.sourceUrl);
    const providers = (payload.verification?.extractionProviders || []).map((item) => `<span class="live-chip">${escapeHtml(item)}</span>`).join('');
    const modelChecks = payload.modelContext?.checks?.length ? `<section class="live-panel live-section"><h2>Model-specific checks</h2><p>${escapeHtml(payload.modelContext.summary || '')}</p><ul class="live-list">${questionList(payload.modelContext.checks)}</ul></section>` : '';
    window.__EVSCAN_LAST_REPORT = payload;
    report.innerHTML = `<main class="live-report">
      <header class="live-report-header"><button class="ghost-button compact" type="button" data-live-close>← Back</button><div class="brand"><span class="brand-mark">⚡</span><span>EV Scan</span></div>${sourceUrl ? `<a class="ghost-button compact" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">Open advert ↗</a>` : '<span></span>'}</header>
      <section class="live-report-grid"><article class="live-panel live-hero-photo"><div class="live-verified">STRICT CHECK PASSED</div>${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(payload.vehicleName || 'Scanned EV')}">` : '<div class="live-photo-fallback">Vehicle photo verified from the advert.</div>'}</article>
      <article class="live-panel live-summary"><div class="live-eyebrow">Live verified scan</div><h1>${escapeHtml(payload.vehicleName || 'Used EV')}</h1><div class="live-meta">${escapeHtml(listing.registration || '')} · ${number(listing.mileage)} miles · ${escapeHtml(listing.fuelType || 'Electric')}${listing.dealerName ? ` · ${escapeHtml(listing.dealerName)}` : ''}</div><div class="live-price"><div><span>Advert asking price</span><strong>${money(listing.price)}</strong></div><div><span>Market comparison</span><strong>Not claimed</strong></div></div><div class="live-score-row"><div class="live-score"><small>Decision confidence</small><b>${escapeHtml(confidence.score ?? '—')}%</b><small>Released only after the strict evidence gate</small></div></div><p class="live-verdict">${escapeHtml(payload.verdict || '')}</p></article></section>
      <section class="live-metrics"><article class="live-panel live-metric"><h3>Battery specification</h3><strong>${escapeHtml(battery.capacityKwh)} kWh</strong><p>Advert-backed specification. Battery State of Health is not guessed.</p></article><article class="live-panel live-metric"><h3>EV range specification</h3><strong>${number(battery.ratedOrListedRangeMiles)} mi</strong><p>Listed/rated figure from the available data.</p></article><article class="live-panel live-metric"><h3>MOT pattern</h3><strong>${escapeHtml(mot.score ?? '—')}/100</strong><p>${escapeHtml(mot.summary || '')}</p></article></section>
      <section class="live-report-grid live-section"><article class="live-panel"><h2>Why EV Scan released this report</h2><div class="live-evidence">${providers}<span class="live-chip">DVSA verified</span><span class="live-chip estimate">No unverified market score</span><span class="live-chip estimate">Battery SoH not measured</span></div><p>The advert was matched to a UK registration and checked against the official vehicle/MOT record. Unsupported conclusions are deliberately left out.</p><p class="live-note">${escapeHtml(battery.note || '')}</p></article><article class="live-panel"><h2>Questions worth asking the seller</h2><ul class="live-list">${questionList(payload.sellerQuestions)}</ul></article></section>
      <section class="live-panel live-section"><h2>Verified MOT history</h2>${motRows(payload.motTests)}</section>${modelChecks}<section class="live-panel live-section"><h2>What this scan still cannot prove remotely</h2><ul class="live-list">${questionList(payload.limitations)}</ul></section>
    </main>`;
    shell.hidden = true; report.hidden = false; hideOverlay(); document.body.classList.remove('modal-open'); window.scrollTo({top:0,behavior:'auto'});
  }

  async function runLiveScan(value) {
    const raw = String(value || '').trim();
    if (!looksLikeUrl(raw)) { setHelp('Enter a valid UK registration or paste the full vehicle listing link.',true); return; }
    const status = listingStatus.loaded ? listingStatus : await refreshListingStatus();
    if (!status.available) { setHelp(status.message,true); return; }
    const listingUrl = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    setHelp('Checking the listing against available verification sources…'); showOverlay();
    try {
      const response = await fetch('/api/scan',{ method:'POST', headers:{'content-type':'application/json',accept:'application/json'}, body:JSON.stringify({ listingUrl }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) {
        hideOverlay();
        if (payload?.listingStatus) listingStatus = { loaded:true, ...payload.listingStatus };
        setHelp(payload?.message || 'EV Scan could not verify this listing strongly enough to produce a reliable report. No report was generated.',true);
        return;
      }
      if (payload?.listingStatus) listingStatus = { loaded:true, ...payload.listingStatus };
      renderLiveReport(payload);
    } catch { hideOverlay(); setHelp('EV Scan could not complete all listing verification checks right now. No report was generated. UK registration checks are still available.',true); }
  }

  document.addEventListener('submit',(event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !['scan-form','rescan-form'].includes(form.id)) return;
    const input = form.id === 'scan-form' ? $('#listing-url') : $('#rescan-url');
    const value = input?.value || '';
    if (looksLikeRegistration(value) && !looksLikeUrl(value)) return; // Let live.js handle registration-only checks.
    event.preventDefault(); event.stopImmediatePropagation(); runLiveScan(value);
  },true);

  document.addEventListener('click',(event) => {
    const close = event.target?.closest?.('[data-live-close]'); if (!close) return;
    event.preventDefault(); const report = $('#report-view'), shell = $('.app-shell'); if (report) report.hidden = true; if (shell) shell.hidden = false; window.scrollTo({top:0,behavior:'smooth'});
  });

  normaliseInput();
  refreshListingStatus().finally(normaliseInput);
  window.addEventListener('load',() => { normaliseInput(); refreshListingStatus(); },{once:true});
})();
