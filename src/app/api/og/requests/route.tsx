import { ImageResponse } from "next/og";
import { PageOg } from "../_pageOg";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <PageOg
        emoji="🧩"
        eyebrow="forAgents.dev"
        title="Request a Kit"
        description="Suggest kits and integrations you'd like to see built for AI agents. Upvote existing requests to help prioritize."
      />
    ),
    { width: 1200, height: 630 }
  );
}
