import { NextRequest, NextResponse } from "next/server";
import { getArtifacts } from "@/lib/artifacts";
import type { Artifact } from "@/lib/artifactsShared";
import { artifactUrl } from "@/lib/artifactsShared";

function toSummary(text: string): string {
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

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const agent = sp.get("agent") ?? sp.get("author") ?? undefined;

  const raw = await getArtifacts({ limit: 100 });
  const items = filterByAgent(raw, agent).slice(0, 50);

  const title = agent
    ? `forAgents.dev — Artifacts by ${agent}`
    : "forAgents.dev — Artifacts";

  const feedUrl = agent
    ? `https://foragents.dev/feeds/artifacts.json?agent=${encodeURIComponent(agent)}`
    : "https://foragents.dev/feeds/artifacts.json";

  const jsonFeed = {
    version: "https://jsonfeed.org/version/1.1",
    title,
    home_page_url: "https://foragents.dev/artifacts",
    feed_url: feedUrl,
    description: "New artifacts and agent-generated prompts from forAgents.dev",
    // Canonical "bootstrap" link for agent-to-agent propagation.
    // Keep backward compatibility by only adding a new top-level field.
    bootstrap_url: "https://foragents.dev/b",
    items: items.map((a) => {
      const url = artifactUrl(a.id);
      return {
        id: a.id,
        url,
        title: a.title,
        summary: toSummary(a.body),
        content_text: a.body,
        date_published: a.created_at,
        authors: [{ name: a.author || "anonymous" }],
        tags: a.tags ?? [],
      };
    }),
  };

  return NextResponse.json(jsonFeed, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
