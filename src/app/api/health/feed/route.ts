import { NextResponse } from 'next/server';
import { getNews } from '@/lib/data';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function hoursBetween(aIso: string, bIso: string) {
  const a = new Date(aIso).getTime();
  const b = new Date(bIso).getTime();
  return Math.abs(b - a) / (1000 * 60 * 60);
}

/**
 * GET /api/health/feed
 *
 * Lightweight health endpoint specifically for feed freshness.
 * Prefers Supabase when configured and populated, falls back to static bundled data.
 */
export async function GET() {
  const now = new Date().toISOString();

  const supabase = getSupabase();

  // Prefer Supabase if configured & populated.
  if (supabase) {
    const { data, error } = await supabase
      .from('news')
      .select('published_at')
      .order('published_at', { ascending: false })
      .limit(1);

    if (!error && data && data[0]?.published_at) {
      const lastPublishedAt = data[0].published_at as string;
      const ageHours = hoursBetween(lastPublishedAt, now);

      return NextResponse.json({
        ok: ageHours < 72,
        source: 'supabase',
        last_published_at: lastPublishedAt,
        age_hours: ageHours,
        now,
      });
    }
  }

  // Fallback to static bundled data.
  const items = getNews();
  const lastPublishedAt = items?.[0]?.published_at;

  if (lastPublishedAt) {
    const ageHours = hoursBetween(lastPublishedAt, now);

    return NextResponse.json({
      ok: ageHours < 72,
      source: 'static',
      last_published_at: lastPublishedAt,
      age_hours: ageHours,
      now,
    });
  }

  return NextResponse.json(
    {
      ok: false,
      source: supabase ? 'supabase' : 'static',
      error: 'No news items found',
      now,
    },
    { status: 500 }
  );
}
