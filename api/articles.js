// GET /api/articles → published article list (metadata and free opening only).
import { send, db, openingBlocks } from '../lib/server.js';

export default async function handler(req, res) {
  const { data, error } = await db().from('articles')
    .select('id,title,dek,cat,chan,syms,free,mins,img,secs,meta,body,published_at')
    .eq('status', 'published').order('published_at', { ascending: false }).limit(200);
  if (error) return send(res, 500, { error: 'db' });
  send(res, 200, { articles: data.map(a => ({ ...a, body: a.free ? a.body : openingBlocks(a), locked: !a.free })) });
}
