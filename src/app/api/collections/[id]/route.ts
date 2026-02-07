import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from "@/lib/requestLimits";
import { ensureUniqueSlug, normalizeOwnerHandle } from "@/lib/collections";
import { getAgentByHandle, formatAgentHandle } from "@/lib/data";
import { getArtifactById } from "@/lib/artifacts";

const MAX_PATCH_BYTES = 8_000;
const MAX_BODY_BYTES = 0; // DELETE/PATCH should not accept large bodies

function ownerHandleFrom(req: NextRequest): string | null {
  const header = req.headers.get("x-owner-handle") || req.headers.get("x-agent-handle");
  const query = req.nextUrl.searchParams.get("ownerHandle");
  const candidate = header || query;
  if (!candidate) return null;
  return normalizeOwnerHandle(candidate);
}

async function assertOwner(opts: {
  supabase: NonNullable<ReturnType<typeof getSupabase>>;
  id: string;
  ownerHandle: string;
}) {
  const { data, error } = await opts.supabase
    .from("collections")
    .select("id, owner_handle, name, description, visibility, slug, created_at, updated_at")
    .eq("id", opts.id)
    .maybeSingle();

  if (error) return { error: "Failed to load collection", status: 500 as const };
  if (!data) return { error: "Not found", status: 404 as const };
  if (data.owner_handle !== opts.ownerHandle) return { error: "Not found", status: 404 as const };
  return { collection: data };
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const ownerHandle = ownerHandleFrom(req);
  if (!ownerHandle) {
    return NextResponse.json({ error: "ownerHandle is required" }, { status: 401 });
  }

  const { id } = await context.params;

  const owned = await assertOwner({ supabase, id, ownerHandle });
  if ("error" in owned) return NextResponse.json({ error: owned.error }, { status: owned.status });

  const { data: items, error: itemsError } = await supabase
    .from("collection_items")
    .select("id, item_type, agent_handle, artifact_id, position, added_at")
    .eq("collection_id", id)
    .order("added_at", { ascending: false });

  if (itemsError) {
    console.error("Collection items load error:", itemsError);
    return NextResponse.json({ error: "Failed to load items" }, { status: 500 });
  }

  // Hydrate display info (MVP: do per-item lookups)
  const hydrated = await Promise.all(
    (items || []).map(async (it) => {
      if (it.item_type === "agent") {
        const parsedHandle = (it.agent_handle || "").replace(/^@/, "");
        const handlePart = parsedHandle.split("@")[0];
        const agent = getAgentByHandle(handlePart);
        return {
          id: it.id,
          itemType: "agent" as const,
          addedAt: it.added_at,
          agentHandle: it.agent_handle,
          agent: agent
            ? {
                name: agent.name,
                handle: formatAgentHandle(agent),
                avatar: agent.avatar,
                profileUrl: `/agents/${agent.handle}`,
                description: agent.description,
              }
            : null,
        };
      }

      const artifact = it.artifact_id ? await getArtifactById(it.artifact_id).catch(() => null) : null;
      return {
        id: it.id,
        itemType: "artifact" as const,
        addedAt: it.added_at,
        artifactId: it.artifact_id,
        artifact: artifact
          ? {
              id: artifact.id,
              title: artifact.title,
              // summary omitted in MVP
              url: `/artifacts/${artifact.id}`,
            }
          : null,
      };
    })
  );

  return NextResponse.json({
    ownerHandle,
    collection: {
      id: owned.collection.id,
      ownerHandle: owned.collection.owner_handle,
      name: owned.collection.name,
      description: owned.collection.description,
      visibility: owned.collection.visibility,
      slug: owned.collection.slug,
      createdAt: owned.collection.created_at,
      updatedAt: owned.collection.updated_at,
    },
    items: hydrated,
  });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`collections_patch:${ip}`, { windowMs: 60_000, max: 30 });
  if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const ownerHandle = ownerHandleFrom(req);
  if (!ownerHandle) return NextResponse.json({ error: "ownerHandle is required" }, { status: 401 });

  const { id } = await context.params;
  const owned = await assertOwner({ supabase, id, ownerHandle });
  if ("error" in owned) return NextResponse.json({ error: owned.error }, { status: owned.status });

  let body: null | {
    name?: unknown;
    description?: unknown;
    visibility?: unknown;
    slug?: unknown;
  } = null;

  try {
    body = (await readJsonWithLimit<Record<string, unknown>>(req, MAX_PATCH_BYTES)) as unknown as typeof body;
  } catch (err) {
    if (typeof err === "object" && err && "status" in err && (err as { status?: unknown }).status === 413) {
      return NextResponse.json({ error: "payload too large" }, { status: 413 });
    }
    body = null;
  }

  const patch: Record<string, unknown> = {};

  const b = body as unknown as Record<string, unknown> | null;

  if (typeof b?.name === "string") patch.name = b.name.trim().slice(0, 120);
  if (typeof b?.description === "string") patch.description = b.description.trim().slice(0, 2000);
  if (b && b.description === null) patch.description = null;
  if (b?.visibility === "private" || b?.visibility === "public") {
    patch.visibility = b.visibility;
  }

  if (typeof b?.slug === "string" && b.slug.trim()) {
    // Ensure uniqueness
    const desired = b.slug.trim();
    const slug = await ensureUniqueSlug({
      desired,
      exists: async (s) => {
        const { data } = await supabase
          .from("collections")
          .select("id")
          .eq("slug", s)
          .neq("id", id)
          .maybeSingle();
        return !!data;
      },
    });
    patch.slug = slug;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No changes" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("collections")
    .update(patch)
    .eq("id", id)
    .select("id, owner_handle, name, description, visibility, slug, created_at, updated_at")
    .single();

  if (error) {
    console.error("Collection update error:", error);
    return NextResponse.json({ error: "Failed to update collection" }, { status: 500 });
  }

  return NextResponse.json({
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
  });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`collections_delete:${ip}`, { windowMs: 60_000, max: 20 });
  if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "payload too large" }, { status: 413 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const ownerHandle = ownerHandleFrom(req);
  if (!ownerHandle) return NextResponse.json({ error: "ownerHandle is required" }, { status: 401 });

  const { id } = await context.params;
  const owned = await assertOwner({ supabase, id, ownerHandle });
  if ("error" in owned) return NextResponse.json({ error: owned.error }, { status: owned.status });

  const { error } = await supabase.from("collections").delete().eq("id", id);
  if (error) {
    console.error("Collection delete error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
