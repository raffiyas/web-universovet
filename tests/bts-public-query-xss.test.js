const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('bts/consultar/index.html', 'utf8');
const appScript = fs.readFileSync('bts/app.js', 'utf8');
const inlineScript = html.match(/<script>\n([\s\S]*?)\n<\/script><\/body>/)?.[1];
assert.ok(inlineScript, 'public lookup inline script must exist');

const maliciousPayloads = [
  '<img src=x onerror=alert(1)>',
  '<script>alert(1)</script>',
  '"><svg onload=alert(1)>',
];

assert.doesNotMatch(inlineScript, /innerHTML\s*=\s*`[\s\S]*\$\{/i, 'untrusted lookup data must not be interpolated in innerHTML templates');
assert.doesNotMatch(inlineScript, /innerHTML\s*=/, 'public lookup result must not assign innerHTML');
assert.match(inlineScript, /textContent\s*=/, 'public lookup result must use textContent');
assert.match(inlineScript, /createElement\(/, 'public lookup result must create DOM nodes safely');
assert.match(inlineScript, /replaceChildren\(/, 'public lookup result must replace result content with DOM nodes');
assert.match(appScript, /function setMessage[\s\S]*?textContent\s*=/, 'shared message helper must write textContent');

class NodeStub {
  constructor(tagName = '') {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.attributes = {};
    this.dataset = {};
    this.hidden = false;
    this.value = '';
    this._text = '';
    this._className = '';
    this._href = '';
    this.listeners = {};
  }
  set textContent(value) { this.children = []; this._text = String(value ?? ''); }
  get textContent() { return this._text + this.children.map((child) => typeof child === 'string' ? child : child.textContent).join(''); }
  set innerHTML(value) { throw new Error(`innerHTML assignment is forbidden in public lookup: ${value}`); }
  get innerHTML() { return this.textContent; }
  set className(value) { this._className = String(value ?? ''); }
  get className() { return this._className; }
  set href(value) { this._href = String(value ?? ''); this.attributes.href = this._href; }
  get href() { return this._href; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this._text = ''; this.children = [...nodes]; }
  addEventListener(type, handler) { this.listeners[type] = handler; }
  querySelectorAll(tag) {
    const matches = [];
    const visit = (node) => {
      if (!(node instanceof NodeStub)) return;
      if (node.tagName.toLowerCase() === tag.toLowerCase()) matches.push(node);
      node.children.forEach(visit);
    };
    visit(this);
    return matches;
  }
}

function createDocument(elements) {
  return {
    getElementById: (id) => elements[id],
    querySelector: (selector) => elements[selector.replace('#', '')],
    querySelectorAll: () => [],
    createElement: (tag) => new NodeStub(tag),
  };
}

function makeContext({ rpcData, rpcError }) {
  const elements = {
    lookupForm: new NodeStub('form'),
    lookupMessage: new NodeStub('div'),
    lookupResult: new NodeStub('div'),
    phone: new NodeStub('input'),
  };
  elements.phone.value = '56911111111';

  const document = createDocument(elements);
  const consoleCalls = [];
  const window = {
    UNIVERSOVET_SUPABASE_URL: 'https://unit-test.supabase.co',
    UNIVERSOVET_SUPABASE_ANON_KEY: 'public-anon-key',
    supabase: {
      createClient() {
        return {
          rpc(name, params) {
            assert.equal(name, 'lookup_bts_coupons_public');
            assert.equal(params.p_phone, elements.phone.value);
            return Promise.resolve({ data: rpcData, error: rpcError });
          },
        };
      },
    },
  };
  const context = {
    window,
    document,
    console: {
      error(...args) { consoleCalls.push(args); },
    },
  };

  vm.runInNewContext(appScript, context, { filename: 'bts/app.js' });
  assert.ok(window.BTSApp, 'real BTSApp must be created from bts/app.js');
  vm.runInNewContext(inlineScript, { ...context, BTSApp: window.BTSApp }, { filename: 'bts/consultar/index.html:inline' });

  return { elements, consoleCalls, BTSApp: window.BTSApp };
}

async function submit(elements) {
  await elements.lookupForm.listeners.submit({ preventDefault() {} });
}

function assertNoExecutableElements(root) {
  assert.equal(root.querySelectorAll('img').length, 0, 'payload must not create img elements');
  assert.equal(root.querySelectorAll('script').length, 0, 'payload must not create script elements');
  assert.equal(root.querySelectorAll('svg').length, 0, 'payload must not create svg elements');
}

(async () => {
  const found = makeContext({
    rpcData: {
      tutor_name: maliciousPayloads[0],
      pet_name: maliciousPayloads[1],
      total_coupons: 3,
      coupon_codes: maliciousPayloads,
    },
  });
  await submit(found.elements);
  assertNoExecutableElements(found.elements.lookupResult);
  maliciousPayloads.forEach((payload) => assert.ok(found.elements.lookupResult.textContent.includes(payload), `payload must render as text: ${payload}`));
  assert.equal(found.elements.lookupMessage.textContent, 'Consulta realizada.', 'found status still works');

  const manyCoupons = Array.from({ length: 145 }, (_, index) => index === 0 ? maliciousPayloads[2] : `BTS-${String(index + 1).padStart(3, '0')}`);
  const truncated = makeContext({
    rpcData: {
      tutor_name: 'Rafa Universo',
      pet_name: 'Luna',
      total_coupons: 145,
      coupon_codes: manyCoupons,
    },
  });
  await submit(truncated.elements);
  assert.ok(truncated.elements.lookupResult.textContent.includes('Rafa, tienes 145 cupones válidos para el sorteo.'), 'title must use the real total when available');
  assert.equal(truncated.elements.lookupResult.querySelectorAll('span').length, 100, 'must render at most 100 coupon codes');
  assert.ok(truncated.elements.lookupResult.textContent.includes('Mostrando los primeros 100 cupones de 145.'), 'must explain coupon truncation');
  assertNoExecutableElements(truncated.elements.lookupResult);

  const invalidTotal = makeContext({
    rpcData: {
      tutor_name: 'Rafa Universo',
      pet_name: 'Luna',
      total_coupons: '<script>999</script>',
      coupon_codes: ['BTS-001', 'BTS-002'],
    },
  });
  await submit(invalidTotal.elements);
  assert.ok(invalidTotal.elements.lookupResult.textContent.includes('Rafa, tienes 2 cupones válidos para el sorteo.'), 'invalid totals must fall back to rendered coupon count');

  const empty = makeContext({ rpcData: { tutor_name: 'Rafa', pet_name: 'Luna', total_coupons: 0, coupon_codes: [] } });
  await submit(empty.elements);
  assert.ok(empty.elements.lookupResult.textContent.includes('No encontramos cupones'), 'empty state still works');
  assert.equal(empty.elements.lookupResult.querySelectorAll('a')[0].href, 'https://wa.me/56935677904', 'WhatsApp URL remains safe and fixed');

  const technicalError = 'relation "participants" violates policy <script>alert(1)</script>';
  const error = makeContext({ rpcError: new Error(technicalError) });
  await submit(error.elements);
  assert.equal(error.elements.lookupResult.children.length, 0, 'error state clears result safely');
  assert.equal(error.elements.lookupMessage.textContent, 'No pudimos realizar la consulta. Inténtalo nuevamente o escríbenos por WhatsApp.', 'public error must be generic');
  assert.ok(!error.elements.lookupMessage.textContent.includes(technicalError), 'technical error must not appear in public DOM');
  assert.deepEqual(error.consoleCalls[0], ['BTS public coupon lookup failed', error.consoleCalls[0][1]], 'real error must be logged with fixed prefix');
  assert.equal(error.consoleCalls[0][1].message, technicalError, 'console should receive the real error object');

  console.log('BTS public lookup XSS contract passed');
})();
