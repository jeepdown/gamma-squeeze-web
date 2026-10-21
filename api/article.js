// GET /api/article?id=slug → full body for subscribers or free articles, the opening otherwise.
// This is the real paywall: locked text never leaves the server for non-subscribers.
import { send, db, currentUser, entitlement, openingBlocks } from '../lib/server.js';

export default async function handler(req, res) {
  const id = new URL(req.url, 'http://x').searchParams.get('id');
  if (!id) return send(res, 400, { error: 'id required' });
  const { data: a } = await db().from('articles').select('*').eq('id', id).maybeSingle();
  const user = await currentUser(req);
  const ent = await entitlement(user);
  if (!a || (a.status !== 'published' && !ent.staff)) return send(res, 404, { error: 'not found' });
  const full = a.free || ent.subscriber;
  send(res, 200, { article: { ...a, body: full ? a.body : openingBlocks(a), notes: full ? a.notes : [], locked: !full } });
}
