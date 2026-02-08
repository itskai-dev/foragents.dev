import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getCreatorByUsername } from "@/lib/data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const creator = getCreatorByUsername(decodeURIComponent(username));

  if (!creator) {
    return new Response("Creator not found", { status: 404 });
  }

  // Take up to 5 top tags
  const displayTags = creator.topTags.slice(0, 5);

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
          {/* Header with avatar and name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, rgba(6, 214, 160, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)",
                border: "2px solid rgba(6, 214, 160, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 56,
              }}
            >
              👤
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  color: "#ffffff",
                  marginBottom: "8px",
                  lineHeight: 1.1,
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                {creator.username}
                {creator.verified && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "8px 16px",
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
              <div
                style={{
                  fontSize: 18,
                  color: "rgba(255, 255, 255, 0.6)",
                }}
              >
                Creator Profile
              </div>
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: "32px",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "20px 32px",
                borderRadius: "12px",
                backgroundColor: "rgba(6, 214, 160, 0.1)",
                border: "1px solid rgba(6, 214, 160, 0.2)",
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: "#06D6A0",
                  lineHeight: 1,
                  marginBottom: "8px",
                }}
              >
                {creator.skillCount}
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: "rgba(255, 255, 255, 0.7)",
                }}
              >
                Skill{creator.skillCount !== 1 ? "s" : ""} Published
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "20px 32px",
                borderRadius: "12px",
                backgroundColor: "rgba(139, 92, 246, 0.1)",
                border: "1px solid rgba(139, 92, 246, 0.2)",
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: "#8B5CF6",
                  lineHeight: 1,
                  marginBottom: "8px",
                }}
              >
                {creator.totalTags}
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: "rgba(255, 255, 255, 0.7)",
                }}
              >
                Total Tags
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "20px 32px",
                borderRadius: "12px",
                backgroundColor: "rgba(6, 182, 212, 0.1)",
                border: "1px solid rgba(6, 182, 212, 0.2)",
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: "#06B6D4",
                  lineHeight: 1,
                  marginBottom: "8px",
                }}
              >
                {displayTags.length}
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: "rgba(255, 255, 255, 0.7)",
                }}
              >
                Top Tags
              </div>
            </div>
          </div>

          {/* Top Tags */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginBottom: "auto",
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.9)",
                marginBottom: "8px",
              }}
            >
              🏷️ Top Tags
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              {displayTags.map((tagData, idx) => (
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
                  {tagData.tag}
                  <span style={{ marginLeft: "8px", opacity: 0.6 }}>
                    ×{tagData.count}
                  </span>
                </div>
              ))}
            </div>
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
                  Creator Directory
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
