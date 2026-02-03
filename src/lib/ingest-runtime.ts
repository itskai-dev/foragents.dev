/**
 * Runtime RSS + Colony Ingestion for forAgents.dev
 *
 * This module contains the ingestion logic extracted from the CLI script,
 * adapted to run inside a Next.js API route (no filesystem access needed).
 * Returns NewsItem[] that can be written to Supabase.
 */

import Parser from "rss-parser";
import { fetchColonyPosts } from "./colony";

// Must match the existing NewsItem type
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  tags: string[];
  published_at: string;
}

interface Source {
  name: string;
  url: string;
  feedUrl: string | null;
  type: string;
  category: string;
  updateFrequency: string;
  verified: boolean;
  notes: string;
}

interface SourcesFile {
  sources: Source[];
}

// Category → tags mapping
const CATEGORY_TAGS: Record<string, string[]> = {
  "ai-company-blog": ["models", "tools"],
  "ai-news": ["community", "agents"],
  "ai-community": ["community"],
  "ai-product": ["tools"],
};

// Source-specific tag overrides
const SOURCE_TAG_OVERRIDES: Record<string, string[]> = {
  "OpenAI Blog": ["models", "tools", "openai"],
  "Google DeepMind Blog": ["models", "research"],
  "Google AI Blog": ["models", "tools"],
  "Anthropic Blog": ["models", "tools", "agents"],
  "Meta Engineering (ML Applications)": ["models", "tools"],
  "Hacker News — AI/Agent Front Page": ["community", "agents"],
  "Hacker News — AI Agent (Newest)": ["community", "agents"],
  "r/MachineLearning": ["community", "models"],
  "r/artificial": ["community", "agents"],
  "r/LocalLLaMA": ["community", "models"],
  "r/AIAgents": ["community", "agents"],
  "r/Autonomous_Agents": ["community", "agents"],
  "OpenClaw GitHub Releases": ["tools", "openclaw"],
  "Claude Code GitHub Releases": ["tools", "agents"],
  "Product Hunt — AI Category": ["tools", "community"],
  "Product Hunt — All": ["tools"],
};

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent":
      "forAgents.dev/1.0 (RSS ingestion; https://foragents.dev)",
    Accept:
      "application/rss+xml, application/atom+xml, application/xml, text/xml",
  },
});

function generateId(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `feed-${Math.abs(hash).toString(36)}`;
}

function truncate(text: string, maxLen: number): string {
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + "...";
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchFeed(source: Source): Promise<NewsItem[]> {
  if (!source.feedUrl || !source.verified) return [];

  try {
    const feed = await parser.parseURL(source.feedUrl);
    const items: NewsItem[] = [];
    const tags =
      SOURCE_TAG_OVERRIDES[source.name] ||
      CATEGORY_TAGS[source.category] ||
      ["community"];

    for (const entry of (feed.items || []).slice(0, 10)) {
      const url = entry.link || entry.guid || "";
      if (!url) continue;

      const title = stripHtml(entry.title || "Untitled");
      const summary = truncate(
        stripHtml(
          entry.contentSnippet ||
            entry.content ||
            entry.summary ||
            entry["dc:description"] ||
            ""
        ),
        300
      );
      const pubDate =
        entry.pubDate || entry.isoDate || new Date().toISOString();

      items.push({
        id: generateId(url),
        title,
        summary: summary || `From ${source.name}`,
        source_url: url,
        source_name: source.name,
        tags,
        published_at: new Date(pubDate).toISOString(),
      });
    }

    return items;
  } catch {
    return [];
  }
}

/**
 * Load sources from the bundled JSON file.
 * We import it statically so it works on Vercel (read-only fs).
 */
import sourcesJson from "../../data/sources.json";

/**
 * Run full ingestion: fetch all RSS feeds + Colony posts.
 * Returns deduplicated, sorted NewsItem[].
 */
export async function runIngestion(): Promise<{
  items: NewsItem[];
  stats: { total: number; rss: number; colony: number; sources: number };
}> {
  const sourcesFile = sourcesJson as SourcesFile;
  const verifiedSources = sourcesFile.sources.filter(
    (s) => s.verified && s.feedUrl
  );

  // Fetch RSS feeds in batches
  const BATCH_SIZE = 5;
  const allRssItems: NewsItem[] = [];

  for (let i = 0; i < verifiedSources.length; i += BATCH_SIZE) {
    const batch = verifiedSources.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(fetchFeed));
    for (const items of results) {
      allRssItems.push(...items);
    }
  }

  // Fetch Colony posts
  const colonyItems = await fetchColonyPosts();

  // Deduplicate by URL
  const seenUrls = new Set<string>();
  const merged: NewsItem[] = [];

  for (const item of [...allRssItems, ...colonyItems]) {
    if (!seenUrls.has(item.source_url)) {
      seenUrls.add(item.source_url);
      merged.push(item);
    }
  }

  // Sort newest first
  merged.sort(
    (a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );

  return {
    items: merged,
    stats: {
      total: merged.length,
      rss: allRssItems.length,
      colony: colonyItems.length,
      sources: verifiedSources.length,
    },
  };
}
