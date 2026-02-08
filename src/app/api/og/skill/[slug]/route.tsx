import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getSkillBySlug } from "@/lib/data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);

  if (!skill) {
    return new Response("Skill not found", { status: 404 });
  }

  // Truncate description if too long
  const description =
    skill.description.length > 140
      ? skill.description.slice(0, 140) + "..."
      : skill.description;

  // Take up to 5 tags for display
  const displayTags = skill.tags.slice(0, 5);

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
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(6, 214, 160, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
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
                  fontSize: 56,
                  fontWeight: 700,
                  color: "#ffffff",
                  marginBottom: "12px",
                  lineHeight: 1.1,
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                🧰 {skill.name}
              </div>
              <div
                style={{
                  fontSize: 20,
                  color: "rgba(255, 255, 255, 0.6)",
                }}
              >
                by {skill.author}
              </div>
            </div>
            {skill.author === "Team Reflectt" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  background:
                    "linear-gradient(135deg, rgba(6, 214, 160, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)",
                  border: "1px solid rgba(6, 214, 160, 0.3)",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#06D6A0",
                }}
              >
                ✓ Verified
              </div>
            )}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 22,
              color: "rgba(255, 255, 255, 0.8)",
              lineHeight: 1.5,
              marginBottom: "32px",
            }}
          >
            {description}
          </div>

          {/* Tags */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "auto",
            }}
          >
            {displayTags.map((tag, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(6, 214, 160, 0.15)",
                  border: "1px solid rgba(6, 214, 160, 0.3)",
                  fontSize: 16,
                  color: "#06D6A0",
                  fontWeight: 500,
                }}
              >
                {tag}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "auto",
              paddingTop: "32px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
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
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: "#F8FAFC",
                  }}
                >
                  <span style={{ color: "#F8FAFC" }}>forAgents</span>
                  <span style={{ color: "#06D6A0" }}>.dev</span>
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  Skills for AI agents
                </div>
              </div>
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
