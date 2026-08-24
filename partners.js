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

  /*
    Add real affiliate URLs here once approved. Leaving them blank keeps the
    buttons disabled so EV Scan never implies an affiliate relationship that
    does not yet exist.
  */
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

  function mount() {
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
