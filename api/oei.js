// GET /api/oei → latest OEI snapshot plus history. OEI and Expected Move are public;
// Fair Vol, Edge Spread, VRP and realized-vol detail are for subscribers.
import { send, db, currentUser, entitlement } from '../lib/server.js';

const PUBLIC = ['spot', 'oei', 'expected_move_30d'];
export default async function handler(req, res) {
  const { data, error } = await db().from('oei_snapshots').select('asof,version,payload').order('asof', { ascending: false }).limit(260);
  if (error) return send(res, 500, { error: 'db' });
  if (!data?.length) return send(res, 200, { latest: null, history: [] });
  const full = (await entitlement(await currentUser(req))).subscriber;
  const pick = row => full ? row : Object.fromEntries(PUBLIC.filter(k => k in row).map(k => [k, row[k]]));
  const latest = data[0];
  send(res, 200, {
    full, asof: latest.asof, version: latest.version,
    latest: Object.fromEntries(Object.entries(latest.payload.rows || {}).map(([s, r]) => [s, pick(r)])),
    history: data.slice().reverse().map(d => ({ asof: d.asof, rows: Object.fromEntries(Object.entries(d.payload.rows || {}).map(([s, r]) => [s, full ? { oei: r.oei, fair_vol: r.fair_vol, edge_spread: r.edge_spread } : { oei: r.oei }])) })),
  });
}
