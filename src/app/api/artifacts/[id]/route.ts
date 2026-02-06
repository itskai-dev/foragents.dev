import { NextRequest, NextResponse } from "next/server";
import { getArtifactById } from "@/lib/artifacts";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const artifact = await getArtifactById(id);
  if (!artifact) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      artifact,
      updated_at: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=30, s-maxage=300",
      },
    }
  );
}
