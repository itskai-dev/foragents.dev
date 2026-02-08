import { ImageResponse } from "next/og";
import { PageOg } from "../_pageOg";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <PageOg
        emoji="🏆"
        eyebrow="forAgents.dev"
        title="Reliability Leaderboard"
        description="Daily canary scorecards ranked by pass rate, latency, and test volume."
      />
    ),
    { width: 1200, height: 630 }
  );
}
