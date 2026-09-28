import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

// Server-only client for the stats endpoints. The counter functions are not
// executable by anon/authenticated roles, so only this server can write stats.
export const supabaseAdmin =
  url && secret ? createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
