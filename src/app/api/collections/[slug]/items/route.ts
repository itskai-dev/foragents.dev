import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { normalizeOwnerHandle } from "@/lib/collections";
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from "@/lib/requestLimits";

function ownerHandleFrom(req: NextRequest): string | null {
  const header = req.headers.get("x-owner-handle") || req.headers.get("x-agent-handle");
  const query = req.nextUrl.searchParams.get("ownerHandle");
  const candidate = header || query;
  if (!candidate) return null;
  return normalizeOwnerHandle(candidate);
}

export async function POST(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const ip = getClientIp(req);
  const rl = checkRateLimit(`collections:items:post:${ip}`, { windowMs: 60_000, max: 60 });
  if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

  const ownerHandle = ownerHandleFrom(req);
  if (!ownerHandle) return NextResponse.json({ error: "ownerHandle is required" }, { status: 401 });

  const { slug } = await context.params;
  const id = slug;

  const { data: collection } = await supabase
    .from("collections")
    .select("id, owner_handle")
    .eq("id", id)
    .maybeSingle();

  if (!collection || collection.owner_handle !== ownerHandle) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: null | {
    itemType?: "agent" | "artifact";
    agentHandle?: string;
    artifactId?: string;
  };

  try {
    body = (await readJsonWithLimit(req, 4_000)) as typeof body;
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = typeof (err as any)?.status === "number" ? (err as any).status : 400;
    if (status === 413) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }

  if (body?.itemType !== "agent" && body?.itemType !== "artifact") {
    return NextResponse.json({ error: "itemType must be agent|artifact" }, { status: 400 });
  }

  if (body.itemType === "agent") {
    const agentHandle = typeof body.agentHandle === "string" ? body.agentHandle.trim().toLowerCase() : "";
    if (!agentHandle.startsWith("@") || agentHandle.split("@").length < 3) {
      return NextResponse.json({ error: "agentHandle must be a full handle like @name@domain" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("collection_items")
      .insert({ collection_id: id, item_type: "agent", agent_handle: agentHandle })
      .select("id, collection_id, item_type, agent_handle, artifact_id, added_at")
      .single();

    if (error) {
      const msg = (error as { code?: string }).code === "23505" ? "Already saved" : "Failed to save";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({ item: data }, { status: 201 });
  }

  const artifactId = typeof body.artifactId === "string" ? body.artifactId.trim() : "";
  if (!artifactId) return NextResponse.json({ error: "artifactId is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("collection_items")
    .insert({ collection_id: id, item_type: "artifact", artifact_id: artifactId })
    .select("id, collection_id, item_type, agent_handle, artifact_id, added_at")
    .single();

  if (error) {
    const msg = (error as { code?: string }).code === "23505" ? "Already saved" : "Failed to save";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({ item: data }, { status: 201 });
}
