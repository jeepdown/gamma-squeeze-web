// POST /api/webhook ← Stripe. Keeps public.subscriptions in sync; marks the new-user offer as used.
import { send, db, stripe, readRaw } from '../lib/server.js';

export const config = { api: { bodyParser: false } }; // Stripe signature needs the raw body

const planOf = sub => {
  const price = sub.items?.data?.[0]?.price?.id;
  return price === process.env.STRIPE_PRICE_ANNUAL ? 'annual' : price === process.env.STRIPE_PRICE_MONTHLY ? 'monthly' : sub.metadata?.plan || null;
};

async function userIdFor(sub) {
  if (sub.metadata?.user_id) return sub.metadata.user_id;
  const { data } = await db().from('profiles').select('id').eq('stripe_customer_id', sub.customer).maybeSingle();
  return data?.id || null;
}

async function upsertSubscription(sub) {
  const user_id = await userIdFor(sub);
  if (!user_id) return;
  const end = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end;
  await db().from('subscriptions').upsert({
    id: sub.id, user_id, status: sub.status, price_id: sub.items?.data?.[0]?.price?.id || null, plan: planOf(sub),
    current_period_end: end ? new Date(end * 1000).toISOString() : null,
    cancel_at_period_end: !!sub.cancel_at_period_end, updated_at: new Date().toISOString(),
  });
  if (sub.metadata?.offer === 'newuser') await db().from('profiles').update({ offer_used: true }).eq('id', user_id);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  let event;
  try {
    event = stripe().webhooks.constructEvent(await readRaw(req), req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return send(res, 400, { error: 'bad signature' });
  }
  const { data: seen } = await db().from('stripe_events').select('id').eq('id', event.id).maybeSingle();
  if (seen) return send(res, 200, { received: true, duplicate: true });

  const o = event.data.object;
  if (event.type === 'checkout.session.completed' && o.subscription) {
    await upsertSubscription(await stripe().subscriptions.retrieve(o.subscription));
  } else if (event.type.startsWith('customer.subscription.')) {
    await upsertSubscription(o);
  }
  // Recorded only after processing, so a failed attempt is retried by Stripe.
  await db().from('stripe_events').insert({ id: event.id, type: event.type });
  send(res, 200, { received: true });
}
