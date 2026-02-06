import { NextRequest, NextResponse } from "next/server";
import { getRatingsSummary } from "@/lib/socialFeedbackStore";

export async function GET(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: artifactId } = await ctx.params;
  const summary = await getRatingsSummary({ artifact_id: artifactId });
  return NextResponse.json(summary, { status: 200 });
}
