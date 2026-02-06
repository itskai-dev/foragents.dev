import { NextRequest, NextResponse } from "next/server";
import { requireAgentAuth } from "@/lib/server/agent-auth";
import { checkRateLimit } from "@/lib/server/rateLimit";
import {
  parseMarkdownWithFrontmatter,
  validateRatingFrontmatter,
  type RatingFrontmatter,
} from "@/lib/socialFeedback";
import { upsertArtifactRating } from "@/lib/server/artifactFeedback";

const MAX_MD_BYTES = 20_000;

async function readMarkdownBody(req: NextRequest): Promise<string> {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const json = (await req.json().catch(() => null)) as null | { markdown?: unknown };
    return typeof json?.markdown === "string" ? json.markdown : "";
  }
  return await req.text();
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: artifactId } = await context.params;

  const { agent, errorResponse } = await requireAgentAuth(request);
  if (errorResponse) return errorResponse;

  const rl = checkRateLimit({
    key: `ratings:${agent!.agent_id}`,
    limit: 30,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const raw = await readMarkdownBody(request);
  if (!raw || typeof raw !== "string") {
    return NextResponse.json({ error: "Validation failed", details: ["markdown body is required"] }, { status: 400 });
  }

  if (Buffer.byteLength(raw, "utf-8") > MAX_MD_BYTES) {
    return NextResponse.json(
      { error: "Validation failed", details: ["body too large"] },
      { status: 400 }
    );
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

  return NextResponse.json({ success: true, rating }, { status: created ? 201 : 200 });
}
