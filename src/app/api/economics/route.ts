import { NextRequest, NextResponse } from "next/server";
import {
  createEconomicsEntryId,
  filterEconomicsEntries,
  normalizeEconomicsCategory,
  readEconomicsEntries,
  type EconomicsCategory,
  type EconomicsEntry,
  writeEconomicsEntries,
} from "@/lib/economics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get("category");
    const search = request.nextUrl.searchParams.get("search");

    const entries = await readEconomicsEntries();
    const filtered = filterEconomicsEntries(entries, { category, search });

    const categories = Array.from(new Set(entries.map((entry) => entry.category)));

    return NextResponse.json(
      {
        entries: filtered,
        total: filtered.length,
        categories,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Failed to load economics entries", error);
    return NextResponse.json({ error: "Failed to load economics entries" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const categoryInput = typeof body.category === "string" ? body.category : "";
    const category = normalizeEconomicsCategory(categoryInput);

    const tags = Array.isArray(body.tags)
      ? body.tags
          .filter((tag): tag is string => typeof tag === "string")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : typeof body.tags === "string"
        ? body.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

    if (!title || !content || !category || tags.length === 0) {
      return NextResponse.json(
        {
          error: "title, content, category (pricing|costs|revenue|roi), and at least one tag are required",
        },
        { status: 400 }
      );
    }

    const entries = await readEconomicsEntries();

    const entry: EconomicsEntry = {
      id: createEconomicsEntryId(title),
      title,
      content,
      category: category as EconomicsCategory,
      tags,
      updatedAt: new Date().toISOString(),
    };

    const updated = [entry, ...entries];
    await writeEconomicsEntries(updated);

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("Failed to create economics entry", error);
    return NextResponse.json({ error: "Failed to create economics entry" }, { status: 500 });
  }
}
