// GET /api/config → public browser config (anon key is safe to expose; RLS protects the tables).
import { send } from '../lib/server.js';
export default function handler(req, res) {
  send(res, 200, { supabaseUrl: process.env.SUPABASE_URL, supabaseAnonKey: process.env.SUPABASE_ANON_KEY, offerMinutes: Number(process.env.OFFER_MINUTES || 10), offerAmount: 100 });
}
