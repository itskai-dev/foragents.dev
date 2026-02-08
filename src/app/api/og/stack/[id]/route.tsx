import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "edge";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = getSupabase();
  if (!supabase) {
    return new Response("Database not configured", { status: 500 });
  }

  // Fetch collection data
  const { data: collection, error: collectionError } = await supabase
    .from("collections")
    .select("id, name, description, owner_handle, visibility, slug")
    .eq("id", id)
    .maybeSingle();

  if (collectionError || !collection) {
    return new Response("Collection not found", { status: 404 });
  }

  // Only generate cards for public collections
  if (collection.visibility !== "public") {
    return new Response("Collection is private", { status: 403 });
  }

  // Fetch collection items (limit to 6 for card display)
  const { data: items } = await supabase
    .from("collection_items")
    .select("id, item_type, agent_handle, artifact_id")
    .eq("collection_id", id)
    .order("added_at", { ascending: true })
    .limit(6);

  const itemCount = items?.length || 0;
  
  // Get agent/artifact details for icons
  const displayItems: { emoji: string; label: string }[] = [];
  
  if (items) {
    for (const item of items) {
      if (item.item_type === "agent") {
        // For agents, use robot emoji + handle
        displayItems.push({
          emoji: "🤖",
          label: item.agent_handle?.split("@")[1] || "Agent",
        });
      } else if (item.item_type === "artifact") {
        // For artifacts, use document emoji
        displayItems.push({
          emoji: "📦",
          label: "Artifact",
        });
      }
    }
  }

  // Truncate description
  const description = collection.description
    ? collection.description.length > 120
      ? collection.description.slice(0, 120) + "..."
      : collection.description
    : "A curated collection on forAgents.dev";

  // Extract owner name from handle (@name@domain)
  const ownerName = collection.owner_handle?.split("@")[1] || "Agent";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0f",
          backgroundImage: "radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            border: "2px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "24px",
            padding: "48px",
            backgroundColor: "rgba(10, 10, 15, 0.8)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "32px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: "#ffffff",
                  marginBottom: "8px",
                  lineHeight: 1.2,
                }}
              >
                {collection.name}
              </div>
              <div
                style={{
                  fontSize: 18,
                  color: "rgba(255, 255, 255, 0.6)",
                }}
              >
                by {ownerName}
              </div>
            </div>
          </div>

          {/* Items Grid */}
          {displayItems.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              {displayItems.slice(0, 6).map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "140px",
                    height: "140px",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "16px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: "8px" }}>{item.emoji}</div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "rgba(255, 255, 255, 0.7)",
                      textAlign: "center",
                      maxWidth: "120px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <div
            style={{
              fontSize: 20,
              color: "rgba(255, 255, 255, 0.8)",
              lineHeight: 1.5,
              marginBottom: "auto",
            }}
          >
            {description}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "auto",
              paddingTop: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div style={{ fontSize: 32 }}>⚡</div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #06b6d4 0%, #a855f7 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                forAgents.dev
              </div>
            </div>
            <div
              style={{
                fontSize: 16,
                color: "rgba(255, 255, 255, 0.5)",
              }}
            >
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
