import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

import skillsData from "@/data/skills.json";

export const runtime = "edge";

type Skill = {
  slug: string;
  name: string;
  tags: string[];
};

function clampText(input: string, maxLen: number) {
  const s = (input || "").trim();
  if (!s) return "";
  return s.length > maxLen ? s.slice(0, maxLen - 1).trimEnd() + "…" : s;
}

function parseSkillsParam(skillsParam: string | null) {
  const raw = (skillsParam || "").trim();
  if (!raw) return [];

  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  // de-dupe while preserving order
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const key = p.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }

  return out.slice(0, 10);
}

function getEmojiForSkill(skill: Skill | undefined, fallbackLabel?: string) {
  const label = (skill?.slug || fallbackLabel || "").toLowerCase();
  const tags = (skill?.tags || []).map((t) => t.toLowerCase());

  const has = (t: string) => tags.includes(t);

  if (has("memory") || label.includes("memory")) return "🧠";
  if (has("autonomy") || has("proactive") || label.includes("autonomy")) return "⚡";
  if (has("teams") || has("coordination") || label.includes("team")) return "👥";
  if (has("identity") || has("security") || label.includes("identity")) return "🪪";
  if (has("browser") || has("web") || has("search") || label.includes("browser")) return "🌐";
  if (has("files") || has("storage") || label.includes("file")) return "📁";
  if (has("voice") || has("audio") || label.includes("voice")) return "🎙️";
  if (has("discord") || has("telegram") || has("slack") || has("messaging") || label.includes("message")) return "💬";
  if (has("calendar") || label.includes("calendar")) return "📅";
  if (has("email") || label.includes("email")) return "✉️";
  if (has("supabase") || has("database") || label.includes("db")) return "🗄️";
  if (has("code") || has("dev") || label.includes("code")) return "💻";

  return skill ? "🧰" : "🧩";
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const title = clampText(url.searchParams.get("title") || "My Stack", 48) || "My Stack";
  const skillSlugsOrNames = parseSkillsParam(url.searchParams.get("skills"));

  const skills = (skillsData as Skill[]) || [];
  const bySlug = new Map(skills.map((s) => [s.slug.toLowerCase(), s] as const));

  const items = skillSlugsOrNames.map((raw) => {
    const key = raw.toLowerCase();
    const found = bySlug.get(key);
    return {
      emoji: getEmojiForSkill(found, raw),
      label: found?.name || raw,
      verified: found?.tags?.includes("openclaw") || false,
    };
  });

  // Layout parameters
  const width = 1200;
  const height = 630;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#070A12",
          backgroundImage:
            "radial-gradient(circle at 20% 25%, rgba(6, 214, 160, 0.18) 0%, transparent 55%), radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.16) 0%, transparent 55%), linear-gradient(135deg, #070A12 0%, #0A0E17 35%, #0B1020 65%, #070A12 100%)",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          padding: "56px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: "28px",
            border: "2px solid rgba(255, 255, 255, 0.10)",
            backgroundColor: "rgba(10, 10, 18, 0.78)",
            padding: "44px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Accent lines */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              borderTopLeftRadius: "28px",
              borderTopRightRadius: "28px",
              background: "linear-gradient(90deg, rgba(6,214,160,0.9) 0%, rgba(6,182,212,0.9) 35%, rgba(168,85,247,0.9) 70%, rgba(139,92,246,0.9) 100%)",
            }}
          />

          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: "26px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: 18,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255, 255, 255, 0.55)",
                  marginBottom: "10px",
                }}
              >
                Agent Tool Stack
              </div>
              <div
                style={{
                  fontSize: 60,
                  fontWeight: 800,
                  lineHeight: 1.06,
                  color: "#F8FAFC",
                  maxWidth: "900px",
                }}
              >
                {title}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "999px",
                border: "1px solid rgba(6, 214, 160, 0.25)",
                background: "rgba(6, 214, 160, 0.10)",
                color: "#06D6A0",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              <span style={{ fontSize: 18 }}>⚡</span>
              <span>{items.length} skills</span>
            </div>
          </div>

          {/* Skills grid */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
              marginTop: "10px",
            }}
          >
            {items.slice(0, 8).map((it, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  width: "488px",
                  padding: "16px 18px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.10)",
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "linear-gradient(135deg, rgba(6,214,160,0.20) 0%, rgba(168,85,247,0.16) 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.10)",
                    fontSize: 26,
                  }}
                >
                  {it.emoji}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "rgba(248, 250, 252, 0.98)",
                      lineHeight: 1.15,
                      maxWidth: "360px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {it.label}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "rgba(255, 255, 255, 0.55)",
                      marginTop: "2px",
                    }}
                  >
                    {it.verified ? "OpenClaw compatible" : "forAgents.dev skill"}
                  </div>
                </div>
              </div>
            ))}

            {skillSlugsOrNames.length > 8 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "488px",
                  padding: "16px 18px",
                  borderRadius: "16px",
                  border: "1px dashed rgba(255, 255, 255, 0.18)",
                  background: "rgba(255, 255, 255, 0.03)",
                  color: "rgba(255, 255, 255, 0.72)",
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                +{skillSlugsOrNames.length - 8} more
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: "auto",
              paddingTop: "26px",
              borderTop: "1px solid rgba(255, 255, 255, 0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ fontSize: 30 }}>⚡</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#F8FAFC" }}>
                  <span style={{ color: "#F8FAFC" }}>forAgents</span>
                  <span style={{ color: "#06D6A0" }}>.dev</span>
                </div>
                <div style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.55)" }}>
                  Share your stack • Build better agents
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontFamily: "monospace",
                fontSize: 14,
                color: "rgba(6, 214, 160, 0.75)",
              }}
            >
              <span>/api/stack-card</span>
              <span style={{ color: "rgba(255, 255, 255, 0.18)" }}>·</span>
              <span>PNG</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
