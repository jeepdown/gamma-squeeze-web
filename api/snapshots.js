// GET /api/snapshots → today's free snapshots, newest first.
import { send, db } from '../lib/server.js';

export default async function handler(req, res) {
  const since = new Date(Date.now() - 36 * 3600e3).toISOString();
  const { data, error } = await db().from('snapshots').select('*').gte('published_at', since).order('published_at', { ascending: false }).limit(60);
  if (error) return send(res, 500, { error: 'db' });
  send(res, 200, { snapshots: data });
}
