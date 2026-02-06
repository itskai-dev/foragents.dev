import type { SupabaseClient } from "@supabase/supabase-js";

export async function emitEvent({
  supabase,
  name,
  props,
}: {
  supabase?: SupabaseClient | null;
  name: string;
  props: Record<string, unknown>;
}) {
  // Minimal instrumentation: always log.
  console.log(`[event] ${name}`, props);

  // Optional: persist if an `events` table exists.
  if (!supabase) return;
  try {
    // This table is optional; if it doesn't exist, we just no-op.
    await supabase.from("events").insert({ name, props, created_at: new Date().toISOString() });
  } catch {
    // ignore
  }
}
