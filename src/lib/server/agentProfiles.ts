import "server-only";

import { promises as fs } from "fs";
import path from "path";

export type HostPlatform = "openclaw" | "claude" | "cursor";

export type AgentProfileRecord = {
  id: string;
  handle: string; // route param (no leading @)
  name: string;
  description: string;
  capabilities: string[];
  hostPlatform: HostPlatform | string;
  agentJsonUrl?: string;
  createdAt: string;
  trustScore: number;

  // Legacy compatibility fields used by existing pages/features
  domain?: string;
  bio?: string;
  installedSkills?: string[];
  stackTitle?: string;
};

export type CreateAgentProfileInput = {
  handle: string;
  name: string;
  description: string;
  capabilities: string[];
  hostPlatform: HostPlatform | string;
  agentJsonUrl?: string;
};

export type AgentListOptions = {
  search?: string;
  platform?: string;
  sort?: "recent" | "trust";
};

const AGENT_PROFILES_PATH = path.join(process.cwd(), "data", "agent-profiles.json");

function normalizeHandle(handle: string): string {
  return String(handle ?? "")
    .trim()
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "");
}

function toISOStringOrEpoch(input: unknown): string {
  const value = typeof input === "string" ? input : "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date(0).toISOString();
  return date.toISOString();
}

function normalizeRecord(row: Partial<AgentProfileRecord>): AgentProfileRecord {
  const handle = normalizeHandle(row.handle ?? "");
  const name = String(row.name ?? handle).trim();
  const description = String(row.description ?? row.bio ?? "").trim();

  const capabilities = Array.isArray(row.capabilities)
    ? row.capabilities.filter((c): c is string => typeof c === "string" && c.trim().length > 0)
    : Array.isArray(row.installedSkills)
      ? row.installedSkills.filter((c): c is string => typeof c === "string" && c.trim().length > 0)
      : [];

  const hostPlatform = String(row.hostPlatform ?? "openclaw").trim().toLowerCase();
  const createdAt = toISOStringOrEpoch(row.createdAt);
  const trustScore = typeof row.trustScore === "number" && Number.isFinite(row.trustScore) ? row.trustScore : 0;

  return {
    id: String(row.id ?? `agent_${handle || "unknown"}`),
    handle,
    name,
    description,
    capabilities,
    hostPlatform,
    ...(typeof row.agentJsonUrl === "string" && row.agentJsonUrl.trim()
      ? { agentJsonUrl: row.agentJsonUrl.trim() }
      : {}),
    createdAt,
    trustScore,

    ...(typeof row.domain === "string" && row.domain.trim() ? { domain: row.domain.trim().toLowerCase() } : {}),
    ...(typeof row.bio === "string" && row.bio.trim() ? { bio: row.bio.trim() } : {}),
    ...(Array.isArray(row.installedSkills) ? { installedSkills: row.installedSkills.filter(Boolean) } : {}),
    ...(typeof row.stackTitle === "string" && row.stackTitle.trim() ? { stackTitle: row.stackTitle.trim() } : {}),
  };
}

async function readAgentProfilesFile(): Promise<AgentProfileRecord[]> {
  try {
    const raw = await fs.readFile(AGENT_PROFILES_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((row) => normalizeRecord((row ?? {}) as Partial<AgentProfileRecord>))
      .filter((row) => row.handle.length > 0 && row.name.length > 0);
  } catch {
    return [];
  }
}

async function writeAgentProfilesFile(rows: AgentProfileRecord[]): Promise<void> {
  await fs.writeFile(AGENT_PROFILES_PATH, `${JSON.stringify(rows, null, 2)}\n`, "utf-8");
}

export async function listAgentProfiles(options: AgentListOptions = {}): Promise<AgentProfileRecord[]> {
  const rows = await readAgentProfilesFile();
  const search = String(options.search ?? "").trim().toLowerCase();
  const platform = String(options.platform ?? "").trim().toLowerCase();
  const sort = options.sort === "trust" ? "trust" : "recent";

  let result = rows;

  if (search) {
    result = result.filter((row) => `${row.name} ${row.description}`.toLowerCase().includes(search));
  }

  if (platform) {
    result = result.filter((row) => String(row.hostPlatform).toLowerCase() === platform);
  }

  result = [...result].sort((a, b) => {
    if (sort === "trust") {
      if (b.trustScore !== a.trustScore) return b.trustScore - a.trustScore;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return result;
}

export async function getAgentProfileByHandle(handle: string): Promise<AgentProfileRecord | null> {
  const clean = normalizeHandle(handle);
  if (!clean) return null;

  const all = await readAgentProfilesFile();
  return all.find((p) => p.handle === clean) ?? null;
}

export async function createAgentProfile(input: CreateAgentProfileInput): Promise<AgentProfileRecord> {
  const rows = await readAgentProfilesFile();

  const handle = normalizeHandle(input.handle);
  const name = String(input.name ?? "").trim();
  const description = String(input.description ?? "").trim();
  const capabilities = Array.isArray(input.capabilities)
    ? input.capabilities.filter((c): c is string => typeof c === "string" && c.trim().length > 0)
    : [];
  const hostPlatform = String(input.hostPlatform ?? "").trim().toLowerCase();

  if (!handle) throw new Error("handle is required");
  if (!name) throw new Error("name is required");
  if (!description) throw new Error("description is required");
  if (!hostPlatform) throw new Error("hostPlatform is required");
  if (!Array.isArray(input.capabilities)) throw new Error("capabilities must be an array");

  const exists = rows.some((row) => row.handle.toLowerCase() === handle.toLowerCase());
  if (exists) throw new Error("handle already exists");

  const now = new Date().toISOString();
  const created: AgentProfileRecord = normalizeRecord({
    id: `agent_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    handle,
    name,
    description,
    capabilities,
    hostPlatform,
    ...(typeof input.agentJsonUrl === "string" && input.agentJsonUrl.trim()
      ? { agentJsonUrl: input.agentJsonUrl.trim() }
      : {}),
    createdAt: now,
    trustScore: 0,

    // Keep legacy fields in sync where useful
    bio: description,
    installedSkills: capabilities,
  });

  rows.push(created);
  await writeAgentProfilesFile(rows);

  return created;
}
