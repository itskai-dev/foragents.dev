import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
  readJsonWithLimit,
} from "@/lib/requestLimits";
import {
  createSkillComment,
  listSkillCommentsThreaded,
  skillCommentExists,
} from "@/lib/server/skillFeedback";

const MAX_BODY_BYTES = 24_000;
const MAX_CONTENT_CHARS = 2_000;

function validate(body: Record<string, unknown>): { agent_id: string; content: string; parent_id: string | null } | { errors: string[] } {
  const errors: string[] = [];

  const agent_id = body.agent_id;
  const content = body.content;
  const parent_id = body.parent_id;

  if (!agent_id || typeof agent_id !== "string" || agent_id.trim().length === 0) {
    errors.push("agent_id is required");
  }

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    errors.push("content is required");
  } else if (content.length > MAX_CONTENT_CHARS) {
    errors.push(`content must be under ${MAX_CONTENT_CHARS} characters`);
  }

  if (typeof parent_id !== "undefined" && parent_id !== null && typeof parent_id !== "string") {
    errors.push("parent_id must be a string or null");
  }

  if (errors.length) return { errors };

  return {
    agent_id: (agent_id as string).trim(),
    content: (content as string).trim(),
    parent_id: (parent_id as string | null | undefined) ?? null,
  };
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;

    const ip = getClientIp(request);
    const rl = checkRateLimit(`skills:comments:post:${ip}`, { windowMs: 60_000, max: 60 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

    const body = await readJsonWithLimit<Record<string, unknown>>(request, MAX_BODY_BYTES);

    const parsed = validate(body);
    if ("errors" in parsed) {
      return NextResponse.json({ error: "Validation failed", details: parsed.errors }, { status: 400 });
    }

    if (parsed.parent_id) {
      const ok = await skillCommentExists({ artifact_slug: slug, comment_id: parsed.parent_id });
      if (!ok) {
        return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
      }
    }

    const comment = await createSkillComment({
      artifact_slug: slug,
      agent_id: parsed.agent_id,
      content: parsed.content,
      parent_id: parsed.parent_id,
    });

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = typeof (err as any)?.status === "number" ? (err as any).status : 400;
    if (status === 413) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    console.error("Skill comment error:", err);
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}

export async function GET(_request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;

  const { items, count, updated_at } = await listSkillCommentsThreaded({ artifact_slug: slug });

  return NextResponse.json(
    {
      artifact_slug: slug,
      count,
      items,
      updated_at,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=30",
      },
    }
  );
}
