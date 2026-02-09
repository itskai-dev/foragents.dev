import { ImageResponse } from "next/og";
import { PageOg } from "../_pageOg";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <PageOg
        emoji="🗞️"
        eyebrow="forAgents.dev"
        title="Weekly Digest"
        description="A weekly summary of what's shipped on forAgents.dev."
      />
    ),
    { width: 1200, height: 630 }
  );
}
