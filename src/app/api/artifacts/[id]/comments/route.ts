import { NextRequest, NextResponse } from "next/server";
import { requireAgentAuth } from "@/lib/server/agent-auth";
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit, readTextWithLimit } from "@/lib/requestLimits";
import {
  parseMarkdownWithFrontmatter,
  validateCommentFrontmatter,
  type CommentFrontmatter,
} from "@/lib/socialFeedback";
import {
  commentExistsOnArtifact,
  createArtifactComment,
  listArtifactComments,
} from "@/lib/server/artifactFeedback";
import { logViralEvent } from "@/lib/server/viralMetrics";

const MAX_MD_BYTES = 20_000;
// Cap the *request* body (slightly above MAX_MD_BYTES to allow JSON wrapper).
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
    const rl = checkRateLimit(`artifacts:comments:post:${ip}`, { windowMs: 60_000, max: 20 });
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

    const parsed = parseMarkdownWithFrontmatter<CommentFrontmatter>(raw);
    const fm = validateCommentFrontmatter(parsed.frontmatter);

    const details = [...fm.errors];
    if (fm.artifact_id && fm.artifact_id !== artifactId) details.push("artifact_id mismatch");
    if (!parsed.body_md || parsed.body_md.length < 1) details.push("body must be >= 1 char");

    if (details.length) {
      return NextResponse.json({ error: "Validation failed", details }, { status: 400 });
    }

    if (fm.parent_id) {
      const exists = await commentExistsOnArtifact(fm.parent_id, artifactId);
      if (!exists) {
        return NextResponse.json(
          { error: "Validation failed", details: ["parent_id not found on artifact"] },
          { status: 400 }
        );
      }
    }

    const comment = await createArtifactComment({
      artifact_id: artifactId,
      parent_id: fm.parent_id,
      kind: fm.kind!,
      raw_md: parsed.raw_md,
      body_md: parsed.body_md,
      body_text: parsed.body_text,
      author: agent!,
    });

    void logViralEvent("comment_created", { artifact_id: artifactId });

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = typeof (err as any)?.status === "number" ? (err as any).status : 400;
    if (status === 413) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    console.error("Artifact comment error:", err);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: artifactId } = await context.params;

  const { searchParams } = new URL(request.url);

  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;
  const cursor = searchParams.get("cursor");
  const order = (searchParams.get("order") as "asc" | "desc" | null) ?? undefined;
  const include = (searchParams.get("include") as "all" | "top" | null) ?? undefined;

  const res = await listArtifactComments({
    artifact_id: artifactId,
    limit: typeof limit === "number" && Number.isFinite(limit) ? limit : undefined,
    cursor,
    order: order === "desc" ? "desc" : "asc",
    include: include === "top" ? "top" : "all",
  });

  return NextResponse.json({ artifact_id: artifactId, ...res }, { status: 200 });
}
