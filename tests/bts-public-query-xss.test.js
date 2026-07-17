const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('bts/consultar/index.html', 'utf8');
const app = fs.readFileSync('bts/app.js', 'utf8');
const inlineScript = html.match(/<script>\n([\s\S]*?)\n<\/script><\/body>/)?.[1];
assert.ok(inlineScript, 'public lookup inline script must exist');

const forbiddenPayloads = [
  '<img src=x onerror=alert(1)>',
  '<script>alert(1)</script>',
  '"><svg onload=alert(1)>',
];

assert.doesNotMatch(inlineScript, /innerHTML\s*=\s*`[\s\S]*\$\{/i, 'untrusted lookup data must not be interpolated in innerHTML templates');
assert.doesNotMatch(inlineScript, /innerHTML\s*=/, 'public lookup result must not assign innerHTML');
assert.match(inlineScript, /textContent\s*=/, 'public lookup result must use textContent');
assert.match(inlineScript, /createElement\(/, 'public lookup result must create DOM nodes safely');
assert.match(inlineScript, /replaceChildren\(/, 'public lookup result must replace result content with DOM nodes');
assert.match(app, /function setMessage[\s\S]*?textContent\s*=/, 'shared message helper must write textContent');

class NodeStub {
  constructor(tagName = '') {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.attributes = {};
    this.dataset = {};
    this.hidden = false;
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

function makeContext(lookupCoupons) {
  const elements = {
    lookupForm: new NodeStub('form'),
    lookupMessage: new NodeStub('div'),
    lookupResult: new NodeStub('div'),
    phone: new NodeStub('input'),
  };
  elements.phone.value = '56911111111';
  const document = {
    getElementById: (id) => elements[id],
    querySelector: (selector) => elements[selector.replace('#', '')],
    querySelectorAll: () => [],
    createElement: (tag) => new NodeStub(tag),
  };
  const BTSApp = {
    $: (selector) => document.querySelector(selector),
    setMessage(el, text, type = 'info') { el.textContent = text; el.className = `message ${type}`; el.hidden = false; },
    safeString(value, fallback = '') { return typeof value === 'string' ? value : fallback; },
    cleanPhone(value) { return String(value || '').replace(/\D/g, ''); },
    firstName(name) { return (name || '').trim().split(/\s+/)[0] || 'Hola'; },
    normalizeCoupons(coupons, limit = 100) {
      if (!Array.isArray(coupons)) return [];
      return coupons.slice(0, limit).map((coupon) => {
        const rawCode = typeof coupon === 'string' ? coupon : coupon?.code;
        return { code: this.safeString(rawCode).trim(), status: this.safeString(coupon?.status, 'valid') || 'valid' };
      }).filter((coupon) => coupon.code);
    },
    lookupCoupons,
  };
  vm.runInNewContext(inlineScript, { document, BTSApp });
  return elements;
}

async function submit(elements) {
  await elements.lookupForm.listeners.submit({ preventDefault() {} });
}

(async () => {
  const found = makeContext(async () => ({
    participant: { full_name: forbiddenPayloads[0] },
    pets: [{ name: forbiddenPayloads[1] }],
    coupons: forbiddenPayloads.map((code) => ({ code })),
  }));
  await submit(found);
  assert.equal(found.lookupResult.querySelectorAll('img').length, 0, 'payload must not create img elements');
  assert.equal(found.lookupResult.querySelectorAll('script').length, 0, 'payload must not create script elements');
  assert.equal(found.lookupResult.querySelectorAll('svg').length, 0, 'payload must not create svg elements');
  forbiddenPayloads.forEach((payload) => assert.ok(found.lookupResult.textContent.includes(payload), `payload must render as text: ${payload}`));
  assert.equal(found.lookupMessage.textContent, 'Consulta realizada.', 'found status still works');

  const empty = makeContext(async () => ({ participant: {}, pets: [], coupons: [] }));
  await submit(empty);
  assert.ok(empty.lookupResult.textContent.includes('No encontramos cupones'), 'empty state still works');
  assert.equal(empty.lookupResult.querySelectorAll('a')[0].href, 'https://wa.me/56935677904', 'WhatsApp URL remains safe and fixed');

  const error = makeContext(async () => { throw new Error(forbiddenPayloads[2]); });
  await submit(error);
  assert.equal(error.lookupResult.children.length, 0, 'error state clears result safely');
  assert.equal(error.lookupMessage.textContent, forbiddenPayloads[2], 'RPC error message renders as text');

  console.log('BTS public lookup XSS contract passed');
})();
