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

type SearchResult = {
  title: string;
  description: string;
  url: string;
  type: string;
};

type SearchResults = {
  query: string;
  news: SearchResult[];
  skills: SearchResult[];
  agents: SearchResult[];
  mcp_servers: SearchResult[];
  llmstxt: SearchResult[];
  total: number;
};

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

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  const entitlements = entitlementsFor({ isPremium: !!premiumStatus?.isPremium });

  // Search pattern for ILIKE queries
  const pattern = `%${q}%`;

  try {
    // Search news table
    const { data: newsData } = await supabase
      .from("news")
      .select("id, title, summary, source_url")
      .or(`title.ilike.${pattern},summary.ilike.${pattern}`)
      .order("published_at", { ascending: false })
      .limit(entitlements.searchLimitMax);

    const news: SearchResult[] = (newsData || []).map((item) => ({
      title: item.title,
      description: item.summary || "",
      url: item.source_url,
      type: "news",
    }));

    // Search skills table
    const { data: skillsData } = await supabase
      .from("skills")
      .select("slug, name, description")
      .or(`name.ilike.${pattern},description.ilike.${pattern}`)
      .limit(entitlements.searchLimitMax);

    const skills: SearchResult[] = (skillsData || []).map((item) => ({
      title: item.name,
      description: item.description,
      url: `/skills/${item.slug}`,
      type: "skill",
    }));

    // Search agents table
    const { data: agentsData } = await supabase
      .from("agents")
      .select("id, name, platform, owner_url")
      .or(`name.ilike.${pattern},platform.ilike.${pattern}`)
      .limit(entitlements.searchLimitMax);

    const agents: SearchResult[] = (agentsData || []).map((item) => ({
      title: item.name,
      description: `${item.platform} agent`,
      url: item.owner_url || `/agents/${item.id}`,
      type: "agent",
    }));

    // MCP servers and llmstxt tables don't exist yet, return empty arrays
    const mcp_servers: SearchResult[] = [];
    const llmstxt: SearchResult[] = [];

    const results: SearchResults & {
      quota?: { remaining: number; limit: number; user_state: SearchQuotaUserState; reset_at: string };
    } = {
      query: q,
      news,
      skills,
      agents,
      mcp_servers,
      llmstxt,
      total: news.length + skills.length + agents.length,
      quota: {
        remaining: quota.remaining,
        limit: quota.limit,
        user_state: userState,
        reset_at: quota.resetAt,
      },
    };

    // Check if client wants markdown
    const acceptHeader = request.headers.get("accept") || "";
    const wantsMarkdown = 
      acceptHeader.includes("text/markdown") || 
      acceptHeader.includes("text/plain");

    if (wantsMarkdown) {
      const markdown = formatResultsAsMarkdown(results);
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

    const res = NextResponse.json(results, {
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

function formatResultsAsMarkdown(results: SearchResults): string {
  const lines = [
    `# Search Results for "${results.query}"`,
    "",
    `**Total:** ${results.total} results`,
    "",
  ];

  if (results.news.length > 0) {
    lines.push("## 📰 News", "");
    for (const item of results.news) {
      lines.push(`- **[${item.title}](${item.url})**`);
      lines.push(`  ${item.description}`);
      lines.push("");
    }
  }

  if (results.skills.length > 0) {
    lines.push("## 🛠️ Skills", "");
    for (const item of results.skills) {
      lines.push(`- **[${item.title}](${item.url})**`);
      lines.push(`  ${item.description}`);
      lines.push("");
    }
  }

  if (results.agents.length > 0) {
    lines.push("## 🤖 Agents", "");
    for (const item of results.agents) {
      lines.push(`- **[${item.title}](${item.url})**`);
      lines.push(`  ${item.description}`);
      lines.push("");
    }
  }

  if (results.mcp_servers.length > 0) {
    lines.push("## 🔌 MCP Servers", "");
    for (const item of results.mcp_servers) {
      lines.push(`- **[${item.title}](${item.url})**`);
      lines.push(`  ${item.description}`);
      lines.push("");
    }
  }

  if (results.llmstxt.length > 0) {
    lines.push("## 📄 llms.txt Sites", "");
    for (const item of results.llmstxt) {
      lines.push(`- **[${item.title}](${item.url})**`);
      lines.push(`  ${item.description}`);
      lines.push("");
    }
  }

  if (results.total === 0) {
    lines.push("No results found.");
  }

  return lines.join("\n");
}
