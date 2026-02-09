import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from "@/lib/requestLimits";
import { createSkillReview, getSkillReviews, incrementReviewHelpful } from "@/lib/reviews";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function validateNewReview(body: Record<string, unknown>): string[] {
  const errors: string[] = [];

  if (!isNonEmptyString(body.skillSlug)) errors.push("skillSlug is required");
  if (!isNonEmptyString(body.author)) errors.push("author is required");
  if (!isNonEmptyString(body.title)) errors.push("title is required");
  if (!isNonEmptyString(body.body)) errors.push("body is required");

  const rating = body.rating;
  if (typeof rating !== "number" || !Number.isFinite(rating)) {
    errors.push("rating must be a number 1-5");
  } else if (rating < 1 || rating > 5) {
    errors.push("rating must be between 1 and 5");
  }

  if (typeof body.title === "string" && body.title.length > 140) {
    errors.push("title must be under 140 characters");
  }
  if (typeof body.body === "string" && body.body.length > 8000) {
    errors.push("body must be under 8,000 characters");
  }

  return errors;
}

// GET /api/reviews?skill=<slug>&sort=helpful|newest
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const skill = url.searchParams.get("skill");
  const sort = url.searchParams.get("sort") as "helpful" | "newest" | null;

  if (!skill) {
    return NextResponse.json(
      { error: "Missing required query param: skill" },
      { status: 400 }
    );
  }

  const reviews = await getSkillReviews(skill, { sort: sort ?? "helpful" });
  return NextResponse.json({ skill, count: reviews.length, reviews });
}

// POST /api/reviews
// - Create a new review: { skillSlug, author, rating, title, body }
// - Increment helpful: { id, helpfulDelta: 1 }
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`reviews:post:${ip}`, { windowMs: 60_000, max: 60 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

    const body = await readJsonWithLimit(req, 24_000);

    // Helpful increment (optional, used by UI)
    if (isNonEmptyString(body.id) && typeof body.helpfulDelta === "number") {
      const delta = Number.isFinite(body.helpfulDelta) ? body.helpfulDelta : 1;
      const updated = await incrementReviewHelpful(body.id, delta);
      if (!updated) {
        return NextResponse.json({ error: "Review not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, review: updated });
    }

    const errors = validateNewReview(body);
    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const review = await createSkillReview({
      skillSlug: (body.skillSlug as string).trim(),
      author: (body.author as string).trim(),
      rating: body.rating as number,
      title: (body.title as string).trim(),
      body: (body.body as string).trim(),
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
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
