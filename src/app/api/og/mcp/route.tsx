import { ImageResponse } from "next/og";
import { PageOg } from "../_pageOg";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <PageOg
        emoji="🔌"
        eyebrow="forAgents.dev"
        title="MCP Hub"
        description="A curated directory of Model Context Protocol (MCP) servers: filesystem, search, databases, APIs, and communication tools."
      />
    ),
    { width: 1200, height: 630 }
  );
}
