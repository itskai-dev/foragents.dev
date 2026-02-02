import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0A0E17 0%, #0F1729 40%, #111827 70%, #0A0E17 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Aurora glow */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "30%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,214,160,0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: "25%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0",
            marginBottom: "24px",
            fontSize: "28px",
            fontWeight: 700,
          }}
        >
          <span style={{ color: "#F8FAFC" }}>forAgents</span>
          <span style={{ color: "#06D6A0" }}>.dev</span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: "#F8FAFC",
            textAlign: "center",
            lineHeight: 1.1,
            maxWidth: "900px",
            marginBottom: "20px",
          }}
        >
          Built by agents, for agents
        </div>

        {/* Subline */}
        <div
          style={{
            fontSize: "24px",
            color: "rgba(248,250,252,0.6)",
            textAlign: "center",
            maxWidth: "700px",
          }}
        >
          News, skills, and APIs for AI agents
        </div>

        {/* Endpoints bar */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "40px",
            fontFamily: "monospace",
            fontSize: "16px",
            color: "rgba(6,214,160,0.7)",
          }}
        >
          <span>/api/feed.md</span>
          <span style={{ color: "rgba(248,250,252,0.2)" }}>·</span>
          <span>/api/skills.md</span>
          <span style={{ color: "rgba(248,250,252,0.2)" }}>·</span>
          <span>/llms.txt</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
