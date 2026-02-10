import { NextResponse } from "next/server";
import { generateWeeklyDigest } from "@/lib/weeklyDigest";

/**
 * GET /api/digest
 *
 * Weekly digest computed from real activity:
 * - new skills (from skill creation dates)
 * - new reviews (data/skill-reviews.json)
 * - top trending skills (same ranking source as /api/trending)
 * - bounties (new + claimed)
 */
export async function GET() {
  const digest = await generateWeeklyDigest();

  return NextResponse.json(digest, {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
