import { NextRequest, NextResponse } from "next/server";
import {
  createRoadmapId,
  filterRoadmapItems,
  isRoadmapCategory,
  isRoadmapStatus,
  readRoadmapItems,
  writeRoadmapItems,
  type RoadmapCategory,
  type RoadmapItem,
  type RoadmapStatus,
} from "@/lib/server/roadmapStore";

type CreateRoadmapRequest = {
  title?: unknown;
  description?: unknown;
  category?: unknown;
};

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: NextRequest) {
  try {
    const statusParam = request.nextUrl.searchParams.get("status");
    const search = request.nextUrl.searchParams.get("search") ?? undefined;

    let status: RoadmapStatus | undefined;

    if (statusParam) {
      if (!isRoadmapStatus(statusParam)) {
        return NextResponse.json(
          { error: "Invalid status. Use planned, in-progress, completed, or considering." },
          { status: 400 }
        );
      }

      status = statusParam;
    }

    const items = await readRoadmapItems();
    const filteredItems = filterRoadmapItems(items, {
      status,
      search,
    });

    return NextResponse.json(
      { items: filteredItems, total: filteredItems.length },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Failed to load roadmap items", error);
    return NextResponse.json({ error: "Failed to load roadmap" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateRoadmapRequest;

    const title = asTrimmedString(body.title);
    const description = asTrimmedString(body.description);
    const category = asTrimmedString(body.category).toLowerCase();

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "title, description, and category are required" },
        { status: 400 }
      );
    }

    if (!isRoadmapCategory(category)) {
      return NextResponse.json(
        { error: "Invalid category. Use platform, tools, community, or enterprise." },
        { status: 400 }
      );
    }

    const items = await readRoadmapItems();
    const newItem: RoadmapItem = {
      id: createRoadmapId(title),
      title,
      description,
      category: category as RoadmapCategory,
      status: "considering",
      voteCount: 0,
      voters: [],
      createdAt: new Date().toISOString(),
    };

    items.unshift(newItem);
    await writeRoadmapItems(items);

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Failed to submit feature request", error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
