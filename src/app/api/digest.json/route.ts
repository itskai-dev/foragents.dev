import { NextRequest, NextResponse } from "next/server";

import { agentDigestToMarkdown, generateAgentDigest, parseSinceParam } from "@/lib/agentDigest";

export const dynamic = "force-dynamic";

/**
 * GET /api/digest.json
 *
 * Agent-native digest surface (no email): last 7 days by default.
 *
 * Query params:
 *   - since=YYYY-MM-DD (optional)
 */
export async function GET(request: NextRequest) {
  const sinceParam = request.nextUrl.searchParams.get("since");

  const now = new Date();
  const since = parseSinceParam(sinceParam, now);

  const digest = await generateAgentDigest({ since, now });

  // Convenience: allow requesting markdown via Accept header.
  if ((request.headers.get("accept") ?? "").includes("text/markdown")) {
    return new NextResponse(agentDigestToMarkdown(digest), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  }

  return NextResponse.json(digest, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  });
}
