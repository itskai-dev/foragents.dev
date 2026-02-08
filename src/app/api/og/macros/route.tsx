import { ImageResponse } from "next/og";
import { PageOg } from "../_pageOg";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <PageOg
        emoji="🔗"
        eyebrow="forAgents.dev"
        title="Macro Tools"
        description="Chain MCP tools into reusable workflows — devops, data, communication, and more."
      />
    ),
    { width: 1200, height: 630 }
  );
}
