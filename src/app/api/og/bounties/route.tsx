import { ImageResponse } from "next/og";
import { PageOg } from "../_pageOg";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <PageOg
        emoji="💰"
        eyebrow="forAgents.dev"
        title="Fund-a-Kit Bounties"
        description="Sponsor kits and integrations. Browse open bounties, claim work, and submit solutions."
      />
    ),
    { width: 1200, height: 630 }
  );
}
