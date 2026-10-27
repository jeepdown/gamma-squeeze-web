// API tests against an in-memory Supabase stand-in and a stubbed Stripe client (real webhook signature checks).
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import Stripe from 'stripe';
import { setTestClients } from '../lib/server.js';

process.env.STRIPE_PRICE_MONTHLY = 'price_m'; process.env.STRIPE_PRICE_ANNUAL = 'price_a';
process.env.STRIPE_COUPON_NEWUSER = 'coupon_100'; process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'; process.env.SITE_URL = 'https://gammasqueeze.example';

// ---- minimal query builder over arrays ----
function fakeDb(tables, users) {
  const key = { profiles: 'id', subscriptions: 'id', articles: 'id', snapshots: 'id', datasets: 'kind', stripe_events: 'id', oei_snapshots: 'asof' };
  const from = name => {
    const rows = tables[name] ||= [];
    let filters = [], op = 'select', payload = null, order = null, lim = null, onlyNull = [];
    const apply = () => rows.filter(r => filters.every(([k, v]) => r[k] === v) && onlyNull.every(k => r[k] == null));
    const exec = () => {
      if (op === 'select') { let out = apply(); if (order) out = [...out].sort((a, b) => (a[order.k] > b[order.k] ? 1 : -1) * (order.asc ? 1 : -1)); return lim ? out.slice(0, lim) : out; }
      if (op === 'update') { const hit = apply(); hit.forEach(r => Object.assign(r, payload)); return hit; }
      if (op === 'insert') { if (rows.some(r => r[key[name]] === payload[key[name]])) return { error: { message: 'duplicate' } }; rows.push({ ...payload }); return [payload]; }
      if (op === 'upsert') { const i = rows.findIndex(r => r[key[name]] === payload[key[name]]); if (i >= 0) Object.assign(rows[i], payload); else rows.push({ ...payload }); return [rows[i >= 0 ? i : rows.length - 1]]; }
    };
    const q = {
      select() { return q; }, eq(k, v) { filters.push([k, v]); return q; }, is(k) { onlyNull.push(k); return q; }, gte() { return q; },
      order(k, o) { order = { k, asc: o?.ascending !== false }; return q; }, limit(n) { lim = n; return q; },
      update(p) { op = 'update'; payload = p; return q; }, insert(p) { op = 'insert'; payload = p; return q; }, upsert(p) { op = 'upsert'; payload = p; return q; },
      maybeSingle() { const r = exec(); return Promise.resolve(r.error ? r : { data: r[0] || null }); },
      single() { const r = exec(); return Promise.resolve(r.error ? r : { data: r[0] }); },
      then(res, rej) { const r = exec(); return Promise.resolve(r.error ? r : { data: r, error: null }).then(res, rej); },
    };
    return q;
  };
  return { from, auth: { getUser: async t => users[t] ? { data: { user: users[t] } } : { error: { message: 'bad token' } } } };
}

function call(handler, { method = 'GET', url = '/', token, body, raw, headers = {} } = {}) {
  const stream = Readable.from(raw ? [raw] : body ? [Buffer.from(JSON.stringify(body))] : []);
  Object.assign(stream, { method, url, headers: { host: 'x', ...(token ? { authorization: 'Bearer ' + token } : {}), ...headers } });
  return new Promise(resolve => {
    const res = { headers: {}, statusCode: 200, setHeader(k, v) { this.headers[k] = v; }, end(b) { resolve({ status: this.statusCode, body: JSON.parse(b) }); } };
    handler(stream, res);
  });
}

const ARTICLE = { id: 'gamma', title: 'T', dek: '', cat: 'c', chan: '期权', syms: ['SPX'], free: false, mins: 5, body: ['open', 'sec1 para', 'sec2 para'], secs: [[1, '一、'], [2, '二、']], notes: [[1, 'n']], meta: {}, status: 'published', published_at: '2026-10-21T00:00:00Z' };
let T, stripeCalls;
beforeEach(() => {
  T = {
    profiles: [{ id: 'u1', email: 'free@x.com', role: 'member' }, { id: 'u2', email: 'pro@x.com', role: 'member', stripe_customer_id: 'cus_2' }, { id: 'u3', email: 'ed@x.com', role: 'admin' }],
    subscriptions: [{ id: 'sub_2', user_id: 'u2', status: 'active', plan: 'annual', current_period_end: '2027-10-21T00:00:00Z' }],
    articles: [{ ...ARTICLE }], datasets: [{ kind: 'earn', payload: { NVDA: { name: 'NVDA' } } }],
  };
  stripeCalls = [];
  const real = new Stripe('sk_test_dummy');
  setTestClients({
    db: fakeDb(T, { t1: { id: 'u1', email: 'free@x.com' }, t2: { id: 'u2', email: 'pro@x.com' }, t3: { id: 'u3', email: 'ed@x.com' } }),
    stripe: {
      customers: { create: async p => (stripeCalls.push(['customer', p]), { id: 'cus_new' }) },
      checkout: { sessions: { create: async p => (stripeCalls.push(['checkout', p]), { url: 'https://checkout.stripe.com/c/test' }) } },
      billingPortal: { sessions: { create: async p => (stripeCalls.push(['portal', p]), { url: 'https://billing.stripe.com/p/test' }) } },
      subscriptions: { retrieve: async id => ({ id, customer: 'cus_new', status: 'active', metadata: { user_id: 'u1', plan: 'annual', offer: 'newuser' }, items: { data: [{ price: { id: 'price_a' }, current_period_end: 1824681600 }] } }) },
      webhooks: real.webhooks,
    },
  });
});

const load = p => import(`../api/${p}.js`).then(m => m.default);

test('article: guests and free members get only the opening; subscribers and staff get everything', async () => {
  const h = await load('article');
  const guest = await call(h, { url: '/api/article?id=gamma' });
  assert.deepEqual(guest.body.article.body, ['open']); assert.equal(guest.body.article.locked, true); assert.deepEqual(guest.body.article.notes, []);
  assert.deepEqual((await call(h, { url: '/api/article?id=gamma', token: 't1' })).body.article.body, ['open']);
  assert.equal((await call(h, { url: '/api/article?id=gamma', token: 't2' })).body.article.body.length, 3);
  assert.equal((await call(h, { url: '/api/article?id=gamma', token: 't3' })).body.article.locked, false);
  assert.equal((await call(h, { url: '/api/article?id=nope' })).status, 404);
});

test('articles list never contains locked text', async () => {
  const r = await call(await load('articles'));
  assert.deepEqual(r.body.articles[0].body, ['open']);
});

test('premium datasets require a subscription', async () => {
  const h = await load('premium');
  assert.equal((await call(h, { url: '/api/premium?kind=earn', token: 't1' })).status, 402);
  assert.equal((await call(h, { url: '/api/premium?kind=earn', token: 't2' })).body.payload.NVDA.name, 'NVDA');
});

test('offer clock starts once and is not reset', async () => {
  const h = await load('offer');
  const first = await call(h, { method: 'POST', token: 't1' });
  const started = T.profiles[0].offer_started_at; assert.ok(first.body.deadline && started);
  await call(h, { method: 'POST', token: 't1' });
  assert.equal(T.profiles[0].offer_started_at, started);
  T.profiles[0].offer_started_at = new Date(Date.now() - 11 * 60000).toISOString();
  assert.equal((await call(h, { method: 'POST', token: 't1' })).body.deadline, null);
});

test('checkout applies the $100 coupon only on annual while the clock runs', async () => {
  const h = await load('checkout');
  T.profiles[0].offer_started_at = new Date().toISOString();
  const r = await call(h, { method: 'POST', token: 't1', body: { plan: 'annual' } });
  assert.equal(r.body.offer, true);
  const s = stripeCalls.find(c => c[0] === 'checkout')[1];
  assert.deepEqual(s.discounts, [{ coupon: 'coupon_100' }]); assert.equal(s.line_items[0].price, 'price_a'); assert.equal(s.client_reference_id, 'u1');
  assert.equal(T.profiles[0].stripe_customer_id, 'cus_new');
  stripeCalls = [];
  assert.equal((await call(h, { method: 'POST', token: 't1', body: { plan: 'monthly' } })).body.offer, false);
  T.profiles[0].offer_started_at = new Date(Date.now() - 20 * 60000).toISOString();
  assert.equal((await call(h, { method: 'POST', token: 't1', body: { plan: 'annual' } })).body.offer, false);
  assert.equal((await call(h, { method: 'POST', token: 't2', body: { plan: 'annual' } })).status, 409);
  assert.equal((await call(h, { method: 'POST', body: { plan: 'annual' } })).status, 401);
});

test('webhook verifies the signature, activates the subscription, marks the offer used, and is idempotent', async () => {
  const h = await load('webhook');
  const payload = JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed', data: { object: { subscription: 'sub_new' } } });
  const bad = await call(h, { method: 'POST', raw: Buffer.from(payload), headers: { 'stripe-signature': 't=1,v1=bad' } });
  assert.equal(bad.status, 400);
  const sig = Stripe.webhooks.generateTestHeaderString({ payload, secret: 'whsec_test' });
  const ok = await call(h, { method: 'POST', raw: Buffer.from(payload), headers: { 'stripe-signature': sig } });
  assert.equal(ok.status, 200);
  const sub = T.subscriptions.find(s => s.id === 'sub_new');
  assert.equal(sub.user_id, 'u1'); assert.equal(sub.status, 'active'); assert.equal(sub.plan, 'annual');
  assert.equal(T.profiles[0].offer_used, true);
  const again = await call(h, { method: 'POST', raw: Buffer.from(payload), headers: { 'stripe-signature': sig } });
  assert.equal(again.body.duplicate, true);
  // now u1 reads full text
  assert.equal((await call(await load('article'), { url: '/api/article?id=gamma', token: 't1' })).body.article.locked, false);
});

test('only editors and admins can publish', async () => {
  const h = await load('admin/publish');
  const item = { id: 'new-one', title: 'N', cat: 'c', chan: '宏观', body: ['a'], status: 'published' };
  assert.equal((await call(h, { method: 'POST', token: 't2', body: { kind: 'article', item } })).status, 403);
  const r = await call(h, { method: 'POST', token: 't3', body: { kind: 'article', item } });
  assert.equal(r.status, 200); assert.ok(T.articles.find(a => a.id === 'new-one').published_at);
});

test('me reports subscription state', async () => {
  const h = await load('me');
  assert.equal((await call(h)).body.signedIn, false);
  const pro = (await call(h, { token: 't2' })).body; assert.equal(pro.subscriber, true); assert.equal(pro.plan, 'annual');
  assert.equal((await call(h, { token: 't1' })).body.subscriber, false);
});

test('OEI: publish by staff, public fields for everyone, Fair Vol and Edge for subscribers', async () => {
  const pub = await load('admin/publish');
  const item = { asof: '2026-10-26', version: '0.1', rows: { SPY: { spot: 671, oei: 18.6, fair_vol: 15.2, edge_spread: 3.4, vrp: 0.0115, expected_move_30d: 35.8 } } };
  assert.equal((await call(pub, { method: 'POST', token: 't2', body: { kind: 'oei', item } })).status, 403);
  assert.equal((await call(pub, { method: 'POST', token: 't3', body: { kind: 'oei', item } })).status, 200);
  const h = await load('oei');
  const guest = (await call(h)).body;
  assert.equal(guest.latest.SPY.oei, 18.6); assert.equal(guest.latest.SPY.fair_vol, undefined); assert.equal(guest.history[0].rows.SPY.edge_spread, undefined);
  const pro = (await call(h, { token: 't2' })).body;
  assert.equal(pro.latest.SPY.edge_spread, 3.4); assert.equal(pro.full, true);
});
