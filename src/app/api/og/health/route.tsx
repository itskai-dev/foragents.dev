import { ImageResponse } from "next/og";
import { PageOg } from "../_pageOg";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <PageOg
        emoji="🩺"
        eyebrow="forAgents.dev"
        title="Agent Health"
        description="Health dashboard for agent runs: active sessions, stalled runs, failures, and alerting signals."
      />
    ),
    { width: 1200, height: 630 }
  );
}
