import newsData from "@/data/news.json";
import skillsData from "@/data/skills.json";
import mcpData from "@/data/mcp-servers.json";
import llmsTxtData from "@/data/llms-txt.json";

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  tags: string[];
  published_at: string;
};

export type Skill = {
  id: string;
  slug: string;
  name: string;
  description: string;
  author: string;
  install_cmd: string;
  repo_url: string;
  tags: string[];
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

export type McpServer = {
  id: string;
  slug: string;
  name: string;
  description: string;
  url: string;
  github: string;
  author: string;
  category: string;
  install_cmd: string;
  tags: string[];
};

export function getMcpServers(category?: string): McpServer[] {
  let items = mcpData as McpServer[];
  if (category) {
    items = items.filter((item) => item.category === category);
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
    lines.push(`- **Author:** ${server.author}`);
    lines.push(`- **Category:** ${server.category}`);
    lines.push(`- **Install:** \`${server.install_cmd}\``);
    lines.push(`- **GitHub:** [${server.github}](${server.github})`);
    lines.push(`- **Tags:** ${server.tags.join(", ")}`);
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

export function getSkills(): Skill[] {
  return skillsData as Skill[];
}

export function getSkillBySlug(slug: string): Skill | undefined {
  return (skillsData as Skill[]).find((s) => s.slug === slug);
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
