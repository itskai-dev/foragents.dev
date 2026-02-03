import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/.well-known/agent.json",
        destination: "/api/agent-card",
      },
      {
        source: "/feed.rss",
        destination: "/api/feed.rss",
      },
    ];
  },
};

export default nextConfig;
