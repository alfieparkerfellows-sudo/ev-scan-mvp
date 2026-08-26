const SITE_URL = 'https://ev-scan-mvp.alfieparkerfellows.workers.dev';

const FAQS = [
  {
    q: 'What is EV Scan?',
    a: 'EV Scan is a free UK used-electric-car buying assistant. Paste a supported vehicle listing or enter a UK registration and EV Scan checks the evidence it can verify before showing a result.'
  },
  {
    q: 'Is EV Scan free?',
    a: 'Yes. The core EV Scan buying tools are intended to be free to use. If the free listing-search allowance is temporarily unavailable, EV Scan pauses link scans rather than charging you or reducing its evidence standard. Registration checks remain available when the official vehicle service is available.'
  },
  {
    q: 'Do I need an account to use EV Scan?',
    a: 'No. You can scan a car without creating an account. A free account is optional and is only useful if you want EV Scan to remember saved scans, your shortlist, driving profile, comparison choices, My Garage, ownership reminders and appearance preferences.'
  },
  {
    q: 'Can EV Scan check MOT history?',
    a: 'Yes. EV Scan uses official DVSA MOT information when it can confidently identify the vehicle. Registration-only checks use this path directly, and supported listing scans also verify the advert against the official vehicle record.'
  },
  {
    q: 'Can EV Scan analyse car adverts?',
    a: 'EV Scan can analyse supported vehicle-listing pages when it can read enough reliable advert information and match the car to an official UK vehicle record. If the advert is inaccessible, incomplete or conflicting, EV Scan refuses the listing scan rather than showing a partial or guessed report.'
  },
  {
    q: 'Can EV Scan estimate battery health?',
    a: 'EV Scan can explain battery specifications and battery-related buying risks, but a listing link cannot remotely measure battery State of Health. EV Scan does not invent a SoH percentage without measured battery evidence.'
  },
  {
    q: 'Does EV Scan compare the asking price with the market?',
    a: 'Not in the current live scanner. EV Scan can show the asking price found in a supported advert, but it does not currently claim that a car is above or below market because no suitable permanent zero-cost independent market-comparison source is connected.'
  },
  {
    q: 'Does EV Scan estimate electric-car insurance?',
    a: 'EV Scan includes a separate insurance budgeting estimator that asks about the driver, vehicle use and other relevant factors. It is an estimate, not an insurer quote.'
  },
  {
    q: 'How accurate is EV Scan?',
    a: 'EV Scan uses a strict evidence gate for listing reports. A live listing report is only released when the advert and official vehicle identity can be matched strongly enough and every field required by that report is supported. If critical evidence is missing or conflicting, no listing report is generated.'
  },
  {
    q: 'Does advertising affect EV Scan recommendations?',
    a: 'No. Advertising, affiliate commission or commercial partnerships must never improve a verdict or vehicle recommendation. Commercial links are kept separate from the buying analysis.'
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
        description: 'A beginner-friendly UK used-EV buying assistant with supported listing analysis, official MOT checks and strict evidence rules.'
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
  <meta property="og:description" content="Paste a supported used-EV listing or enter a UK registration. EV Scan checks the advert and official vehicle evidence and refuses incomplete listing reports rather than guessing.">
  <meta property="og:url" content="${SITE_URL}/">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="EV Scan — Check a Used Electric Car Before You Buy">
  <meta name="twitter:description" content="Beginner-friendly used EV checks with strict evidence rules, not guesses.">
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
