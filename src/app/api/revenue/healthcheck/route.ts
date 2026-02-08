import { NextResponse } from "next/server";
import { listRevenueEvents, summarizeRevenueEvents } from "@/lib/revenue-events";

export const runtime = "nodejs";

/**
 * GET /api/revenue/healthcheck
 *
 * Lightweight revenue ops health check:
 * - last webhook received
 * - avg Stripe event lag (created -> processed)
 * - webhook failures in the last hour
 */
export async function GET() {
  const events = await listRevenueEvents();
  const summary = summarizeRevenueEvents(events);

  return NextResponse.json({
    ok: true,
    ...summary,
  });
}
