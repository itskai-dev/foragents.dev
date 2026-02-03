import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

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

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  // Search pattern for ILIKE queries
  const pattern = `%${q}%`;

  try {
    // Search news table
    const { data: newsData } = await supabase
      .from("news")
      .select("id, title, summary, source_url")
      .or(`title.ilike.${pattern},summary.ilike.${pattern}`)
      .order("published_at", { ascending: false })
      .limit(5);

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
      .limit(5);

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
      .limit(5);

    const agents: SearchResult[] = (agentsData || []).map((item) => ({
      title: item.name,
      description: `${item.platform} agent`,
      url: item.owner_url || `/agents/${item.id}`,
      type: "agent",
    }));

    // MCP servers and llmstxt tables don't exist yet, return empty arrays
    const mcp_servers: SearchResult[] = [];
    const llmstxt: SearchResult[] = [];

    const results: SearchResults = {
      query: q,
      news,
      skills,
      agents,
      mcp_servers,
      llmstxt,
      total: news.length + skills.length + agents.length,
    };

    // Check if client wants markdown
    const acceptHeader = request.headers.get("accept") || "";
    const wantsMarkdown = 
      acceptHeader.includes("text/markdown") || 
      acceptHeader.includes("text/plain");

    if (wantsMarkdown) {
      const markdown = formatResultsAsMarkdown(results);
      return new NextResponse(markdown, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Cache-Control": "public, max-age=60",
        },
      });
    }

    return NextResponse.json(results, {
      headers: { "Cache-Control": "public, max-age=60" },
    });
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
