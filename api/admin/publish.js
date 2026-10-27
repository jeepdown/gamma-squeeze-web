// POST /api/admin/publish {kind:'article'|'snapshot'|'dataset'|'oei', item} → upsert content (editors and admins only).
// Website and app both read the same API, so one publish updates both.
import { send, db, readJson, currentUser } from '../../lib/server.js';

const ARTICLE_FIELDS = ['id','title','dek','cat','chan','syms','free','mins','img','body','secs','notes','meta','status'];
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  const user = await currentUser(req);
  if (!user || !['admin', 'editor'].includes(user.role)) return send(res, 403, { error: 'editors only' });
  const { kind, item } = await readJson(req);
  if (!item || typeof item !== 'object') return send(res, 400, { error: 'item required' });
  const now = new Date().toISOString();
  let q;
  if (kind === 'article') {
    if (!item.id || !item.title || !item.cat || !item.chan) return send(res, 400, { error: 'id, title, cat, chan required' });
    const row = Object.fromEntries(ARTICLE_FIELDS.filter(k => k in item).map(k => [k, item[k]]));
    row.updated_at = now;
    if (row.status === 'published' && !item.published_at) row.published_at = now;
    q = db().from('articles').upsert(row).select('id,status,published_at').single();
  } else if (kind === 'snapshot') {
    if (!item.id || !item.sector || !item.title || !item.text) return send(res, 400, { error: 'id, sector, title, text required' });
    q = db().from('snapshots').upsert({ id: item.id, sector: item.sector, title: item.title, text: item.text, data: item.data || [], published_at: item.published_at || now }).select('id').single();
  } else if (kind === 'dataset') {
    if (!['earn', 'insts', 'congress'].includes(item.kind)) return send(res, 400, { error: 'unknown dataset' });
    q = db().from('datasets').upsert({ kind: item.kind, payload: item.payload, source: item.source || null, updated_at: now }).select('kind').single();
  } else if (kind === 'oei') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.asof || '') || !item.rows) return send(res, 400, { error: 'asof and rows required' });
    q = db().from('oei_snapshots').upsert({ asof: item.asof, version: item.version || '0.1', payload: item }).select('asof').single();
  } else return send(res, 400, { error: 'unknown kind' });
  const { data, error } = await q;
  if (error) return send(res, 500, { error: error.message });
  send(res, 200, { ok: true, saved: data });
}
