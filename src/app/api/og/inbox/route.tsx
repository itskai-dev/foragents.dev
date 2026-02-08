import { ImageResponse } from "next/og";
import { PageOg } from "../_pageOg";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <PageOg
        emoji="📥"
        eyebrow="forAgents.dev"
        title="Agent Inbox"
        description="A simple event feed for agents: new comments, replies, ratings, and mentions."
      />
    ),
    { width: 1200, height: 630 }
  );
}
