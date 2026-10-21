// POST /api/checkout {plan:'monthly'|'annual'} → Stripe Checkout URL.
// The $100 new-user coupon is applied only to the annual plan and only while the server-side offer clock is running.
import { send, db, stripe, readJson, currentUser, entitlement, offerDeadline, siteUrl } from '../lib/server.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  const user = await currentUser(req);
  if (!user) return send(res, 401, { error: 'sign in required' });
  const ent = await entitlement(user);
  if (ent.subscriber) return send(res, 409, { error: 'already subscribed' });
  const { plan } = await readJson(req);
  const price = plan === 'annual' ? process.env.STRIPE_PRICE_ANNUAL : plan === 'monthly' ? process.env.STRIPE_PRICE_MONTHLY : null;
  if (!price) return send(res, 400, { error: 'unknown plan' });

  let customer = user.stripe_customer_id;
  if (!customer) {
    const c = await stripe().customers.create({ email: user.email, metadata: { user_id: user.id } });
    customer = c.id;
    await db().from('profiles').update({ stripe_customer_id: customer }).eq('id', user.id);
  }
  const deadline = offerDeadline(user);
  const offer = plan === 'annual' && process.env.STRIPE_COUPON_NEWUSER && deadline && deadline > new Date();
  const base = siteUrl(req);
  const session = await stripe().checkout.sessions.create({
    mode: 'subscription',
    customer,
    client_reference_id: user.id,
    line_items: [{ price, quantity: 1 }],
    ...(offer ? { discounts: [{ coupon: process.env.STRIPE_COUPON_NEWUSER }] } : { allow_promotion_codes: true }),
    subscription_data: { metadata: { user_id: user.id, plan, offer: offer ? 'newuser' : '' } },
    success_url: `${base}/?checkout=success#me`,
    cancel_url: `${base}/?checkout=cancel#pricing`,
  });
  send(res, 200, { url: session.url, offer: !!offer });
}
