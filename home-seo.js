const SITE_URL = 'https://ev-scan-mvp.alfieparkerfellows.workers.dev';

const FAQS = [
  {
    q: 'What is EV Scan?',
    a: 'EV Scan is a free UK used-electric-car buying assistant. You can paste a vehicle listing or enter a registration and we turn technical EV information into a simple buying report.'
  },
  {
    q: 'Is EV Scan free?',
    a: 'Yes. The core EV Scan buying tools are intended to be free to use. We may earn commission from clearly labelled partner or affiliate links, but those relationships do not change Deal Scores or recommendations.'
  },
  {
    q: 'Can EV Scan check MOT history?',
    a: 'EV Scan can use official DVSA MOT information when the live registration service is available. We explain MOT patterns in plain English rather than only showing a list of tests.'
  },
  {
    q: 'Can EV Scan check an Auto Trader advert?',
    a: 'EV Scan is being built to analyse approved marketplace listing data, including Auto Trader once the required production access is connected. Until then, marketplace-only fields stay unavailable rather than being guessed.'
  },
  {
    q: 'Can EV Scan estimate battery health?',
    a: 'EV Scan can show battery confidence or an expected battery-health range when there is enough reliable model information. We do not present an estimated State of Health as a measured battery test.'
  },
  {
    q: 'Does EV Scan estimate electric-car insurance?',
    a: 'Yes. The report includes an insurance budgeting estimator that asks about the driver, vehicle use and other relevant factors. It is an estimate, not an insurer quote.'
  },
  {
    q: 'How accurate is EV Scan?',
    a: 'Accuracy depends on the information available for that car. EV Scan labels information as verified, estimated, seller claim or unknown so you can see exactly how much confidence to place in each part of the report.'
  },
  {
    q: 'Does advertising affect EV Scan recommendations?',
    a: 'No. Advertising, affiliate commission or commercial partnerships must never improve a Deal Score, verdict or vehicle recommendation. Commercial links are kept separate from the buying analysis.'
  }
];

function esc(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderHomeHead() {
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'EV Scan',
        description: 'A beginner-friendly UK used-EV buying assistant that explains price, battery, range, MOT history, insurance and buying risks in plain English.'
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'EV Scan',
        url: SITE_URL
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map(item => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a }
        }))
      }
    ]
  }).replaceAll('<', '\\u003c');

  return `
  <link rel="canonical" href="${SITE_URL}/">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="EV Scan">
  <meta property="og:title" content="EV Scan — Check a Used Electric Car Before You Buy">
  <meta property="og:description" content="Paste a used EV listing or enter a registration. EV Scan explains price, battery, real-world range, MOT history, insurance and the questions worth asking before you buy.">
  <meta property="og:url" content="${SITE_URL}/">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="EV Scan — Check a Used Electric Car Before You Buy">
  <meta name="twitter:description" content="Beginner-friendly used EV buying reports with clear answers, not jargon.">
  <link rel="stylesheet" href="/seo.css">
  <script type="application/ld+json">${schema}</script>`;
}

export function renderHomeFaq() {
  return `<section id="evscan-faq" class="home-faq-section section-pad">
    <div class="home-faq-head">
      <div>
        <div class="eyebrow">EV Scan FAQ</div>
        <h2>Quick answers about EV Scan.</h2>
        <p>Researching electric cars? Browse our <a href="/ev-guides/">simple EV buying guides</a> or <a href="/cars/">used EV model guides</a>.</p>
      </div>
      <a class="home-faq-guides" href="/cars/">Used EV Guides →</a>
    </div>
    <div class="home-faq-list">
      ${FAQS.map((item, index) => `<details${index === 0 ? ' open' : ''}><summary>${esc(item.q)}<span>+</span></summary><p>${esc(item.a)}</p></details>`).join('')}
    </div>
  </section>`;
}
