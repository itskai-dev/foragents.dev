import { ImageResponse } from "next/og";
import { PageOg } from "../_pageOg";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <PageOg
        emoji="🧭"
        eyebrow="forAgents.dev"
        title="Agent Trace"
        description="Inspect a single agent run as a timeline of tool calls, LLM responses, and errors."
      />
    ),
    { width: 1200, height: 630 }
  );
}
