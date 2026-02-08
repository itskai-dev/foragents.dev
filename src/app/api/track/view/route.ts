import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from "@/lib/requestLimits";
import { incrementSkillMetric, readSkillMetricStore } from "@/lib/server/skillMetrics";

// POST: Track a skill page view
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`track:view:${ip}`, { windowMs: 60_000, max: 240 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

    const body = await readJsonWithLimit<Record<string, unknown>>(request, 1_000);
    const skillSlug = typeof body?.skillSlug === "string" ? body.skillSlug : "";

    if (!skillSlug) {
      return NextResponse.json(
        { error: "skillSlug is required and must be a string" },
        { status: 400 }
      );
    }

    const result = await incrementSkillMetric({ slug: skillSlug, metric: "view" });

    return NextResponse.json({
      skillSlug: result.slug,
      count: result.total,
    });
  } catch (error) {
    console.error("Error tracking view:", error);
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 });
  }
}

// GET: Retrieve view counts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skillSlug = searchParams.get("slug");

    const store = await readSkillMetricStore();

    if (skillSlug) {
      return NextResponse.json({
        skillSlug,
        count: store.views_total[skillSlug] ?? 0,
      });
    }

    return NextResponse.json(store.views_total);
  } catch (error) {
    console.error("Error retrieving view counts:", error);
    return NextResponse.json(
      { error: "Failed to retrieve view counts" },
      { status: 500 }
    );
  }
}
