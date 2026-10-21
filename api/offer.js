// POST /api/offer → start the new-user offer clock the first time a signed-in non-subscriber sees a paywall.
// The start time is stored once and never reset, so the countdown is a real deadline.
import { send, db, currentUser, entitlement, offerDeadline } from '../lib/server.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  const user = await currentUser(req);
  if (!user) return send(res, 401, { error: 'sign in required' });
  const ent = await entitlement(user);
  if (ent.subscriber) return send(res, 200, { deadline: null });
  let profile = user;
  if (!user.offer_started_at && !user.offer_used) {
    const { data } = await db().from('profiles').update({ offer_started_at: new Date().toISOString() })
      .eq('id', user.id).is('offer_started_at', null).select('*').maybeSingle();
    if (data) profile = data;
  }
  const d = offerDeadline(profile);
  send(res, 200, { deadline: d && d > new Date() ? d.toISOString() : null });
}
