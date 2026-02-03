import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

/**
 * Returns a Supabase client if SUPABASE_URL and SUPABASE_ANON_KEY are set.
 * Returns null otherwise (caller should fall back to JSON file).
 */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  if (!_client) {
    _client = createClient(url, key);
  }
  return _client;
}
