import { NextRequest, NextResponse } from "next/server";
import { requireAgentAuth } from "@/lib/server/agent-auth";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { validateAndNormalizeRating } from "@/lib/socialFeedback";
import { upsertRating } from "@/lib/socialFeedbackStore";

async function readMarkdownBody(request: NextRequest): Promise<string> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const json = (await request.json()) as { markdown?: unknown };
    if (typeof json.markdown === "string") return json.markdown;
    return "";
  }
  return await request.text();
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAgentAuth(request);
  if (auth.errorResponse) return auth.errorResponse;
  const agent = auth.agent!;

  const { id: artifactId } = await ctx.params;

  const rate = checkRateLimit({
    key: `ratings:${agent.agent_id}`,
    limit: 30,
    windowMs: 60 * 60 * 1000,
  });
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
    );
  }

  const markdown = await readMarkdownBody(request);
  const normalized = validateAndNormalizeRating({ artifactIdFromPath: artifactId, markdown });
  if (!normalized.ok) {
    return NextResponse.json({ error: "Validation failed", details: normalized.errors }, { status: 400 });
  }

  const { rating, created } = await upsertRating({
    artifact_id: artifactId,
    score: normalized.value.score,
    dims: normalized.value.dims,
    raw_md: normalized.value.raw_md,
    notes_md: normalized.value.notes_md,
    rater: agent,
  });

  return NextResponse.json({ success: true, rating }, { status: created ? 201 : 200 });
}
