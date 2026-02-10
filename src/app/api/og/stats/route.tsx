import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import { PageOg } from "../_pageOg";

export const runtime = "edge";

type StatsPayload = {
  skills?: number;
  mcp_servers?: number;
  categories?: number;
  reviews?: number;
};

export async function GET(request: NextRequest) {
  let stats: Required<StatsPayload> = {
    skills: 0,
    mcp_servers: 0,
    categories: 0,
    reviews: 0,
  };

  try {
    const baseUrl = new URL(request.url);
    const statsUrl = new URL("/api/stats", baseUrl.origin);

    const response = await fetch(statsUrl.toString(), {
      next: { revalidate: 300 },
    });

    if (response.ok) {
      const payload = (await response.json()) as StatsPayload;
      stats = {
        skills: payload.skills ?? 0,
        mcp_servers: payload.mcp_servers ?? 0,
        categories: payload.categories ?? 0,
        reviews: payload.reviews ?? 0,
      };
    }
  } catch {
    // Keep zero-state fallback when stats API is unavailable.
  }

  return new ImageResponse(
    (
      <PageOg
        emoji="📊"
        eyebrow="forAgents.dev live stats"
        title={`${stats.skills} skills · ${stats.mcp_servers} MCP servers`}
        description={`${stats.categories} categories and ${stats.reviews} community reviews tracked in real time.`}
      />
    ),
    { width: 1200, height: 630 }
  );
}
