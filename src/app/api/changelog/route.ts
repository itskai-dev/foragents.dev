import { NextRequest, NextResponse } from "next/server";

import changelog from "../../../../data/changelog.json";
import { type ChangelogEntry } from "@/lib/changelog";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function toInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return parsed;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawLimit = toInt(searchParams.get("limit"), DEFAULT_LIMIT);
  const rawOffset = toInt(searchParams.get("offset"), 0);

  const limit = Math.min(Math.max(rawLimit, 1), MAX_LIMIT);
  const offset = Math.max(rawOffset, 0);

  const allEntries = (Array.isArray(changelog) ? (changelog as ChangelogEntry[]) : [])
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const entries = allEntries.slice(offset, offset + limit);

  return NextResponse.json(
    {
      entries,
      total: allEntries.length,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    }
  );
}
