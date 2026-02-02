import { NextRequest, NextResponse } from "next/server";
import {
  getNews,
  getSkills,
  getMcpServers,
  getAgents,
  type NewsItem,
  type Skill,
  type McpServer,
  type Agent,
} from "@/lib/data";

function matches(query: string, ...fields: (string | string[])[]): boolean {
  const q = query.toLowerCase();
  for (const field of fields) {
    if (Array.isArray(field)) {
      if (field.some((f) => f.toLowerCase().includes(q))) return true;
    } else if (field && field.toLowerCase().includes(q)) {
      return true;
    }
  }
  return false;
}

export type SearchResults = {
  query: string;
  news: NewsItem[];
  skills: Skill[];
  mcpServers: McpServer[];
  agents: Agent[];
  total: number;
};

export function search(query: string): SearchResults {
  const news = getNews().filter((n) =>
    matches(query, n.title, n.summary, n.tags)
  );
  const skills = getSkills().filter((s) =>
    matches(query, s.name, s.description, s.tags)
  );
  const mcpServers = getMcpServers().filter((m) =>
    matches(query, m.name, m.description, m.tags)
  );
  const agents = getAgents().filter((a) =>
    matches(query, a.name, a.description)
  );

  return {
    query,
    news,
    skills,
    mcpServers,
    agents,
    total: news.length + skills.length + mcpServers.length + agents.length,
  };
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json(
      { error: "Missing required query parameter: q" },
      { status: 400 }
    );
  }

  const results = search(q);

  return NextResponse.json(results, {
    headers: { "Cache-Control": "public, max-age=60" },
  });
}
