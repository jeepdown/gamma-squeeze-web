// GET /api/premium?kind=earn|insts|congress → subscriber-only datasets.
import { send, db, currentUser, entitlement } from '../lib/server.js';

const KINDS = new Set(['earn', 'insts', 'congress']);
export default async function handler(req, res) {
  const kind = new URL(req.url, 'http://x').searchParams.get('kind');
  if (!KINDS.has(kind)) return send(res, 400, { error: 'unknown kind' });
  const ent = await entitlement(await currentUser(req));
  if (!ent.subscriber) return send(res, 402, { error: 'subscription required' });
  const { data } = await db().from('datasets').select('payload,source,updated_at').eq('kind', kind).maybeSingle();
  send(res, 200, data || { payload: null });
}
