(() => {
  const $ = selector => document.querySelector(selector);

  const style = document.createElement('style');
  style.textContent = `.login-card .preview-dashboard-button{background:rgba(255,255,255,.035)!important;color:#cbd3df!important;border:1px solid rgba(255,255,255,.09)!important;box-shadow:none!important;margin-top:7px!important}`;
  document.head.appendChild(style);

  function preview() {
    const overlay = $('#login-overlay');
    if (overlay) overlay.hidden = true;
    const banner = $('#system-banner');
    if (banner) {
      banner.hidden = false;
      $('#system-banner-title').textContent = 'Preview mode · no analytics are being stored';
      $('#system-banner-copy').textContent = 'The full dashboard interface is ready. Persistent history, reviews and live statistics will switch on only when the production database and privacy settings are activated.';
      banner.querySelector('.status-dot').className = 'status-dot is-waiting';
    }
    const mini = $('#source-mini');
    if (mini) {
      mini.querySelector('.status-dot').className = 'status-dot is-waiting';
      mini.querySelector('small').textContent = 'Preview · collection paused';
    }
  }

  function setFlag(element, label, state = 'waiting') {
    if (!element) return;
    element.innerHTML = `<i class="status-dot ${state === 'bad' ? 'is-bad' : state === 'waiting' ? 'is-waiting' : ''}"></i>${label}`;
  }

  function listingLabel(status = {}) {
    if (!status.configured) return 'Listing links · not connected';
    if (!status.statusKnown) return 'Listing links · status unknown';
    const remaining = Number(status.remainingCredits);
    if (!Number.isFinite(remaining)) return 'Listing links · checking';
    const reset = status.resetDate ? ` · ${status.resetDate}` : '';
    return `Link credits · ${remaining.toLocaleString('en-GB')} left${reset}`;
  }

  $('#preview-dashboard')?.addEventListener('click', preview);

  fetch('/api/health', { headers:{ accept:'application/json' }, cache:'no-store' })
    .then(response => response.json())
    .then(data => {
      const flags = $('#health-flags');
      if (flags) {
        const items = flags.children;
        setFlag(items[0], 'DVSA', data.liveMotConfigured ? 'good' : 'bad');
        const listing = data.listingStatus || {};
        setFlag(items[1], listingLabel(listing), listing.available ? 'good' : listing.statusKnown ? 'bad' : 'waiting');
        setFlag(items[2], 'Database', data.accountsConfigured ? 'good' : 'waiting');
      }

      const mini = $('#source-mini');
      if (mini && data.listingStatus) {
        const status = data.listingStatus;
        mini.querySelector('.status-dot').className = `status-dot ${status.available ? '' : status.statusKnown ? 'is-bad' : 'is-waiting'}`;
        mini.querySelector('b').textContent = 'Listing allowance';
        mini.querySelector('small').textContent = status.available
          ? `${Number(status.remainingCredits || 0).toLocaleString('en-GB')} credits left${status.resetDate ? ` · resets ${status.resetDate}` : ''}`
          : status.message || 'Link scans paused; registration checks still available';
      }
    })
    .catch(() => {});
})();
