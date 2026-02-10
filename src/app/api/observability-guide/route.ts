import { NextRequest, NextResponse } from "next/server";
import {
  filterObservabilityGuides,
  normalizeObservabilityGuideCategory,
  normalizeObservabilityGuideDifficulty,
  readObservabilityGuides,
  type ObservabilityGuide,
  type ObservabilityGuideCategory,
  type ObservabilityGuideDifficulty,
  writeObservabilityGuides,
} from "@/lib/observability-guides";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function createGuideId(): string {
  const suffix = Math.random().toString(36).slice(2, 10);
  return `observability-${Date.now()}-${suffix}`;
}

export async function GET(request: NextRequest) {
  try {
    const categoryParam = request.nextUrl.searchParams.get("category");
    const search = request.nextUrl.searchParams.get("search");

    if (categoryParam && !normalizeObservabilityGuideCategory(categoryParam)) {
      return NextResponse.json(
        { error: "Invalid category. Use logging, metrics, tracing, or alerting." },
        { status: 400 }
      );
    }

    const guides = await readObservabilityGuides();
    const filteredGuides = filterObservabilityGuides(guides, {
      category: categoryParam,
      search,
    });

    return NextResponse.json(
      {
        guides: filteredGuides,
        total: filteredGuides.length,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Failed to load observability guides", error);
    return NextResponse.json({ error: "Failed to load observability guides" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const categoryRaw = typeof body.category === "string" ? body.category : "";
    const difficultyRaw = typeof body.difficulty === "string" ? body.difficulty : "";
    const tags = Array.isArray(body.tags)
      ? body.tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
      : [];

    const category = normalizeObservabilityGuideCategory(categoryRaw) as ObservabilityGuideCategory | null;
    const difficulty = normalizeObservabilityGuideDifficulty(difficultyRaw) as ObservabilityGuideDifficulty | null;

    if (!title || !content || !category || !difficulty) {
      return NextResponse.json(
        {
          error:
            "title, content, category (logging|metrics|tracing|alerting), and difficulty (beginner|intermediate|advanced) are required",
        },
        { status: 400 }
      );
    }

    const guides = await readObservabilityGuides();

    const newGuide: ObservabilityGuide = {
      id: createGuideId(),
      title,
      content,
      category,
      difficulty,
      tags,
      updatedAt: new Date().toISOString(),
    };

    const updatedGuides = [...guides, newGuide];
    await writeObservabilityGuides(updatedGuides);

    return NextResponse.json({ guide: newGuide }, { status: 201 });
  } catch (error) {
    console.error("Failed to create observability guide", error);
    return NextResponse.json({ error: "Failed to create observability guide" }, { status: 500 });
  }
}
