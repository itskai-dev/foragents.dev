import { NextRequest, NextResponse } from "next/server";
import { createArtifact, getArtifactById, validateArtifactInput } from "@/lib/artifacts";
import { logViralEvent } from "@/lib/server/viralMetrics";
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from "@/lib/requestLimits";

const MAX_JSON_BYTES = 50_000;

/**
 * POST /api/artifacts/:id/remix
 *
 * Creates a new artifact that references the source artifact via parent_artifact_id.
 *
 * Body (JSON): { title?, body?, author?, tags? }
 * If title/body are omitted, we default to a minimal remix of the parent.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`artifacts:remix:${ip}`, { windowMs: 60_000, max: 20 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

    const { id } = await context.params;

    const parent = await getArtifactById(id);
    if (!parent) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const json = (await readJsonWithLimit<Record<string, unknown>>(request, MAX_JSON_BYTES).catch(() => ({}))) as Record<
      string,
      unknown
    >;

    const bodyObj: Record<string, unknown> = {
      title: typeof json.title === "string" && json.title.trim() ? json.title : `Remix of: ${parent.title}`,
      body: typeof json.body === "string" && json.body.trim() ? json.body : parent.body,
      author: typeof json.author === "string" ? json.author : undefined,
      tags: Array.isArray(json.tags) ? json.tags : parent.tags,
      parent_artifact_id: parent.id,
    };

    const errors = validateArtifactInput(bodyObj);
    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const remix = await createArtifact({
      title: (bodyObj.title as string).trim(),
      body: (bodyObj.body as string).trim(),
      author: typeof bodyObj.author === "string" ? (bodyObj.author as string) : undefined,
      tags: Array.isArray(bodyObj.tags) ? (bodyObj.tags as string[]) : undefined,
      parent_artifact_id: parent.id,
    });

    // Metrics must never block.
    void logViralEvent("artifact_remixed", {
      artifact_id: remix.id,
      meta: { parent_artifact_id: parent.id },
    });

    return NextResponse.json({ success: true, artifact: remix }, { status: 201 });
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = typeof (err as any)?.status === "number" ? (err as any).status : 400;
    if (status === 413) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    console.error("/api/artifacts/[id]/remix POST error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
