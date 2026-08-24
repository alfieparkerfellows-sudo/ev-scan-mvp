(() => {
  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;

  function ensureInfoModal() {
    if ($('#account-info-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'account-info-overlay';
    overlay.className = 'account-info-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="account-info-dialog" role="dialog" aria-modal="true" aria-labelledby="account-info-title">
        <button class="account-info-close" type="button" data-account-info-close aria-label="Close">×</button>
        <div class="eyebrow">Free My EV Scan account</div>
        <h2 id="account-info-title">One place for the EVs you’re considering — and the one you buy.</h2>
        <p class="account-info-intro">You never need an account to scan a car. A free account simply saves the useful bits so you do not have to start again every time.</p>
        <div class="account-info-grid">
          <article><span>♡</span><div><b>Save scans</b><p>Keep reports you want to revisit and access them again when you come back.</p></div></article>
          <article><span>⇄</span><div><b>Shortlist + compare</b><p>Keep serious candidates together and compare the actual cars you scanned side by side.</p></div></article>
          <article><span>⌁</span><div><b>Save your driving profile</b><p>Tell EV Scan how you drive once. We can reuse it in Find My EV and personal EV-fit checks.</p></div></article>
          <article><span>◷</span><div><b>My Garage after you buy</b><p>Keep MOT, service, tax/VED and battery-warranty dates together, with due-soon warnings and calendar reminders.</p></div></article>
          <article><span>↗</span><div><b>Pick up on another device</b><p>Your saved cars, shortlist, garage and preferences are tied to your account instead of one browser.</p></div></article>
          <article><span>◐</span><div><b>A few useful personal touches</b><p>Choose light or dark mode, an accent colour, compact layout and reduced motion. None of these changes your vehicle scores.</p></div></article>
        </div>
        <div class="account-info-footer">
          <button class="primary-button" type="button" data-account-info-register>Create free account</button>
          <button class="account-info-login" type="button" data-account-info-login>I already have an account</button>
          <small>Two fields to sign up: email and password. Scanning remains free without an account.</small>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }

  function openInfo() {
    ensureInfoModal();
    const overlay = $('#account-info-overlay');
    if (!overlay) return;
    overlay.hidden = false;
    document.body.classList.add('modal-open');
  }

  function closeInfo() {
    const overlay = $('#account-info-overlay');
    if (overlay) overlay.hidden = true;
    const authOpen = $('#account-overlay')?.hidden === false;
    const dashboardOpen = $('#account-dashboard')?.hidden === false;
    const scanOpen = $('#scan-overlay')?.hidden === false;
    const finderOpen = $('#finder-modal')?.hidden === false;
    if (!authOpen && !dashboardOpen && !scanOpen && !finderOpen) document.body.classList.remove('modal-open');
  }

  function openAuth(mode = 'login') {
    closeInfo();
    const overlay = $('#account-overlay');
    if (!overlay) return;
    overlay.hidden = false;
    document.body.classList.add('modal-open');
    const tab = $(`[data-auth-mode="${mode}"]`, overlay);
    if (tab) tab.click();
  }

  function polishHeader() {
    const header = $('.site-header');
    if (!header) return;
    const entry = $('.account-entry', header);
    const oldScan = $('[data-scroll-home]', header);
    if (!entry) return;
    if (oldScan) oldScan.remove();
    header.classList.add('account-header-polished');
  }

  function polishBenefits() {
    const section = $('#account-benefits');
    if (!section || section.dataset.evAccountPolished === 'true') return;
    section.dataset.evAccountPolished = 'true';
    section.innerHTML = `
      <div class="account-benefits-card ev-account-benefits-v2">
        <div class="account-benefits-main">
          <div class="eyebrow">Free My EV Scan account</div>
          <h3>Keep the cars you’re considering in one place.</h3>
          <p>Save scans, build a shortlist and compare cars while you shop. If you buy one, My Garage keeps its important ownership dates together too.</p>
        </div>
        <div class="account-benefits-points" aria-label="Free account benefits">
          <span><b>Save + compare</b><small>Your actual scanned cars</small></span>
          <span><b>Driving profile</b><small>Less repeating yourself</small></span>
          <span><b>My Garage</b><small>MOT, service + warranty dates</small></span>
          <span><b>Across devices</b><small>Pick up where you left off</small></span>
        </div>
        <button class="ghost-button account-benefits-more" type="button" data-account-benefits>See what you get</button>
      </div>`;
  }

  function simplifyDashboard() {
    const main = $('#account-main');
    if (!main) return;

    const nameInput = $('#display-name', main);
    nameInput?.closest('.account-card')?.remove();

    const advancedToggle = $('[data-pref-toggle="advancedData"]', main);
    advancedToggle?.closest('.account-toggle-row')?.remove();

    const nickname = $('input[name="nickname"]', main);
    nickname?.closest('.account-field')?.remove();

    const heading = $('.account-page-head h1', main);
    if (heading && /^Hi\s|^Your EVs, remembered\.?$/i.test(heading.textContent.trim())) {
      heading.textContent = 'Your EVs, remembered.';
    }
  }

  let scheduled = false;
  function schedulePolish() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      ensureInfoModal();
      polishHeader();
      polishBenefits();
      simplifyDashboard();
    });
  }

  document.addEventListener('click', event => {
    const benefits = event.target.closest('[data-account-benefits]');
    if (benefits) {
      event.preventDefault();
      openInfo();
      return;
    }
    if (event.target.closest('[data-account-info-close]')) {
      event.preventDefault();
      closeInfo();
      return;
    }
    if (event.target.closest('[data-account-info-register]')) {
      event.preventDefault();
      openAuth('register');
      return;
    }
    if (event.target.closest('[data-account-info-login]')) {
      event.preventDefault();
      openAuth('login');
      return;
    }
    const overlay = event.target.closest('#account-info-overlay');
    if (overlay && event.target === overlay) closeInfo();
  }, true);

  const observer = new MutationObserver(schedulePolish);
  if (document.body) observer.observe(document.body, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedulePolish, { once: true });
  else schedulePolish();
})();
