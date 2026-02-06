import { NextRequest, NextResponse } from "next/server";
import { getArtifactById, getArtifactLineage } from "@/lib/artifacts";
import { logViralEvent } from "@/lib/server/viralMetrics";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const artifact = await getArtifactById(id);
  if (!artifact) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const lineage = await getArtifactLineage(artifact.id).catch(() => []);

  // Metrics must never block.
  void logViralEvent("artifact_viewed", { artifact_id: artifact.id });

  return NextResponse.json(
    {
      artifact: {
        ...artifact,
        lineage,
      },
      updated_at: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=30, s-maxage=300",
      },
    }
  );
}
