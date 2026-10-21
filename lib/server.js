// Shared helpers for the Vercel API routes. Never import this from the browser bundle.
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const env = (k, fallback) => {
  const v = process.env[k] ?? fallback;
  if (v === undefined) throw new Error(`Missing environment variable ${k}`);
  return v;
};

let _db, _stripe;
export function db() {
  return _db ??= createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });
}
export function stripe() {
  return _stripe ??= new Stripe(env('STRIPE_SECRET_KEY'));
}
export function setTestClients({ db: d, stripe: s }) { _db = d; _stripe = s; } // test hook

export const OFFER_MINUTES = () => Number(process.env.OFFER_MINUTES || 10);
export const ACTIVE = new Set(['active', 'trialing']);

export function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const raw = await readRaw(req);
  try { return raw.length ? JSON.parse(raw.toString('utf8')) : {}; } catch { return {}; }
}
export function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Resolve the signed-in user from the Supabase access token in the Authorization header.
export async function currentUser(req) {
  const h = req.headers['authorization'] || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return null;
  const { data, error } = await db().auth.getUser(token);
  if (error || !data?.user) return null;
  const { data: profile } = await db().from('profiles').select('*').eq('id', data.user.id).maybeSingle();
  return profile ? { ...profile, email: profile.email || data.user.email } : { id: data.user.id, email: data.user.email, role: 'member' };
}

export async function activeSubscription(userId) {
  if (!userId) return null;
  const { data } = await db().from('subscriptions').select('*').eq('user_id', userId)
    .order('current_period_end', { ascending: false }).limit(5);
  return (data || []).find(s => ACTIVE.has(s.status)) || null;
}

// Staff always read everything; members need an active or trialing subscription.
export async function entitlement(user) {
  if (!user) return { signedIn: false, subscriber: false, staff: false };
  const staff = user.role === 'admin' || user.role === 'editor';
  const sub = staff ? null : await activeSubscription(user.id);
  return { signedIn: true, subscriber: staff || !!sub, staff, sub };
}

export function offerDeadline(profile) {
  if (!profile?.offer_started_at || profile.offer_used) return null;
  return new Date(new Date(profile.offer_started_at).getTime() + OFFER_MINUTES() * 60000);
}

export function siteUrl(req) {
  return process.env.SITE_URL || `https://${req.headers['x-forwarded-host'] || req.headers.host}`;
}

// Free opening of an article: every block before the first section heading.
export function openingBlocks(article) {
  const secs = article.secs || [];
  const first = secs.length ? secs[0][0] : 1;
  return (article.body || []).slice(0, first);
}
