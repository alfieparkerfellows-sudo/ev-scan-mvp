const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require('node:path').join(__dirname,'..','listing-live.js'),'utf8');

function response(ok,payload) {
  return { ok, json: async () => payload };
}

async function scenario(scanFetch,{ abort = false, immediateTimeout = false } = {}) {
  const listeners = {};
  class Form {}
  const elements = new Map();
  const element = (extra = {}) => ({ hidden:true, textContent:'', style:{}, classList:{ add(){}, remove(){}, toggle(){} }, setAttribute(){}, ...extra });
  elements.set('#scan-overlay',element());
  elements.set('#url-help',element());
  elements.set('#listing-url',element({ value:'https://www.ebay.co.uk/itm/123', id:'listing-url' }));
  const scanForm = new Form(); scanForm.id = 'scan-form';
  elements.set('#scan-form',scanForm);
  elements.set('#scan-title',element());
  elements.set('#scan-step-copy',element());
  elements.set('#scan-progress',element());
  elements.set('#scan-stage-count',element());
  elements.set('#report-view',element());
  elements.set('.app-shell',element({ hidden:false }));

  const windowListeners = {};
  const context = {
    console, URL, Intl, Date, AbortController, HTMLFormElement:Form,
    document:{
      head:{ appendChild(){} }, body:{ classList:{ add(){}, remove(){} } },
      createElement:() => element(), querySelector:(selector) => elements.get(selector) || null,
      addEventListener:(type,handler) => { listeners[type] = handler; }
    },
    window:{
      addEventListener:(type,handler) => { windowListeners[type] = handler; },
      scrollTo(){},
    },
    fetch:(url,options = {}) => url === '/api/listing-status'
      ? Promise.resolve(response(true,{ available:true, message:'Listing scans available.' }))
      : scanFetch(options),
    setTimeout:(handler,delay) => {
      if (immediateTimeout && delay === 30000) queueMicrotask(handler);
      return 1;
    },
    clearTimeout(){},
    queueMicrotask
  };
  vm.runInNewContext(source,context);
  await new Promise((resolve) => setImmediate(resolve));
  const submitEvent = { target:elements.get('#scan-form'), preventDefault(){}, stopImmediatePropagation(){} };
  listeners.submit(submitEvent);
  if (abort) { await Promise.resolve(); windowListeners.pagehide(); }
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
  return { overlay:elements.get('#scan-overlay'), help:elements.get('#url-help'), report:elements.get('#report-view') };
}

function abortableFailure(options) {
  return new Promise((resolve,reject) => {
    options.signal.addEventListener('abort',() => reject(Object.assign(new Error('aborted'),{ name:'AbortError' })),{ once:true });
  });
}

(async () => {
  const handled = await scenario(() => Promise.resolve(response(false,{ ok:false, message:'eBay listing could not be verified. No report was generated.' })));
  assert.equal(handled.overlay.hidden,true,'handled API failure closes overlay');
  assert.match(handled.help.textContent,/eBay listing could not be verified/);

  const network = await scenario(() => Promise.reject(new TypeError('network down')));
  assert.equal(network.overlay.hidden,true,'network failure closes overlay');
  assert.match(network.help.textContent,/could not complete/);

  const timeout = await scenario(abortableFailure,{ immediateTimeout:true });
  assert.equal(timeout.overlay.hidden,true,'timeout closes overlay');
  assert.match(timeout.help.textContent,/took too long/);

  const aborted = await scenario(abortableFailure,{ abort:true });
  assert.equal(aborted.overlay.hidden,true,'aborted request closes overlay');
  assert.match(aborted.help.textContent,/cancelled/);

  const successPayload = { ok:true, quality:{ passed:true }, listing:{ images:[] }, scoring:{ decisionConfidence:{} }, battery:{}, mot:{}, verification:{ extractionProviders:[] }, sellerQuestions:[], motTests:[], limitations:[] };
  const success = await scenario(() => Promise.resolve(response(true,successPayload)));
  assert.equal(success.overlay.hidden,true,'successful request closes overlay');
  assert.equal(success.report.hidden,false,'successful request opens report');

  console.log('listing-live request lifecycle: 5 scenarios passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });

