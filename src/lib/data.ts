import newsData from "@/data/news.json";
import skillsData from "@/data/skills.json";
import mcpData from "@/data/mcp-servers.json";
import llmsTxtData from "@/data/llms-txt.json";
import agentsData from "@/data/agents.json";
import acpAgentsData from "@/data/acp-agents.json";
import workflowsData from "@/data/workflows.json";
import templatesData from "@/data/templates.json";
import { getSupabase } from "@/lib/supabase";
import { getVerificationInfo, type VerifiedSkillInfo } from "@/lib/verification";
import { promises as fs } from "fs";
import path from "path";

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  tags: string[];
  published_at: string;
};

import type { TrendingBadgeKind } from "@/lib/trendingTypes";

export type Skill = {
  id: string;
  slug: string;
  name: string;
  description: string;
  author: string;
  install_cmd: string;
  repo_url: string;
  tags: string[];

  // Computed fields (not present in the bundled JSON by default)
  trendingScore?: number;
  trendingBadge?: TrendingBadgeKind | null;

  // Verification (derived from data/verified-skills.json)
  verified?: boolean;
  verification?: VerifiedSkillInfo | null;
};

export function getNews(tag?: string): NewsItem[] {
  let items = newsData as NewsItem[];
  if (tag) {
    items = items.filter((item) => item.tags.includes(tag));
  }
  return items.sort(
    (a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
}

export function getNewsById(id: string): NewsItem | undefined {
  return (newsData as NewsItem[]).find((item) => item.id === id);
}

export type McpServerCategory =
  | "file-system"
  | "database"
  | "API"
  | "coding"
  | "search"
  | "communication";

export type McpServer = {
  id: string;
  slug: string;
  name: string;
  description: string;

  // Requirements (directory schema)
  repo_url: string;
  category: McpServerCategory;
  install_cmd: string;
  compatibility: string[];

  // Optional curation
  featured?: boolean;
};

export function getMcpServers(category?: string): McpServer[] {
  let items = mcpData as McpServer[];
  if (category) {
    const q = category.toLowerCase();
    items = items.filter((item) => item.category.toLowerCase() === q);
  }
  return items;
}

export function getMcpServerBySlug(slug: string): McpServer | undefined {
  return (mcpData as McpServer[]).find((s) => s.slug === slug);
}

export function mcpServersToMarkdown(servers: McpServer[]): string {
  const lines = [
    "# Agent Hub — MCP Server Directory",
    `> ${servers.length} MCP servers listed`,
    "> Model Context Protocol servers give AI agents secure access to tools and data sources.",
    "",
  ];

  for (const server of servers) {
    lines.push(`## ${server.name}`);
    lines.push("");
    lines.push(server.description);
    lines.push("");
    lines.push(`- **Category:** ${server.category}`);
    lines.push(`- **Install:** \`${server.install_cmd}\``);
    lines.push(`- **Repo:** [${server.repo_url}](${server.repo_url})`);
    lines.push(`- **Compatibility:** ${server.compatibility.join(", ")}`);
    if (server.featured) {
      lines.push(`- **Featured:** yes`);
    }
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

export type LlmsTxtEntry = {
  id: string;
  domain: string;
  url: string;
  title: string;
  description: string;
  lastChecked: string;
  sections: string[];
};

export function getLlmsTxtEntries(): LlmsTxtEntry[] {
  return llmsTxtData as LlmsTxtEntry[];
}

export function llmsTxtToMarkdown(entries: LlmsTxtEntry[]): string {
  const lines = [
    "# llms.txt Directory — forAgents.dev",
    `> The first directory of llms.txt files on the web`,
    `> ${entries.length} sites indexed · Last updated: ${new Date().toISOString().split("T")[0]}`,
    "",
    "Sites that serve llms.txt files — machine-readable documentation for AI agents.",
    "",
  ];

  for (const entry of entries) {
    lines.push(`## ${entry.title}`);
    lines.push("");
    lines.push(entry.description);
    lines.push("");
    lines.push(`- **Domain:** ${entry.domain}`);
    lines.push(`- **llms.txt:** [${entry.url}](${entry.url})`);
    lines.push(`- **Sections:** ${entry.sections.join(", ")}`);
    lines.push(`- **Last Checked:** ${entry.lastChecked}`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

function withVerification(skill: Skill): Skill {
  const info = getVerificationInfo(skill.slug);
  return {
    ...skill,
    verified: !!info,
    verification: info,
  };
}

export function getSkills(): Skill[] {
  return (skillsData as Skill[]).map(withVerification);
}

export function getSkillBySlug(slug: string): Skill | undefined {
  const base = (skillsData as Skill[]).find((s) => s.slug === slug);
  return base ? withVerification(base) : undefined;
}

export function newsToMarkdown(items: NewsItem[]): string {
  const lines = [
    "# Agent Hub — News Feed",
    `> Last updated: ${new Date().toISOString()}`,
    `> ${items.length} items`,
    "",
  ];

  for (const item of items) {
    lines.push(`## ${item.title}`);
    lines.push("");
    lines.push(item.summary);
    lines.push("");
    lines.push(
      `- **Source:** [${item.source_name}](${item.source_url})`
    );
    lines.push(`- **Published:** ${item.published_at}`);
    lines.push(`- **Tags:** ${item.tags.join(", ")}`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

export function skillsToMarkdown(skills: Skill[]): string {
  const lines = [
    "# Agent Hub — Skills Directory",
    `> ${skills.length} skills available`,
    "",
  ];

  for (const skill of skills) {
    lines.push(`## ${skill.name}`);
    lines.push("");
    lines.push(skill.description);
    lines.push("");
    lines.push(`- **Author:** ${skill.author}`);
    lines.push(`- **Install:** \`${skill.install_cmd}\``);
    lines.push(`- **Repo:** [${skill.repo_url}](${skill.repo_url})`);
    lines.push(`- **Tags:** ${skill.tags.join(", ")}`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

// ============ AGENTS ============

export type ActivityItem = {
  type: string;
  description: string;
  timestamp: string;
};

export type Agent = {
  id: string;
  handle: string;
  name: string;
  domain: string;
  description: string;
  avatar: string;
  role: string;
  platforms: string[];
  skills: string[];
  links: {
    agentJson?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  featured: boolean;
  verified?: boolean;
  trustScore?: number;
  activity?: ActivityItem[];
  joinedAt: string;
};

export function getAgents(): Agent[] {
  return agentsData as Agent[];
}

export function getFeaturedAgents(): Agent[] {
  return (agentsData as Agent[]).filter((a) => a.featured);
}

export function getAgentByHandle(handle: string): Agent | undefined {
  return (agentsData as Agent[]).find((a) => a.handle === handle);
}

export function formatAgentHandle(agent: Agent): string {
  return `@${agent.handle}@${agent.domain}`;
}

export function agentsToMarkdown(agents: Agent[]): string {
  const lines = [
    "# Agent Directory — forAgents.dev",
    `> ${agents.length} registered agents`,
    "> The first directory of AI agents with public identities.",
    "",
    "Agents listed here have published profiles, making them discoverable by other agents and humans.",
    "",
  ];

  for (const agent of agents) {
    const handle = formatAgentHandle(agent);
    lines.push(`## ${agent.avatar} ${agent.name}`);
    lines.push("");
    lines.push(`**Handle:** ${handle}`);
    lines.push(`**Role:** ${agent.role}`);
    lines.push("");
    lines.push(agent.description);
    lines.push("");
    lines.push(`- **Platforms:** ${agent.platforms.join(", ")}`);
    lines.push(`- **Skills:** ${agent.skills.join(", ")}`);
    if (agent.links.agentJson) {
      lines.push(`- **agent.json:** [${agent.links.agentJson}](${agent.links.agentJson})`);
    }
    if (agent.links.twitter) {
      lines.push(`- **Twitter:** [${agent.links.twitter}](${agent.links.twitter})`);
    }
    if (agent.links.github) {
      lines.push(`- **GitHub:** [${agent.links.github}](${agent.links.github})`);
    }
    lines.push(`- **Profile:** [/agents/${agent.handle}](/agents/${agent.handle})`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

export function agentToMarkdown(agent: Agent): string {
  const handle = formatAgentHandle(agent);
  const lines = [
    `# ${agent.avatar} ${agent.name}`,
    "",
    `> ${handle}`,
    `> ${agent.role}`,
    "",
    agent.description,
    "",
    "## Details",
    "",
    `- **Handle:** ${handle}`,
    `- **Role:** ${agent.role}`,
    `- **Platforms:** ${agent.platforms.join(", ")}`,
    `- **Skills:** ${agent.skills.join(", ")}`,
    `- **Joined:** ${agent.joinedAt}`,
    "",
  ];

  if (Object.keys(agent.links).length > 0) {
    lines.push("## Links");
    lines.push("");
    if (agent.links.agentJson) {
      lines.push(`- **agent.json:** [${agent.links.agentJson}](${agent.links.agentJson})`);
    }
    if (agent.links.twitter) {
      lines.push(`- **Twitter:** [${agent.links.twitter}](${agent.links.twitter})`);
    }
    if (agent.links.github) {
      lines.push(`- **GitHub:** [${agent.links.github}](${agent.links.github})`);
    }
    if (agent.links.website) {
      lines.push(`- **Website:** [${agent.links.website}](${agent.links.website})`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

// ============ ACP AGENTS ============

export type AcpAgent = {
  id: string;
  name: string;
  version: string;
  description: string;
  repository: string;
  author: string;
  license: string;
  icon: string;
  category: string;
  ides: string[];
  install_type: string;
  install_cmd: string;
  tags: string[];
};

export function getAcpAgents(category?: string): AcpAgent[] {
  let items = acpAgentsData as AcpAgent[];
  if (category) {
    items = items.filter((item) => item.category === category);
  }
  return items;
}

export function getAcpAgentById(id: string): AcpAgent | undefined {
  return (acpAgentsData as AcpAgent[]).find((a) => a.id === id);
}

export function acpAgentsToMarkdown(agents: AcpAgent[]): string {
  const lines = [
    "# Agent Hub — ACP Agent Directory",
    `> ${agents.length} coding agents listed`,
    "> Agent Client Protocol (ACP) agents work with JetBrains IDEs and Zed editor.",
    "",
    "ACP is an open standard (like LSP for AI agents) that lets any coding agent work in any supporting editor.",
    "",
  ];

  for (const agent of agents) {
    lines.push(`## ${agent.name}`);
    lines.push("");
    lines.push(agent.description);
    lines.push("");
    lines.push(`- **Version:** ${agent.version}`);
    lines.push(`- **Author:** ${agent.author}`);
    lines.push(`- **License:** ${agent.license}`);
    lines.push(`- **IDEs:** ${agent.ides.join(", ")}`);
    lines.push(`- **Category:** ${agent.category}`);
    if (agent.install_cmd && !agent.install_cmd.startsWith("#")) {
      lines.push(`- **Install:** \`${agent.install_cmd}\``);
    }
    lines.push(`- **Repository:** [${agent.repository}](${agent.repository})`);
    lines.push(`- **Tags:** ${agent.tags.join(", ")}`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  lines.push("## Resources");
  lines.push("");
  lines.push("- [ACP Registry](https://agentclientprotocol.com/registry) — Official registry");
  lines.push("- [ACP Protocol](https://agentclientprotocol.com) — Protocol documentation");
  lines.push("- [GitHub Registry](https://github.com/agentclientprotocol/registry) — Submit your agent");
  lines.push("");

  return lines.join("\n");
}

// ============ SUBMISSIONS ============

const SUBMISSIONS_PATH = path.join(process.cwd(), "data", "submissions.json");

export type Submission = {
  id: string;
  type: "skill" | "mcp" | "agent" | "llms-txt";
  name: string;
  description: string;
  url: string;
  author: string;
  tags: string[];
  install_cmd?: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  rejection_reason?: string;
  // For approved entries, optionally link to the directory slug
  directory_slug?: string;
};

async function readSubmissionsFromFile(): Promise<Submission[]> {
  try {
    const raw = await fs.readFile(SUBMISSIONS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Fetches recent submissions (all statuses) for display.
 * Uses Supabase if configured, falls back to JSON file.
 */
export async function getRecentSubmissions(limit = 5): Promise<Submission[]> {
  const supabase = getSupabase();

  if (supabase) {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Supabase fetch error:", error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      type: row.type,
      name: row.name,
      description: row.description,
      url: row.url,
      author: row.author,
      tags: row.tags || [],
      ...(row.install_cmd && { install_cmd: row.install_cmd }),
      status: row.status,
      submitted_at: row.created_at,
      ...(row.rejection_reason && { rejection_reason: row.rejection_reason }),
      ...(row.directory_slug && { directory_slug: row.directory_slug }),
    }));
  }

  // JSON fallback
  const all = await readSubmissionsFromFile();
  return all
    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    .slice(0, limit);
}

// ============ CREATORS ============

export type Creator = {
  username: string;
  skillCount: number;
  totalTags: number;
  skills: Skill[];
  topTags: Array<{ tag: string; count: number }>;
  verified: boolean;
};

/**
 * Get all unique creators with aggregated stats
 */
export function getCreators(): Creator[] {
  const skills = getSkills();
  const creatorMap = new Map<string, Creator>();

  for (const skill of skills) {
    const existing = creatorMap.get(skill.author);
    
    if (existing) {
      existing.skillCount++;
      existing.skills.push(skill);
      existing.totalTags += skill.tags.length;
    } else {
      creatorMap.set(skill.author, {
        username: skill.author,
        skillCount: 1,
        totalTags: skill.tags.length,
        skills: [skill],
        topTags: [],
        verified: skill.author === "Team Reflectt",
      });
    }
  }

  // Calculate top tags for each creator
  for (const creator of creatorMap.values()) {
    const tagCounts = new Map<string, number>();
    for (const skill of creator.skills) {
      for (const tag of skill.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }
    creator.topTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  return Array.from(creatorMap.values()).sort((a, b) => b.skillCount - a.skillCount);
}

/**
 * Get a specific creator by username
 */
export function getCreatorByUsername(username: string): Creator | undefined {
  const creators = getCreators();
  return creators.find(
    (c) => c.username.toLowerCase() === username.toLowerCase()
  );
}

/**
 * Get all skills by a specific author
 */
export function getSkillsByAuthor(author: string): Skill[] {
  return getSkills().filter(
    (s) => s.author.toLowerCase() === author.toLowerCase()
  );
}

// ============ WORKFLOWS ============

export type WorkflowStep = {
  id: string;
  name: string;
  description: string;
  skills: string[];
  automated: boolean;
};

export type Workflow = {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  tags: string[];
  requiredSkills: string[];
  steps: WorkflowStep[];
};

/**
 * Get all workflows
 */
export function getWorkflows(): Workflow[] {
  return workflowsData as Workflow[];
}

/**
 * Get a specific workflow by ID
 */
export function getWorkflowById(id: string): Workflow | undefined {
  return (workflowsData as Workflow[]).find((w) => w.id === id);
}

/**
 * Get workflows by category
 */
export function getWorkflowsByCategory(category: string): Workflow[] {
  return (workflowsData as Workflow[]).filter(
    (w) => w.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get workflows by difficulty
 */
export function getWorkflowsByDifficulty(difficulty: string): Workflow[] {
  return (workflowsData as Workflow[]).filter(
    (w) => w.difficulty.toLowerCase() === difficulty.toLowerCase()
  );
}

/**
 * Template types
 */
export type TemplateCategory = "chatbot" | "coding-assistant" | "data-analyst" | "content-creator" | "devops";

export type Template = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  useCase: string;
  stack: {
    models: string[];
    tools: string[];
    frameworks: string[];
  };
  config: Record<string, unknown>;
};

/**
 * Get all templates
 */
export function getTemplates(): Template[] {
  return templatesData as Template[];
}

/**
 * Get a specific template by ID
 */
export function getTemplateById(id: string): Template | undefined {
  return (templatesData as Template[]).find((t) => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): Template[] {
  return (templatesData as Template[]).filter(
    (t) => t.category.toLowerCase() === category.toLowerCase()
  );
}
