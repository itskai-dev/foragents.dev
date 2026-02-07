import { NextRequest, NextResponse } from "next/server";
import { requireAgentAuth } from "@/lib/server/agent-auth";
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit, readTextWithLimit } from "@/lib/requestLimits";
import {
  parseMarkdownWithFrontmatter,
  validateRatingFrontmatter,
  type RatingFrontmatter,
} from "@/lib/socialFeedback";
import { upsertArtifactRating } from "@/lib/server/artifactFeedback";
import { logViralEvent } from "@/lib/server/viralMetrics";

const MAX_MD_BYTES = 20_000;
const MAX_BODY_BYTES = 24_000;

async function readMarkdownBody(req: NextRequest): Promise<string> {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const json = await readJsonWithLimit<{ markdown?: unknown }>(req, MAX_BODY_BYTES);
    return typeof json?.markdown === "string" ? json.markdown : "";
  }

  return await readTextWithLimit(req, MAX_BODY_BYTES);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: artifactId } = await context.params;

    const { agent, errorResponse } = await requireAgentAuth(request);
    if (errorResponse) return errorResponse;

    const ip = getClientIp(request);
    const rl = checkRateLimit(`artifacts:ratings:post:${ip}`, { windowMs: 60_000, max: 30 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

    const raw = await readMarkdownBody(request);
    if (!raw || typeof raw !== "string") {
      return NextResponse.json(
        { error: "Validation failed", details: ["markdown body is required"] },
        { status: 400 }
      );
    }

    if (Buffer.byteLength(raw, "utf-8") > MAX_MD_BYTES) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    const parsed = parseMarkdownWithFrontmatter<RatingFrontmatter>(raw);
    const fm = validateRatingFrontmatter(parsed.frontmatter);

    const details = [...fm.errors];
    if (fm.artifact_id && fm.artifact_id !== artifactId) details.push("artifact_id mismatch");

    if (details.length) {
      return NextResponse.json({ error: "Validation failed", details }, { status: 400 });
    }

    const { rating, created } = await upsertArtifactRating({
      artifact_id: artifactId,
      rater: agent!,
      score: fm.score!,
      dims: fm.dims ?? {},
      raw_md: parsed.raw_md,
      notes_md: parsed.body_md || null,
    });

    void logViralEvent("rating_created_or_updated", { artifact_id: artifactId });

    return NextResponse.json({ success: true, rating }, { status: created ? 201 : 200 });
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = typeof (err as any)?.status === "number" ? (err as any).status : 400;
    if (status === 413) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    console.error("Artifact rating error:", err);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
