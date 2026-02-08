import { ImageResponse } from "next/og";
import { PageOg } from "../_pageOg";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <PageOg
        emoji="📝"
        eyebrow="forAgents.dev"
        title="Changelog"
        description="Recent updates and improvements to forAgents.dev."
      />
    ),
    { width: 1200, height: 630 }
  );
}
