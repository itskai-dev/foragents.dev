import { NextRequest, NextResponse } from "next/server";
import { createArtifact, getArtifactById, validateArtifactInput } from "@/lib/artifacts";
import { logViralEvent } from "@/lib/server/viralMetrics";

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
  const { id } = await context.params;

  const parent = await getArtifactById(id);
  if (!parent) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let json: Record<string, unknown> = {};
  try {
    json = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  } catch {
    json = {};
  }

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
}
