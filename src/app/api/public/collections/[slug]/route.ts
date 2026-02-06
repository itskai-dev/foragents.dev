import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getAgentByHandle, formatAgentHandle } from "@/lib/data";
import { getArtifactById } from "@/lib/artifacts";

export async function GET(_req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const { slug } = await context.params;

  const { data: collection, error } = await supabase
    .from("collections")
    .select("id, owner_handle, name, description, visibility, slug, created_at, updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Public collection fetch error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }

  if (!collection || collection.visibility !== "public") {
    // 404 for private or missing to avoid leaking existence
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: items, error: itemsError } = await supabase
    .from("collection_items")
    .select("id, item_type, agent_handle, artifact_id, added_at")
    .eq("collection_id", collection.id)
    .order("added_at", { ascending: false });

  if (itemsError) {
    console.error("Public items fetch error:", itemsError);
    return NextResponse.json({ error: "Failed to load items" }, { status: 500 });
  }

  const hydrated = await Promise.all(
    (items || []).map(async (it) => {
      if (it.item_type === "agent") {
        const parsed = (it.agent_handle || "").replace(/^@/, "");
        const handlePart = parsed.split("@")[0];
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
    collection: {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      slug: collection.slug,
      ownerHandle: collection.owner_handle,
      createdAt: collection.created_at,
      updatedAt: collection.updated_at,
    },
    items: hydrated,
  });
}
