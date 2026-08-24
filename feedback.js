(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

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
    #home .hero-center-actions{
      grid-area:actions;
      width:min(760px,100%);
      justify-self:center;
      text-align:center;
      margin:0 auto;
    }
    #home .hero-center-actions .scan-form{width:100%;max-width:none;margin:0 auto}
    #home .hero-center-actions .hero-meta,
    #home .hero-center-actions .secondary-path{justify-content:center}
    #home .hero-center-actions .input-help{text-align:center}
    #home .hero-subtitle{max-width:640px!important}

    /* Pull homepage sections closer together */
    .trust-preview-section{padding:10px 0 34px!important}
    .content-section,.report-preview,.finder-section,.trust-section{
      padding-top:52px!important;
      padding-bottom:52px!important;
    }
    .trust-section{display:none!important}
    .section-heading{margin-bottom:26px!important}
    .steps-grid{gap:14px!important}
    #how-it-works .info-card{
      min-height:190px!important;
      display:flex!important;
      flex-direction:column!important;
      align-items:flex-start!important;
      justify-content:flex-start!important;
      padding:28px!important;
    }
    #how-it-works .info-card .step-no{
      display:block!important;
      margin:0 0 18px!important;
    }
    #how-it-works .info-card h3{
      margin:0 0 10px!important;
    }
    #how-it-works .info-card p{
      margin:0!important;
    }
    .finder-card{padding:34px!important}
    .trust-card{padding:34px!important}
    .report-preview .metric-grid{margin-top:14px!important}
    .trust-preview-head{padding-bottom:20px!important}
    .demo-stats{padding-top:20px!important}

    /* Dynamic report sections need their own internal spacing. */
    .partner-card{
      padding:32px!important;
    }

    /* Registration-only price cards must never retain demo market visuals. */
    .report-metrics .metric-rich:first-child:has(.data-tag.estimated) .market-scale,
    .report-metrics .metric-rich:first-child:has(.data-tag.estimated) .metric-foot{
      display:none!important;
    }
    .battery-card:has(.battery-visual span[style*="width: 0%"] ) .battery-status strong{
      color:#f7f8fb!important;
    }

    /* Report feedback */
    .scan-feedback-card{
      margin-top:14px;
      margin-bottom:44px;
      padding:32px!important;
      overflow:hidden;
      position:relative;
    }
    .scan-feedback-card::before{
      content:"";
      position:absolute;
      width:360px;
      height:280px;
      border-radius:50%;
      background:rgba(245,15,93,.12);
      filter:blur(80px);
      right:-180px;
      top:-180px;
      pointer-events:none;
    }
    .scan-feedback-inner{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,.8fr) minmax(420px,1.2fr);gap:34px;align-items:center}
    .scan-feedback-copy h2{margin:8px 0 10px;font-size:clamp(1.7rem,3vw,2.65rem);line-height:1.03;letter-spacing:-.045em}
    .scan-feedback-copy p{margin:0;color:var(--muted);line-height:1.6;max-width:540px}
    .scan-feedback-form{display:grid;gap:14px;min-width:0}
    .feedback-stars{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    .feedback-star{
      border:0;
      background:transparent;
      color:#4b5568;
      font-size:2rem;
      line-height:1;
      padding:2px;
      transition:transform .15s ease,color .15s ease,filter .15s ease;
    }
    .feedback-star:hover,.feedback-star.is-active{
      color:#ffc459;
      filter:drop-shadow(0 0 9px rgba(255,196,89,.45));
      transform:translateY(-1px) scale(1.06);
    }
    .feedback-rating-label{color:var(--muted);font-size:.74rem;min-height:18px}
    .scan-feedback-form textarea{
      width:100%;
      min-height:96px;
      resize:vertical;
      border:1px solid var(--border);
      border-radius:14px;
      padding:14px 15px;
      color:#fff;
      background:#0b1323;
      outline:none;
      line-height:1.5;
    }
    .scan-feedback-form textarea:focus{border-color:rgba(245,15,93,.5);box-shadow:0 0 0 3px rgba(245,15,93,.08)}
    .feedback-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
    .feedback-note{color:var(--muted-2);font-size:.67rem;line-height:1.4}
    .feedback-thanks{padding:24px;border:1px solid rgba(71,217,140,.18);background:rgba(71,217,140,.07);border-radius:16px}
    .feedback-thanks strong{display:block;color:var(--green);font-size:1.2rem;margin-bottom:5px}
    .feedback-thanks span{color:var(--muted);font-size:.8rem;line-height:1.5}

    @media(max-width:980px){
      #home.hero{
        grid-template-columns:1fr!important;
        grid-template-areas:"copy" "actions" "visual";
        row-gap:20px!important;
      }
      #home .hero-copy{width:min(760px,100%);margin:0 auto}
      #home .hero-center-actions{width:min(760px,100%)}
      #home .hero-visual{width:min(760px,100%);margin:0 auto;min-height:410px!important}
      .scan-feedback-inner{grid-template-columns:1fr;gap:22px}
    }

    @media(max-width:720px){
      #home.hero{padding-top:26px!important;padding-bottom:18px!important;row-gap:16px!important}
      #home .hero-center-actions{text-align:left}
      #home .hero-center-actions .hero-meta,
      #home .hero-center-actions .secondary-path{justify-content:flex-start}
      #home .hero-center-actions .input-help{text-align:left}
      #home .hero-visual{min-height:330px!important}
      #home .hero-subtitle{max-width:none!important}
      .trust-preview-section{padding:8px 0 22px!important}
      .content-section,.report-preview,.finder-section,.trust-section{padding-top:34px!important;padding-bottom:34px!important}
      .section-heading{margin-bottom:20px!important}
      #how-it-works .info-card{min-height:auto!important;padding:24px!important}
      #how-it-works .info-card .step-no{margin-bottom:14px!important}
      .finder-card,.trust-card{padding:24px!important}
      .partner-card{padding:22px!important}
      .scan-feedback-card{padding:22px!important;margin-bottom:28px}
      .scan-feedback-inner{gap:18px}
      .feedback-star{font-size:1.85rem}
      .feedback-actions .primary-button{width:100%}
    }
  `;
  document.head.appendChild(style);

  function centreHeroActions() {
    const hero = $('#home');
    const copy = $('.hero-copy', hero || document);
    if (!hero || !copy || $('.hero-center-actions', hero)) return;

    const form = $('#scan-form');
    const meta = $('.hero-meta', copy);
    const secondary = $('.secondary-path', copy);
    if (!form) return;

    const actions = document.createElement('div');
    actions.className = 'hero-center-actions';
    actions.appendChild(form);
    if (meta) {
      if (![...meta.children].some(item => item.textContent.trim() === 'Insurance estimate')) {
        const insurance = document.createElement('span');
        insurance.textContent = 'Insurance estimate';
        meta.appendChild(insurance);
      }
      actions.appendChild(meta);
    }
    if (secondary) actions.appendChild(secondary);
    hero.appendChild(actions);
  }

  function updateHomepageCopy() {
    const heroSubtitle = $('#home .hero-subtitle');
    if (heroSubtitle) {
      heroSubtitle.innerHTML = 'Paste the listing. We’ll explain the price, battery, real-world range,<br>MOT history and estimated insurance cost.';
    }

    const cards = $$('#how-it-works .info-card');
    const middleCopy = cards[1]?.querySelector('p');
    if (middleCopy) {
      middleCopy.textContent = 'Price, battery confidence, real-world range, insurance estimate, MOT patterns and model-specific risks.';
    }
  }

  function polishRegistrationOnlyReport() {
    const report = $('#report-view');
    const source = $('.source-note', report || document);
    const trim = $('#trim-select', report || document);
    const isLiveRegistration = Boolean(trim?.disabled && /live dvsa vehicle/i.test(source?.textContent || ''));
    if (!isLiveRegistration) return;

    const versionLabel = $('label[for="trim-select"]', report);
    if (versionLabel && versionLabel.textContent.trim() !== 'Verified vehicle') {
      versionLabel.textContent = 'Verified vehicle';
    }

    const priceCard = $$('.report-metrics .metric-rich', report)[0];
    if (priceCard && /unknown/i.test($('.metric-value', priceCard)?.textContent || '')) {
      const marketScale = $('.market-scale', priceCard);
      const metricFoot = $('.metric-foot', priceCard);
      if (marketScale) marketScale.hidden = true;
      if (metricFoot) metricFoot.hidden = true;
    }

    const batteryCard = $('.battery-card', report);
    if (batteryCard && /unknown/i.test($('.battery-status strong', batteryCard)?.textContent || '')) {
      const status = $('.battery-status strong', batteryCard);
      if (status) status.style.color = '#f7f8fb';
    }
  }

  function watchReportPolish() {
    const report = $('#report-view');
    if (!report || report.dataset.evscanPolishObserver === '1') return;
    report.dataset.evscanPolishObserver = '1';
    const observer = new MutationObserver(() => polishRegistrationOnlyReport());
    observer.observe(report, { childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:['disabled','hidden','style'] });
    polishRegistrationOnlyReport();
  }

  function feedbackStorage() {
    try {
      const parsed = JSON.parse(localStorage.getItem('evscan_feedback_v1') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveFeedback(item) {
    try {
      const current = feedbackStorage();
      current.push(item);
      localStorage.setItem('evscan_feedback_v1', JSON.stringify(current.slice(-100)));
      return true;
    } catch {
      return false;
    }
  }

  function mountFeedback() {
    if ($('#scan-feedback') || !$('.report-main')) return;
    const main = $('.report-main');
    const section = document.createElement('section');
    section.id = 'scan-feedback';
    section.className = 'report-card scan-feedback-card';
    section.innerHTML = `
      <div class="scan-feedback-inner">
        <div class="scan-feedback-copy">
          <span class="mini-label">Quick feedback</span>
          <h2>How useful was this scan?</h2>
          <p>Tap a star and, if you want, leave a short comment. It should take about five seconds.</p>
        </div>
        <form class="scan-feedback-form" id="scan-feedback-form">
          <div>
            <div class="feedback-stars" role="radiogroup" aria-label="Rate this scan out of five stars">
              ${[1,2,3,4,5].map(n => `<button class="feedback-star" type="button" role="radio" aria-checked="false" data-rating="${n}" aria-label="${n} star${n === 1 ? '' : 's'}">★</button>`).join('')}
            </div>
            <div class="feedback-rating-label" id="feedback-rating-label">Choose 1–5 stars</div>
          </div>
          <textarea id="feedback-comment" maxlength="700" placeholder="Optional: what did you like, or what could we improve?"></textarea>
          <div class="feedback-actions">
            <button class="primary-button compact" type="submit">Send quick review</button>
            <span class="feedback-note">Prototype feedback is saved on this device for now.</span>
          </div>
        </form>
      </div>`;
    main.appendChild(section);

    let rating = 0;
    const stars = $$('.feedback-star', section);
    const label = $('#feedback-rating-label', section);
    const words = ['', 'Not very useful', 'Could be better', 'Helpful', 'Very helpful', 'Excellent'];

    function paint(value) {
      stars.forEach((star, index) => {
        const active = index < value;
        star.classList.toggle('is-active', active);
        star.setAttribute('aria-checked', String(Number(star.dataset.rating) === value));
      });
      if (label) label.textContent = value ? `${value}/5 · ${words[value]}` : 'Choose 1–5 stars';
    }

    stars.forEach(star => {
      star.addEventListener('mouseenter', () => paint(Number(star.dataset.rating)));
      star.addEventListener('focus', () => paint(Number(star.dataset.rating)));
      star.addEventListener('click', () => {
        rating = Number(star.dataset.rating);
        paint(rating);
      });
    });
    $('.feedback-stars', section)?.addEventListener('mouseleave', () => paint(rating));

    $('#scan-feedback-form', section)?.addEventListener('submit', event => {
      event.preventDefault();
      if (!rating) {
        if (label) {
          label.textContent = 'Pick a star rating first';
          label.style.color = '#ff8a8a';
        }
        stars[0]?.focus();
        return;
      }

      const comment = ($('#feedback-comment', section)?.value || '').trim();
      const vehicle = $('#trim-select')?.selectedOptions?.[0]?.textContent?.trim() || 'EV scan';
      saveFeedback({ rating, comment, vehicle, createdAt: new Date().toISOString() });

      const inner = $('.scan-feedback-inner', section);
      if (inner) inner.innerHTML = `<div class="feedback-thanks"><strong>Thanks — that was it.</strong><span>Your ${rating}-star rating${comment ? ' and comment' : ''} has been saved. Once the live feedback database is connected, this same form can feed genuine EV Scan reviews and statistics.</span></div>`;
    });
  }

  function mount() {
    updateHomepageCopy();
    centreHeroActions();
    mountFeedback();
    watchReportPolish();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
