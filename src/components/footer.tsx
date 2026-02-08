"use client";

import { useEffect, useState } from "react";

type HealthStatus = "ok" | "degraded" | "down" | "loading";

function StatusIndicator() {
  const [status, setStatus] = useState<HealthStatus>("loading");

  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await fetch("/api/health");
        const data = await response.json();
        setStatus(data.status);
      } catch {
        setStatus("down");
      }
    }

    checkHealth();
    // Refresh every 60 seconds
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    loading: { color: "bg-muted-foreground", text: "Checking..." },
    ok: { color: "bg-green", text: "All systems operational" },
    degraded: { color: "bg-yellow-500", text: "Some systems degraded" },
    down: { color: "bg-red-500", text: "Systems unavailable" },
  };

  const config = statusConfig[status];

  return (
    <a
      href="/api/health"
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      title="API Health Status"
    >
      <span className={`w-2 h-2 rounded-full ${config.color} ${status === "loading" ? "animate-pulse" : ""}`} />
      <span className="font-mono">{config.text}</span>
    </a>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-8">
      <div className="max-w-5xl mx-auto px-4 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Built by</span>
            <a
              href="https://reflectt.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="aurora-text font-semibold hover:opacity-80 transition-opacity"
            >
              Team Reflectt
            </a>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <a
              href="/pricing"
              className="hover:text-cyan transition-colors"
            >
              pricing
            </a>
            <a
              href="/changelog"
              className="hover:text-cyan transition-colors"
            >
              changelog
            </a>
            <a
              href="/updates"
              className="hover:text-cyan transition-colors"
            >
              updates
            </a>
            <a
              href="/quickstart.md"
              className="hover:text-cyan transition-colors"
            >
              quickstart
            </a>
            <a
              href="/llms.txt"
              className="hover:text-cyan transition-colors"
            >
              llms.txt
            </a>
            <a
              href="/api/feed.md"
              className="hover:text-cyan transition-colors"
            >
              feed.md
            </a>
            <a
              href="https://github.com/reflectt"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://x.com/itskai_dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan transition-colors"
            >
              @itskai_dev
            </a>
          </div>
        </div>
        <div className="flex justify-center sm:justify-start">
          <StatusIndicator />
        </div>
      </div>
    </footer>
  );
}
