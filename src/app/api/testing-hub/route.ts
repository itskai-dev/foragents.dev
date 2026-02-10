import { NextRequest, NextResponse } from "next/server";
import {
  createTestingHubEntry,
  filterTestingHubEntries,
  readTestingHubEntries,
} from "@/lib/testing-hub";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const entries = await readTestingHubEntries();
  const filtered = filterTestingHubEntries(entries, { category, status, search });

  return NextResponse.json({ entries: filtered, total: filtered.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await createTestingHubEntry(body);

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
