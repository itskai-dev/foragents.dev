#!/usr/bin/env node
/*
  Refresh the forAgents.dev news feed.

  - Fetches recent AI agent ecosystem news via Google News RSS search feeds
  - Deduplicates by source_url
  - Prepends new items to src/data/news.json

  Usage:
    npm run refresh-news
    npm run refresh-news -- --dry-run
*/

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

import Parser from 'rss-parser';

type NewsEntry = {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  tags: string[];
  published_at: string;
};

type GoogleRssSource = { title?: string; url?: string } | string;

type FeedItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  content?: string;
  contentSnippet?: string;
  source?: GoogleRssSource;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const newsPath = path.join(repoRoot, 'src', 'data', 'news.json');

const SEARCH_QUERIES = [
  'AI agents news',
  'MCP protocol updates',
  'agent frameworks',
  'AI agent tools',
];

const DEFAULT_WINDOW_HOURS = 48;
const MAX_ITEMS_PER_QUERY = 12;
const MAX_NEW_ENTRIES = 30;

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  try {
    const u = new URL(trimmed);

    // Normalize Google News wrapper links so dedup works across differing params.
    if (u.hostname === 'news.google.com') {
      u.search = '';
      u.hash = '';
      return u.toString();
    }

    // Strip common tracking params.
    const drop = new Set([
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'gclid',
      'mc_cid',
      'mc_eid',
      'ref',
    ]);
    for (const key of Array.from(u.searchParams.keys())) {
      if (drop.has(key)) u.searchParams.delete(key);
    }
    u.hash = '';
    return u.toString();
  } catch {
    return trimmed;
  }
}

function stripHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function parseSourceName(item: FeedItem): string {
  const src = item.source;
  if (typeof src === 'string' && src.trim()) return src.trim();
  if (src && typeof src === 'object') {
    if (src.title && src.title.trim()) return src.title.trim();
  }

  // Google News titles are commonly "Headline - Publisher"
  const title = item.title ?? '';
  const lastDash = title.lastIndexOf(' - ');
  if (lastDash !== -1 && lastDash + 3 < title.length) {
    return title.slice(lastDash + 3).trim();
  }

  return 'Google News';
}

function cleanTitle(itemTitle: string, sourceName: string): string {
  // Remove trailing " - Source" if present.
  const suffix = ` - ${sourceName}`;
  if (itemTitle.endsWith(suffix)) return itemTitle.slice(0, -suffix.length).trim();
  return itemTitle.trim();
}

function inferTags(query: string, title: string): string[] {
  const q = query.toLowerCase();
  const t = title.toLowerCase();

  const tags: string[] = [];

  // Query-based priors
  if (q.includes('agent')) tags.push('agents');
  if (q.includes('mcp') || q.includes('protocol')) tags.push('tools');
  if (q.includes('framework')) tags.push('tools');
  if (q.includes('tools')) tags.push('tools');

  // Keyword-based hints
  if (/(openai|anthropic|xai|grok|claude|gpt|llama|gemini|mistral|deepseek)/.test(t)) tags.push('models');
  if (/(mcp|model context protocol)/.test(t)) tags.push('tools');
  if (/(sdk|framework|library|tool|server|plugin|integration)/.test(t)) tags.push('tools');
  if (/(security|vulnerab|rce|prompt injection|zero-trust|governance)/.test(t)) tags.push('security');
  if (/(release|launch|announc|introduc|unveil|ga|generally available)/.test(t)) tags.push('tools');

  return uniq(tags.map((x) => x.toLowerCase()));
}

function toIsoDate(item: FeedItem): string | null {
  const d = item.isoDate ?? item.pubDate;
  if (!d) return null;
  const parsed = new Date(d);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function isWithinHours(iso: string, windowHours: number): boolean {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts <= windowHours * 60 * 60 * 1000;
}

function randomId(existingIds: Set<string>): string {
  for (let i = 0; i < 20; i++) {
    const rand = crypto.randomBytes(4).toString('base64url').slice(0, 6).toLowerCase();
    const id = `feed-${rand}`;
    if (!existingIds.has(id)) return id;
  }
  // fallback
  const id = `feed-${crypto.randomUUID().slice(0, 6)}`;
  return id;
}

function buildGoogleNewsRssUrl(query: string, windowHours: number): string {
  // Google News supports search operators like when:1d, when:2d.
  // We'll map our window into a whole-day operator for simplicity.
  const days = Math.max(1, Math.min(7, Math.ceil(windowHours / 24)));
  const q = `${query} when:${days}d`;
  const params = new URLSearchParams({
    q,
    hl: 'en-US',
    gl: 'US',
    ceid: 'US:en',
  });
  return `https://news.google.com/rss/search?${params.toString()}`;
}

async function readExistingNews(): Promise<NewsEntry[]> {
  const raw = await fs.readFile(newsPath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error(`Expected an array in ${newsPath}`);
  return parsed as NewsEntry[];
}

async function writeNews(entries: NewsEntry[]): Promise<void> {
  const formatted = JSON.stringify(entries, null, 2) + '\n';
  await fs.writeFile(newsPath, formatted, 'utf8');
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const windowArg = args.find((a) => a.startsWith('--hours='));
  const windowHours = windowArg ? Number(windowArg.split('=')[1]) : DEFAULT_WINDOW_HOURS;
  const effectiveWindow = Number.isFinite(windowHours) && windowHours > 0 ? windowHours : DEFAULT_WINDOW_HOURS;

  const existing = await readExistingNews();
  const existingByUrl = new Set(existing.map((e) => normalizeUrl(e.source_url)));
  const existingIds = new Set(existing.map((e) => e.id));

  const parser = new Parser<unknown, FeedItem>({
    customFields: {
      item: ['source'],
    },
  });

  const candidates: NewsEntry[] = [];

  for (const query of SEARCH_QUERIES) {
    const rssUrl = buildGoogleNewsRssUrl(query, effectiveWindow);

    let feed;
    try {
      feed = await parser.parseURL(rssUrl);
    } catch (err) {
      console.error(`[refresh-news] Failed to fetch RSS for query "${query}":`, err);
      continue;
    }

    const items = (feed.items ?? []).slice(0, MAX_ITEMS_PER_QUERY);

    for (const item of items) {
      if (candidates.length >= MAX_NEW_ENTRIES) break;

      const link = item.link ? normalizeUrl(item.link) : null;
      if (!link) continue;
      if (existingByUrl.has(link)) continue;

      const published = toIsoDate(item) ?? new Date().toISOString();
      if (!isWithinHours(published, effectiveWindow)) continue;

      const sourceName = parseSourceName(item);
      const title = cleanTitle(item.title ?? 'Untitled', sourceName);

      const snippet = item.contentSnippet?.trim()
        ? item.contentSnippet.trim()
        : item.content
          ? stripHtml(item.content).trim()
          : '';

      const summary = snippet && snippet.length >= 80
        ? snippet
        : `${sourceName} published an update relevant to AI agents: ${title}.`;

      candidates.push({
        id: randomId(existingIds),
        title,
        summary,
        source_url: link,
        source_name: sourceName,
        tags: inferTags(query, title),
        published_at: published,
      });

      existingByUrl.add(link);
    }
  }

  // Stable ordering: newest first
  candidates.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  if (candidates.length === 0) {
    console.log('[refresh-news] 0 new entries added');
    return;
  }

  const updated = [...candidates, ...existing];

  if (!dryRun) {
    await writeNews(updated);
  }

  console.log(`[refresh-news] ${candidates.length} new entr${candidates.length === 1 ? 'y' : 'ies'} ${dryRun ? 'found (dry-run; not written)' : 'added'}`);
  for (const c of candidates.slice(0, 10)) {
    console.log(`- ${c.title} (${c.source_name})`);
  }
  if (candidates.length > 10) {
    console.log(`...and ${candidates.length - 10} more`);
  }
}

main().catch((err) => {
  console.error('[refresh-news] Fatal error:', err);
  process.exitCode = 1;
});
