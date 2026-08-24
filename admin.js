(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = { token: sessionStorage.getItem('evscan_admin_token') || '', days: 30, data: null, connected: false, collectionEnabled: false, reviewFilter: 'all' };

  const formatNumber = (value) => new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(Number(value || 0));
  const formatPercent = (value) => value == null ? '—' : `${Number(value).toFixed(1).replace('.0','')}%`;
  const formatDateTime = (value) => {
    if (!value) return 'Unknown time';
    const date = new Date(`${String(value).replace(' ', 'T')}Z`);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }).format(date);
  };
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));

  function setView(name) {
    $$('.admin-nav-item').forEach(button => button.classList.toggle('is-active', button.dataset.view === name));
    $$('.admin-view').forEach(panel => panel.classList.toggle('is-active', panel.dataset.panel === name));
    const button = $(`.admin-nav-item[data-view="${name}"]`);
    $('#page-title').textContent = button?.querySelector('b')?.textContent || 'Overview';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showBanner(title, copy, tone = 'waiting') {
    const banner = $('#system-banner');
    banner.hidden = false;
    $('#system-banner-title').textContent = title;
    $('#system-banner-copy').textContent = copy;
    const dot = banner.querySelector('.status-dot');
    dot.className = `status-dot ${tone === 'bad' ? 'is-bad' : tone === 'good' ? '' : 'is-waiting'}`;
  }

  function setCollectionStatus() {
    const mini = $('#source-mini');
    const dot = mini.querySelector('.status-dot');
    const small = mini.querySelector('small');
    if (!state.connected) {
      dot.className = 'status-dot is-waiting';
      small.textContent = 'Database not connected';
    } else if (!state.collectionEnabled) {
      dot.className = 'status-dot is-waiting';
      small.textContent = 'Ready · collection paused';
    } else {
      dot.className = 'status-dot';
      small.textContent = 'Live and collecting';
    }
  }

  function sparkline(target, values) {
    const root = $(target);
    if (!root) return;
    const nums = values.map(Number).filter(Number.isFinite);
    if (nums.length < 2 || Math.max(...nums) === Math.min(...nums)) { root.innerHTML = ''; return; }
    const width = 84, height = 30, min = Math.min(...nums), max = Math.max(...nums);
    const points = nums.map((value, index) => {
      const x = index / (nums.length - 1) * width;
      const y = height - ((value - min) / (max - min)) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    root.innerHTML = `<svg viewBox="0 0 ${width} ${height}" aria-hidden="true"><polyline points="${points}" fill="none" stroke="#f50f5d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  function trendDays(trend = [], reviewTrend = []) {
    const map = new Map();
    trend.forEach(row => map.set(row.day, { day: row.day, pageviews:Number(row.pageviews||0), scans:Number(row.scans||0), errors:Number(row.errors||0), reviews:0 }));
    reviewTrend.forEach(row => {
      const current = map.get(row.day) || { day:row.day, pageviews:0, scans:0, errors:0, reviews:0 };
      current.reviews = Number(row.reviews || 0); map.set(row.day, current);
    });
    return [...map.values()].sort((a,b) => String(a.day).localeCompare(String(b.day)));
  }

  function mainChart(rows) {
    const root = $('#main-trend-chart');
    if (!rows.length) { root.innerHTML = '<div class="empty-state compact"><b>No history yet</b><span>Live history will build automatically after launch.</span></div>'; return; }
    const width = 780, height = 260, left = 38, right = 10, top = 14, bottom = 32;
    const max = Math.max(1, ...rows.flatMap(row => [Number(row.pageviews||0), Number(row.scans||0)]));
    const point = (value, index) => {
      const x = left + (rows.length === 1 ? 0 : index / (rows.length - 1) * (width-left-right));
      const y = top + (1 - Number(value||0) / max) * (height-top-bottom);
      return [x,y];
    };
    const path = key => rows.map((row,index) => `${index ? 'L':'M'} ${point(row[key],index).map(v=>v.toFixed(1)).join(' ')}`).join(' ');
    const grid = [0,.25,.5,.75,1].map(level => {
      const y = top + level*(height-top-bottom); const value = Math.round(max*(1-level));
      return `<line class="chart-grid-line" x1="${left}" x2="${width-right}" y1="${y}" y2="${y}"/><text class="chart-axis-label" x="0" y="${y+4}">${value}</text>`;
    }).join('');
    const labels = rows.map((row,index) => {
      if (rows.length > 8 && index % Math.ceil(rows.length/6) !== 0 && index !== rows.length-1) return '';
      const x = point(0,index)[0]; const date = new Date(`${row.day}T12:00:00Z`); const text = Number.isNaN(date.getTime()) ? row.day : new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short'}).format(date);
      return `<text class="chart-axis-label" x="${x}" y="${height-6}" text-anchor="middle">${text}</text>`;
    }).join('');
    root.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Traffic and scans over time"><defs><linearGradient id="adminChartArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#53d4ff" stop-opacity=".16"/><stop offset="1" stop-color="#53d4ff" stop-opacity="0"/></linearGradient></defs>${grid}<path class="chart-path-page" d="${path('pageviews')}"/><path class="chart-path-scan" d="${path('scans')}"/>${labels}</svg>`;
  }

  function renderFunnel(funnel = {}) {
    const items = [
      ['Visitors', Number(funnel.visitors||0)], ['Started scan', Number(funnel.scan_started||0)], ['Successful scan', Number(funnel.scan_success||0)],
      ['Viewed report', Number(funnel.report_viewed||0)], ['Partner click', Number(funnel.partner_click||0)], ['Left review', Number(funnel.review_submitted||0)]
    ];
    const max = Math.max(1, items[0][1]);
    $('#funnel-chart').innerHTML = items.map(([label,value]) => `<div class="funnel-row"><span>${escapeHtml(label)}</span><div class="funnel-track"><div class="funnel-fill" style="width:${Math.max(value?4:0, value/max*100)}%"></div></div><b>${formatNumber(value)}</b></div>`).join('');
  }

  function rankRows(rows = [], target = '#popular-vehicles') {
    const root = $(target);
    if (!rows.length) { root.innerHTML = '<div class="empty-state compact"><b>No vehicle data yet</b><span>Popular makes and models will appear here.</span></div>'; return; }
    const max = Math.max(1, ...rows.map(row=>Number(row.scans||0)));
    root.innerHTML = rows.map((row,index) => `<div class="rank-row"><span class="rank-no">${index+1}</span><div><b>${escapeHtml([row.make,row.model].filter(Boolean).join(' ') || 'Unknown EV')}</b><small>${row.success_rate == null ? 'Success rate unavailable' : `${row.success_rate}% scan success`}</small></div><strong>${formatNumber(row.scans)}</strong></div>`).join('');
  }

  function barRows(rows = [], target, labelKey='source', valueKey='sessions') {
    const root = $(target); if (!root) return;
    if (!rows.length) { root.innerHTML = '<div class="empty-state compact"><b>No data yet</b><span>This view will populate automatically.</span></div>'; return; }
    const max = Math.max(1, ...rows.map(row=>Number(row[valueKey]||0)));
    root.innerHTML = rows.map(row => `<div class="bar-row"><span title="${escapeHtml(row[labelKey])}">${escapeHtml(row[labelKey] || 'Unknown')}</span><div class="bar-track"><i style="width:${Number(row[valueKey]||0)/max*100}%"></i></div><b>${formatNumber(row[valueKey])}</b></div>`).join('');
  }

  function apiRows(rows = [], target) {
    const root = $(target); if (!root) return;
    if (!rows.length) { root.innerHTML = '<div class="empty-state compact"><b>No API history yet</b><span>DVSA and Auto Trader performance will appear here.</span></div>'; return; }
    root.innerHTML = rows.map(row => `<div class="api-row"><div><b>${escapeHtml((row.provider||'Unknown provider').toUpperCase())}</b><small>${formatNumber(row.calls)} calls · ${formatNumber(row.failures)} failures</small></div><div class="api-stat"><span>Success</span><strong>${formatPercent(row.success_rate)}</strong></div><div class="api-stat"><span>Avg speed</span><strong>${row.avg_ms == null ? '—' : `${formatNumber(row.avg_ms)} ms`}</strong></div><div class="api-stat"><span>Status</span><strong style="color:${Number(row.success_rate||0)>=95?'#47d98c':Number(row.success_rate||0)>=80?'#ffc459':'#ff6666'}">${Number(row.success_rate||0)>=95?'Healthy':Number(row.success_rate||0)>=80?'Watch':'Issue'}</strong></div></div>`).join('');
  }

  function pageRows(rows = []) {
    $('#top-pages').innerHTML = rows.length ? rows.map(row => `<tr><td title="${escapeHtml(row.path)}">${escapeHtml(row.path)}</td><td>${formatNumber(row.views)}</td><td>${formatNumber(row.visitors)}</td></tr>`).join('') : '<tr><td colspan="3">No page-view history yet.</td></tr>';
  }

  function devices(rows = []) {
    const total = rows.reduce((sum,row)=>sum+Number(row.sessions||0),0) || 1;
    const find = name => rows.find(row=>String(row.device||'').toLowerCase()===name)?.sessions || 0;
    const mobile = Number(find('mobile')), desktop = Number(find('desktop')), tablet = Math.max(0,total-mobile-desktop);
    const mobilePct = Math.round(mobile/total*100), desktopPct = Math.round(desktop/total*100), tabletPct = Math.max(0,100-mobilePct-desktopPct);
    const donut = $('#device-donut'); donut.style.setProperty('--mobile',mobilePct); donut.style.setProperty('--desktop',desktopPct); donut.querySelector('span').textContent = `${formatNumber(total)}`;
    $('#device-legend').innerHTML = `<div><i></i><span>Mobile</span><b>${mobilePct}%</b></div><div><i></i><span>Desktop</span><b>${desktopPct}%</b></div><div><i></i><span>Other</span><b>${tabletPct}%</b></div>`;
  }

  function reviewCards(rows = []) {
    const filtered = rows.filter(row => state.reviewFilter === 'all' || (state.reviewFilter==='pending' && !row.approved && !row.hidden) || (state.reviewFilter==='approved' && row.approved) || (state.reviewFilter==='hidden' && row.hidden));
    const root = $('#review-grid');
    if (!filtered.length) { root.innerHTML = '<div class="empty-state admin-card"><b>No reviews in this view</b><span>New submissions will appear here automatically.</span></div>'; return; }
    root.innerHTML = filtered.map(row => {
      const status = row.hidden ? 'hidden' : row.approved ? 'approved' : 'pending';
      const statusLabel = row.hidden ? 'Hidden' : row.approved ? 'Approved' : 'Pending';
      return `<article class="review-card admin-card" data-review-id="${row.id}"><div class="review-card-head"><span class="review-stars">${'★'.repeat(Number(row.rating||0))}${'☆'.repeat(Math.max(0,5-Number(row.rating||0)))}</span><span class="review-status ${status}">${statusLabel}</span></div><blockquote>${row.comment ? `“${escapeHtml(row.comment)}”` : '<span style="color:#67748a">No written comment</span>'}</blockquote><div class="review-meta"><span>${escapeHtml(row.vehicle || 'Vehicle not recorded')}</span><span>${formatDateTime(row.created_at)}</span></div><div class="review-actions">${!row.approved&&!row.hidden?'<button class="approve" data-review-action="approve">Approve</button>':''}${row.approved?'<button data-review-action="unapprove">Unapprove</button>':''}${!row.hidden?'<button data-review-action="hide">Hide</button>':''}<button class="danger" data-review-action="delete">Delete</button></div></article>`;
    }).join('');
  }

  function errors(rows = []) {
    $('#error-count').textContent = formatNumber(rows.length);
    $('#error-list').innerHTML = rows.length ? rows.map(row => `<div class="error-row"><i></i><div><b>${escapeHtml(row.error_code || 'Unknown error')}</b><span>${escapeHtml(row.path || row.source || 'No location recorded')} · ${formatNumber(row.occurrences || 1)} occurrence${Number(row.occurrences||1)===1?'':'s'}</span></div><time>${formatDateTime(row.created_at)}</time></div>`).join('') : '<div class="empty-state compact"><b>No errors recorded</b><span>That is what we want to see.</span></div>';
  }

  const activityLabels = { page_view:'Page viewed', scan_started:'Scan started', scan_completed:'Vehicle scan completed', report_viewed:'Report viewed', partner_click:'Partner link clicked', review_submitted:'Review submitted', api_call:'API call', app_error:'App error', finder_opened:'EV finder opened' };
  function activity(rows = []) {
    $('#activity-list').innerHTML = rows.length ? rows.map(row => {
      const type = String(row.event_type||''); const klass = type.includes('scan')?'scan':type.includes('review')?'review':type.includes('error')?'error':'';
      const vehicle = [row.vehicle_year,row.vehicle_make,row.vehicle_model].filter(Boolean).join(' ');
      const detail = vehicle || row.path || row.source || (row.success===0 ? row.error_code : '') || 'EV Scan activity';
      return `<div class="activity-row ${klass}"><i></i><time>${formatDateTime(row.created_at)}</time><div><b>${escapeHtml(activityLabels[type] || type.replaceAll('_',' '))}</b><span>${escapeHtml(detail)}</span></div><em>${row.success===0?'Failed':row.success===1?'Success':''}</em></div>`;
    }).join('') : '<div class="empty-state"><b>No activity yet</b><span>Events will appear here after data collection is activated.</span></div>';
  }

  function insights(data) {
    const o = data.overview || {}; const items = [];
    if ((o.scans||0) >= 5 && o.scanSuccessRate != null && o.scanSuccessRate < 90) items.push(['warn','Scan reliability needs attention',`${100-o.scanSuccessRate.toFixed(1)}% of scan attempts are not completing successfully. Check provider errors before driving more traffic.`]);
    if ((o.sessions||0) >= 10 && (data.funnel?.scan_started||0) / Math.max(1,o.sessions) < .25) items.push(['warn','Visitors are not starting enough scans','Less than a quarter of visitors are beginning a vehicle check. Test the homepage scan CTA and first-screen clarity.']);
    if ((o.awaitingApproval||0) > 0) items.push(['good',`${o.awaitingApproval} review${o.awaitingApproval===1?'':'s'} waiting`,`Review genuine feedback and approve the strongest submissions for future homepage social proof.`]);
    if ((o.errors||0) > 0) items.push(['warn','Front-end errors were recorded',`${o.errors} error event${o.errors===1?' was':'s were'} seen in this period. Open Product health and inspect the repeated codes.`]);
    if ((data.vehicles||[]).length && Number(data.vehicles[0]?.scans||0) >= 3) items.push(['good',`${data.vehicles[0].make} ${data.vehicles[0].model} is leading demand`,`${data.vehicles[0].scans} scans in this period. Make sure this model has strong SEO coverage and model-specific buying guidance.`]);
    if (!items.length) items.push(['neutral','Waiting for enough real usage','Once EV Scan has traffic, this panel will turn behaviour into product, reliability and SEO actions automatically.']);
    $('#insight-list').innerHTML = items.slice(0,4).map((item,index)=>`<div class="insight-item ${item[0]}"><i>${index+1}</i><div><b>${escapeHtml(item[1])}</b><span>${escapeHtml(item[2])}</span></div></div>`).join('');
  }

  function healthScore(data) {
    const o = data.overview || {}; const api = data.api || [];
    let score = 100;
    if (o.scanSuccessRate != null) score -= Math.max(0, 98-o.scanSuccessRate)*.8;
    score -= Math.min(25, Number(o.errors||0)*2.5);
    api.forEach(row => { if (row.success_rate != null) score -= Math.max(0,95-Number(row.success_rate))*.25; });
    score = Math.max(0,Math.min(100,Math.round(score)));
    const ring = $('#health-ring'); ring.style.setProperty('--health',score); $('#health-score').textContent = score;
    $('#health-title').textContent = score >= 95 ? 'Everything looks healthy' : score >= 80 ? 'Healthy, with a few things to watch' : score >= 60 ? 'Some issues need attention' : 'EV Scan needs attention';
    $('#health-summary').textContent = `Based on scan reliability, provider performance and ${formatNumber(o.errors||0)} recorded front-end error${Number(o.errors||0)===1?'':'s'} in the selected period.`;
    const providers = new Map((api||[]).map(row=>[String(row.provider||'').toLowerCase(),row]));
    const flags = $('#health-flags').children;
    const dvsa = providers.get('dvsa'); flags[0].querySelector('i').className = `status-dot ${!dvsa?'is-waiting':Number(dvsa.success_rate||0)>=95?'':Number(dvsa.success_rate||0)>=80?'is-waiting':'is-bad'}`;
    flags[1].querySelector('i').className = `status-dot ${providers.get('autotrader')?'':'is-waiting'}`;
    flags[2].querySelector('i').className = `status-dot ${state.connected?'':'is-waiting'}`;
  }

  function render(data) {
    state.data = data;
    const o = data.overview || {}, rows = trendDays(data.trend||[], data.reviewTrend||[]);
    $('#kpi-visitors').textContent = formatNumber(o.sessions); $('#kpi-scans').textContent = formatNumber(o.scans); $('#kpi-success').textContent = formatPercent(o.scanSuccessRate); $('#kpi-rating').textContent = o.averageRating == null ? '—' : `${Number(o.averageRating).toFixed(1)}/5`;
    $('#kpi-rating-note').textContent = o.reviews ? `${formatNumber(o.reviews)} review${o.reviews===1?'':'s'} in period` : 'No live reviews yet';
    sparkline('#spark-visitors', rows.map(row=>row.pageviews)); sparkline('#spark-scans',rows.map(row=>row.scans)); sparkline('#spark-reviews',rows.map(row=>row.reviews));
    mainChart(rows); renderFunnel(data.funnel||{}); rankRows(data.vehicles||[],'#popular-vehicles'); barRows(data.sources||[],'#source-bars'); insights(data); healthScore(data);
    $('#scan-total').textContent=formatNumber(o.scans); $('#scan-successful').textContent=formatNumber(o.successfulScans); $('#scan-failed').textContent=formatNumber(Math.max(0,Number(o.scans||0)-Number(o.successfulScans||0))); rankRows(data.vehicles||[],'#scan-vehicles'); apiRows(data.api||[],'#scan-api'); apiRows(data.api||[],'#health-api');
    $('#review-average').textContent=o.averageRating==null?'—':`${Number(o.averageRating).toFixed(1)}/5`; $('#review-summary-count').textContent=`${formatNumber(o.reviews)} review${Number(o.reviews)===1?'':'s'} in selected period`; $('#review-pending-text').textContent=`${formatNumber(o.awaitingApproval)} awaiting approval`; const badge=$('#review-badge'); badge.hidden=!o.awaitingApproval; badge.textContent=formatNumber(o.awaitingApproval); reviewCards(data.reviews||[]);
    pageRows(data.pages||[]); barRows(data.sources||[],'#traffic-sources'); devices(data.devices||[]); errors(data.errors||[]); activity(data.activity||[]);
  }

  async function api(path, options={}) {
    const response = await fetch(path, { ...options, headers: { ...(options.headers||{}), 'x-admin-token': state.token, 'content-type':'application/json' } });
    let data={}; try { data=await response.json(); } catch {}
    return { response, data };
  }

  async function loadDashboard({ silent=false }={}) {
    if (!state.token) { $('#login-overlay').hidden=false; return; }
    const button=$('#refresh-dashboard'); if(!silent){button.disabled=true;button.querySelector('span').textContent='…';}
    try {
      const { response, data } = await api(`/api/admin/dashboard?days=${state.days}`);
      if (response.status===401) { sessionStorage.removeItem('evscan_admin_token'); state.token=''; $('#login-overlay').hidden=false; $('#login-message').textContent='That access key was not accepted.'; return; }
      if (data.code==='ADMIN_NOT_CONFIGURED') { showBanner('Admin backend not activated yet','The visual dashboard is built. Add the production admin secret and database during the launch phase to switch the live backend on.','waiting'); state.connected=false; state.collectionEnabled=false; setCollectionStatus(); $('#login-overlay').hidden=true; return; }
      if (!response.ok || !data.ok) throw new Error(data.message||'Dashboard request failed');
      $('#login-overlay').hidden=true; state.connected=Boolean(data.connected); state.collectionEnabled=Boolean(data.collectionEnabled); setCollectionStatus();
      if (!data.connected) { showBanner('Dashboard built · database still offline','The admin interface and analytics API are ready, but no persistent database is connected yet. Nothing is being collected or stored.','waiting'); return; }
      if (!data.collectionEnabled) showBanner('Live database connected · collection paused','This is intentional. Set DATA_COLLECTION_ENABLED=true only when the production privacy setup is ready.','waiting');
      else $('#system-banner').hidden=true;
      render(data.data || {});
    } catch (error) {
      showBanner('Dashboard could not refresh',String(error.message||error),'bad');
    } finally {
      button.disabled=false; button.querySelector('span').textContent='↻';
    }
  }

  async function moderate(id, action) {
    if (action==='delete' && !confirm('Delete this review permanently?')) return;
    const { response, data } = await api(`/api/admin/reviews/${id}`, { method:'PATCH', body:JSON.stringify({action}) });
    if (!response.ok || !data.ok) { alert('That review could not be updated.'); return; }
    await loadDashboard({silent:true});
  }

  $$('.admin-nav-item').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
  $$('[data-jump]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.jump)));
  $('#range-select').addEventListener('change', event=>{state.days=Number(event.target.value)||30;loadDashboard();});
  $('#refresh-dashboard').addEventListener('click',()=>loadDashboard());
  $('#admin-lock').addEventListener('click',()=>{sessionStorage.removeItem('evscan_admin_token');state.token='';$('#login-overlay').hidden=false;$('#admin-token').value='';});
  $('#admin-login-form').addEventListener('submit', event=>{event.preventDefault();state.token=$('#admin-token').value.trim();if(!state.token){$('#login-message').textContent='Enter your admin access key.';return;}sessionStorage.setItem('evscan_admin_token',state.token);loadDashboard();});
  $$('.review-filters button').forEach(button=>button.addEventListener('click',()=>{$$('.review-filters button').forEach(x=>x.classList.toggle('is-active',x===button));state.reviewFilter=button.dataset.reviewFilter;reviewCards(state.data?.reviews||[]);}));
  $('#review-grid').addEventListener('click', event=>{const button=event.target.closest('[data-review-action]');if(!button)return;const card=button.closest('[data-review-id]');if(card)moderate(card.dataset.reviewId,button.dataset.reviewAction);});

  if (state.token) loadDashboard({silent:true}); else $('#login-overlay').hidden=false;
})();
