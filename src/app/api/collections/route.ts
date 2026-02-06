import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from "@/lib/requestLimits";
import { getSupabase } from "@/lib/supabase";
import { ensureUniqueSlug, normalizeOwnerHandle } from "@/lib/collections";

function getOwnerHandleFromRequest(req: NextRequest): string | null {
  const header = req.headers.get("x-owner-handle") || req.headers.get("x-agent-handle");
  const query = req.nextUrl.searchParams.get("ownerHandle");
  const candidate = header || query;
  if (!candidate) return null;
  return normalizeOwnerHandle(candidate);
}

export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const ownerHandle = getOwnerHandleFromRequest(req);
  if (!ownerHandle) {
    return NextResponse.json(
      { error: "ownerHandle is required (format: @name@domain)" },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("collections")
    .select("id, owner_handle, name, description, visibility, slug, created_at, updated_at")
    .eq("owner_handle", ownerHandle)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Collections list error:", error);
    return NextResponse.json({ error: "Failed to load collections" }, { status: 500 });
  }

  // Item counts (cheap in SQL would be better; MVP do a second query)
  const ids = (data || []).map((c) => c.id);
  const counts: Record<string, number> = {};
  if (ids.length) {
    const { data: items, error: itemsError } = await supabase
      .from("collection_items")
      .select("collection_id")
      .in("collection_id", ids);
    if (!itemsError && items) {
      for (const row of items as { collection_id: string }[]) {
        counts[row.collection_id] = (counts[row.collection_id] || 0) + 1;
      }
    }
  }

  return NextResponse.json({
    ownerHandle,
    collections: (data || []).map((c) => ({
      id: c.id,
      ownerHandle: c.owner_handle,
      name: c.name,
      description: c.description,
      visibility: c.visibility,
      slug: c.slug,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      itemCount: counts[c.id] || 0,
    })),
  });
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const ip = getClientIp(req);
  const rl = checkRateLimit(`collections:post:${ip}`, { windowMs: 60_000, max: 20 });
  if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

  let body: null | {
    ownerHandle?: string;
    name?: string;
    description?: string;
  } = null;

  try {
    body = await readJsonWithLimit(req, 12_000);
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = typeof (err as any)?.status === "number" ? (err as any).status : 400;
    if (status === 413) return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }

  const ownerHandle = normalizeOwnerHandle(body?.ownerHandle || "");
  if (!ownerHandle) {
    return NextResponse.json(
      { error: "ownerHandle is required (format: @name@domain)" },
      { status: 401 }
    );
  }

  const name = (body?.name || "").trim();
  const description = typeof body?.description === "string" ? body.description.trim() : null;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const slug = await ensureUniqueSlug({
    desired: name,
    exists: async (s) => {
      const { data } = await supabase.from("collections").select("id").eq("slug", s).maybeSingle();
      return !!data;
    },
  });

  const row = {
    owner_handle: ownerHandle,
    name,
    description,
    visibility: "private",
    slug,
  };

  const { data, error } = await supabase
    .from("collections")
    .insert(row)
    .select("id, owner_handle, name, description, visibility, slug, created_at, updated_at")
    .single();

  if (error) {
    console.error("Collections create error:", error);
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }

  return NextResponse.json(
    {
      collection: {
        id: data.id,
        ownerHandle: data.owner_handle,
        name: data.name,
        description: data.description,
        visibility: data.visibility,
        slug: data.slug,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    },
    { status: 201 }
  );
}
