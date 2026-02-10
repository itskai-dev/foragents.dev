import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAgentPremiumByHandle } from "@/lib/premiumStore";
import { entitlementsFor } from "@/lib/entitlements";
import {
  checkAndConsumeSearchQuota,
  getQuotaLimitForUserState,
  newAnonymousSearchId,
  type SearchQuotaUserState,
} from "@/lib/searchQuota";
import { emitEvent } from "@/lib/telemetry";
import {
  getAgents,
  getBlogPosts,
  getLlmsTxtEntries,
  getMcpServers,
  getSkills,
} from "@/lib/data";
import { readGuides } from "@/lib/guides";

type SearchResultType = "skill" | "mcp" | "agent" | "llms-txt" | "blog" | "guide";

type SearchResult = {
  title: string;
  description: string;
  url: string;
  type: SearchResultType;
  score: number;
};

type SearchResults = {
  query: string;
  results: SearchResult[];
  skills: SearchResult[];
  mcp_servers: SearchResult[];
  agents: SearchResult[];
  llmstxt: SearchResult[];
  blog: SearchResult[];
  guides: SearchResult[];
  total: number;
};

function normalize(input: string): string {
  return (input || "").toLowerCase().trim();
}

function scoreMatch(query: string, values: string[]): number {
  const q = normalize(query);
  if (!q) return 0;

  let score = 0;

  for (const raw of values) {
    const value = normalize(raw);
    if (!value) continue;

    if (value === q) {
      score += 300;
      continue;
    }

    if (value.startsWith(q)) {
      score += 180;
      continue;
    }

    const idx = value.indexOf(q);
    if (idx >= 0) {
      score += Math.max(40, 120 - idx);
    }
  }

  return score;
}

function toTopMatches(items: SearchResult[], max: number): SearchResult[] {
  return items
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, max);
}

/**
 * Search endpoint for forAgents.dev
 * GET /api/search?q=query
 * Returns JSON by default, markdown if Accept header requests it
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json(
      { error: "Missing required query parameter: q" },
      { status: 400 }
    );
  }

  // Optional: if caller provides an agent handle, we can apply Premium entitlements.
  // (MVP: increases per-category result caps.)
  const agentHandle = request.nextUrl.searchParams.get("agentHandle")?.trim();
  const premiumLookupClient = getSupabaseAdmin() || getSupabase();
  const premiumStatus = agentHandle
    ? await getAgentPremiumByHandle({ supabase: premiumLookupClient, agentHandle })
    : null;

  const userState: SearchQuotaUserState = premiumStatus?.isPremium
    ? "premium"
    : agentHandle
      ? "free"
      : "anonymous";

  // Best-effort anonymous identity: cookie-based, with IP fallback.
  const existingAnonId = request.cookies.get("fa_search_id")?.value;
  const anonId = existingAnonId || newAnonymousSearchId();
  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  const quotaId = agentHandle ? `agent:${agentHandle.replace(/^@/, "")}` : `anon:${anonId}:${ip || "noip"}`;
  const quotaLimit = getQuotaLimitForUserState(userState);
  const quota = checkAndConsumeSearchQuota({ id: quotaId, limit: quotaLimit });

  if (!quota.allowed) {
    const upgrade_url = "/pricing";
    const retryAfterSeconds = Math.max(
      0,
      Math.floor((new Date(quota.resetAt).getTime() - Date.now()) / 1000)
    );

    await emitEvent({
      supabase: getSupabaseAdmin() || null,
      name: "paywall_hit",
      props: {
        paywall_type: "search_quota",
        surface: "api",
        path: "/api/search",
        q_len: q.length,
        user_state: userState,
        quota_remaining: 0,
        quota_limit: quotaLimit,
        experiment_variant: "A_inline",
      },
    });

    const res = NextResponse.json(
      {
        error: "search_limit_reached",
        message: "Daily search limit reached",
        remaining: 0,
        upgrade_url,
        retry_after_seconds: retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
          "Cache-Control": "no-store",
        },
      }
    );

    if (!existingAnonId) {
      res.cookies.set({
        name: "fa_search_id",
        value: anonId,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    return res;
  }

  const entitlements = entitlementsFor({ isPremium: !!premiumStatus?.isPremium });

  try {
    const skills = toTopMatches(
      getSkills().map((skill) => ({
        title: skill.name,
        description: skill.description || "",
        url: `/skills/${skill.slug}`,
        type: "skill" as const,
        score: scoreMatch(q, [skill.name, skill.description, ...(skill.tags || []), skill.author]),
      })),
      entitlements.searchLimitMax
    );

    const mcp_servers = toTopMatches(
      getMcpServers().map((server) => ({
        title: server.name,
        description: server.description || "",
        url: `/mcp/${server.slug}`,
        type: "mcp" as const,
        score: scoreMatch(q, [
          server.name,
          server.description,
          server.category,
          ...(server.compatibility || []),
          server.repo_url,
        ]),
      })),
      entitlements.searchLimitMax
    );

    const agents = toTopMatches(
      getAgents().map((agent) => ({
        title: agent.name,
        description: agent.description || "",
        url: `/agents/${agent.handle}`,
        type: "agent" as const,
        score: scoreMatch(q, [
          agent.name,
          agent.handle,
          agent.domain,
          agent.role,
          agent.description,
          ...(agent.platforms || []),
          ...(agent.skills || []),
        ]),
      })),
      entitlements.searchLimitMax
    );

    const llmstxt = toTopMatches(
      getLlmsTxtEntries().map((entry) => ({
        title: entry.title,
        description: entry.description || "",
        url: entry.url,
        type: "llms-txt" as const,
        score: scoreMatch(q, [
          entry.title,
          entry.description,
          entry.domain,
          ...(entry.sections || []),
          entry.url,
        ]),
      })),
      entitlements.searchLimitMax
    );

    const blog = toTopMatches(
      getBlogPosts().map((post) => ({
        title: post.title,
        description: post.excerpt || "",
        url: `/blog/${post.slug}`,
        type: "blog" as const,
        score: scoreMatch(q, [
          post.title,
          post.excerpt,
          post.category,
          ...(post.tags || []),
          post.author?.name || "",
        ]),
      })),
      entitlements.searchLimitMax
    );

    const guides = toTopMatches(
      (await readGuides()).map((guide) => ({
        title: guide.title,
        description: guide.description || "",
        url: `/guides/${guide.slug}`,
        type: "guide" as const,
        score: scoreMatch(q, [
          guide.title,
          guide.description,
          guide.category,
          guide.difficulty,
          guide.author,
          ...(guide.tags || []),
        ]),
      })),
      entitlements.searchLimitMax
    );

    const results = [...skills, ...mcp_servers, ...agents, ...llmstxt, ...blog, ...guides].sort(
      (a, b) => b.score - a.score || a.title.localeCompare(b.title)
    );

    const payload: SearchResults & {
      quota?: { remaining: number; limit: number; user_state: SearchQuotaUserState; reset_at: string };
    } = {
      query: q,
      results,
      skills,
      mcp_servers,
      agents,
      llmstxt,
      blog,
      guides,
      total: results.length,
      quota: {
        remaining: quota.remaining,
        limit: quota.limit,
        user_state: userState,
        reset_at: quota.resetAt,
      },
    };

    const acceptHeader = request.headers.get("accept") || "";
    const wantsMarkdown =
      acceptHeader.includes("text/markdown") ||
      acceptHeader.includes("text/plain");

    if (wantsMarkdown) {
      const markdown = formatResultsAsMarkdown(payload);
      const res = new NextResponse(markdown, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Cache-Control": "public, max-age=60",
        },
      });
      if (!existingAnonId) {
        res.cookies.set({
          name: "fa_search_id",
          value: anonId,
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
        });
      }
      return res;
    }

    const res = NextResponse.json(payload, {
      headers: { "Cache-Control": "public, max-age=60" },
    });
    if (!existingAnonId) {
      res.cookies.set({
        name: "fa_search_id",
        value: anonId,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return res;
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}

function formatSection(label: string, items: SearchResult[]): string[] {
  if (items.length === 0) return [];

  const lines: string[] = [label, ""];
  for (const item of items) {
    lines.push(`- **[${item.title}](${item.url})**`);
    lines.push(`  ${item.description}`);
    lines.push("");
  }
  return lines;
}

function formatResultsAsMarkdown(results: SearchResults): string {
  const lines = [
    `# Search Results for "${results.query}"`,
    "",
    `**Total:** ${results.total} results`,
    "",
    ...formatSection("## 🛠️ Skills", results.skills),
    ...formatSection("## 🔌 MCP Servers", results.mcp_servers),
    ...formatSection("## 🤖 Agents", results.agents),
    ...formatSection("## 📄 llms.txt", results.llmstxt),
    ...formatSection("## 📝 Blog", results.blog),
    ...formatSection("## 📚 Guides", results.guides),
  ];

  if (results.total === 0) {
    lines.push("No results found.");
  }

  return lines.join("\n");
}
