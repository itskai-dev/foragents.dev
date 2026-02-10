import { NextRequest, NextResponse } from "next/server";
import {
  createTrustCenterEntry,
  filterTrustCenterEntries,
  readTrustCenterEntries,
  TRUST_CENTER_CATEGORIES,
} from "@/lib/trustCenterStore";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const entries = await readTrustCenterEntries();
  const filtered = filterTrustCenterEntries(entries, { category, search });

  return NextResponse.json(
    {
      entries: filtered,
      total: filtered.length,
      filters: {
        category: category ?? "all",
        search: search ?? "",
      },
      availableCategories: TRUST_CENTER_CATEGORIES,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await createTrustCenterEntry(body);

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
