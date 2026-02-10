import { NextRequest, NextResponse } from "next/server";

import {
  createGuideId,
  createGuideSlug,
  filterGuides,
  normalizeGuideCategory,
  normalizeGuideDifficulty,
  readGuides,
  toGuideSummary,
  type Guide,
  type GuideCategory,
  type GuideDifficulty,
  writeGuides,
} from "@/lib/guides";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const difficulty = request.nextUrl.searchParams.get("difficulty");
    const category = request.nextUrl.searchParams.get("category");
    const search = request.nextUrl.searchParams.get("search");

    if (difficulty && !normalizeGuideDifficulty(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty. Use beginner, intermediate, or advanced." },
        { status: 400 }
      );
    }

    if (category && !normalizeGuideCategory(category)) {
      return NextResponse.json(
        { error: "Invalid category. Use getting-started, best-practices, deployment, security, or performance." },
        { status: 400 }
      );
    }

    const guides = await readGuides();
    const filtered = filterGuides(guides, { difficulty, category, search });

    return NextResponse.json(
      {
        guides: filtered.map(toGuideSummary),
        total: filtered.length,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Failed to load guides", error);
    return NextResponse.json({ error: "Failed to load guides" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const author = typeof body.author === "string" ? body.author.trim() : "forAgents Team";

    const categoryRaw = typeof body.category === "string" ? body.category : "";
    const difficultyRaw = typeof body.difficulty === "string" ? body.difficulty : "";

    const category = normalizeGuideCategory(categoryRaw) as GuideCategory | null;
    const difficulty = normalizeGuideDifficulty(difficultyRaw) as GuideDifficulty | null;

    const tags = Array.isArray(body.tags)
      ? body.tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
      : [];

    const readCount = typeof body.readCount === "number" && Number.isFinite(body.readCount) ? body.readCount : 0;
    const estimatedMinutes =
      typeof body.estimatedMinutes === "number" && Number.isFinite(body.estimatedMinutes)
        ? body.estimatedMinutes
        : 10;

    if (!title || !content || !description || !category || !difficulty) {
      return NextResponse.json(
        {
          error:
            "title, description, content, category (getting-started|best-practices|deployment|security|performance), and difficulty (beginner|intermediate|advanced) are required",
        },
        { status: 400 }
      );
    }

    const guides = await readGuides();

    const requestedSlug = typeof body.slug === "string" ? body.slug.trim() : "";
    const baseSlug = requestedSlug || createGuideSlug(title);

    if (!baseSlug) {
      return NextResponse.json({ error: "Unable to generate guide slug from title" }, { status: 400 });
    }

    let slug = baseSlug;
    let counter = 2;
    while (guides.some((guide) => guide.slug === slug)) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    const newGuide: Guide = {
      id: createGuideId(),
      title,
      slug,
      description,
      content,
      category,
      difficulty,
      tags,
      updatedAt: new Date().toISOString(),
      readCount,
      estimatedMinutes,
      author,
    };

    const updatedGuides = [...guides, newGuide];
    await writeGuides(updatedGuides);

    return NextResponse.json({ guide: newGuide }, { status: 201 });
  } catch (error) {
    console.error("Failed to create guide", error);
    return NextResponse.json({ error: "Failed to create guide" }, { status: 500 });
  }
}
