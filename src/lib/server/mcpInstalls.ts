import "server-only";

import { promises as fs } from "fs";
import path from "path";

const MCP_INSTALLS_PATH = path.join(process.cwd(), "data", "mcp-installs.json");

export type McpInstallCounts = Record<string, number>;

export async function readMcpInstallCounts(): Promise<McpInstallCounts> {
  try {
    const raw = await fs.readFile(MCP_INSTALLS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const normalized: McpInstallCounts = {};
    for (const [slug, count] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof slug !== "string") continue;
      if (typeof count !== "number" || !Number.isFinite(count) || count < 0) continue;
      normalized[slug] = Math.floor(count);
    }

    return normalized;
  } catch {
    return {};
  }
}

async function writeMcpInstallCounts(counts: McpInstallCounts): Promise<void> {
  await fs.mkdir(path.dirname(MCP_INSTALLS_PATH), { recursive: true });
  await fs.writeFile(MCP_INSTALLS_PATH, JSON.stringify(counts, null, 2), "utf-8");
}

export async function getMcpInstalls(slug: string): Promise<number> {
  const counts = await readMcpInstallCounts();
  return counts[slug] ?? 0;
}

export async function incrementMcpInstalls(slug: string): Promise<number> {
  const counts = await readMcpInstallCounts();
  counts[slug] = (counts[slug] ?? 0) + 1;
  await writeMcpInstallCounts(counts);
  return counts[slug];
}
