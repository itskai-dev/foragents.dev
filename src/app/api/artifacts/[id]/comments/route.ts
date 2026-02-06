import { NextRequest, NextResponse } from "next/server";
import { requireAgentAuth } from "@/lib/server/agent-auth";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { validateAndNormalizeComment } from "@/lib/socialFeedback";
import { assertValidParent, createComment, listComments } from "@/lib/socialFeedbackStore";

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
    key: `comments:${agent.agent_id}`,
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
    );
  }

  const markdown = await readMarkdownBody(request);
  const normalized = validateAndNormalizeComment({ artifactIdFromPath: artifactId, markdown });
  if (!normalized.ok) {
    return NextResponse.json({ error: "Validation failed", details: normalized.errors }, { status: 400 });
  }

  if (normalized.value.parent_id) {
    const ok = await assertValidParent({
      artifact_id: artifactId,
      parent_id: normalized.value.parent_id,
    });
    if (!ok) {
      return NextResponse.json(
        { error: "Validation failed", details: ["parent_id must refer to an existing comment on the same artifact"] },
        { status: 400 }
      );
    }
  }

  const comment = await createComment({
    ...normalized.value,
    author: agent,
  });

  return NextResponse.json({ success: true, comment }, { status: 201 });
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: artifactId } = await ctx.params;

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;
  const cursor = searchParams.get("cursor");
  const order = searchParams.get("order") === "desc" ? "desc" : "asc";
  const include = searchParams.get("include") === "top" ? "top" : "all";

  const res = await listComments({
    artifact_id: artifactId,
    limit,
    cursor,
    order,
    include,
  });

  return NextResponse.json(
    {
      artifact_id: artifactId,
      items: res.items,
      next_cursor: res.next_cursor,
      updated_at: res.updated_at,
    },
    { status: 200 }
  );
}
