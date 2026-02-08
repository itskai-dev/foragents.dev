import { NextResponse } from "next/server";
import { computeAgentHealthMetrics, readHealthEvents } from "@/lib/agentHealth";

export const runtime = "nodejs";

export async function GET() {
  const events = await readHealthEvents();
  const metrics = computeAgentHealthMetrics(events);

  return NextResponse.json(metrics, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
