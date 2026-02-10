import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

type BookmarkItemType = "skill" | "mcp" | "collection" | "guide" | "connector";

type BookmarkRecord = {
  id: string;
  userId: string;
  itemType: BookmarkItemType;
  itemSlug: string;
  itemName: string;
  note?: string;
  createdAt: string;
  tags: string[];
};

type CreateBookmarkBody = {
  userId?: unknown;
  itemType?: unknown;
  itemSlug?: unknown;
  itemName?: unknown;
  note?: unknown;
  tags?: unknown;
};

const BOOKMARKS_PATH = path.join(process.cwd(), "data", "bookmarks.json");
const VALID_TYPES: BookmarkItemType[] = ["skill", "mcp", "collection", "guide", "connector"];

async function readBookmarks(): Promise<BookmarkRecord[]> {
  try {
    const raw = await fs.readFile(BOOKMARKS_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as BookmarkRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeBookmarks(bookmarks: BookmarkRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(BOOKMARKS_PATH), { recursive: true });
  await fs.writeFile(BOOKMARKS_PATH, JSON.stringify(bookmarks, null, 2), "utf8");
}

export async function GET(request: NextRequest) {
  try {
    const typeFilter = request.nextUrl.searchParams.get("type")?.trim().toLowerCase();
    const tagFilter = request.nextUrl.searchParams.get("tag")?.trim().toLowerCase();
    const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase();

    if (typeFilter && !VALID_TYPES.includes(typeFilter as BookmarkItemType)) {
      return NextResponse.json({ error: `type must be one of: ${VALID_TYPES.join(", ")}` }, { status: 400 });
    }

    const bookmarks = await readBookmarks();

    const filtered = bookmarks.filter((bookmark) => {
      const matchesType = !typeFilter || bookmark.itemType === typeFilter;
      const matchesTag =
        !tagFilter || bookmark.tags.some((tag) => tag.toLowerCase() === tagFilter.toLowerCase());
      const matchesSearch =
        !search ||
        bookmark.itemName.toLowerCase().includes(search) ||
        bookmark.itemSlug.toLowerCase().includes(search) ||
        bookmark.note?.toLowerCase().includes(search) ||
        bookmark.tags.some((tag) => tag.toLowerCase().includes(search));

      return matchesType && matchesTag && matchesSearch;
    });

    const tags = [...new Set(bookmarks.flatMap((bookmark) => bookmark.tags))].sort((a, b) =>
      a.localeCompare(b)
    );

    return NextResponse.json({ bookmarks: filtered, total: filtered.length, tags });
  } catch (error) {
    console.error("Failed to load bookmarks", error);
    return NextResponse.json({ error: "Failed to load bookmarks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateBookmarkBody;

    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    const itemType = typeof body.itemType === "string" ? body.itemType.trim().toLowerCase() : "";
    const itemSlug = typeof body.itemSlug === "string" ? body.itemSlug.trim() : "";
    const itemName = typeof body.itemName === "string" ? body.itemName.trim() : "";
    const note = typeof body.note === "string" ? body.note.trim() : "";
    const tags = Array.isArray(body.tags)
      ? body.tags
          .filter((tag): tag is string => typeof tag === "string")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    if (!userId || !itemType || !itemSlug || !itemName) {
      return NextResponse.json(
        { error: "userId, itemType, itemSlug, and itemName are required" },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(itemType as BookmarkItemType)) {
      return NextResponse.json(
        { error: `itemType must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const bookmarks = await readBookmarks();

    const exists = bookmarks.some(
      (bookmark) =>
        bookmark.userId === userId &&
        bookmark.itemType === itemType &&
        bookmark.itemSlug.toLowerCase() === itemSlug.toLowerCase()
    );

    if (exists) {
      return NextResponse.json({ error: "Bookmark already exists" }, { status: 409 });
    }

    const created: BookmarkRecord = {
      id: `bmk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId,
      itemType: itemType as BookmarkItemType,
      itemSlug,
      itemName,
      ...(note ? { note } : {}),
      createdAt: new Date().toISOString(),
      tags,
    };

    bookmarks.unshift(created);
    await writeBookmarks(bookmarks);

    return NextResponse.json({ bookmark: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create bookmark", error);
    return NextResponse.json({ error: "Failed to create bookmark" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id")?.trim();

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const bookmarks = await readBookmarks();
    const nextBookmarks = bookmarks.filter((bookmark) => bookmark.id !== id);

    if (nextBookmarks.length === bookmarks.length) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
    }

    await writeBookmarks(nextBookmarks);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Failed to delete bookmark", error);
    return NextResponse.json({ error: "Failed to delete bookmark" }, { status: 500 });
  }
}
