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
        <div class="eyebrow">Your EV buying dashboard</div>
        <h2 id="account-info-title">More useful while you shop. Still useful after you buy.</h2>
        <p class="account-info-intro">Scanning stays free without an account. Create one only if you want EV Scan to become your personal place to shortlist cars, compare real scans, get personalised recommendations and keep on top of the EV you eventually buy.</p>
        <div class="account-info-grid">
          <article><span>♡</span><div><b>Build a proper shortlist</b><p>Save the exact EVs you care about, keep their reports together and stop losing track of good listings.</p></div></article>
          <article><span>⇄</span><div><b>Compare the actual cars</b><p>Put shortlisted scans side by side and compare Deal Score, price, battery, range, MOT and confidence — not just model specs.</p></div></article>
          <article><span>◎</span><div><b>Get personalised EV matches</b><p>Find My EV and EV Fit can use your real journeys, charging situation and priorities to make recommendations that suit you.</p></div></article>
          <article><span>◷</span><div><b>Never lose an important date</b><p>Move the car you buy into My Garage and track MOT, service, tax/VED and battery-warranty dates with due-soon warnings and calendar reminders.</p></div></article>
          <article><span>↗</span><div><b>Take your EV Scan anywhere</b><p>Your scans, shortlist, comparisons and garage follow your account, so you can pick up on another phone or computer.</p></div></article>
          <article><span>◐</span><div><b>Make EV Scan feel like yours</b><p>Choose light or dark mode, an accent colour, compact layout and reduced motion. Small extras, without changing any vehicle score.</p></div></article>
        </div>
        <div class="account-info-footer">
          <button class="primary-button" type="button" data-account-info-register>Create my free account</button>
          <button class="account-info-login" type="button" data-account-info-login>I already have an account</button>
          <small>Sign up with just an email and password. No account is ever required to scan a car.</small>
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
          <div class="eyebrow">Unlock more from EV Scan</div>
          <h3>Build your shortlist. Compare properly. Stay on top after you buy.</h3>
          <p>A free account turns EV Scan into your personal EV buying dashboard — helping you make the decision now and manage the important stuff later.</p>
        </div>
        <div class="account-benefits-points" aria-label="Free account benefits">
          <span><i>♡</i><b>Save the cars that matter</b><small>Keep every serious scan in one shortlist</small></span>
          <span><i>⇄</i><b>Compare exact cars</b><small>Price, battery, range, MOT and scores side by side</small></span>
          <span><i>◎</i><b>Personalised EV matches</b><small>Recommendations shaped around your real life</small></span>
          <span><i>◷</i><b>Ownership reminders</b><small>MOT, service, tax/VED and battery warranty in My Garage</small></span>
        </div>
        <button class="primary-button account-benefits-more" type="button" data-account-benefits>See everything you unlock →</button>
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
