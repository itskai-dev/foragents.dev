import { NextRequest, NextResponse } from "next/server";
import {
  createDeveloperPortalEntry,
  filterDeveloperPortalEntries,
  readDeveloperPortalEntries,
} from "@/lib/developerPortalStore";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const entries = await readDeveloperPortalEntries();
  const filtered = filterDeveloperPortalEntries(entries, { category, search });

  return NextResponse.json({ entries: filtered, total: filtered.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await createDeveloperPortalEntry(body);

    if (result.errors.length > 0 || !result.entry) {
      return NextResponse.json(
        { error: "Validation failed", details: result.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ entry: result.entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }
}
