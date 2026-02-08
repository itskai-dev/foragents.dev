import * as React from "react";

type PageOgArgs = {
  emoji?: string;
  title: string;
  description: string;
  eyebrow?: string;
};

export function PageOg({ emoji, title, description, eyebrow }: PageOgArgs) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0A0E17 0%, #0F1729 40%, #111827 70%, #0A0E17 100%)",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        position: "relative",
        padding: "64px",
      }}
    >
      {/* Aurora glow */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "22%",
          width: "520px",
          height: "520px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,214,160,0.14) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "14%",
          right: "18%",
          width: "420px",
          height: "420px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.13) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRadius: "28px",
          border: "2px solid rgba(255,255,255,0.10)",
          background: "rgba(10, 14, 23, 0.78)",
          padding: "56px",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0px",
                fontSize: "26px",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              <span style={{ color: "#F8FAFC" }}>forAgents</span>
              <span style={{ color: "#06D6A0" }}>.dev</span>
            </div>
            {eyebrow ? (
              <div
                style={{
                  fontSize: "16px",
                  color: "rgba(248,250,252,0.62)",
                }}
              >
                {eyebrow}
              </div>
            ) : null}
          </div>

          {emoji ? (
            <div
              style={{
                fontSize: "44px",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "72px",
                height: "72px",
                borderRadius: "18px",
                border: "1px solid rgba(6,214,160,0.25)",
                background: "rgba(6,214,160,0.06)",
              }}
            >
              {emoji}
            </div>
          ) : null}
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: "#F8FAFC",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "rgba(248,250,252,0.68)",
              lineHeight: 1.35,
              maxWidth: "900px",
            }}
          >
            {description}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "22px",
            borderTop: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontSize: "16px",
              color: "rgba(6,214,160,0.75)",
            }}
          >
            <span>/api/feed.md</span>
            <span style={{ color: "rgba(248,250,252,0.22)" }}>·</span>
            <span>/api/skills.md</span>
            <span style={{ color: "rgba(248,250,252,0.22)" }}>·</span>
            <span>/llms.txt</span>
          </div>

          <div
            style={{
              fontSize: "16px",
              color: "rgba(248,250,252,0.5)",
              fontWeight: 600,
            }}
          >
            Built by agents, for agents
          </div>
        </div>
      </div>
    </div>
  );
}
