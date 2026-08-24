(() => {
  const $ = (sel, root = document) => root.querySelector(sel);

  const style = document.createElement('style');
  style.textContent = `
    .insurance-card{margin-top:14px;overflow:hidden}
    .insurance-intro{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}
    .insurance-intro h2{margin:8px 0 8px;font-size:clamp(1.5rem,3vw,2.15rem);letter-spacing:-.04em}
    .insurance-intro p{margin:0;color:var(--muted);max-width:760px;line-height:1.55}
    .insurance-badge{flex:0 0 auto;background:rgba(255,190,78,.13);color:#ffc65d;border:1px solid rgba(255,190,78,.2);padding:8px 11px;border-radius:999px;font-size:.66rem;letter-spacing:.08em;font-weight:900}
    .insurance-summary{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(240px,.8fr);gap:16px;margin-top:20px}
    .insurance-teaser,.insurance-price-box{border:1px solid var(--border);border-radius:18px;background:rgba(8,14,27,.48);padding:18px}
    .insurance-teaser h3{margin:0 0 8px;font-size:1.08rem}
    .insurance-teaser p{font-size:.83rem;margin:0 0 14px;color:var(--muted)}
    .insurance-teaser ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
    .insurance-teaser li{font-size:.76rem;color:#c5cddd;padding:9px 10px;background:rgba(255,255,255,.025);border-radius:10px}
    .insurance-price-box{display:flex;flex-direction:column;justify-content:center}
    .insurance-price-box>span{color:var(--muted);font-size:.72rem}
    .insurance-price-box>strong{font-size:2rem;letter-spacing:-.045em;margin:5px 0;color:#fff}
    .insurance-price-box>small{color:var(--muted-2);line-height:1.45}
    .insurance-start{margin-top:16px}
    .insurance-form{margin-top:18px;border-top:1px solid var(--border);padding-top:18px}
    .insurance-form[hidden],.insurance-result[hidden]{display:none!important}
    .insurance-form-heading{display:flex;justify-content:space-between;gap:14px;align-items:flex-end;margin-bottom:14px}
    .insurance-form-heading h3{margin:0;font-size:1.15rem}
    .insurance-form-heading p{margin:4px 0 0;color:var(--muted);font-size:.76rem}
    .insurance-privacy{font-size:.68rem;color:#7f8ba0;text-align:right;max-width:220px}
    .insurance-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
    .insurance-field{display:flex;flex-direction:column;gap:7px;font-size:.74rem;color:#dbe1eb;font-weight:700}
    .insurance-field input,.insurance-field select{width:100%;min-height:48px;border:1px solid var(--border);border-radius:12px;background:#0b1323;color:#fff;padding:0 12px;font:inherit;font-weight:600;outline:none}
    .insurance-field input:focus,.insurance-field select:focus{border-color:rgba(255,23,103,.6);box-shadow:0 0 0 3px rgba(255,23,103,.09)}
    .insurance-field small{font-weight:500;color:var(--muted-2);line-height:1.35}
    .insurance-actions{display:flex;gap:10px;align-items:center;margin-top:16px;flex-wrap:wrap}
    .insurance-legal{font-size:.68rem;line-height:1.45;color:var(--muted-2);margin:14px 0 0}
    .insurance-result{margin-top:18px;border-top:1px solid var(--border);padding-top:18px}
    .insurance-result-top{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(230px,.8fr);gap:14px}
    .insurance-result-main{padding:20px;border-radius:18px;background:linear-gradient(145deg,rgba(255,23,103,.12),rgba(255,255,255,.025));border:1px solid rgba(255,23,103,.18)}
    .insurance-result-main span{display:block;color:var(--muted);font-size:.72rem}
    .insurance-result-main strong{display:block;font-size:clamp(2rem,5vw,3rem);letter-spacing:-.055em;margin:4px 0;color:#fff}
    .insurance-result-main b{font-size:.84rem;color:#ff4b86}
    .insurance-monthly{display:grid;place-content:center;padding:20px;border:1px solid var(--border);border-radius:18px;background:rgba(8,14,27,.52)}
    .insurance-monthly span{font-size:.72rem;color:var(--muted)}
    .insurance-monthly strong{font-size:1.7rem;letter-spacing:-.04em;margin-top:5px}
    .insurance-drivers{margin-top:14px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .insurance-driver{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--border);border-radius:13px;padding:12px;background:rgba(255,255,255,.02)}
    .insurance-driver i{font-style:normal;font-size:1rem}
    .insurance-driver b{display:block;font-size:.76rem;margin-bottom:2px}
    .insurance-driver span{display:block;color:var(--muted);font-size:.7rem;line-height:1.4}
    .insurance-explain{margin-top:14px;padding:14px;border-radius:13px;background:rgba(255,190,78,.07);border:1px solid rgba(255,190,78,.14);font-size:.73rem;line-height:1.5;color:#cbd3df}
    .insurance-explain b{color:#fff}
    @media(max-width:900px){.insurance-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:720px){
      .insurance-intro{display:block}.insurance-badge{display:inline-block;margin-top:12px}
      .insurance-summary,.insurance-result-top{grid-template-columns:1fr}
      .insurance-teaser ul{grid-template-columns:1fr 1fr}
      .insurance-grid{grid-template-columns:1fr 1fr;gap:10px}
      .insurance-form-heading{display:block}.insurance-privacy{text-align:left;max-width:none;margin-top:6px}
      .insurance-drivers{grid-template-columns:1fr}
    }
    @media(max-width:480px){.insurance-grid{grid-template-columns:1fr}.insurance-teaser ul{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  function mount() {
    if ($('#insurance-estimator')) return;
    const target = $('.effective-card') || $('.fit-score-card') || $('.limits-card');
    if (!target) return;

    const section = document.createElement('section');
    section.id = 'insurance-estimator';
    section.className = 'report-card insurance-card';
    section.innerHTML = `
      <div class="insurance-intro">
        <div>
          <span class="mini-label">First-year ownership cost</span>
          <h2>What might this EV cost you to insure?</h2>
          <p>Answer a few normal questions about you and how you’ll use the car. We’ll turn them into an indicative UK insurance range and explain what is pushing it up or down.</p>
        </div>
        <span class="insurance-badge">ESTIMATE — NOT A QUOTE</span>
      </div>

      <div class="insurance-summary">
        <div class="insurance-teaser">
          <h3>We’ll ask about the things insurers usually care about.</h3>
          <p>No insurance jargon and no account needed.</p>
          <ul>
            <li>Age & licence history</li><li>No-claims discount</li><li>Claims & convictions</li><li>Annual mileage & use</li><li>Parking & area type</li><li>Occupation & modifications</li>
          </ul>
        </div>
        <div class="insurance-price-box">
          <span>Current status</span>
          <strong>Not calculated</strong>
          <small>We won’t pretend to know your premium until you tell us about the driver.</small>
        </div>
      </div>

      <button id="insurance-start" class="primary-button insurance-start" type="button">Estimate my insurance</button>

      <form id="insurance-form" class="insurance-form" hidden>
        <div class="insurance-form-heading">
          <div><h3>Tell us about the main driver.</h3><p>This takes about a minute.</p></div>
          <div class="insurance-privacy">Your answers stay in this browser for this estimate and are not submitted to an insurer.</div>
        </div>
        <div class="insurance-grid">
          <label class="insurance-field">Your age
            <input id="ins-age" type="number" inputmode="numeric" min="17" max="90" value="30" required />
          </label>
          <label class="insurance-field">Licence type
            <select id="ins-licence" required><option value="full">Full UK licence</option><option value="auto">Automatic-only UK licence</option><option value="provisional">Provisional</option><option value="nonuk">Non-UK licence</option></select>
          </label>
          <label class="insurance-field">How long have you held it?
            <select id="ins-years" required><option value="0">Less than 1 year</option><option value="1.5">1–2 years</option><option value="4">3–5 years</option><option value="8" selected>5+ years</option></select>
          </label>
          <label class="insurance-field">No-claims discount
            <select id="ins-ncd" required><option value="0">None</option><option value="1">1 year</option><option value="2">2 years</option><option value="3">3 years</option><option value="4">4 years</option><option value="5" selected>5+ years</option></select>
          </label>
          <label class="insurance-field">Claims in the last 5 years
            <select id="ins-claims" required><option value="0" selected>None</option><option value="1">1 claim</option><option value="2">2 claims</option><option value="3">3+ claims</option></select>
          </label>
          <label class="insurance-field">Points / motoring convictions
            <select id="ins-points" required><option value="0" selected>None</option><option value="3">1–3 points</option><option value="6">4–6 points</option><option value="9">7–9 points</option><option value="12">10+ points / serious conviction</option></select>
          </label>
          <label class="insurance-field">Occupation
            <select id="ins-job" required><option value="office" selected>Office / admin / marketing</option><option value="professional">Professional / technical</option><option value="trade">Trade / manual</option><option value="delivery">Delivery / driving-based</option><option value="student">Student</option><option value="retired">Retired</option><option value="unemployed">Not currently working</option><option value="other">Other</option></select>
          </label>
          <label class="insurance-field">Annual mileage
            <select id="ins-mileage" required><option value="4000">Under 5,000</option><option value="7000">5,000–8,000</option><option value="10000" selected>8,000–12,000</option><option value="14000">12,000–15,000</option><option value="18000">15,000+</option></select>
          </label>
          <label class="insurance-field">How will you use the car?
            <select id="ins-use" required><option value="social">Social / pleasure only</option><option value="commute" selected>Social + commuting</option><option value="business">Business use as well</option></select>
          </label>
          <label class="insurance-field">Where is it kept overnight?
            <select id="ins-parking" required><option value="garage">Locked garage</option><option value="driveway" selected>Driveway</option><option value="street">On the road</option><option value="carpark">Residential car park</option></select>
          </label>
          <label class="insurance-field">What best describes the area?
            <select id="ins-area" required><option value="rural">Rural</option><option value="town">Town / small city</option><option value="suburb" selected>Suburban</option><option value="city">City</option><option value="central">Central / inner city</option></select>
            <small>Insurers normally use your exact postcode. We use this only as a broad proxy for now.</small>
          </label>
          <label class="insurance-field">Any modifications?
            <select id="ins-mods" required><option value="no" selected>No</option><option value="yes">Yes</option></select>
          </label>
          <label class="insurance-field">Voluntary excess
            <select id="ins-excess" required><option value="0">£0</option><option value="100">£100</option><option value="250" selected>£250</option><option value="500">£500</option><option value="750">£750+</option></select>
          </label>
          <label class="insurance-field">Any additional driver under 25?
            <select id="ins-young-driver" required><option value="no" selected>No</option><option value="yes">Yes</option></select>
          </label>
          <label class="insurance-field">Are you the main driver?
            <select id="ins-main-driver" required><option value="yes" selected>Yes</option><option value="no">No</option></select>
            <small>The main driver should be the person who actually uses the car most.</small>
          </label>
        </div>
        <div class="insurance-actions">
          <button class="primary-button" type="submit">Calculate estimate</button>
          <button id="insurance-cancel" class="ghost-button" type="button">Hide questions</button>
        </div>
        <p class="insurance-legal">This tool is an indicative budgeting aid, not an insurance quote or offer of cover. Exact premiums depend on postcode-level risk, the exact vehicle/trim, insurer underwriting, cover details and live market pricing.</p>
      </form>

      <div id="insurance-result" class="insurance-result" hidden></div>
    `;

    target.insertAdjacentElement('afterend', section);
    wire(section);
  }

  function ageFactor(age) {
    if (age <= 20) return [2.95, 'Your age is likely to be the biggest price driver.', '🔺'];
    if (age <= 24) return [2.25, 'Drivers under 25 are usually much more expensive to insure.', '🔺'];
    if (age <= 29) return [1.55, 'Younger-driver pricing is still likely to have a noticeable effect.', '↗'];
    if (age <= 39) return [1.08, 'Your age sits close to our neutral pricing band.', '•'];
    if (age <= 59) return [0.88, 'Your age is likely to help rather than hurt the estimate.', '↓'];
    if (age <= 69) return [0.98, 'Your age has little effect in this estimate.', '•'];
    return [1.22, 'Older-driver pricing can start to rise again.', '↗'];
  }

  function factorFor(select, map) {
    const value = select?.value;
    return map[value] ?? 1;
  }

  function money(n) {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(Math.round(n));
  }

  function currentVehicleFactor() {
    const trim = $('#trim-select')?.value || 'ultimate';
    if (trim === 'awd') return 1.28;
    if (trim === 'premium') return 1.11;
    return 1.16;
  }

  function addDriver(drivers, factor, title, text, positive = false) {
    const strength = Math.abs(factor - 1);
    if (strength < .045) return;
    drivers.push({ strength, title, text, icon: positive ? '↓' : factor > 1 ? '↗' : '↓', positive });
  }

  function wire(section) {
    const form = $('#insurance-form', section);
    const result = $('#insurance-result', section);
    const start = $('#insurance-start', section);
    const status = $('.insurance-price-box', section);

    start?.addEventListener('click', () => {
      form.hidden = false;
      start.hidden = true;
      form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    $('#insurance-cancel', section)?.addEventListener('click', () => {
      form.hidden = true;
      start.hidden = false;
    });

    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      const age = Number($('#ins-age', section)?.value || 0);
      if (age < 17 || age > 90) return;

      if ($('#ins-main-driver', section)?.value === 'no') {
        result.hidden = false;
        result.innerHTML = `<div class="insurance-explain"><b>Use the main driver’s details.</b> Insurance pricing is based mainly on the person who will actually drive the car most. Using somebody else as the declared main driver just to reduce the price can invalidate cover, so we won’t calculate a misleading estimate from the wrong profile.</div>`;
        return;
      }

      const drivers = [];
      let premium = 720 * currentVehicleFactor();

      const [ageMult, ageText] = ageFactor(age);
      premium *= ageMult;
      addDriver(drivers, ageMult, `Age ${age}`, ageText, ageMult < 1);

      const licence = factorFor($('#ins-licence', section), { full:.98, auto:1, provisional:1.85, nonuk:1.25 });
      premium *= licence;
      addDriver(drivers, licence, 'Licence type', licence > 1.2 ? 'This licence type is likely to increase the range materially.' : 'Your licence type has a small effect.', licence < 1);

      const licenceYears = Number($('#ins-years', section)?.value || 0);
      const yearsMult = licenceYears < 1 ? 1.32 : licenceYears < 3 ? 1.16 : licenceYears <= 5 ? 1.06 : 1;
      premium *= yearsMult;
      addDriver(drivers, yearsMult, 'Driving experience', licenceYears < 1 ? 'Less than a year of licence history increases uncertainty and cost.' : 'Shorter licence history can raise premiums.');

      const ncd = Number($('#ins-ncd', section)?.value || 0);
      const ncdMult = ncd === 0 ? 1.16 : ncd === 1 ? 1.06 : ncd === 2 ? .97 : ncd === 3 ? .9 : ncd === 4 ? .84 : .77;
      premium *= ncdMult;
      addDriver(drivers, ncdMult, 'No-claims discount', ncd >= 4 ? 'A strong no-claims history is pulling the estimate down.' : 'Limited no-claims history leaves less discount available.', ncdMult < 1);

      const claims = Number($('#ins-claims', section)?.value || 0);
      const claimsMult = claims === 0 ? 1 : claims === 1 ? 1.2 : claims === 2 ? 1.43 : 1.72;
      premium *= claimsMult;
      addDriver(drivers, claimsMult, 'Recent claims', `${claims || 'No'} claim${claims === 1 ? '' : 's'} declared in the last five years.`);

      const points = Number($('#ins-points', section)?.value || 0);
      const pointsMult = points === 0 ? 1 : points <= 3 ? 1.11 : points <= 6 ? 1.28 : points <= 9 ? 1.52 : 1.92;
      premium *= pointsMult;
      addDriver(drivers, pointsMult, 'Licence points / convictions', points >= 7 ? 'Higher points or a serious conviction can change insurer appetite significantly.' : 'Motoring points can raise pricing.');

      const job = factorFor($('#ins-job', section), { office:.96, professional:.93, trade:1.06, delivery:1.23, student:1.28, retired:.9, unemployed:1.13, other:1 });
      premium *= job;
      addDriver(drivers, job, 'Occupation', job > 1.1 ? 'This broad occupation category is associated with more expensive risk in our model.' : 'Your occupation category has a modest effect.', job < 1);

      const mileage = Number($('#ins-mileage', section)?.value || 10000);
      const mileageMult = mileage <= 4000 ? .9 : mileage <= 7000 ? .96 : mileage <= 10000 ? 1 : mileage <= 14000 ? 1.08 : 1.16;
      premium *= mileageMult;
      addDriver(drivers, mileageMult, 'Annual mileage', mileage > 14000 ? 'Higher annual mileage means more time exposed to road risk.' : 'Lower mileage can help the estimate.', mileageMult < 1);

      const usage = factorFor($('#ins-use', section), { social:.93, commute:1, business:1.15 });
      premium *= usage;
      addDriver(drivers, usage, 'Vehicle use', usage > 1 ? 'Business use generally adds more exposure than normal commuting.' : 'Social-only use is helping slightly.', usage < 1);

      const parking = factorFor($('#ins-parking', section), { garage:.91, driveway:.96, street:1.09, carpark:1.04 });
      premium *= parking;
      addDriver(drivers, parking, 'Overnight parking', parking > 1 ? 'Where the car is kept overnight is nudging the estimate upward.' : 'More secure overnight parking is helping.', parking < 1);

      const area = factorFor($('#ins-area', section), { rural:.88, town:.96, suburb:1, city:1.12, central:1.27 });
      premium *= area;
      addDriver(drivers, area, 'Area risk', area > 1.1 ? 'A denser urban area usually means higher theft, collision and repair exposure.' : 'A lower-risk area proxy is helping.', area < 1);

      const mods = $('#ins-mods', section)?.value === 'yes' ? 1.2 : 1;
      premium *= mods;
      addDriver(drivers, mods, 'Modifications', 'Declared modifications can reduce the number of insurers willing to quote.');

      const excess = Number($('#ins-excess', section)?.value || 250);
      const excessMult = excess === 0 ? 1.1 : excess <= 100 ? 1.05 : excess <= 250 ? 1 : excess <= 500 ? .95 : .91;
      premium *= excessMult;
      addDriver(drivers, excessMult, 'Voluntary excess', excess >= 500 ? 'A higher voluntary excess can reduce the premium, but you must be able to afford it after a claim.' : 'A lower excess can make the premium slightly higher.', excessMult < 1);

      const youngDriver = $('#ins-young-driver', section)?.value === 'yes' ? 1.14 : 1;
      premium *= youngDriver;
      addDriver(drivers, youngDriver, 'Additional young driver', 'Adding another driver under 25 can increase the risk profile.');

      premium = Math.max(280, Math.min(9500, premium));
      const low = Math.max(250, premium * .72);
      const high = Math.min(12500, premium * 1.38);
      const monthlyLow = low / 12;
      const monthlyHigh = high / 12;

      const topDrivers = drivers.sort((a,b) => b.strength - a.strength).slice(0,4);
      const driverHtml = topDrivers.length ? topDrivers.map(d => `<div class="insurance-driver"><i>${d.icon}</i><div><b>${d.title}</b><span>${d.text}</span></div></div>`).join('') : `<div class="insurance-driver"><i>✓</i><div><b>Fairly neutral profile</b><span>None of the answers moved our model dramatically in either direction.</span></div></div>`;

      result.hidden = false;
      result.innerHTML = `
        <div class="insurance-result-top">
          <div class="insurance-result-main"><span>Indicative annual range</span><strong>${money(low)}–${money(high)}</strong><b>Budgeting estimate for this EV</b></div>
          <div class="insurance-monthly"><span>Monthly equivalent</span><strong>${money(monthlyLow)}–${money(monthlyHigh)}</strong></div>
        </div>
        <div class="insurance-drivers">${driverHtml}</div>
        <div class="insurance-explain"><b>How confident are we?</b> Medium-low. Your driver profile is now much clearer, but this is still a model rather than a live quote. Exact postcode, the insurer’s own claims data, the precise registration/insurance group, cover start date and live underwriting can move the real price substantially. When we connect an insurance partner, this same section can return genuine quotes instead of a modelled range.</div>`;

      if (status) status.innerHTML = `<span>Indicative annual range</span><strong>${money(low)}–${money(high)}</strong><small>Based on the driver answers you supplied. Not a live insurer quote.</small>`;
      result.scrollIntoView({ behavior:'smooth', block:'nearest' });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
