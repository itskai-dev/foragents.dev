import { NextRequest, NextResponse } from "next/server";
import { getNews, NewsItem } from "@/lib/data";
import { getSupabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

async function getFreshNews(tag?: string): Promise<NewsItem[]> {
  const supabase = getSupabase();
  
  if (supabase) {
    let query = supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(100);
    
    if (tag) {
      query = query.contains('tags', [tag]);
    }
    
    const { data, error } = await query;
    
    if (!error && data && data.length > 0) {
      return data as NewsItem[];
    }
  }
  
  return getNews(tag);
}

export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get("tag") ?? undefined;
  const items = await getFreshNews(tag);

  return NextResponse.json(
    { items, count: items.length, updated_at: new Date().toISOString() },
    {
      headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" },
    }
  );
}
