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

  $('#preview-dashboard')?.addEventListener('click', preview);

  fetch('/api/health', { headers:{ accept:'application/json' } })
    .then(response => response.json())
    .then(data => {
      const flags = $('#health-flags');
      if (!flags) return;
      const items = flags.children;
      if (items[0]) items[0].querySelector('i').className = `status-dot ${data.liveMotConfigured ? '' : 'is-bad'}`;
      if (items[1]) items[1].querySelector('i').className = `status-dot ${data.autoTraderConfigured ? '' : 'is-waiting'}`;
      if (items[2]) items[2].querySelector('i').className = 'status-dot is-waiting';
    })
    .catch(() => {});
})();
