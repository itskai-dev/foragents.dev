import { NextResponse } from "next/server";

import { BOOTSTRAP_SHARE } from "@/lib/bootstrapLinks";

/**
 * GET /api/share.json
 *
 * Copy/paste helper for canonical agent-shareable links.
 */
export async function GET() {
  return NextResponse.json(
    {
      share: BOOTSTRAP_SHARE,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    }
  );
}
