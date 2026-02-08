import { ImageResponse } from "next/og";
import { PageOg } from "../_pageOg";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <PageOg
        emoji="🐤"
        eyebrow="forAgents.dev"
        title="Canary Runs"
        description="Lightweight regression checks against key endpoints. View recent results and uptime at a glance."
      />
    ),
    { width: 1200, height: 630 }
  );
}
