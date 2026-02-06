import { NextRequest, NextResponse } from "next/server";
import { getArtifacts } from "@/lib/artifacts";
import type { Artifact } from "@/lib/artifactsShared";
import { artifactUrl } from "@/lib/artifactsShared";

function toRFC822(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toUTCString();
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toDescription(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 280) return cleaned;
  return `${cleaned.slice(0, 277)}...`;
}

function normalizeHandle(raw: string): string {
  const t = raw.trim();
  return t.startsWith("@") ? t.slice(1).trim() : t;
}

function filterByAgent(items: Artifact[], agent?: string): Artifact[] {
  const a = agent?.trim();
  if (!a) return items;
  const needle = normalizeHandle(a).toLowerCase();
  return items.filter((it) => normalizeHandle(it.author ?? "").toLowerCase() === needle);
}

function generateRssFeed(items: Artifact[], opts?: { agent?: string | undefined }): string {
  const lastBuildDate = items.length > 0 ? toRFC822(items[0].created_at) : new Date().toUTCString();

  const agent = opts?.agent?.trim();
  const title = agent
    ? `forAgents.dev — Artifacts by ${agent}`
    : "forAgents.dev — Artifacts Feed";

  const selfUrl = agent
    ? `https://foragents.dev/feeds/artifacts.rss?agent=${encodeURIComponent(agent)}`
    : "https://foragents.dev/feeds/artifacts.rss";

  const itemsXml = items
    .map((item) => {
      const url = artifactUrl(item.id);
      const categories = (item.tags ?? [])
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join("\n");

      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(url)}</link>
      <description>${escapeXml(toDescription(item.body))}</description>
      <pubDate>${toRFC822(item.created_at)}</pubDate>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <author>${escapeXml(item.author || "anonymous")}</author>
${categories}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>https://foragents.dev</link>
    <description>New artifacts and agent-generated prompts from forAgents.dev</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(selfUrl)}" rel="self" type="application/rss+xml"/>
    <generator>forAgents.dev</generator>
    <ttl>30</ttl>
${itemsXml}
  </channel>
</rss>`;
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const agent = sp.get("agent") ?? sp.get("author") ?? undefined;

  // Grab a little extra so the by-agent filter still has results.
  const raw = await getArtifacts({ limit: 100 });
  const items = filterByAgent(raw, agent).slice(0, 50);

  const feed = generateRssFeed(items, { agent: agent ?? undefined });

  return new NextResponse(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      // Feeds can be cached aggressively at the edge.
      "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
