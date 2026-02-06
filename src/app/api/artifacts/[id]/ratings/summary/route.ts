import { NextRequest, NextResponse } from "next/server";
import { getArtifactRatingsSummary } from "@/lib/server/artifactFeedback";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: artifactId } = await context.params;

  const summary = await getArtifactRatingsSummary(artifactId);

  return NextResponse.json(summary, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=10, s-maxage=60",
    },
  });
}
