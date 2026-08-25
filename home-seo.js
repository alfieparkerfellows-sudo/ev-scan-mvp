const SITE_URL = 'https://ev-scan-mvp.alfieparkerfellows.workers.dev';

const FAQS = [
  {
    q: 'What is EV Scan?',
    a: 'EV Scan is a free UK used-electric-car buying assistant. Paste a vehicle listing and we cross-check the advert against available vehicle, MOT and market evidence before releasing a simple buying report.'
  },
  {
    q: 'Is EV Scan free?',
    a: 'Yes. The core EV Scan buying tools are intended to be free to use. We may earn commission from clearly labelled partner or affiliate links, but those relationships do not change Deal Scores or recommendations.'
  },
  {
    q: 'Do I need an account to use EV Scan?',
    a: 'No. You can scan a car without creating an account. A free account is optional and is only useful if you want EV Scan to remember saved scans, your shortlist, driving profile, comparison choices, My Garage, ownership reminders and appearance preferences.'
  },
  {
    q: 'Can EV Scan check MOT history?',
    a: 'EV Scan uses official DVSA MOT information as part of a live listing scan when the vehicle can be matched confidently to a registration. If that verification is unavailable, EV Scan does not release a partial buying report.'
  },
  {
    q: 'Can EV Scan analyse car adverts?',
    a: 'Yes, when EV Scan can access and independently match enough reliable data for the exact advert. If a marketplace or provider cannot be verified strongly enough, EV Scan refuses the scan rather than showing a partial or guessed report.'
  },
  {
    q: 'Can EV Scan estimate battery health?',
    a: 'EV Scan can explain battery specification and battery-related buying risks, but a listing link cannot remotely measure battery State of Health. EV Scan does not invent a SoH percentage without measured battery evidence.'
  },
  {
    q: 'Does EV Scan estimate electric-car insurance?',
    a: 'EV Scan includes a separate insurance budgeting estimator that asks about the driver, vehicle use and other relevant factors. It is an estimate, not an insurer quote.'
  },
  {
    q: 'How accurate is EV Scan?',
    a: 'EV Scan uses a strict evidence gate. A live buying report is only released when the advert, vehicle identity, MOT information and market evidence can be matched strongly enough. If critical evidence is missing or conflicting, no report is generated.'
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
        description: 'A beginner-friendly UK used-EV buying assistant that cross-checks a vehicle advert against available vehicle, MOT and market evidence before releasing a report.'
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
  <meta name="google-site-verification" content="RD0qu1KdeWjd9m3E8SiPbTgRyKq7PSUnldosIdF4FKQ">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="EV Scan">
  <meta property="og:title" content="EV Scan — Check a Used Electric Car Before You Buy">
  <meta property="og:description" content="Paste a used EV listing. EV Scan cross-checks the advert against available vehicle, MOT and market evidence and only releases a report when the data is reliable enough.">
  <meta property="og:url" content="${SITE_URL}/">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="EV Scan — Check a Used Electric Car Before You Buy">
  <meta name="twitter:description" content="Beginner-friendly used EV buying reports with strict evidence checks, not guesses.">
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
