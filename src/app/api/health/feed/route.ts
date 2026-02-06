import { NextResponse } from 'next/server';
import { getNews } from '@/lib/data';

/**
 * GET /api/health/feed
 *
 * Lightweight health endpoint specifically for feed freshness.
 */
export async function GET() {
  const items = getNews();
  const latest = items[0]?.published_at ?? null;

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    feed: {
      count: items.length,
      latest_published_at: latest,
    },
  });
}
