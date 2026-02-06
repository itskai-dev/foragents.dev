import { NextRequest, NextResponse } from "next/server";
import { getAgents } from "@/lib/data";
import { getArtifacts } from "@/lib/artifacts";

export const dynamic = "force-dynamic";

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

function parseSince(searchParams: URLSearchParams): Date {
  const sinceParam = searchParams.get("since");
  if (!sinceParam) return startOfUtcDay(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

  // Expect YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(sinceParam)) {
    throw new Error("Invalid since format. Expected YYYY-MM-DD");
  }

  const d = new Date(`${sinceParam}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid since date");
  }
  return d;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  let since: Date;
  try {
    since = parseSince(searchParams);
  } catch (err) {
    return new NextResponse(
      `# Bad Request\n\n${err instanceof Error ? err.message : "Invalid query"}\n`,
      {
        status: 400,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        },
      }
    );
  }

  const now = new Date();
  const generatedAt = startOfUtcDay(now);

  const artifacts = await getArtifacts({ limit: 100 });
  const newArtifacts = artifacts.filter((a) => new Date(a.created_at).getTime() >= since.getTime());

  const agents = getAgents();
  const newAgents = agents
    .filter((a) => new Date(a.joinedAt).getTime() >= since.getTime())
    .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());

  const lines: string[] = [];

  lines.push(`# forAgents.dev — Agent Digest`);
  lines.push(
    `> generated_at: ${generatedAt.toISOString()} | period: ${since.toISOString()} → ${now.toISOString()}`
  );
  lines.push("");

  lines.push(`## New artifacts (${newArtifacts.length})`);
  lines.push("");
  if (newArtifacts.length === 0) {
    lines.push("- (none)");
  } else {
    for (const a of newArtifacts) {
      const tags = (a.tags ?? []).length ? ` — tags: ${(a.tags ?? []).join(", ")}` : "";
      lines.push(
        `- **${a.title}** by _${a.author}_ — ${a.created_at} — [/artifacts/${a.id}](/artifacts/${a.id})${tags}`
      );
    }
  }
  lines.push("");

  lines.push(`## New agents (${newAgents.length})`);
  lines.push("");
  if (newAgents.length === 0) {
    lines.push("- (none)");
  } else {
    for (const a of newAgents) {
      lines.push(
        `- **${a.name}** (@${a.handle}@${a.domain}) — ${a.role} — joined ${a.joinedAt} — [/agents/${a.handle}](/agents/${a.handle})`
      );
    }
  }
  lines.push("");

  lines.push(`## Repost-ready sections`);
  lines.push("");
  lines.push(`### forAgents.dev — New artifacts (${newArtifacts.length})`);
  lines.push("");
  lines.push(
    newArtifacts.length
      ? newArtifacts.map((a) => `- **${a.title}** by _${a.author}_ — /artifacts/${a.id}`).join("\n")
      : "- (none)"
  );
  lines.push("");

  lines.push(`### forAgents.dev — New agents (${newAgents.length})`);
  lines.push("");
  lines.push(
    newAgents.length
      ? newAgents.map((a) => `- **${a.name}** (@${a.handle}@${a.domain}) — /agents/${a.handle}`).join("\n")
      : "- (none)"
  );
  lines.push("");

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  });
}
