import { NextRequest, NextResponse } from "next/server";
import { search } from "@/app/api/search/route";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return new NextResponse("Missing required query parameter: q", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const results = search(q);
  const lines: string[] = [
    `# Search Results — "${q}"`,
    `> ${results.total} results across all categories`,
    "",
  ];

  if (results.news.length > 0) {
    lines.push(`## News (${results.news.length})`);
    lines.push("");
    for (const item of results.news) {
      lines.push(`- **${item.title}** — ${item.summary}`);
      lines.push(`  Source: [${item.source_name}](${item.source_url}) · ${item.published_at}`);
    }
    lines.push("");
  }

  if (results.skills.length > 0) {
    lines.push(`## Skills (${results.skills.length})`);
    lines.push("");
    for (const skill of results.skills) {
      lines.push(`- **${skill.name}** — ${skill.description}`);
      lines.push(`  Install: \`${skill.install_cmd}\` · Tags: ${skill.tags.join(", ")}`);
    }
    lines.push("");
  }

  if (results.mcpServers.length > 0) {
    lines.push(`## MCP Servers (${results.mcpServers.length})`);
    lines.push("");
    for (const server of results.mcpServers) {
      lines.push(`- **${server.name}** — ${server.description}`);
      lines.push(`  Category: ${server.category} · Tags: ${server.tags.join(", ")}`);
    }
    lines.push("");
  }

  if (results.agents.length > 0) {
    lines.push(`## Agents (${results.agents.length})`);
    lines.push("");
    for (const agent of results.agents) {
      lines.push(`- **${agent.name}** (@${agent.handle}) — ${agent.description}`);
      lines.push(`  Role: ${agent.role} · Platforms: ${agent.platforms.join(", ")}`);
    }
    lines.push("");
  }

  if (results.total === 0) {
    lines.push("No results found.");
    lines.push("");
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}
