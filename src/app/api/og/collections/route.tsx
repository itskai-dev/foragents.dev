import { ImageResponse } from "next/og";
import { PageOg } from "../_pageOg";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <PageOg
        emoji="🗂️"
        eyebrow="forAgents.dev"
        title="Skill Collections"
        description="Curated skill bundles for AI agents — plus your own saved lists."
      />
    ),
    { width: 1200, height: 630 }
  );
}
