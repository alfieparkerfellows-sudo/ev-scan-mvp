(() => {
  const $ = (sel, root = document) => root?.querySelector?.(sel) || null;
  const $$ = (sel, root = document) => root?.querySelectorAll ? [...root.querySelectorAll(sel)] : [];

  const style = document.createElement('style');
  style.textContent = `
    /* Homepage density + centred scan action */
    #home.hero{
      min-height:auto!important;
      grid-template-columns:minmax(0,1fr) minmax(390px,1fr)!important;
      grid-template-areas:"copy visual" "actions actions";
      align-items:center!important;
      column-gap:48px!important;
      row-gap:24px!important;
      padding-top:44px!important;
      padding-bottom:28px!important;
    }
    #home .hero-copy{grid-area:copy;min-width:0}
    #home .hero-visual{grid-area:visual;min-height:430px!important}
    #home .hero-center-actions{grid-area:actions;width:min(760px,100%);justify-self:center;text-align:center;margin:0 auto}
    #home .hero-center-actions .scan-form{width:100%;max-width:none;margin:0 auto}
    #home .hero-center-actions .hero-meta,#home .hero-center-actions .secondary-path{justify-content:center}
    #home .hero-center-actions .input-help{text-align:center}
    #home .hero-subtitle{max-width:640px!important}

    .trust-preview-section{padding:10px 0 34px!important}
    .content-section,.report-preview,.finder-section,.trust-section{padding-top:52px!important;padding-bottom:52px!important}
    .trust-section{display:none!important}
    .section-heading{margin-bottom:26px!important}
    .steps-grid{gap:14px!important}
    #how-it-works .info-card{min-height:190px!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:flex-start!important;padding:28px!important}
    #how-it-works .info-card .step-no{display:block!important;margin:0 0 18px!important}
    #how-it-works .info-card h3{margin:0 0 10px!important}
    #how-it-works .info-card p{margin:0!important}
    .finder-card{padding:34px!important}.trust-card{padding:34px!important}.report-preview .metric-grid{margin-top:14px!important}.trust-preview-head{padding-bottom:20px!important}.demo-stats{padding-top:20px!important}

    /* Dynamic report section spacing */
    .partner-card{padding:32px!important}
    .scan-feedback-card{margin-top:14px;margin-bottom:44px;padding:32px!important;overflow:hidden;position:relative}
    .scan-feedback-card::before{content:"";position:absolute;width:360px;height:280px;border-radius:50%;background:rgba(245,15,93,.12);filter:blur(80px);right:-180px;top:-180px;pointer-events:none}
    .scan-feedback-inner{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,.8fr) minmax(420px,1.2fr);gap:34px;align-items:center}
    .scan-feedback-copy h2{margin:8px 0 10px;font-size:clamp(1.7rem,3vw,2.65rem);line-height:1.03;letter-spacing:-.045em}
    .scan-feedback-copy p{margin:0;color:var(--muted);line-height:1.6;max-width:540px}
    .scan-feedback-form{display:grid;gap:14px;min-width:0}
    .feedback-stars{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    .feedback-star{border:0;background:transparent;color:#4b5568;font-size:2rem;line-height:1;padding:2px;transition:transform .15s ease,color .15s ease,filter .15s ease}
    .feedback-star:hover,.feedback-star.is-active{color:#ffc459;filter:drop-shadow(0 0 9px rgba(255,196,89,.45));transform:translateY(-1px) scale(1.06)}
    .feedback-rating-label{color:var(--muted);font-size:.74rem;min-height:18px}
    .scan-feedback-form textarea{width:100%;min-height:96px;resize:vertical;border:1px solid var(--border);border-radius:14px;padding:14px 15px;color:#fff;background:#0b1323;outline:none;line-height:1.5}
    .scan-feedback-form textarea:focus{border-color:rgba(245,15,93,.5);box-shadow:0 0 0 3px rgba(245,15,93,.08)}
    .feedback-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
    .feedback-note{color:var(--muted-2);font-size:.67rem;line-height:1.4}
    .feedback-thanks{padding:24px;border:1px solid rgba(71,217,140,.18);background:rgba(71,217,140,.07);border-radius:16px}
    .feedback-thanks strong{display:block;color:var(--green);font-size:1.2rem;margin-bottom:5px}.feedback-thanks span{color:var(--muted);font-size:.8rem;line-height:1.5}

    /* Dedicated number-plate / DVSA report */
    .registration-only-mode .quick-verdict,
    .registration-only-mode .report-metrics,
    .registration-only-mode .report-grid-two,
    .registration-only-mode .effective-card,
    .registration-only-mode .insurance-card,
    .registration-only-mode .fit-score-card,
    .registration-only-mode .recommendations-section,
    .registration-only-mode .limits-card{display:none!important}
    .registration-only-mode .report-hero{grid-template-columns:minmax(300px,.72fr) minmax(0,1.28fr);padding:18px;gap:20px}
    .registration-only-mode .gallery-thumbs{display:none!important}
    .registration-only-mode .vehicle-summary{padding:14px 14px 14px 2px}
    .registration-only-mode .vehicle-title-row{grid-template-columns:1fr!important}
    .registration-only-mode .asking-price{display:none!important}
    .registration-only-mode .score-band{margin-top:25px;padding-top:22px;display:block!important}
    .registration-only-mode .vehicle-meta{font-size:.82rem;line-height:1.55}
    .reg-vehicle-visual{min-height:285px;border-radius:18px;border:1px solid var(--border);background:radial-gradient(circle at 68% 28%,rgba(245,15,93,.19),transparent 35%),linear-gradient(145deg,#202a3d,#0b1220 68%);display:grid;align-content:center;justify-items:center;text-align:center;padding:28px;position:relative;overflow:hidden}
    .reg-vehicle-visual::before{content:"";width:150px;height:150px;border:1px solid rgba(245,15,93,.25);border-radius:50%;position:absolute;box-shadow:0 0 70px rgba(245,15,93,.12)}
    .reg-check-icon{position:relative;z-index:1;width:58px;height:58px;border-radius:18px;background:rgba(71,217,140,.12);border:1px solid rgba(71,217,140,.22);color:var(--green);display:grid;place-items:center;font-size:1.55rem;font-weight:900;margin-bottom:18px}
    .reg-vehicle-visual strong{position:relative;z-index:1;font-size:clamp(1.45rem,2.2vw,2.15rem);letter-spacing:-.04em}
    .reg-vehicle-visual span{position:relative;z-index:1;color:var(--muted);font-size:.76rem;line-height:1.5;margin-top:7px}
    .reg-verified-badge{position:absolute!important;left:14px;top:14px;margin:0!important;padding:7px 10px;border-radius:9px;background:rgba(7,11,21,.72);border:1px solid rgba(71,217,140,.2);color:var(--green)!important;font-size:.62rem!important;font-weight:900;letter-spacing:.09em;text-transform:uppercase}
    .reg-completeness{display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:center;border:1px solid var(--border);border-radius:16px;background:#0b1323;padding:16px}
    .reg-completeness-ring{--value:40;width:70px;height:70px;border-radius:50%;display:grid;place-items:center;position:relative;background:conic-gradient(var(--pink) calc(var(--value)*1%),rgba(255,255,255,.08) 0)}
    .reg-completeness-ring::after{content:"";position:absolute;inset:7px;background:#0b1323;border-radius:inherit}.reg-completeness-ring b{position:relative;z-index:1;font-size:.9rem}
    .reg-completeness-copy span{display:block;color:var(--muted);font-size:.65rem;text-transform:uppercase;letter-spacing:.1em;font-weight:850}.reg-completeness-copy strong{display:block;margin:5px 0 3px;font-size:.95rem}.reg-completeness-copy small{display:block;color:var(--muted);font-size:.72rem;line-height:1.45}

    .registration-check{display:grid;gap:14px;margin-top:14px}
    .reg-kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
    .reg-kpi{padding:20px;min-width:0}.reg-kpi span{display:block;color:var(--muted);font-size:.68rem;text-transform:uppercase;letter-spacing:.08em;font-weight:800}.reg-kpi strong{display:block;margin:10px 0 4px;font-size:1.42rem;letter-spacing:-.035em;overflow-wrap:anywhere}.reg-kpi small{display:block;color:var(--muted-2);font-size:.68rem;line-height:1.45}
    .reg-alert-card{padding:24px;display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:start}.reg-alert-icon{width:44px;height:44px;border-radius:13px;display:grid;place-items:center;font-size:1.05rem;background:rgba(255,196,89,.1);border:1px solid rgba(255,196,89,.18);color:var(--amber)}.reg-alert-card.is-clear .reg-alert-icon{background:rgba(71,217,140,.1);border-color:rgba(71,217,140,.18);color:var(--green)}.reg-alert-card h2{margin:3px 0 8px;font-size:1.28rem;letter-spacing:-.03em}.reg-alert-card p{margin:0;color:var(--muted);line-height:1.6;font-size:.84rem}
    .reg-two-col{display:grid;grid-template-columns:1.15fr .85fr;gap:14px}.reg-detail-card{padding:26px;min-width:0}.reg-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:20px}.reg-card-head h2{margin:7px 0 0;font-size:1.38rem;letter-spacing:-.035em}.reg-card-head p{margin:7px 0 0;color:var(--muted);font-size:.76rem;line-height:1.5}.reg-source-tag{flex:0 0 auto;padding:6px 8px;border-radius:8px;background:rgba(71,217,140,.1);border:1px solid rgba(71,217,140,.16);color:var(--green);font-size:.56rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
    .reg-mileage-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}.reg-mileage-summary div{padding:11px;border:1px solid var(--border);border-radius:12px;background:#0b1323}.reg-mileage-summary span{display:block;color:var(--muted-2);font-size:.58rem}.reg-mileage-summary b{display:block;margin-top:4px;font-size:.79rem}.reg-mileage-chart{width:100%;height:auto;display:block}.reg-chart-axis{stroke:rgba(255,255,255,.10);stroke-width:1}.reg-chart-line{fill:none;stroke:var(--pink);stroke-width:4;stroke-linecap:round;stroke-linejoin:round}.reg-chart-dot{fill:#fff;stroke:var(--pink);stroke-width:3}.reg-chart-label{fill:#7f8ba0;font-size:11px}
    .reg-model-card{display:flex;flex-direction:column}.reg-model-card .reg-model-name{font-size:1.55rem;font-weight:900;letter-spacing:-.04em;margin:4px 0 10px}.reg-model-card p{color:var(--muted);font-size:.8rem;line-height:1.6;margin:0 0 16px}.reg-model-points{display:grid;gap:8px;margin-bottom:18px}.reg-model-points span{display:flex;gap:9px;align-items:flex-start;padding:10px 11px;border:1px solid var(--border);border-radius:11px;background:#0b1323;color:#cbd3df;font-size:.72rem;line-height:1.45}.reg-model-points span::before{content:"✓";color:var(--pink-2);font-weight:900}.reg-model-link{margin-top:auto;display:flex;align-items:center;justify-content:center;min-height:44px;border-radius:12px;border:1px solid rgba(245,15,93,.24);background:var(--pink-soft);color:#fff;font-size:.75rem;font-weight:850}
    .reg-mot-list{display:grid;gap:8px}.reg-mot-row{display:grid;grid-template-columns:13px minmax(0,1fr) auto;gap:12px;align-items:start;padding:13px 14px;border:1px solid var(--border);border-radius:13px;background:#0b1323}.reg-mot-dot{width:10px;height:10px;border-radius:50%;background:var(--green);box-shadow:0 0 0 5px rgba(71,217,140,.08);margin-top:5px}.reg-mot-row.is-fail .reg-mot-dot{background:var(--red);box-shadow:0 0 0 5px rgba(255,100,100,.08)}.reg-mot-row b{display:block;font-size:.8rem}.reg-mot-row span{display:block;color:var(--muted);font-size:.7rem;line-height:1.45;margin-top:3px}.reg-mot-mileage{color:#dbe1eb!important;text-align:right!important;white-space:nowrap!important;font-size:.68rem!important}.reg-mot-extra[hidden]{display:none!important}.reg-history-toggle{width:100%;margin-top:10px;min-height:42px;border-radius:11px;border:1px solid var(--border);background:rgba(255,255,255,.04);color:#fff;font-weight:800;font-size:.72rem}
    .reg-checklist{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.reg-check-item{display:grid;grid-template-columns:28px 1fr;gap:10px;align-items:start;padding:13px;border:1px solid var(--border);border-radius:13px;background:#0b1323}.reg-check-item i{width:28px;height:28px;border-radius:9px;display:grid;place-items:center;background:rgba(245,15,93,.10);color:var(--pink-2);font-style:normal;font-weight:900}.reg-check-item b{display:block;font-size:.76rem;margin-bottom:3px}.reg-check-item span{display:block;color:var(--muted);font-size:.68rem;line-height:1.45}
    .reg-complete-card{padding:28px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:28px;align-items:center;background:linear-gradient(140deg,rgba(245,15,93,.12),rgba(255,255,255,.02));border-color:rgba(245,15,93,.19)}.reg-complete-card h2{margin:7px 0 8px;font-size:1.55rem;letter-spacing:-.04em}.reg-complete-card p{margin:0;color:var(--muted);line-height:1.55;font-size:.8rem;max-width:720px}.reg-missing-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:14px}.reg-missing-chips span{padding:7px 9px;border-radius:999px;border:1px solid var(--border);background:#0b1323;color:#c6cedb;font-size:.64rem}.reg-complete-actions{display:grid;gap:8px;min-width:205px}.reg-complete-actions a,.reg-complete-actions button{min-height:44px;border-radius:12px;padding:0 16px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:.72rem;font-weight:850}.reg-complete-actions a{background:linear-gradient(135deg,var(--pink),#ff2f73);color:#fff}.reg-complete-actions button{border:1px solid var(--border);background:rgba(255,255,255,.045);color:#fff}
    .reg-trust-note{padding:22px}.reg-trust-note h2{margin:6px 0 8px;font-size:1.15rem}.reg-trust-note p{margin:0;color:var(--muted);font-size:.76rem;line-height:1.6}

    @media(max-width:980px){
      #home.hero{grid-template-columns:1fr!important;grid-template-areas:"copy" "actions" "visual";row-gap:20px!important}
      #home .hero-copy{width:min(760px,100%);margin:0 auto}#home .hero-center-actions{width:min(760px,100%)}#home .hero-visual{width:min(760px,100%);margin:0 auto;min-height:410px!important}
      .scan-feedback-inner{grid-template-columns:1fr;gap:22px}.reg-kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.reg-two-col{grid-template-columns:1fr}.registration-only-mode .report-hero{grid-template-columns:1fr}.reg-complete-card{grid-template-columns:1fr}.reg-complete-actions{grid-template-columns:1fr 1fr;min-width:0}
    }
    @media(max-width:720px){
      #home.hero{padding-top:26px!important;padding-bottom:18px!important;row-gap:16px!important}#home .hero-center-actions{text-align:left}#home .hero-center-actions .hero-meta,#home .hero-center-actions .secondary-path{justify-content:flex-start}#home .hero-center-actions .input-help{text-align:left}#home .hero-visual{min-height:330px!important}#home .hero-subtitle{max-width:none!important}
      .trust-preview-section{padding:8px 0 22px!important}.content-section,.report-preview,.finder-section,.trust-section{padding-top:34px!important;padding-bottom:34px!important}.section-heading{margin-bottom:20px!important}#how-it-works .info-card{min-height:auto!important;padding:24px!important}#how-it-works .info-card .step-no{margin-bottom:14px!important}.finder-card,.trust-card{padding:24px!important}
      .partner-card{padding:22px!important}.scan-feedback-card{padding:22px!important;margin-bottom:28px}.scan-feedback-inner{gap:18px}.feedback-star{font-size:1.85rem}.feedback-actions .primary-button{width:100%}
      .registration-only-mode .report-hero{padding:12px;gap:13px}.registration-only-mode .vehicle-summary{padding:8px 5px 10px}.reg-vehicle-visual{min-height:205px;border-radius:14px;padding:22px}.reg-vehicle-visual::before{width:120px;height:120px}.reg-check-icon{width:50px;height:50px;border-radius:15px;font-size:1.25rem;margin-bottom:13px}.reg-vehicle-visual strong{font-size:1.45rem}.reg-completeness{padding:13px}.reg-completeness-ring{width:62px;height:62px}.registration-check{gap:10px;margin-top:10px}.reg-kpi-grid{gap:8px}.reg-kpi{padding:15px}.reg-kpi strong{font-size:1.15rem}.reg-alert-card{padding:18px;grid-template-columns:38px 1fr;gap:12px}.reg-alert-icon{width:38px;height:38px;border-radius:11px}.reg-alert-card h2{font-size:1.08rem}.reg-detail-card{padding:18px}.reg-card-head{margin-bottom:15px}.reg-card-head h2{font-size:1.16rem}.reg-mileage-summary{grid-template-columns:1fr 1fr 1fr;gap:6px}.reg-mileage-summary div{padding:9px 7px}.reg-mileage-summary b{font-size:.7rem}.reg-mot-row{grid-template-columns:12px minmax(0,1fr);gap:10px}.reg-mot-mileage{grid-column:2;text-align:left!important}.reg-checklist{grid-template-columns:1fr;gap:7px}.reg-complete-card{padding:20px;gap:18px}.reg-complete-card h2{font-size:1.3rem}.reg-complete-actions{grid-template-columns:1fr}.reg-trust-note{padding:18px}
    }
  `;
  document.head.appendChild(style);

  const MODEL_GUIDES = [
    { test:/TESLA\s+MODEL\s*3/i, path:'/cars/tesla/model-3', note:'Confirm the exact battery/drive version before comparing range, price or warranty.', points:['Check exact variant and remaining battery/drive warranty.','Inspect tyres and verify charging/app functions.'] },
    { test:/TESLA\s+MODEL\s*Y/i, path:'/cars/tesla/model-y', note:'Exact variant and wheel size can materially change range, ride, tyre cost and value.', points:['Compare RWD, Long Range and Performance like-for-like.','Check tyres, charging and app/account transfer.'] },
    { test:/HYUNDAI\s+IONIQ\s*5/i, path:'/cars/hyundai/ioniq-5', note:'Battery/version and charging history matter, and applicable ICCU campaign work should be checked on the individual car.', points:['Confirm exact battery/version and charging operation.','Check applicable recall/campaign completion and 12V history.'] },
    { test:/KIA\s+EV6/i, path:'/cars/kia/ev6', note:'The EV6 can be excellent for long journeys, but exact RWD/AWD/GT specification and recall status matter.', points:['Confirm exact drivetrain/version and warranty position.','Check applicable ICCU recall work and charging operation.'] },
    { test:/MG\s+MG4/i, path:'/cars/mg/mg4-ev', note:'The MG4 is strongest when the price advantage is real; exact battery and trim should be confirmed first.', points:['Confirm battery size and trim rather than relying on the headline.','Check software, charging, tyres and driver-assistance behaviour.'] },
    { test:/VOLKSWAGEN\s+ID\.?\s*3/i, path:'/cars/volkswagen/id-3', note:'Battery size, equipment and software history can differ significantly between used ID.3s.', points:['Confirm exact battery/equipment specification.','Check software stability, charging, tyres and suspension history.'] },
    { test:/NISSAN\s+LEAF/i, path:'/cars/nissan/leaf', note:'Used LEAFs can have different battery sizes, range and charging capability. Confirm the exact battery/version before relying on any range estimate.', points:['Ask for battery-health evidence rather than assuming condition from mileage.','Confirm charging cables, charge-port operation and exact battery/version.'] },
    { test:/POLESTAR\s+2/i, path:'/cars/polestar/2', note:'Battery, motor layout and equipment vary by version, so identify the exact derivative before comparing value.', points:['Confirm exact Single/Dual Motor version and battery.','Check tyres, charging, software and remaining warranty.'] },
    { test:/SKODA\s+ENYAQ/i, path:'/cars/skoda/enyaq', note:'Battery size and trim make a large difference to range, equipment and used value.', points:['Confirm exact battery/trim and charging specification.','Check tyres, software, charging and service history.'] },
    { test:/KIA\s+(NIRO|E-?NIRO)/i, path:'/cars/kia/niro-ev', note:'Identify the exact generation/version and battery before comparing range and price.', points:['Confirm battery/version and remaining warranty.','Check charging, tyres and full service history.'] }
  ];

  function escapeHtml(value = '') {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }

  function safeArray(value) { return Array.isArray(value) ? value : []; }
  function safeNumber(value, fallback = null) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }
  function cleanText(value, fallback = '') { const text = value == null ? '' : String(value).trim(); return text || fallback; }
  function cleanRegistration(value = '') { return String(value).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8); }

  function formatMonth(value) {
    if (!value) return 'Date unavailable';
    const d = new Date(value); if (Number.isNaN(d.getTime())) return 'Date unavailable';
    return new Intl.DateTimeFormat('en-GB',{month:'short',year:'numeric'}).format(d);
  }
  function formatFullDate(value) {
    if (!value) return 'Unknown';
    const d = new Date(value); if (Number.isNaN(d.getTime())) return 'Unknown';
    return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric'}).format(d);
  }
  function yearFromDate(value) {
    const d = new Date(value || ''); const y = d.getFullYear(); return Number.isFinite(y) ? String(y) : '';
  }
  function formatMileage(value, unit = 'mi') {
    const n = safeNumber(value); return n == null ? 'Unknown' : `${Math.round(n).toLocaleString('en-GB')} ${cleanText(unit,'mi')}`;
  }

  function centreHeroActions() {
    const hero = $('#home'); const copy = $('.hero-copy', hero || document);
    if (!hero || !copy || $('.hero-center-actions', hero)) return;
    const form = $('#scan-form'); const meta = $('.hero-meta', copy); const secondary = $('.secondary-path', copy);
    if (!form) return;
    const actions = document.createElement('div'); actions.className = 'hero-center-actions'; actions.appendChild(form);
    if (meta) {
      if (![...meta.children].some(item => item.textContent.trim() === 'Insurance estimate')) { const insurance = document.createElement('span'); insurance.textContent = 'Insurance estimate'; meta.appendChild(insurance); }
      actions.appendChild(meta);
    }
    if (secondary) actions.appendChild(secondary); hero.appendChild(actions);
  }

  function updateHomepageCopy() {
    const heroSubtitle = $('#home .hero-subtitle');
    if (heroSubtitle) heroSubtitle.innerHTML = 'Paste the listing. We’ll explain the price, battery, real-world range,<br>MOT history and estimated insurance cost.';
    const cards = $$('#how-it-works .info-card'); const middleCopy = cards[1]?.querySelector('p');
    if (middleCopy) middleCopy.textContent = 'Price, battery confidence, real-world range, insurance estimate, MOT patterns and model-specific risks.';
  }

  function feedbackStorage() {
    try { const parsed = JSON.parse(localStorage.getItem('evscan_feedback_v1') || '[]'); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
  }
  function saveFeedback(item) {
    try { const current = feedbackStorage(); current.push(item); localStorage.setItem('evscan_feedback_v1', JSON.stringify(current.slice(-100))); return true; } catch { return false; }
  }

  function mountFeedback() {
    if ($('#scan-feedback') || !$('.report-main')) return;
    const main = $('.report-main'); const section = document.createElement('section'); section.id = 'scan-feedback'; section.className = 'report-card scan-feedback-card';
    section.innerHTML = `<div class="scan-feedback-inner"><div class="scan-feedback-copy"><span class="mini-label">Quick feedback</span><h2>How useful was this scan?</h2><p>Tap a star and, if you want, leave a short comment. It should take about five seconds.</p></div><form class="scan-feedback-form" id="scan-feedback-form"><div><div class="feedback-stars" role="radiogroup" aria-label="Rate this scan out of five stars">${[1,2,3,4,5].map(n => `<button class="feedback-star" type="button" role="radio" aria-checked="false" data-rating="${n}" aria-label="${n} star${n === 1 ? '' : 's'}">★</button>`).join('')}</div><div class="feedback-rating-label" id="feedback-rating-label">Choose 1–5 stars</div></div><textarea id="feedback-comment" maxlength="700" placeholder="Optional: what did you like, or what could we improve?"></textarea><div class="feedback-actions"><button class="primary-button compact" type="submit">Send quick review</button><span class="feedback-note">Prototype feedback is saved on this device for now.</span></div></form></div>`;
    main.appendChild(section);
    let rating = 0; const stars = $$('.feedback-star', section); const label = $('#feedback-rating-label', section); const words = ['', 'Not very useful', 'Could be better', 'Helpful', 'Very helpful', 'Excellent'];
    function paint(value) { stars.forEach((star,index)=>{const active=index<value;star.classList.toggle('is-active',active);star.setAttribute('aria-checked',String(Number(star.dataset.rating)===value));}); if(label) label.textContent=value?`${value}/5 · ${words[value]}`:'Choose 1–5 stars'; }
    stars.forEach(star=>{star.addEventListener('mouseenter',()=>paint(Number(star.dataset.rating)));star.addEventListener('focus',()=>paint(Number(star.dataset.rating)));star.addEventListener('click',()=>{rating=Number(star.dataset.rating);paint(rating);});});
    $('.feedback-stars',section)?.addEventListener('mouseleave',()=>paint(rating));
    $('#scan-feedback-form',section)?.addEventListener('submit',event=>{event.preventDefault();if(!rating){if(label){label.textContent='Pick a star rating first';label.style.color='#ff8a8a';}stars[0]?.focus();return;}const comment=($('#feedback-comment',section)?.value||'').trim();const vehicle=$('#trim-select')?.selectedOptions?.[0]?.textContent?.trim()||'EV scan';saveFeedback({rating,comment,vehicle,createdAt:new Date().toISOString()});const inner=$('.scan-feedback-inner',section);if(inner)inner.innerHTML=`<div class="feedback-thanks"><strong>Thanks — that was it.</strong><span>Your ${rating}-star rating${comment?' and comment':''} has been saved. Once the live feedback database is connected, this same form can feed genuine EV Scan reviews and statistics.</span></div>`;});
  }

  function defectSummary(test = {}) {
    const defects = safeArray(test.defects); const serious = defects.filter(d => d?.dangerous || /DANGEROUS|MAJOR/i.test(cleanText(d?.type))).length; const minor = defects.filter(d => /ADVISORY|MINOR/i.test(cleanText(d?.type))).length;
    if (serious) return `${serious} major/dangerous issue${serious===1?'':'s'} recorded`;
    if (minor) return `${minor} advisory/minor item${minor===1?'':'s'}`;
    return 'No recorded defects';
  }

  function motHistorySignal(mot = {}, tests = []) {
    if (safeNumber(mot.mileageAnomalies,0) > 0) return { label:'Mileage needs checking', icon:'!', clear:false };
    if (safeNumber(mot.dangerousCount,0) > 0) return { label:'Serious history present', icon:'!', clear:false };
    if (safeArray(mot.repeatedThemes).length) return { label:'Repeated issue pattern', icon:'↻', clear:false };
    const fails = safeNumber(mot.failCount,0);
    if (fails > 1) return { label:'Several historic failures', icon:'!', clear:false };
    if (tests.length) return { label:'No repeated red flag found', icon:'✓', clear:true };
    return { label:'Limited MOT history', icon:'?', clear:false };
  }

  function mileageStats(tests = []) {
    const points = safeArray(tests).map(t => ({ date:new Date(t?.completedDate || ''), mileage:safeNumber(t?.odometerValue), unit:cleanText(t?.odometerUnit,'mi') })).filter(p => p.mileage != null && !Number.isNaN(p.date.getTime())).sort((a,b)=>a.date-b.date);
    if (!points.length) return { points:[], latest:null, oldest:null, annual:null, distance:null, unit:'mi' };
    const oldest = points[0], latest = points[points.length-1]; const years = (latest.date-oldest.date)/(365.25*24*60*60*1000); const distance = latest.mileage-oldest.mileage; const annual = years > .5 && distance >= 0 ? Math.round(distance/years) : null;
    return { points, latest, oldest, annual, distance:distance>=0?distance:null, unit:latest.unit || 'mi' };
  }

  function mileageSvg(stats) {
    const points = stats.points || [];
    if (points.length < 2) return '<div style="color:var(--muted);font-size:.78rem;line-height:1.55;padding:18px 0">Not enough historical mileage readings were returned to draw a useful trend yet.</div>';
    const w=720,h=230,left=46,right=22,top=22,bottom=38; const minM=Math.min(...points.map(p=>p.mileage)); const maxM=Math.max(...points.map(p=>p.mileage)); const span=Math.max(1,maxM-minM); const start=points[0].date.getTime(), end=points[points.length-1].date.getTime(), timeSpan=Math.max(1,end-start);
    const coords=points.map(p=>({x:left+((p.date.getTime()-start)/timeSpan)*(w-left-right),y:top+(1-(p.mileage-minM)/span)*(h-top-bottom),p})); const poly=coords.map(c=>`${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
    const dots=coords.map((c,i)=>`<circle class="reg-chart-dot" cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${i===coords.length-1?6:4}"/>`).join('');
    const first=coords[0], last=coords[coords.length-1];
    return `<svg class="reg-mileage-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Recorded MOT mileage over time"><line class="reg-chart-axis" x1="${left}" y1="${h-bottom}" x2="${w-right}" y2="${h-bottom}"/><line class="reg-chart-axis" x1="${left}" y1="${top}" x2="${left}" y2="${h-bottom}"/><polyline class="reg-chart-line" points="${poly}"/>${dots}<text class="reg-chart-label" x="${first.x}" y="${h-12}" text-anchor="start">${first.p.date.getFullYear()}</text><text class="reg-chart-label" x="${last.x}" y="${h-12}" text-anchor="end">${last.p.date.getFullYear()}</text><text class="reg-chart-label" x="${left-8}" y="${top+6}" text-anchor="end">${Math.round(maxM/1000)}k</text><text class="reg-chart-label" x="${left-8}" y="${h-bottom}" text-anchor="end">${Math.round(minM/1000)}k</text></svg>`;
  }

  const THEME_CHECKS = {
    suspension:{title:'Suspension and uneven tyre wear',copy:'Listen for knocks or clunks and inspect bushes, arms, springs and tyre wear because suspension-related items repeat in the MOT history.'},
    tyre:{title:'Tyres and wheel condition',copy:'Check tread depth, sidewalls, matching tyres and uneven wear because tyre/wheel items repeat in the MOT history.'},
    brake:{title:'Brakes',copy:'Inspect discs and pads, test smooth braking and check the parking brake because brake-related items repeat in the MOT history.'},
    steering:{title:'Steering',copy:'Check for play, noises and whether the car tracks straight because steering-related items repeat in the MOT history.'},
    lighting:{title:'All exterior lights',copy:'Test headlamps, indicators, brake lights and reflectors because lighting issues repeat in the MOT history.'},
    windscreen:{title:'Windscreen, wipers and washers',copy:'Check chips/cracks and make sure wipers and washers operate properly because these items repeat in the MOT history.'},
    body:{title:'Structure and corrosion',copy:'Inspect the underside and previous repair areas carefully because body/structure-related items repeat in the MOT history.'}
  };

  function viewingChecklist(vehicle = {}) {
    const mot = vehicle.motIntelligence || {}; const items=[];
    safeArray(mot.repeatedThemes).slice(0,3).forEach(item=>{const check=THEME_CHECKS[cleanText(item?.theme).toLowerCase()];if(check)items.push(check);});
    if (safeNumber(mot.mileageAnomalies,0)>0) items.push({title:'Mileage evidence',copy:'The recorded mileage appears to move backwards at least once. Verify service invoices and the odometer history before buying.'});
    if (safeNumber(mot.dangerousCount,0)>0) items.push({title:'Evidence of serious repairs',copy:'The history contains a dangerous defect record. Ask what was repaired and inspect the relevant area even if a later MOT passed.'});
    items.push({title:'Battery evidence',copy:'Ask for any battery-health report or diagnostic evidence. MOT history cannot measure battery State of Health.'});
    items.push({title:'Charging equipment',copy:'Confirm the charge ports work and that the expected charging cables are included with the car.'});
    items.push({title:'Service and ownership paperwork',copy:'Check service history, recalls/campaigns where applicable, both keys and any warranty documentation.'});
    return items.slice(0,6);
  }

  function modelGuideFor(vehicle = {}) {
    const name=`${cleanText(vehicle.make)} ${cleanText(vehicle.model)}`.trim(); return MODEL_GUIDES.find(item=>item.test.test(name)) || null;
  }

  function motRows(tests = []) {
    return safeArray(tests).map((test,index)=>{const result=cleanText(test?.result,'Result unavailable');const fail=/FAIL/i.test(result);return `<div class="reg-mot-row ${fail?'is-fail':''} ${index>=4?'reg-mot-extra':''}" ${index>=4?'hidden':''}><i class="reg-mot-dot"></i><div><b>${escapeHtml(formatMonth(test?.completedDate))} · ${escapeHtml(result)}</b><span>${escapeHtml(defectSummary(test))}</span></div><span class="reg-mot-mileage">${escapeHtml(formatMileage(test?.odometerValue,test?.odometerUnit))}</span></div>`;}).join('');
  }

  function renderRegistrationReport(payload = {}) {
    if (!payload?.ok || payload?.mode !== 'live-registration') return;
    const report=$('#report-view'); const main=$('.report-main',report||document); const hero=$('.report-hero',report||document); if(!report||!main||!hero)return;
    report.classList.add('registration-only-mode');
    $('#registration-check')?.remove();

    const vehicle=payload.vehicle||{}; const tests=safeArray(vehicle.motTests); const mot=vehicle.motIntelligence||{}; const year=yearFromDate(vehicle.firstUsedDate); const reg=cleanRegistration(vehicle.registration)||'Registration'; const make=cleanText(vehicle.make,'Vehicle'); const model=cleanText(vehicle.model,''); const name=[year,make,model].filter(Boolean).join(' '); const latest=tests[0]||{}; const miles=mileageStats(tests); const signal=motHistorySignal(mot,tests); const guide=modelGuideFor(vehicle); const checklist=viewingChecklist(vehicle); const completeness=40;

    const gallery=$('.vehicle-gallery',hero); if(gallery) gallery.innerHTML=`<div class="reg-vehicle-visual"><span class="reg-verified-badge">DVSA verified</span><div class="reg-check-icon">✓</div><strong>${escapeHtml(name||reg)}</strong><span>${escapeHtml(reg)} · ${escapeHtml(cleanText(vehicle.primaryColour,'Colour unavailable'))} · ${escapeHtml(cleanText(vehicle.fuelType,'Fuel type unavailable'))}</span></div>`;
    const versionLabel=$('label[for="trim-select"]',hero); if(versionLabel)versionLabel.textContent='Verified vehicle';
    const scoreBand=$('.score-band',hero); if(scoreBand)scoreBand.innerHTML=`<div class="reg-completeness"><div class="reg-completeness-ring" style="--value:${completeness}"><b>${completeness}%</b></div><div class="reg-completeness-copy"><span>Scan completeness</span><strong>2 of 5 core evidence areas verified</strong><small>Vehicle identity and MOT history are live. Price, advert evidence and battery condition still need adding before EV Scan can judge the deal.</small></div></div>`;

    const latestDefects=safeArray(latest.defects).length; const latestResult=cleanText(latest.result,'Unknown'); const expiry=latest.expiryDate?`MOT expiry: ${formatFullDate(latest.expiryDate)}`:'Latest DVSA test record'; const avgAnnual=miles.annual!=null?`${miles.annual.toLocaleString('en-GB')} mi/yr`:'Not enough history'; const passes=tests.filter(t=>/PASS/i.test(cleanText(t?.result))).length;
    const alertCopy=cleanText(mot.summary,tests.length?'No repeated MOT pattern stands out from the available records.':'No MOT test records were returned.');
    const modelPoints=guide?guide.points:[`Confirm the exact ${model||'vehicle'} version and battery specification before using model-level range figures.`,'Use the MOT history as evidence, but still inspect the car physically and verify battery condition separately.'];
    const modelLink=guide?`<a class="reg-model-link" href="${guide.path}">Read the ${escapeHtml(make)} ${escapeHtml(model)} buyer guide →</a>`:`<a class="reg-model-link" href="/cars/">Browse EV buyer guides →</a>`;

    const section=document.createElement('section'); section.id='registration-check'; section.className='registration-check';
    section.innerHTML=`
      <div class="reg-kpi-grid">
        <article class="report-card reg-kpi"><span>Latest MOT</span><strong style="color:${/PASS/i.test(latestResult)?'var(--green)':'var(--amber)'}">${escapeHtml(latestResult)}</strong><small>${escapeHtml(formatMonth(latest.completedDate))} · ${latestDefects?`${latestDefects} recorded item${latestDefects===1?'':'s'}`:'No recorded defects'}</small></article>
        <article class="report-card reg-kpi"><span>Latest mileage</span><strong>${escapeHtml(formatMileage(miles.latest?.mileage,miles.unit))}</strong><small>From the latest MOT odometer reading</small></article>
        <article class="report-card reg-kpi"><span>MOT records</span><strong>${tests.length}</strong><small>${passes} pass${passes===1?'':'es'} · ${safeNumber(mot.failCount,0)} historic fail${safeNumber(mot.failCount,0)===1?'':'s'}</small></article>
        <article class="report-card reg-kpi"><span>History signal</span><strong>${escapeHtml(signal.label)}</strong><small>${safeNumber(mot.mileageAnomalies,0)?'Mileage anomaly detected':safeArray(mot.repeatedThemes).length?`${safeArray(mot.repeatedThemes)[0].count} ${escapeHtml(safeArray(mot.repeatedThemes)[0].theme)}-related records`:expiry}</small></article>
      </div>

      <article class="report-card reg-alert-card ${signal.clear?'is-clear':''}"><div class="reg-alert-icon">${escapeHtml(signal.icon)}</div><div><span class="mini-label">What stands out</span><h2>${escapeHtml(signal.label)}</h2><p>${escapeHtml(alertCopy)}</p></div></article>

      <div class="reg-two-col">
        <article class="report-card reg-detail-card"><div class="reg-card-head"><div><span class="mini-label">Mileage history</span><h2>Recorded mileage over time</h2><p>Built from DVSA odometer readings at each MOT.</p></div><span class="reg-source-tag">DVSA verified</span></div>${mileageSvg(miles)}<div class="reg-mileage-summary"><div><span>Earliest reading</span><b>${escapeHtml(formatMileage(miles.oldest?.mileage,miles.unit))}</b></div><div><span>Latest reading</span><b>${escapeHtml(formatMileage(miles.latest?.mileage,miles.unit))}</b></div><div><span>Approx. annual use</span><b>${escapeHtml(avgAnnual)}</b></div></div></article>
        <article class="report-card reg-detail-card reg-model-card"><div class="reg-card-head"><div><span class="mini-label">Model intelligence</span><h2>What to know about this model</h2></div><span class="reg-source-tag" style="color:var(--pink-2);background:var(--pink-soft);border-color:rgba(245,15,93,.18)">Model guide</span></div><div class="reg-model-name">${escapeHtml(`${make} ${model}`.trim())}</div><p>${escapeHtml(guide?.note || 'We know the vehicle identity from DVSA, but the exact battery, trim and equipment still need confirming before model-level estimates can be applied.')}</p><div class="reg-model-points">${modelPoints.map(point=>`<span>${escapeHtml(point)}</span>`).join('')}</div>${modelLink}</article>
      </div>

      <article class="report-card reg-detail-card"><div class="reg-card-head"><div><span class="mini-label">MOT intelligence</span><h2>The full MOT story</h2><p>Recent records first. Older failures can already be repaired; repeated themes matter more.</p></div><span class="reg-source-tag">DVSA verified</span></div><div class="reg-mot-list">${motRows(tests) || '<div style="color:var(--muted);font-size:.8rem">No MOT test records were returned.</div>'}</div>${tests.length>4?`<button class="reg-history-toggle" id="reg-history-toggle" type="button">View all ${tests.length} MOT records</button>`:''}</article>

      <article class="report-card reg-detail-card"><div class="reg-card-head"><div><span class="mini-label">Your viewing checklist</span><h2>What we would check on this exact car</h2><p>This turns the MOT patterns and EV-specific unknowns into practical viewing checks.</p></div></div><div class="reg-checklist">${checklist.map((item,index)=>`<div class="reg-check-item"><i>${index+1}</i><div><b>${escapeHtml(item.title)}</b><span>${escapeHtml(item.copy)}</span></div></div>`).join('')}</div></article>

      <article class="report-card reg-complete-card"><div><span class="mini-label">Complete the buying decision</span><h2>We found the car. The advert unlocks the deal.</h2><p>The number plate gives us a useful verified vehicle check, but we still need the actual asking price, listing evidence and battery/version information before giving you a genuine Deal Score.</p><div class="reg-missing-chips"><span>Asking price</span><span>Exact battery / trim</span><span>Listing photos</span><span>Seller claims</span><span>Market comparables</span></div></div><div class="reg-complete-actions">${guide?`<a href="${guide.path}">Research this model</a>`:`<a href="/cars/">Research this model</a>`}<button type="button" id="reg-focus-advert">Add the advert when ready</button></div></article>

      <article class="report-card reg-trust-note"><span class="mini-label">Trust matters</span><h2>What this registration check still cannot prove</h2><p>DVSA MOT data does not measure battery State of Health, verify outstanding finance/theft/write-off history, prove the car's current mechanical condition or confirm unsupported seller claims. EV Scan keeps those items unknown until there is evidence.</p></article>`;
    hero.insertAdjacentElement('afterend',section);

    $('#reg-history-toggle',section)?.addEventListener('click',event=>{const hidden=$$('.reg-mot-extra',section);const expanding=hidden.some(row=>row.hidden);hidden.forEach(row=>row.hidden=!expanding);event.currentTarget.textContent=expanding?'Show recent MOT records':`View all ${tests.length} MOT records`;});
    $('#reg-focus-advert',section)?.addEventListener('click',()=>{const input=$('#rescan-url');if(input){input.focus({preventScroll:false});input.scrollIntoView({behavior:'smooth',block:'center'});input.placeholder='Paste the advert link here when you have it…';}});
  }

  function waitAndRender(payload, attempt = 0) {
    const report=$('#report-view'); const source=$('.source-note',report||document);
    if (report && !report.hidden && /live dvsa vehicle/i.test(source?.textContent || '')) { renderRegistrationReport(payload); return; }
    if (attempt < 20) setTimeout(()=>waitAndRender(payload,attempt+1),60);
  }

  function installScanCapture() {
    if (window.__evscanRegistrationCapture) return; window.__evscanRegistrationCapture=true;
    const nativeFetch=window.fetch.bind(window);
    window.fetch=async (...args)=>{
      const response=await nativeFetch(...args);
      try {
        const rawUrl=typeof args[0]==='string'?args[0]:args[0]?.url||'';
        const url=new URL(rawUrl,location.href);
        if (url.pathname==='/api/scan') {
          const clone=response.clone();
          clone.json().then(payload=>{if(payload?.ok && payload?.mode==='live-registration') waitAndRender(payload);}).catch(()=>{});
        }
      } catch {}
      return response;
    };
  }

  function mount() { updateHomepageCopy(); centreHeroActions(); mountFeedback(); installScanCapture(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();