(() => {
  if (window.__EVSCAN_TELEMETRY__) return;
  window.__EVSCAN_TELEMETRY__ = true;

  const originalFetch = window.fetch.bind(window);
  const sessionKey = 'evscan_session_v1';
  let sessionId = '';
  try {
    sessionId = sessionStorage.getItem(sessionKey) || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    sessionStorage.setItem(sessionKey, sessionId);
  } catch {
    sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function deviceType() {
    const width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    if (width <= 720) return 'mobile';
    if (width <= 1050) return 'tablet';
    return 'desktop';
  }

  function trafficSource() {
    try {
      const params = new URLSearchParams(location.search);
      const utm = (params.get('utm_source') || '').trim();
      if (utm) return utm.slice(0, 80);
      if (!document.referrer) return 'Direct';
      const host = new URL(document.referrer).hostname.replace(/^www\./,'');
      if (host.includes('google.')) return 'Google';
      if (host.includes('linkedin.')) return 'LinkedIn';
      if (host.includes('bing.')) return 'Bing';
      return host.slice(0, 80);
    } catch { return 'Direct'; }
  }

  function referrerHost() {
    try { return document.referrer ? new URL(document.referrer).hostname.replace(/^www\./,'').slice(0,160) : ''; }
    catch { return ''; }
  }

  function payload(eventType, extra = {}) {
    return {
      eventType,
      sessionId,
      path: location.pathname,
      referrerHost: referrerHost(),
      deviceType: deviceType(),
      source: trafficSource(),
      ...extra
    };
  }

  function send(eventType, extra = {}) {
    const body = JSON.stringify(payload(eventType, extra));
    try {
      if (navigator.sendBeacon) {
        const ok = navigator.sendBeacon('/api/events', new Blob([body], { type:'application/json' }));
        if (ok) return;
      }
    } catch {}
    originalFetch('/api/events', { method:'POST', headers:{'content-type':'application/json'}, body, keepalive:true }).catch(()=>{});
  }

  window.EVScanTelemetry = { send, sessionId };
  send('page_view');

  document.addEventListener('submit', event => {
    if (event.target?.matches?.('#scan-form, .mini-scan-form')) {
      const value = event.target.querySelector('input')?.value || '';
      const scanMode = /https?:\/\/|\.[a-z]{2,}/i.test(value) ? 'listing' : 'registration';
      send('scan_started', { scanMode });
    }
  }, true);

  document.addEventListener('click', event => {
    const partner = event.target?.closest?.('.partner-link:not(.is-disabled), [data-affiliate]');
    if (partner) send('partner_click', { source: partner.dataset.partner || partner.textContent?.trim().slice(0,80) || 'partner' });
    const finder = event.target?.closest?.('[data-open-finder], #open-finder');
    if (finder) send('finder_opened');
  }, true);

  let reportLogged = false;
  const report = document.querySelector('#report-view');
  if (report) {
    const observeReport = () => {
      if (!reportLogged && !report.hidden) { reportLogged = true; send('report_viewed'); }
    };
    new MutationObserver(observeReport).observe(report, { attributes:true, attributeFilter:['hidden'] });
    observeReport();
  }

  window.fetch = async function(input, init) {
    const urlText = typeof input === 'string' ? input : input?.url || '';
    const isScan = /\/api\/scan(?:\?|$)/.test(urlText);
    const isAutoTrader = /\/api\/autotrader\/(?:search|status)(?:\?|$)/.test(urlText);
    if (!isScan && !isAutoTrader) return originalFetch(input, init);

    const start = performance.now();
    try {
      const response = await originalFetch(input, init);
      let data = {};
      try { data = await response.clone().json(); } catch {}
      const durationMs = Math.round(performance.now() - start);
      const provider = isAutoTrader ? 'autotrader' : 'dvsa';
      send('api_call', { source:provider, success:response.ok, durationMs, errorCode:response.ok ? '' : (data.code || data.diagnostic?.upstreamCode || `HTTP_${response.status}`), metadata:{ status:response.status } });
      if (isScan) {
        const vehicle = data?.vehicle || {};
        const year = vehicle.firstUsedDate ? Number(String(vehicle.firstUsedDate).slice(0,4)) || null : null;
        send('scan_completed', {
          scanMode:data?.mode || 'registration',
          success:Boolean(response.ok && data?.ok),
          durationMs,
          errorCode:response.ok ? '' : (data.code || data.diagnostic?.upstreamCode || `HTTP_${response.status}`),
          vehicleMake:vehicle.make || '',
          vehicleModel:vehicle.model || '',
          vehicleYear:year,
          metadata:{ motRecords:Array.isArray(vehicle.motTests) ? vehicle.motTests.length : null }
        });
      }
      return response;
    } catch (error) {
      const durationMs = Math.round(performance.now() - start);
      send('api_call', { source:isAutoTrader?'autotrader':'dvsa', success:false, durationMs, errorCode:'NETWORK_ERROR' });
      if (isScan) send('scan_completed', { scanMode:'registration', success:false, durationMs, errorCode:'NETWORK_ERROR' });
      throw error;
    }
  };

  window.addEventListener('error', event => {
    if (event.target && event.target !== window) return;
    send('app_error', { errorCode:(event.message || 'WINDOW_ERROR').slice(0,120), metadata:{ file:(event.filename || '').split('/').pop() || '' } });
  });
  window.addEventListener('unhandledrejection', event => {
    const message = String(event.reason?.message || event.reason || 'UNHANDLED_REJECTION').slice(0,120);
    send('app_error', { errorCode:message });
  });
})();
