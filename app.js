(() => {
  const appShell = document.querySelector('.app-shell');
  const reportView = document.getElementById('report-view');
  const scanOverlay = document.getElementById('scan-overlay');
  const scanForm = document.getElementById('scan-form');
  const listingUrl = document.getElementById('listing-url');
  const urlHelp = document.getElementById('url-help');
  const scanTitle = document.getElementById('scan-title');
  const scanCopy = document.getElementById('scan-step-copy');
  const scanProgress = document.getElementById('scan-progress');
  const scanStageCount = document.getElementById('scan-stage-count');
  const rescanForm = document.getElementById('rescan-form');
  const rescanUrl = document.getElementById('rescan-url');
  const finderModal = document.getElementById('finder-modal');

  const scanStages = [
    ['Reading the listing…', 'Pulling out the vehicle, price, mileage and seller information.'],
    ['Identifying the exact EV…', 'Matching the model, trim, battery and drivetrain.'],
    ['Checking the price…', 'Comparing this demo vehicle against similar examples.'],
    ['Reviewing battery expectations…', 'Estimating a sensible health range for this age and mileage.'],
    ['Analysing MOT patterns…', 'Looking for repeated advisories and unusual mileage changes.'],
    ['Checking EV-specific details…', 'Range, charging, warranty and specification traps.'],
    ['Finding the unknowns…', 'Spotting important information the advert does not clearly answer.'],
    ['Preparing your verdict…', 'Turning the findings into clear next steps and seller questions.']
  ];

  function looksLikeUrl(value) {
    const v = value.trim();
    if (!v) return false;
    try {
      const withProtocol = /^https?:\/\//i.test(v) ? v : `https://${v}`;
      const parsed = new URL(withProtocol);
      return Boolean(parsed.hostname && parsed.hostname.includes('.'));
    } catch (_) {
      return false;
    }
  }

  function openReport() {
    scanOverlay.hidden = true;
    document.body.classList.remove('modal-open');
    appShell.hidden = true;
    reportView.hidden = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function closeReport() {
    reportView.hidden = true;
    appShell.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function runDemoScan(value) {
    if (value && !looksLikeUrl(value)) {
      urlHelp.textContent = 'Paste a normal web link, for example https://example.com/car-listing';
      urlHelp.classList.add('error');
      listingUrl?.focus();
      return;
    }

    urlHelp?.classList.remove('error');
    if (urlHelp) urlHelp.textContent = 'Demo mode is on for now — the report uses clearly labelled sample data.';
    scanOverlay.hidden = false;
    document.body.classList.add('modal-open');

    let stage = 0;
    const showStage = () => {
      const [title, copy] = scanStages[stage];
      scanTitle.textContent = title;
      scanCopy.textContent = copy;
      scanStageCount.textContent = `${stage + 1} of ${scanStages.length}`;
      scanProgress.style.width = `${Math.round(((stage + 1) / scanStages.length) * 100)}%`;
    };

    showStage();
    const timer = window.setInterval(() => {
      stage += 1;
      if (stage >= scanStages.length) {
        window.clearInterval(timer);
        window.setTimeout(openReport, 380);
        return;
      }
      showStage();
    }, 540);
  }

  scanForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    runDemoScan(listingUrl.value);
  });

  document.querySelectorAll('[data-demo-scan]').forEach((button) => {
    button.addEventListener('click', () => runDemoScan('https://example.com/demo-ev'));
  });

  document.querySelectorAll('[data-close-report]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      closeReport();
    });
  });

  document.querySelectorAll('[data-scroll-home]').forEach((button) => {
    button.addEventListener('click', () => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' }));
  });

  rescanForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = rescanUrl.value.trim();
    if (!looksLikeUrl(value)) {
      rescanUrl.setCustomValidity('Paste a valid-looking listing link.');
      rescanUrl.reportValidity();
      rescanUrl.setCustomValidity('');
      return;
    }
    reportView.hidden = true;
    appShell.hidden = false;
    runDemoScan(value);
  });

  // Trim explorer
  const trims = {
    ultimate: {
      meta: '34,200 miles · Electric · Automatic · 77.4 kWh · RWD',
      range: '238 mi', speed: '7.3 sec', charge: '~233 kW', drive: 'RWD', soh: '90–94%',
      mainRange: '238 miles', summer: '257 mi', typical: '238 mi', winter: '205 mi',
      explainer: 'The Ultimate RWD balances range, equipment and performance without paying for the AWD powertrain.',
      verdict: 'For most buyers, this trim avoids paying extra for AWD while keeping the strong long-distance charging experience.'
    },
    premium: {
      meta: '34,200 miles · Electric · Automatic · 77.4 kWh · RWD',
      range: '240 mi', speed: '7.3 sec', charge: '~233 kW', drive: 'RWD', soh: '90–94%',
      mainRange: '240 miles', summer: '260 mi', typical: '240 mi', winter: '207 mi',
      explainer: 'The Premium RWD keeps almost the same range and charging performance while usually costing less than Ultimate.',
      verdict: 'This is likely the value sweet spot if you care more about range than top-spec equipment.'
    },
    awd: {
      meta: '34,200 miles · Electric · Automatic · 77.4 kWh · AWD',
      range: '224 mi', speed: '5.1 sec', charge: '~233 kW', drive: 'AWD', soh: '90–94%',
      mainRange: '224 miles', summer: '243 mi', typical: '224 mi', winter: '193 mi',
      explainer: 'The AWD version is much quicker and adds extra traction, but it uses more energy and normally costs more.',
      verdict: 'Choose AWD for performance or traction. For a normal first-time EV buyer, RWD is usually the more rational value choice.'
    }
  };

  const trimSelect = document.getElementById('trim-select');
  function updateTrim(key) {
    const trim = trims[key] || trims.ultimate;
    document.getElementById('trim-meta').textContent = trim.meta;
    document.getElementById('trim-range').textContent = trim.range;
    document.getElementById('trim-speed').textContent = trim.speed;
    document.getElementById('trim-charge').textContent = trim.charge;
    document.getElementById('trim-drive').textContent = trim.drive;
    document.getElementById('battery-soh').textContent = trim.soh;
    document.getElementById('range-main').textContent = trim.mainRange;
    document.getElementById('range-summer').textContent = trim.summer;
    document.getElementById('range-typical').textContent = trim.typical;
    document.getElementById('range-winter').textContent = trim.winter;
    document.getElementById('trim-explainer').textContent = trim.explainer;
    document.getElementById('trim-verdict').innerHTML = `<b>Our take:</b> ${trim.verdict}`;
  }
  trimSelect?.addEventListener('change', () => updateTrim(trimSelect.value));

  // Seller message copy
  const copyButton = document.getElementById('copy-message');
  const sellerMessage = document.getElementById('seller-message');
  const copyStatus = document.getElementById('copy-status');

  copyButton?.addEventListener('click', async () => {
    const text = sellerMessage.value;
    let copied = false;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch (_) {
        copied = false;
      }
    }
    if (!copied) {
      sellerMessage.focus();
      sellerMessage.select();
      try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
      sellerMessage.setSelectionRange(0, 0);
    }
    copyStatus.textContent = copied ? 'Copied — ready to send.' : 'Select the message and copy it manually.';
    window.setTimeout(() => { copyStatus.textContent = ''; }, 2800);
  });

  // Seller reply demo analyser
  const replyInput = document.getElementById('seller-reply');
  const replyResult = document.getElementById('reply-result');
  document.getElementById('analyse-reply')?.addEventListener('click', () => {
    const raw = replyInput.value.trim();
    if (!raw) {
      replyResult.hidden = false;
      replyResult.innerHTML = '<strong>Paste the seller’s reply first.</strong> The demo checker will then show which questions appear to have been answered.';
      return;
    }

    const text = raw.toLowerCase();
    const batteryAnswered = /(state of health|soh|battery report|battery health|certificate|diagnostic|percent|%)/.test(text);
    const cableAnswered = /(charging cable|charge cable|cable included|type 2 cable|granny cable|both cables|one cable)/.test(text);
    const keysAnswered = /(two keys|2 keys|both keys|one key|single key)/.test(text);
    const serviceAnswered = /(service history|service record|service paperwork|serviced|maintenance history)/.test(text);

    const answerLine = (answered, label) => `<div class="${answered ? 'answered' : 'unanswered'}">${answered ? '✓ Appears answered' : '⚠ Still unclear'} — ${label}</div>`;
    const answeredCount = [batteryAnswered, cableAnswered, keysAnswered, serviceAnswered].filter(Boolean).length;
    replyResult.hidden = false;
    replyResult.innerHTML = `
      <strong>Demo reply check: ${answeredCount}/4 key points appear to be addressed.</strong><br><br>
      ${answerLine(batteryAnswered, 'measured battery-health evidence')}<br>
      ${answerLine(cableAnswered, 'charging cables included')}<br>
      ${answerLine(keysAnswered, 'number of keys')}<br>
      ${answerLine(serviceAnswered, 'service history / paperwork')}<br><br>
      <span>This is keyword-based demo logic for the MVP, not a final AI judgement. The production version should understand context and distinguish a real answer from something evasive like “the battery has always been fine”.</span>`;
  });

  // Quick fit score
  const fitToggle = document.getElementById('quick-fit-toggle');
  const fitForm = document.getElementById('quick-fit-form');
  const fitResult = document.getElementById('fit-result');
  fitToggle?.addEventListener('click', () => {
    fitForm.hidden = !fitForm.hidden;
    fitToggle.textContent = fitForm.hidden ? 'Check my fit' : 'Hide questions';
  });

  fitForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const daily = Number(document.getElementById('fit-daily').value);
    const longTrip = Number(document.getElementById('fit-long').value);
    const home = document.getElementById('fit-home').value;
    const motorway = document.getElementById('fit-motorway').value;

    let score = 94;
    const notes = [];
    if (daily > 90) { score -= 7; notes.push('Your daily mileage makes range efficiency more important than it is for most buyers.'); }
    else notes.push('Your normal daily driving is comfortably inside this car’s expected range.');

    if (longTrip > 230) { score -= 7; notes.push('Your longest regular journey will probably need a rapid-charge stop, especially in winter.'); }
    else if (longTrip > 150) notes.push('Your longer trips look realistic, though winter motorway range deserves a little planning.');
    else notes.push('Your regular long journeys should be easy for this EV.');

    if (home === 'no') { score -= 9; notes.push('No home charging makes public charging convenience and price much more important.'); }
    else notes.push('Home charging is a major advantage and means you probably do not need to pay extra for an enormous battery.');

    if (motorway === 'often') { score -= 3; notes.push('Frequent motorway use means the car’s very fast DC charging is particularly useful.'); }

    score = Math.max(55, Math.min(98, score));
    const verdict = score >= 90 ? 'Excellent fit' : score >= 80 ? 'Strong fit' : score >= 70 ? 'Reasonable fit' : 'Think carefully';
    fitResult.hidden = false;
    fitResult.innerHTML = `<div class="fit-score-number">${score}</div><div><h3>${verdict}</h3><p>${notes.join(' ')}</p></div>`;
  });

  // Finder modal
  function openFinder() {
    finderModal.hidden = false;
    document.body.classList.add('modal-open');
  }
  function closeFinder() {
    finderModal.hidden = true;
    document.body.classList.remove('modal-open');
  }
  document.querySelectorAll('[data-open-finder]').forEach((button) => button.addEventListener('click', openFinder));
  document.querySelectorAll('[data-close-finder]').forEach((button) => button.addEventListener('click', closeFinder));
  finderModal?.addEventListener('click', (event) => { if (event.target === finderModal) closeFinder(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (!finderModal.hidden) closeFinder();
      if (!scanOverlay.hidden) {
        scanOverlay.hidden = true;
        document.body.classList.remove('modal-open');
      }
    }
  });

  const finderForm = document.getElementById('finder-form');
  const finderResults = document.getElementById('finder-results');
  finderForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const budget = Number(document.getElementById('finder-budget').value);
    const daily = Number(document.getElementById('finder-daily').value);
    const longest = Number(document.getElementById('finder-long').value);
    const home = document.getElementById('finder-home').value;
    const priority = document.getElementById('finder-priority').value;

    const neededRange = Math.min(310, Math.max(150, longest + (home === 'no' ? 55 : 30)));
    const rapidChargeImportant = longest > 160 || home === 'no';
    const largeBatteryNeeded = daily > 80 || longest > 210 || home === 'no';

    const picksByPriority = {
      value: [['MG4 Long Range', 'Great value and efficient'], ['Kia e-Niro', 'Proven, efficient all-rounder'], ['Tesla Model 3 RWD', 'Efficient with strong charging']],
      range: [['Tesla Model 3 Long Range', 'Long range and efficient'], ['Hyundai Ioniq 6', 'Very efficient motorway EV'], ['Kia EV6', 'Strong range with rapid charging']],
      space: [['Skoda Enyaq', 'Excellent family practicality'], ['Hyundai Ioniq 5', 'Very spacious inside'], ['Kia EV6', 'Practical with fast charging']],
      comfort: [['Polestar 2', 'Premium-feeling cabin'], ['BMW i4', 'Comfortable and refined'], ['Hyundai Ioniq 5', 'Relaxed, spacious interior']],
      performance: [['Tesla Model 3 Long Range', 'Fast without Performance-car pricing'], ['Polestar 2 Dual Motor', 'Strong performance and quality'], ['Kia EV6 AWD', 'Fast and very quick to charge']]
    };

    finderResults.hidden = false;
    finderResults.innerHTML = `
      <h3>We’d look for roughly ${neededRange}+ miles of realistic range.</h3>
      <p>Based on your answers, ${largeBatteryNeeded ? 'a medium-to-large battery makes sense' : 'you probably do not need to pay extra for the biggest battery'}. ${rapidChargeImportant ? 'Fast rapid charging should be a priority for you.' : 'Extreme rapid-charging performance is useful, but it does not need to dominate your decision.'} With a £${budget.toLocaleString('en-GB')} ceiling, these are the kinds of cars we’d start with:</p>
      <div class="finder-picks">
        ${picksByPriority[priority].map(([name, reason], index) => `<div class="finder-pick"><div><b>${index + 1}. ${name}</b><span>${reason}</span></div><span>Demo match</span></div>`).join('')}
      </div>
      <p><b>Production goal:</b> turn these human requirements into live marketplace filters automatically, rather than asking you for battery size, kWh or charging speed.</p>`;
  });

  // Budget recommendations
  const recommendationData = [
    { type: 'Same car, better listing', name: '2022 Hyundai Ioniq 5 Ultimate', sub: '31,000 miles · RWD', price: 21950, score: 91, delta: '£1,045 less', reason: 'Same trim with lower mileage and a stronger demo price position.' },
    { type: 'Save money', name: '2021 Tesla Model 3 RWD', sub: '39,500 miles · RWD', price: 18950, score: 88, delta: '£4,045 less', reason: 'Smaller and less SUV-like, but very efficient with strong long-distance charging.' },
    { type: 'Better fit', name: '2022 Kia EV6 Air', sub: '35,800 miles · RWD', price: 22500, score: 90, delta: '£495 less', reason: 'Similar charging hardware and practicality with a slightly sharper driving feel.' },
    { type: 'Worth stretching for', name: '2023 Hyundai Ioniq 5 Premium', sub: '24,300 miles · RWD', price: 24450, score: 93, delta: '+£1,455', reason: 'Newer example with less mileage; worth considering if the extra spend buys more warranty and condition.' },
    { type: 'Wildcard', name: '2022 Skoda Enyaq 80', sub: '36,000 miles · RWD', price: 20950, score: 86, delta: '£2,045 less', reason: 'Slower to rapid-charge, but excellent space and a calmer family-car experience.' },
    { type: 'Save money', name: '2022 MG4 Trophy Long Range', sub: '28,000 miles · RWD', price: 16450, score: 89, delta: '£6,545 less', reason: 'A big saving if premium cabin feel and SUV space are not priorities.' }
  ];

  const budgetRange = document.getElementById('budget-range');
  const budgetValue = document.getElementById('budget-value');
  const recommendationGrid = document.getElementById('recommendation-grid');

  function renderRecommendations(budget) {
    const lower = Math.max(5000, budget - 8000);
    const upper = budget + 2000;
    let options = recommendationData.filter((car) => car.price >= lower && car.price <= upper);
    options = options.sort((a,b) => Math.abs(a.price - budget) - Math.abs(b.price - budget)).slice(0,4);
    if (!options.length) options = recommendationData.slice(0,4);

    recommendationGrid.innerHTML = options.map((car, index) => `
      <article class="reco-card" data-reco-index="${index}">
        <div class="reco-image"><span>${car.type}</span><span class="reco-score">${car.score}/100</span></div>
        <div class="reco-body">
          <div class="reco-type">${car.type}</div>
          <h3>${car.name}</h3>
          <div class="reco-sub">${car.sub}</div>
          <div class="reco-price-row"><strong>£${car.price.toLocaleString('en-GB')}</strong><span>${car.delta}</span></div>
          <p class="reco-reason">${car.reason}</p>
          <div class="reco-actions">
            <button class="primary-button" type="button" data-reco-detail="${index}">Why this one?</button>
            <button class="ghost-button" type="button" data-reco-compare="${index}">Compare</button>
          </div>
          <div class="reco-detail" hidden></div>
        </div>
      </article>`).join('');

    const displayed = options;
    recommendationGrid.querySelectorAll('[data-reco-detail]').forEach((button) => {
      button.addEventListener('click', () => {
        const idx = Number(button.dataset.recoDetail);
        const card = button.closest('.reco-card');
        const detail = card.querySelector('.reco-detail');
        const car = displayed[idx];
        detail.hidden = !detail.hidden;
        detail.innerHTML = `<p style="margin:12px 0 0;color:#9ba7ba;font-size:.72rem;line-height:1.5"><b style="color:#fff">Why it surfaced:</b> ${car.reason} In the production version this explanation should be personalised to the buyer’s budget, driving and priorities.</p>`;
        button.textContent = detail.hidden ? 'Why this one?' : 'Hide reason';
      });
    });

    recommendationGrid.querySelectorAll('[data-reco-compare]').forEach((button) => {
      button.addEventListener('click', () => {
        const idx = Number(button.dataset.recoCompare);
        const car = displayed[idx];
        const card = button.closest('.reco-card');
        const detail = card.querySelector('.reco-detail');
        const priceDifference = car.price - 22995;
        const priceText = priceDifference < 0 ? `£${Math.abs(priceDifference).toLocaleString('en-GB')} cheaper` : `£${priceDifference.toLocaleString('en-GB')} more`;
        detail.hidden = false;
        detail.innerHTML = `<p style="margin:12px 0 0;color:#9ba7ba;font-size:.72rem;line-height:1.5"><b style="color:#fff">Quick comparison:</b> ${car.name} is ${priceText} than the scanned demo Ioniq 5 and has a demo Deal Score of ${car.score}/100 versus 87/100. A full production comparison would also show range, battery confidence, warranty, space and running costs.</p>`;
        card.querySelector('[data-reco-detail]').textContent = 'Why this one?';
      });
    });
  }

  budgetRange?.addEventListener('input', () => {
    const budget = Number(budgetRange.value);
    budgetValue.textContent = `£${budget.toLocaleString('en-GB')}`;
    renderRecommendations(budget);
  });
  renderRecommendations(Number(budgetRange?.value || 23000));
})();
