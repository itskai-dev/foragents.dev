import "server-only";

import { promises as fs } from "fs";
import path from "path";

export type AgentProfileRecord = {
  handle: string; // route param (no leading @)
  domain: string;
  name: string;
  bio: string;
  installedSkills: string[];
  stackTitle?: string;
};

const AGENT_PROFILES_PATH = path.join(process.cwd(), "data", "agent-profiles.json");

async function readAgentProfilesFile(): Promise<AgentProfileRecord[]> {
  try {
    const raw = await fs.readFile(AGENT_PROFILES_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as AgentProfileRecord[];
  } catch {
    return [];
  }
}

export async function listAgentProfiles(): Promise<AgentProfileRecord[]> {
  const rows = await readAgentProfilesFile();
  // normalize + stable sort
  return rows
    .filter((r) => r && typeof r.handle === "string" && typeof r.domain === "string")
    .map((r) => ({
      ...r,
      handle: String(r.handle).trim().toLowerCase(),
      domain: String(r.domain).trim().toLowerCase(),
      name: String(r.name ?? r.handle).trim(),
      bio: String(r.bio ?? "").trim(),
      installedSkills: Array.isArray(r.installedSkills) ? r.installedSkills.filter(Boolean) : [],
      stackTitle: typeof r.stackTitle === "string" ? r.stackTitle.trim() : undefined,
    }))
    .sort((a, b) => a.handle.localeCompare(b.handle));
}

export async function getAgentProfileByHandle(handle: string): Promise<AgentProfileRecord | null> {
  const clean = (handle ?? "").trim().toLowerCase().replace(/^@/, "");
  if (!clean) return null;
  const all = await listAgentProfiles();
  return all.find((p) => p.handle === clean) ?? null;
}
