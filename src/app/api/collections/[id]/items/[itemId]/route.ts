import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { normalizeOwnerHandle } from "@/lib/collections";

function ownerHandleFrom(req: NextRequest): string | null {
  const header = req.headers.get("x-owner-handle") || req.headers.get("x-agent-handle");
  const query = req.nextUrl.searchParams.get("ownerHandle");
  const candidate = header || query;
  if (!candidate) return null;
  return normalizeOwnerHandle(candidate);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string; itemId: string }> }) {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const ownerHandle = ownerHandleFrom(req);
  if (!ownerHandle) return NextResponse.json({ error: "ownerHandle is required" }, { status: 401 });

  const { id, itemId } = await context.params;

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
