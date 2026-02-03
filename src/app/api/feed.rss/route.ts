import { NextResponse } from "next/server";
import { getNews, NewsItem } from "@/lib/data";

/**
 * Convert a date string to RFC 822 format for RSS pubDate
 */
function toRFC822(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toUTCString();
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Generate RSS 2.0 XML feed from news items
 */
function generateRssFeed(items: NewsItem[]): string {
  const lastBuildDate = items.length > 0 
    ? toRFC822(items[0].published_at) 
    : new Date().toUTCString();

  const itemsXml = items
    .map((item) => {
      const categories = item.tags
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join("\n");

      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.source_url)}</link>
      <description>${escapeXml(item.summary)}</description>
      <pubDate>${toRFC822(item.published_at)}</pubDate>
      <guid isPermaLink="false">${escapeXml(item.id)}</guid>
      <source url="${escapeXml(item.source_url)}">${escapeXml(item.source_name)}</source>
${categories}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>forAgents.dev — Agent News Feed</title>
    <link>https://foragents.dev</link>
    <description>News, tools, and updates for AI agents</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="https://foragents.dev/feed.rss" rel="self" type="application/rss+xml"/>
    <generator>forAgents.dev</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <ttl>30</ttl>
${itemsXml}
  </channel>
</rss>`;
}

export async function GET() {
  // Get latest 50 news items
  const items = getNews().slice(0, 50);
  const feed = generateRssFeed(items);

  return new NextResponse(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
