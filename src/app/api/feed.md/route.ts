import { NextRequest, NextResponse } from "next/server";
import { getNews, newsToMarkdown, NewsItem } from "@/lib/data";
import { getSupabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

async function getFreshNews(tag?: string): Promise<NewsItem[]> {
  const supabase = getSupabase();
  
  if (supabase) {
    // Try to get fresh news from Supabase
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
  
  // Fallback to static JSON
  return getNews(tag);
}

export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get("tag") ?? undefined;
  const items = await getFreshNews(tag);

  return new NextResponse(newsToMarkdown(items), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  });
}
