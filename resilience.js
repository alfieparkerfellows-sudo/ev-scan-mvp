(() => {
  const safeArray = (value) => Array.isArray(value) ? value : [];
  const safeText = (value, fallback = 'Unknown') => {
    if (value === null || value === undefined) return fallback;
    const text = String(value).trim();
    return text || fallback;
  };
  const safeNumber = (value, fallback = null) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  };
  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  async function fetchJson(url, options = {}, timeoutMs = 12000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      const text = await response.text();
      let data = null;
      try { data = text ? JSON.parse(text) : {}; }
      catch { data = { ok: false, message: 'The data provider returned an unreadable response.' }; }
      return { response, data };
    } finally {
      clearTimeout(timer);
    }
  }

  const storage = {
    get(key, fallback = null) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : raw;
      } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); return true; }
      catch { return false; }
    },
    remove(key) {
      try { localStorage.removeItem(key); return true; }
      catch { return false; }
    }
  };

  window.EVScanResilience = { safeArray, safeText, safeNumber, escapeHtml, fetchJson, storage };

  const styles = document.createElement('style');
  styles.textContent = `
    .legal-nav-inline{display:flex;gap:10px 18px;flex-wrap:wrap;justify-content:center;margin-top:10px;font-size:.75rem}
    .legal-nav-inline a{color:#95a2b8;text-decoration:none;font-weight:700}
    .legal-nav-inline a:hover{color:#fff}
    .image-fallback-safe{width:100%;height:100%;min-height:120px;display:grid;place-items:center;text-align:center;padding:18px;background:linear-gradient(145deg,#202b3e,#0d1421);color:#9da9bc;font-weight:750}
    .service-fallback{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:99999;width:min(620px,calc(100% - 28px));padding:12px 15px;border:1px solid rgba(255,196,90,.28);border-radius:14px;background:rgba(20,20,26,.96);color:#f4d99f;font-size:.78rem;line-height:1.45;box-shadow:0 15px 50px rgba(0,0,0,.35)}

    /* Make the main scan input much easier to tap, especially on phones. */
    #scan-form .input-wrap{cursor:text;touch-action:manipulation}
    #scan-form .input-wrap input{min-height:58px;padding:0 10px;touch-action:manipulation}
    #scan-form .input-icon{pointer-events:none}
    #scan-form .scan-button{cursor:pointer}
    @media(max-width:720px){
      #scan-form .input-wrap{padding:10px;gap:8px;border-radius:22px}
      #scan-form .input-wrap input{min-height:64px;padding:0 8px;font-size:1.02rem}
      #scan-form .input-icon{margin-left:9px;font-size:1.45rem}
      #scan-form .scan-button{min-height:56px}
    }
  `;
  document.head.appendChild(styles);

  function legalNav() {
    const nav = document.createElement('nav');
    nav.className = 'legal-nav-inline';
    nav.setAttribute('aria-label', 'Legal');
    nav.innerHTML = '<a href="/privacy.html">Privacy</a><a href="/cookies.html">Cookies</a><a href="/terms.html">Terms</a><a href="/affiliate-disclosure.html">Affiliate disclosure</a>';
    return nav;
  }

  const footer = document.querySelector('.site-footer');
  if (footer && !footer.querySelector('.legal-nav-inline')) footer.appendChild(legalNav());

  const report = document.querySelector('#report-view');
  if (report && !report.querySelector('.legal-nav-inline')) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'padding:20px 18px 32px';
    wrap.appendChild(legalNav());
    report.appendChild(wrap);
  }

  /* Tapping the icon or spare white space should focus the field, not do nothing. */
  document.addEventListener('click', (event) => {
    const wrap = event.target?.closest?.('#scan-form .input-wrap');
    if (!wrap) return;
    if (event.target?.closest?.('button') || event.target?.matches?.('input')) return;
    wrap.querySelector('input')?.focus();
  });

  document.addEventListener('error', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;
    if (target.dataset.fallbackApplied === '1') return;
    target.dataset.fallbackApplied = '1';
    const fallback = document.createElement('div');
    fallback.className = 'image-fallback-safe';
    fallback.textContent = target.alt ? `${target.alt} · photo unavailable` : 'Photo unavailable';
    target.replaceWith(fallback);
  }, true);

  let warningShown = false;
  function showSafeWarning() {
    if (warningShown) return;
    warningShown = true;
    const warning = document.createElement('div');
    warning.className = 'service-fallback';
    warning.setAttribute('role', 'status');
    warning.textContent = 'One part of EV Scan did not load correctly. The rest of the page is still available — missing information will be shown as unavailable rather than guessed.';
    document.body.appendChild(warning);
    setTimeout(() => warning.remove(), 7000);
  }

  window.addEventListener('unhandledrejection', (event) => {
    console.error('EV Scan recovered from an unhandled promise rejection:', event.reason);
    showSafeWarning();
  });
  window.addEventListener('error', (event) => {
    if (event.target instanceof HTMLImageElement) return;
    console.error('EV Scan recovered from a page error:', event.error || event.message);
    showSafeWarning();
  });
})();