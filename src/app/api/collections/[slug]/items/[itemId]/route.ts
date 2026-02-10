import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { normalizeOwnerHandle } from "@/lib/collections";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/requestLimits";

const MAX_BODY_BYTES = 2_000;

function ownerHandleFrom(req: NextRequest): string | null {
  const header = req.headers.get("x-owner-handle") || req.headers.get("x-agent-handle");
  const query = req.nextUrl.searchParams.get("ownerHandle");
  const candidate = header || query;
  if (!candidate) return null;
  return normalizeOwnerHandle(candidate);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ slug: string; itemId: string }> }) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`collections:items:delete:${ip}`, { windowMs: 60_000, max: 60 });
  if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

  // DELETE requests should not include a body; cap just in case.
  const len = Number(req.headers.get("content-length") || "0");
  if (Number.isFinite(len) && len > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request body too large" }, { status: 413 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const ownerHandle = ownerHandleFrom(req);
  if (!ownerHandle) return NextResponse.json({ error: "ownerHandle is required" }, { status: 401 });

  const { slug, itemId } = await context.params;
  const id = slug;

  const { data: collection } = await supabase
    .from("collections")
    .select("id, owner_handle")
    .eq("id", id)
    .maybeSingle();

  if (!collection || collection.owner_handle !== ownerHandle) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("collection_items")
    .delete()
    .eq("id", itemId)
    .eq("collection_id", id);

  if (error) {
    console.error("Delete item error:", error);
    return NextResponse.json({ error: "Failed to remove" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
