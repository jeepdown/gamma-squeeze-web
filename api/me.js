// GET /api/me → who is signed in and what they can read.
import { send, currentUser, entitlement, offerDeadline } from '../lib/server.js';

export default async function handler(req, res) {
  const user = await currentUser(req);
  if (!user) return send(res, 200, { signedIn: false });
  const ent = await entitlement(user);
  const deadline = offerDeadline(user);
  send(res, 200, {
    signedIn: true, email: user.email, role: user.role, subscriber: ent.subscriber, staff: ent.staff,
    plan: ent.sub?.plan || null, renews: ent.sub?.current_period_end || null, cancelAtPeriodEnd: !!ent.sub?.cancel_at_period_end,
    offer: { startedAt: user.offer_started_at || null, used: !!user.offer_used, deadline: deadline?.toISOString() || null },
  });
}
