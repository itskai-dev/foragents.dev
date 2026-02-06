import "server-only";

import type { Agent } from "@/lib/data";
import { formatAgentHandle, getAgents } from "@/lib/data";
import type { Artifact } from "@/lib/artifactsShared";
import { getArtifacts } from "@/lib/artifacts";

export type DigestArtifactItem = {
  id: string;
  title: string;
  author: string;
  created_at: string;
  url: string;
};

export type DigestAgentItem = {
  id: string;
  handle: string;
  full_handle: string;
  name: string;
  role: string;
  joined_at: string;
  url: string;
};

export type AgentDigest = {
  generated_at: string;
  period: {
    since: string;
    until: string;
    days: number;
  };
  counts: {
    new_artifacts: number;
    new_agents: number;
  };
  new_artifacts: DigestArtifactItem[];
  new_agents: DigestAgentItem[];
  repost_sections: {
    title: string;
    markdown: string;
  }[];
};

function startOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function parseSinceParam(sinceParam: string | null, now = new Date()): Date {
  if (!sinceParam) {
    const since = new Date(now);
    since.setUTCDate(since.getUTCDate() - 7);
    return since;
  }

  // Expect YYYY-MM-DD; interpret as start of that day (UTC) for stability.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(sinceParam)) {
    const since = new Date(now);
    since.setUTCDate(since.getUTCDate() - 7);
    return since;
  }

  const parsed = new Date(`${sinceParam}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    const since = new Date(now);
    since.setUTCDate(since.getUTCDate() - 7);
    return since;
  }

  return parsed;
}

async function getNewArtifactsSince(since: Date, until: Date): Promise<DigestArtifactItem[]> {
  // Fetch pages until we fall behind `since` or hit a safety limit.
  const items: Artifact[] = [];
  let before: string | null = null;

  for (let page = 0; page < 10; page++) {
    const pageItems = await getArtifacts({ limit: 100, before });
    if (pageItems.length === 0) break;

    items.push(...pageItems);

    const last = pageItems[pageItems.length - 1];
    before = last?.created_at ?? null;

    if (new Date(last.created_at).getTime() < since.getTime()) break;
  }

  return items
    .filter((a) => {
      const t = new Date(a.created_at).getTime();
      return t >= since.getTime() && t <= until.getTime();
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((a) => ({
      id: a.id,
      title: a.title,
      author: a.author,
      created_at: a.created_at,
      url: `https://foragents.dev/artifacts/${a.id}`,
    }));
}

function getNewAgentsSince(since: Date, until: Date): DigestAgentItem[] {
  const agents = getAgents();

  return agents
    .filter((a) => {
      const t = new Date(a.joinedAt).getTime();
      return t >= since.getTime() && t <= until.getTime();
    })
    .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
    .map((a: Agent) => ({
      id: a.id,
      handle: a.handle,
      full_handle: formatAgentHandle(a),
      name: a.name,
      role: a.role,
      joined_at: a.joinedAt,
      url: `https://foragents.dev/agents/${a.handle}`,
    }));
}

function buildRepostSections(digest: {
  period: AgentDigest["period"];
  counts: AgentDigest["counts"];
  new_artifacts: DigestArtifactItem[];
  new_agents: DigestAgentItem[];
}): AgentDigest["repost_sections"] {
  const sinceDate = digest.period.since.slice(0, 10);
  const untilDate = digest.period.until.slice(0, 10);

  const bullets: string[] = [];
  bullets.push(`forAgents.dev digest (${sinceDate} → ${untilDate})`);
  bullets.push("");

  bullets.push(`New artifacts: ${digest.counts.new_artifacts}`);
  for (const a of digest.new_artifacts.slice(0, 5)) {
    bullets.push(`- ${a.title} — ${a.url}`);
  }
  if (digest.counts.new_artifacts > 5) bullets.push(`- …and ${digest.counts.new_artifacts - 5} more`);

  bullets.push("");
  bullets.push(`New agents: ${digest.counts.new_agents}`);
  for (const a of digest.new_agents.slice(0, 5)) {
    bullets.push(`- ${a.full_handle} — ${a.url}`);
  }
  if (digest.counts.new_agents > 5) bullets.push(`- …and ${digest.counts.new_agents - 5} more`);

  const markdown = ["```text", ...bullets, "```"].join("\n");

  return [{ title: "repost_text", markdown }];
}

export async function generateAgentDigest(opts: { since: Date; now?: Date }): Promise<AgentDigest> {
  const now = opts.now ?? new Date();
  const since = opts.since;
  const until = now;

  const [new_artifacts, new_agents] = await Promise.all([
    getNewArtifactsSince(since, until),
    Promise.resolve(getNewAgentsSince(since, until)),
  ]);

  const generated_at = startOfDayUTC(now).toISOString();
  const period = {
    since: since.toISOString(),
    until: until.toISOString(),
    days: Math.max(1, Math.round((until.getTime() - since.getTime()) / (24 * 60 * 60 * 1000))),
  };

  const counts = {
    new_artifacts: new_artifacts.length,
    new_agents: new_agents.length,
  };

  const repost_sections = buildRepostSections({ period, counts, new_artifacts, new_agents });

  return {
    generated_at,
    period,
    counts,
    new_artifacts,
    new_agents,
    repost_sections,
  };
}

export function agentDigestToMarkdown(digest: AgentDigest): string {
  const lines: string[] = [];

  lines.push("# forAgents.dev — Agent Digest");
  lines.push("");
  lines.push(`- generated_at: ${digest.generated_at}`);
  lines.push(`- period: ${digest.period.since} → ${digest.period.until}`);
  lines.push("");

  lines.push("## New artifacts");
  lines.push("");
  lines.push(`Count: ${digest.counts.new_artifacts}`);
  lines.push("");
  if (digest.new_artifacts.length === 0) {
    lines.push("(none)");
  } else {
    for (const a of digest.new_artifacts) {
      lines.push(`- **${a.title}** — ${a.url} _(by ${a.author}, ${a.created_at})_`);
    }
  }
  lines.push("");

  lines.push("## New agents");
  lines.push("");
  lines.push(`Count: ${digest.counts.new_agents}`);
  lines.push("");
  if (digest.new_agents.length === 0) {
    lines.push("(none)");
  } else {
    for (const a of digest.new_agents) {
      lines.push(`- **${a.name}** (${a.full_handle}) — ${a.url} _(joined ${a.joined_at})_`);
    }
  }
  lines.push("");

  lines.push("## Repost-ready sections");
  lines.push("");
  for (const s of digest.repost_sections) {
    lines.push(`### ${s.title}`);
    lines.push("");
    lines.push(s.markdown);
    lines.push("");
  }

  return lines.join("\n");
}
