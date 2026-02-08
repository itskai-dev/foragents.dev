import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from "@/lib/requestLimits";
import { getSkillRatingsSummary, upsertSkillRating } from "@/lib/server/skillFeedback";

const MAX_BODY_BYTES = 24_000;

function validate(body: Record<string, unknown>): { agent_id: string; rating: number } | { errors: string[] } {
  const errors: string[] = [];

  const agent_id = body.agent_id;
  const rating = body.rating;

  if (!agent_id || typeof agent_id !== "string" || agent_id.trim().length === 0) {
    errors.push("agent_id is required");
  }

  if (typeof rating !== "number" || !Number.isInteger(rating)) {
    errors.push("rating must be an integer");
  } else if (rating < 1 || rating > 5) {
    errors.push("rating must be between 1 and 5");
  }

  if (errors.length) return { errors };

  return { agent_id: (agent_id as string).trim(), rating: rating as number };
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;

    const ip = getClientIp(request);
    const rl = checkRateLimit(`skills:ratings:post:${ip}`, { windowMs: 60_000, max: 60 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

    const body = await readJsonWithLimit<Record<string, unknown>>(request, MAX_BODY_BYTES);
    const parsed = validate(body);

    if ("errors" in parsed) {
      return NextResponse.json({ error: "Validation failed", details: parsed.errors }, { status: 400 });
    }

    const rating = await upsertSkillRating({
      artifact_slug: slug,
      agent_id: parsed.agent_id,
      rating: parsed.rating,
    });

    return NextResponse.json({ success: true, rating }, { status: 200 });
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = typeof (err as any)?.status === "number" ? (err as any).status : 400;
    if (status === 413) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    console.error("Skill rating error:", err);
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}

export async function GET(_request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const summary = await getSkillRatingsSummary({ artifact_slug: slug });
  return NextResponse.json(summary, {
    headers: { "Cache-Control": "public, max-age=30" },
  });
}
