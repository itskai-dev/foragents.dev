import { NextRequest, NextResponse } from "next/server";
import { getNews } from "@/lib/data";
import { decodeCursor, encodeCursor, isNewerThanCursor } from "@/lib/agentCursor";

/**
 * GET /api/feed/delta?cursor=<base64url>&tag=<tag>&limit=50
 *
 * Stateless delta polling over the news feed.
 * - cursor encodes the newest timestamp the client has seen (plus ids at that timestamp).
 * - response includes next_cursor for the client to persist.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tag = searchParams.get("tag") ?? undefined;
  const limitParam = searchParams.get("limit");
  const limit = Math.min(200, Math.max(1, Number(limitParam) || 50));

  const cursor = decodeCursor(searchParams.get("cursor"));
  const feed = getNews(tag);

  // New items are at the top (descending published_at).
  const items = cursor
    ? feed.filter((item) =>
        isNewerThanCursor({
          itemPublishedAt: item.published_at,
          itemId: item.id,
          cursor,
        })
      )
    : feed;

  const sliced = items.slice(0, limit);

  // Compute next cursor as "newest item the client has now seen".
  const newestSeen = (cursor ? feed : sliced)[0];

  // If we had no cursor, and no items at all, omit next_cursor.
  const nextCursor = newestSeen
    ? encodeCursor({
        t: newestSeen.published_at,
        ids: feed
          .filter((i) => i.published_at === newestSeen.published_at)
          .slice(0, 50)
          .map((i) => i.id),
      })
    : null;

  return NextResponse.json(
    {
      items: sliced,
      count: sliced.length,
      next_cursor: nextCursor,
      updated_at: new Date().toISOString(),
    },
    {
      headers: {
        // Delta polling shouldn't be cached by intermediaries.
        "Cache-Control": "no-store",
      },
    }
  );
}
