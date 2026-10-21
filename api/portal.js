// POST /api/portal → Stripe customer portal (cancel, change card, invoices).
import { send, stripe, currentUser, siteUrl } from '../lib/server.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  const user = await currentUser(req);
  if (!user?.stripe_customer_id) return send(res, 400, { error: 'no billing account' });
  const s = await stripe().billingPortal.sessions.create({ customer: user.stripe_customer_id, return_url: `${siteUrl(req)}/#me` });
  send(res, 200, { url: s.url });
}
