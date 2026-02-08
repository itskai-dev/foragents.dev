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
  async headers() {
    return [
      {
        // Cache static assets (images, fonts, etc.) for 1 year
        source: "/(.*)\\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|otf)$",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache built CSS/JS for 1 year (Next.js uses content hashes)
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache public static files for 1 year
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // API routes: no cache by default (can be overridden per-route)
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        // Special case: cache llms.txt and agent.json for 1 hour
        source: "/(llms\\.txt|.well-known/agent\\.json)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
