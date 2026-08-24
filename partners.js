(() => {
  const $ = (sel, root = document) => root.querySelector(sel);

  const style = document.createElement('style');
  style.textContent = `
    /* Insurance layout hardening */
    .insurance-card,.insurance-card *{min-width:0}
    .insurance-card{overflow:visible!important;padding-top:30px!important}
    .insurance-intro{flex-wrap:wrap!important}
    .insurance-intro>div{flex:1 1 620px;min-width:0}
    .insurance-intro .mini-label{line-height:1.35;margin-bottom:6px;overflow-wrap:anywhere}
    .insurance-intro h2{line-height:1.08!important;overflow-wrap:anywhere;max-width:900px}
    .insurance-intro p{overflow-wrap:anywhere}
    .insurance-badge{max-width:100%;white-space:normal!important;text-align:center;line-height:1.25}
    .insurance-summary>*{min-width:0}
    .insurance-teaser li,.insurance-price-box,.insurance-price-box small{overflow-wrap:anywhere}
    .insurance-field input,.insurance-field select{min-width:0;max-width:100%}
    @media(max-width:1120px){
      .insurance-summary{grid-template-columns:1fr!important}
      .insurance-price-box{min-height:150px}
    }
    @media(max-width:720px){
      .insurance-card{padding-top:24px!important}
      .insurance-intro>div{flex-basis:100%}
      .insurance-badge{display:inline-flex!important;width:auto}
    }

    /* Homepage trust preview */
    .trust-preview-section{width:min(calc(100% - 40px),var(--max));margin:0 auto;padding:24px 0 86px;overflow:hidden}
    .trust-preview-shell{border:1px solid var(--border);background:linear-gradient(150deg,rgba(255,255,255,.045),rgba(255,255,255,.015));border-radius:28px;padding:34px 0 30px;box-shadow:0 22px 70px rgba(0,0,0,.2);position:relative;overflow:hidden}
    .trust-preview-shell::before{content:"";position:absolute;width:420px;height:260px;border-radius:50%;background:rgba(245,15,93,.13);filter:blur(75px);left:50%;top:-190px;transform:translateX(-50%);pointer-events:none}
    .trust-preview-head{padding:0 34px 25px;text-align:center;position:relative;z-index:1}
    .trust-demo-label{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border-radius:999px;border:1px solid rgba(255,196,89,.2);background:rgba(255,196,89,.075);color:#ffd27a;font-size:.63rem;line-height:1;font-weight:900;letter-spacing:.08em;text-transform:uppercase;margin-bottom:15px}
    .trust-preview-head h2{margin:0;font-size:clamp(1.75rem,3vw,3rem);line-height:1.05;letter-spacing:-.045em}
    .star-display{display:flex;justify-content:center;gap:8px;margin:18px 0 9px}
    .star-display span{font-size:1.55rem;color:#ffc459;text-shadow:0 0 8px rgba(255,196,89,.75),0 0 24px rgba(255,196,89,.34);animation:starGleam 2.6s ease-in-out infinite}
    .star-display span:nth-child(2){animation-delay:.13s}.star-display span:nth-child(3){animation-delay:.26s}.star-display span:nth-child(4){animation-delay:.39s}.star-display span:nth-child(5){animation-delay:.52s}
    @keyframes starGleam{0%,100%{transform:scale(1);filter:brightness(1)}50%{transform:scale(1.13);filter:brightness(1.25)}}
    .trust-preview-sub{margin:0;color:var(--muted);font-size:.83rem;line-height:1.55}
    .review-marquee{position:relative;overflow:hidden;padding:2px 0}
    .review-marquee::before,.review-marquee::after{content:"";position:absolute;top:0;bottom:0;width:90px;z-index:2;pointer-events:none}
    .review-marquee::before{left:0;background:linear-gradient(90deg,#0d1322,transparent)}
    .review-marquee::after{right:0;background:linear-gradient(270deg,#0d1322,transparent)}
    .review-track{display:flex;width:max-content;gap:14px;padding:0 7px;animation:reviewMarquee 42s linear infinite;will-change:transform}
    .review-marquee:hover .review-track{animation-play-state:paused}
    @keyframes reviewMarquee{to{transform:translateX(-50%)}}
    .demo-review{width:340px;min-height:180px;flex:0 0 auto;border:1px solid var(--border);border-radius:19px;padding:20px;background:#0c1322;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 12px 34px rgba(0,0,0,.18)}
    .demo-review-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:15px}
    .demo-review-stars{color:#ffc459;letter-spacing:.06em;text-shadow:0 0 10px rgba(255,196,89,.26);font-size:.86rem}
    .demo-review-tag{font-size:.56rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#ffd27a;padding:5px 7px;border-radius:999px;background:rgba(255,196,89,.07);border:1px solid rgba(255,196,89,.15)}
    .demo-review p{margin:0;color:#e4e8ef;font-size:.9rem;line-height:1.6}
    .demo-review footer{margin-top:16px;display:flex;align-items:center;gap:10px;color:var(--muted);font-size:.72rem}
    .review-avatar{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,rgba(245,15,93,.35),rgba(79,214,255,.18));border:1px solid var(--border);color:#fff;font-weight:850}
    .demo-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;padding:26px 34px 0;position:relative;z-index:1}
    .demo-stat{border:1px solid var(--border);border-radius:17px;padding:18px 19px;background:rgba(8,14,27,.65);min-width:0}
    .demo-stat span{display:block;color:var(--muted);font-size:.7rem;line-height:1.3}
    .demo-stat strong{display:block;margin:8px 0 4px;font-size:clamp(1.45rem,2.3vw,2.15rem);letter-spacing:-.045em;color:#fff;white-space:nowrap}
    .demo-stat em{display:block;color:var(--pink-2);font-size:.58rem;font-style:normal;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
    .trust-preview-note{text-align:center;margin:18px 34px 0;color:var(--muted-2);font-size:.65rem;line-height:1.45}
    @media(max-width:900px){.demo-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:720px){
      .trust-preview-section{padding:14px 0 44px}
      .trust-preview-shell{border-radius:22px;padding-top:27px}
      .trust-preview-head{padding:0 20px 22px}
      .review-marquee::before,.review-marquee::after{width:34px}
      .demo-review{width:285px;min-height:176px;padding:18px}
      .review-track{gap:12px;animation-duration:36s}
      .demo-stats{grid-template-columns:1fr 1fr;padding:22px 18px 0;gap:10px}
      .demo-stat{padding:16px 14px}
      .demo-stat strong{font-size:1.35rem}
      .trust-preview-note{margin-inline:20px}
    }
    @media(prefers-reduced-motion:reduce){.review-track,.star-display span{animation:none!important}}

    /* Partner / affiliate area */
    .partner-card{margin-top:14px;overflow:hidden;position:relative}
    .partner-card::before{content:"";position:absolute;width:360px;height:360px;border-radius:50%;right:-180px;top:-210px;background:rgba(245,15,93,.10);filter:blur(70px);pointer-events:none}
    .partner-head{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;position:relative;z-index:1}
    .partner-head>div{min-width:0}
    .partner-head h2{margin:8px 0 10px;font-size:clamp(1.65rem,3vw,2.5rem);line-height:1.04;letter-spacing:-.045em}
    .partner-head p{margin:0;color:var(--muted);line-height:1.6;max-width:760px}
    .partner-disclosure{flex:0 0 auto;max-width:285px;border:1px solid rgba(255,196,89,.18);background:rgba(255,196,89,.07);border-radius:14px;padding:11px 13px;color:#c7cfdb;font-size:.7rem;line-height:1.45}
    .partner-disclosure b{color:#ffc459}
    .partner-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:22px;position:relative;z-index:1}
    .partner-item{display:flex;flex-direction:column;min-width:0;border:1px solid var(--border);background:rgba(8,14,27,.55);border-radius:18px;padding:18px;min-height:245px}
    .partner-icon{width:42px;height:42px;display:grid;place-items:center;border-radius:12px;background:rgba(245,15,93,.11);font-size:1.2rem;margin-bottom:16px}
    .partner-kicker{display:block;color:var(--pink-2);text-transform:uppercase;letter-spacing:.08em;font-size:.62rem;font-weight:900;margin-bottom:6px}
    .partner-item h3{font-size:1rem;line-height:1.25;margin:0 0 8px}
    .partner-item p{margin:0 0 18px;color:var(--muted);font-size:.76rem;line-height:1.5;flex:1}
    .partner-link{display:flex;align-items:center;justify-content:center;min-height:45px;padding:0 14px;border-radius:12px;background:linear-gradient(135deg,var(--pink),#ff2f73);color:#fff;font-size:.75rem;font-weight:800;box-shadow:0 10px 26px rgba(245,15,93,.16)}
    .partner-link:hover{transform:translateY(-1px)}
    .partner-link.is-disabled{background:rgba(255,255,255,.055);color:#8793a7;border:1px solid var(--border);box-shadow:none;cursor:not-allowed}
    .partner-footnote{margin:14px 0 0;color:var(--muted-2);font-size:.68rem;line-height:1.5;position:relative;z-index:1}
    .partner-footnote b{color:#cbd3df}
    @media(max-width:1050px){.partner-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:720px){
      .partner-head{display:block}
      .partner-disclosure{max-width:none;margin-top:14px}
      .partner-grid{grid-template-columns:1fr;gap:14px}
      .partner-item{min-height:0}
    }
  `;
  document.head.appendChild(style);

  const DEMO_REVIEWS = [
    {initials:'JM',quote:'It explained the battery and range stuff in normal English. I knew exactly what I needed to ask before viewing the car.',name:'Jamie M.',detail:'Demo first-time EV buyer'},
    {initials:'SP',quote:'The trim comparison is the bit I would actually use. I nearly paid more for a version that did not suit how I drive.',name:'Sam P.',detail:'Demo feedback'},
    {initials:'AB',quote:'I liked that it did not just say whether the car was good. It showed what was still unknown and what could change the verdict.',name:'Alex B.',detail:'Demo feedback'},
    {initials:'RK',quote:'The real-world winter range explanation made far more sense than trying to compare battery sizes and WLTP figures myself.',name:'Riley K.',detail:'Demo first-time EV buyer'},
    {initials:'TW',quote:'Being able to paste a listing and get the important bits back without creating an account is exactly how I would want this to work.',name:'Taylor W.',detail:'Demo feedback'},
    {initials:'CH',quote:'The seller message is simple but genuinely useful. It turns the missing information into questions I would not have thought to ask.',name:'Casey H.',detail:'Demo feedback'}
  ];

  function reviewCard(review) {
    return `<article class="demo-review">
      <div>
        <div class="demo-review-top"><span class="demo-review-stars">★★★★★</span><span class="demo-review-tag">Demo review</span></div>
        <p>“${review.quote}”</p>
      </div>
      <footer><span class="review-avatar">${review.initials}</span><span><b style="color:#fff">${review.name}</b><br>${review.detail}</span></footer>
    </article>`;
  }

  function mountHomepageTrust() {
    if ($('#homepage-trust-preview')) return;
    const hero = $('#home');
    const next = $('#how-it-works');
    if (!hero || !next) return;

    const section = document.createElement('section');
    section.id = 'homepage-trust-preview';
    section.className = 'trust-preview-section';
    const cards = DEMO_REVIEWS.map(reviewCard).join('');
    section.innerHTML = `
      <div class="trust-preview-shell">
        <div class="trust-preview-head">
          <span class="trust-demo-label">Demo social proof · placeholders</span>
          <h2>Designed to make buying your first EV feel much easier.</h2>
          <div class="star-display" aria-label="Five demo stars"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
          <p class="trust-preview-sub"><b style="color:#fff">5.0 demo presentation</b> · These example reviews show how genuine customer feedback will appear once EV Scan has real users.</p>
        </div>
        <div class="review-marquee" aria-label="Demo review design preview">
          <div class="review-track">${cards}${cards}</div>
        </div>
        <div class="demo-stats">
          <div class="demo-stat"><span>EV buyers helped</span><strong>6,240</strong><em>Demo placeholder</em></div>
          <div class="demo-stat"><span>Vehicle scans completed</span><strong>12,480</strong><em>Demo placeholder</em></div>
          <div class="demo-stat"><span>Better matches surfaced</span><strong>1,850</strong><em>Demo placeholder</em></div>
          <div class="demo-stat"><span>Vehicle value analysed</span><strong>£186m</strong><em>Demo placeholder</em></div>
        </div>
        <p class="trust-preview-note">These numbers and reviews are deliberately marked as demo placeholders and are not claims about real EV Scan usage. The finished product can connect these cards to genuine review and analytics data.</p>
      </div>`;
    hero.insertAdjacentElement('afterend', section);
  }

  const PARTNERS = [
    {
      key: 'history', icon: '🧾', kicker: 'Vehicle history',
      title: 'Run a full provenance check',
      text: 'Check things such as outstanding finance, theft and insurance write-off history that our free scan does not independently verify yet.',
      cta: 'Run full history check', url: ''
    },
    {
      key: 'battery', icon: '🔋', kicker: 'Battery certainty',
      title: 'Get an independent battery test',
      text: 'A physical diagnostic test can give you stronger evidence about battery State of Health than an estimated range can.',
      cta: 'Check battery testing', url: ''
    },
    {
      key: 'insurance', icon: '🛡️', kicker: 'Insurance',
      title: 'Get a real insurance quote',
      text: 'Our estimator is only for budgeting. A live quote from an insurer or comparison service is what actually tells you what you may pay.',
      cta: 'Compare insurance quotes', url: ''
    },
    {
      key: 'charger', icon: '⚡', kicker: 'Home charging',
      title: 'Compare home charging options',
      text: 'If you can charge at home, a suitable charger and overnight tariff can make EV ownership much easier and cheaper.',
      cta: 'Compare home chargers', url: ''
    }
  ];

  function linkMarkup(partner) {
    if (!partner.url) {
      return `<span class="partner-link is-disabled" aria-disabled="true" title="Affiliate partner not connected yet">Partner link coming soon</span>`;
    }
    return `<a class="partner-link" href="${partner.url}" target="_blank" rel="noopener sponsored">${partner.cta} →</a>`;
  }

  function mountPartners() {
    if ($('#partner-next-steps')) return;
    const insurance = $('#insurance-estimator');
    const target = insurance || $('.effective-card') || $('.fit-score-card') || $('.limits-card');
    if (!target) return;

    const section = document.createElement('section');
    section.id = 'partner-next-steps';
    section.className = 'report-card partner-card';
    section.innerHTML = `
      <div class="partner-head">
        <div>
          <span class="mini-label">Useful next steps</span>
          <h2>Want to check anything in more detail?</h2>
          <p>EV Scan can point you towards specialist services when you want stronger verification or a real quote. These are separate from our Deal Score.</p>
        </div>
        <div class="partner-disclosure"><b>Affiliate disclosure:</b> some links here may earn EV Scan a commission if you use them. That never changes our scores, verdicts or which cars we recommend.</div>
      </div>
      <div class="partner-grid">
        ${PARTNERS.map(partner => `
          <article class="partner-item" data-partner="${partner.key}">
            <span class="partner-icon" aria-hidden="true">${partner.icon}</span>
            <span class="partner-kicker">${partner.kicker}</span>
            <h3>${partner.title}</h3>
            <p>${partner.text}</p>
            ${linkMarkup(partner)}
          </article>`).join('')}
      </div>
      <p class="partner-footnote"><b>Important:</b> a partner paying us does not make their data “verified” inside EV Scan. We only label information according to the evidence actually returned.</p>
    `;

    target.insertAdjacentElement('afterend', section);
  }

  function mountAll() {
    mountHomepageTrust();
    mountPartners();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountAll);
  else mountAll();
})();

(() => {
  if (document.querySelector('script[data-evscan-brand]')) return;
  const brand = document.createElement('script');
  brand.src = '/brand.js';
  brand.dataset.evscanBrand = 'true';
  brand.onload = () => {
    const light = document.createElement('script');
    light.src = '/brand-light.js';
    light.dataset.evscanBrandLight = 'true';
    document.head.appendChild(light);
  };
  document.head.appendChild(brand);
})();
