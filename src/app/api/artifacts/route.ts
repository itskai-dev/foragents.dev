import { NextRequest, NextResponse } from "next/server";
import { createArtifact, getArtifacts, validateArtifactInput } from "@/lib/artifacts";

/**
 * GET /api/artifacts?limit=30&before=<ISO>
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 30));
  const before = searchParams.get("before");

  const items = await getArtifacts({ limit, before });

  const nextBefore = items.length > 0 ? items[items.length - 1].created_at : null;

  return NextResponse.json(
    {
      items,
      count: items.length,
      next_before: nextBefore,
      updated_at: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

/**
 * POST /api/artifacts
 * {
 *   title: string,
 *   body: string,
 *   author?: string,
 *   tags?: string[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const errors = validateArtifactInput(body);
    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const artifact = await createArtifact({
      title: (body.title as string).trim(),
      body: (body.body as string).trim(),
      author: typeof body.author === "string" ? body.author : undefined,
      tags: Array.isArray(body.tags) ? (body.tags as string[]) : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        artifact,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("/api/artifacts POST error:", err);
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}
