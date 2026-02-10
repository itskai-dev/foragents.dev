import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from "@/lib/requestLimits";
import { createSkillReview, queryReviews } from "@/lib/reviews";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function parseSort(value: string | null): "recent" | "highest" {
  return value === "highest" ? "highest" : "recent";
}

function validateNewReview(body: Record<string, unknown>): string[] {
  const errors: string[] = [];

  if (!isNonEmptyString(body.skillSlug)) errors.push("skillSlug is required");
  if (!isNonEmptyString(body.title)) errors.push("title is required");
  if (!isNonEmptyString(body.body)) errors.push("body is required");

  const rating = body.rating;
  if (typeof rating !== "number" || !Number.isFinite(rating)) {
    errors.push("rating must be a number 1-5");
  } else if (rating < 1 || rating > 5) {
    errors.push("rating must be between 1 and 5");
  }

  return errors;
}

// GET /api/reviews?skill=<slug>&sort=recent|highest
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const skill = url.searchParams.get("skill")?.trim() || undefined;
  const sort = parseSort(url.searchParams.get("sort"));

  const reviews = await queryReviews({ skillSlug: skill, sort });
  const total = reviews.length;
  const averageRating =
    total > 0
      ? Number((reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / total).toFixed(2))
      : 0;

  return NextResponse.json({ reviews, total, averageRating });
}

// POST /api/reviews
// body: { skillSlug, rating, title, body, author }
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`reviews:post:${ip}`, { windowMs: 60_000, max: 60 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

    const body = await readJsonWithLimit(req, 24_000);

    const errors = validateNewReview(body);
    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const review = await createSkillReview({
      skillSlug: (body.skillSlug as string).trim(),
      author: typeof body.author === "string" ? body.author.trim() : "anonymous",
      rating: Number(body.rating),
      title: (body.title as string).trim(),
      body: (body.body as string).trim(),
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = typeof (err as any)?.status === "number" ? (err as any).status : 400;
    if (status === 413) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    console.error("Review error:", err);
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}
