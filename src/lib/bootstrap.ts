import skillsData from "@/data/skills.json";
import mcpServersData from "@/data/mcp-servers.json";
import setupPresetsData from "@/data/setup-presets.json";

type HostPublicId = "openclaw" | "claude" | "cursor" | "custom";
type HostPresetId = "openclaw" | "claude-desktop" | "cursor" | "custom";

type SetupPreset = {
  id: HostPresetId;
  name: string;
  description: string;
  detectHints: string[];
  defaultSkills: string[];
  defaultMcpServers: string[];
  agentCapabilities: string[];
  bootstrapCommand: string;
};

type Skill = {
  slug: string;
  name: string;
  install_cmd: string;
};

type McpServer = {
  slug: string;
  name: string;
  install_cmd: string;
};

const HOST_TO_PRESET: Record<HostPublicId, HostPresetId> = {
  openclaw: "openclaw",
  claude: "claude-desktop",
  cursor: "cursor",
  custom: "custom",
};

const PRESET_TO_HOST: Record<HostPresetId, HostPublicId> = {
  openclaw: "openclaw",
  "claude-desktop": "claude",
  cursor: "cursor",
  custom: "custom",
};

const SKILL_ALIASES: Record<string, string> = {
  "memory-kit": "agent-memory-kit",
  "autonomy-kit": "agent-autonomy-kit",
  "team-kit": "agent-team-kit",
  "identity-kit": "agent-identity-kit",
};

const skills = skillsData as Skill[];
const mcpServers = mcpServersData as McpServer[];
const setupPresets = setupPresetsData as SetupPreset[];

function normalizeHost(hostRaw?: string | null): HostPublicId {
  const normalized = hostRaw?.trim().toLowerCase() ?? "openclaw";

  if (normalized === "claude-desktop") return "claude";
  if (normalized === "openclaw" || normalized === "claude" || normalized === "cursor" || normalized === "custom") {
    return normalized;
  }

  return "custom";
}

function resolveSkillSlug(skillIdOrSlug: string): string {
  if (skills.some((s) => s.slug === skillIdOrSlug)) return skillIdOrSlug;

  const alias = SKILL_ALIASES[skillIdOrSlug];
  if (alias) return alias;

  const prefixed = skillIdOrSlug.startsWith("agent-") ? skillIdOrSlug : `agent-${skillIdOrSlug}`;
  if (skills.some((s) => s.slug === prefixed)) return prefixed;

  return skillIdOrSlug;
}

function toConnectionString(slug: string, installCmd: string): string {
  return `mcp://${slug}?transport=stdio&command=${encodeURIComponent(installCmd)}`;
}

export type BootstrapPackage = {
  host: HostPublicId;
  skills: Array<{ slug: string; name: string; installCmd: string }>;
  mcpServers: Array<{ slug: string; name: string; connectionString: string }>;
  agentJsonTemplate: {
    name: string;
    version: string;
    role: string;
    capabilities: string[];
    host: HostPublicId;
    installedSkills: string[];
    mcpServers: string[];
  };
  setupSteps: string[];
  version: string;
};

export function buildBootstrapPackage(hostRaw?: string | null): BootstrapPackage {
  const host = normalizeHost(hostRaw);
  const presetId = HOST_TO_PRESET[host];
  const preset = setupPresets.find((p) => p.id === presetId) ?? setupPresets[0];

  const skillItems = (preset.defaultSkills || [])
    .map((skillId) => {
      const slug = resolveSkillSlug(skillId);
      const skill = skills.find((s) => s.slug === slug);
      if (!skill) return null;
      return {
        slug: skill.slug,
        name: skill.name,
        installCmd: skill.install_cmd,
      };
    })
    .filter((item): item is { slug: string; name: string; installCmd: string } => item !== null);

  const mcpItems = (preset.defaultMcpServers || [])
    .map((mcpSlug) => {
      const server = mcpServers.find((m) => m.slug === mcpSlug);
      if (!server) return null;
      return {
        slug: server.slug,
        name: server.name,
        connectionString: toConnectionString(server.slug, server.install_cmd),
      };
    })
    .filter((item): item is { slug: string; name: string; connectionString: string } => item !== null);

  const installedSkills = skillItems.map((s) => s.slug);
  const enabledMcpServers = mcpItems.map((m) => m.slug);

  return {
    host,
    skills: skillItems,
    mcpServers: mcpItems,
    agentJsonTemplate: {
      name: `foragents-${host}-agent`,
      version: "1.0.0",
      role: "generalist-agent",
      capabilities: preset.agentCapabilities || ["chat"],
      host,
      installedSkills,
      mcpServers: enabledMcpServers,
    },
    setupSteps: [
      `Select host preset: ${preset.name}`,
      ...skillItems.map((skill) => `Install ${skill.slug}: ${skill.installCmd}`),
      ...mcpItems.map((server) => `Register MCP server ${server.slug}: ${server.connectionString}`),
      "Write agent.json using the provided agentJsonTemplate.",
      `Verify setup: /api/bootstrap/verify?host=${host}&skills=${preset.defaultSkills.join(",")}`,
    ],
    version: "1.0.0",
  };
}

export function verifyBootstrapSetup(input: { hostRaw?: string | null; skillsRaw?: string | null }) {
  const host = normalizeHost(input.hostRaw);
  const presetId = HOST_TO_PRESET[host];
  const preset = setupPresets.find((p) => p.id === presetId) ?? setupPresets[0];

  const required = new Set((preset.defaultSkills || []).map((skill) => skill.toLowerCase()));
  const provided = new Set(
    (input.skillsRaw || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .map((s) => {
        if (Object.values(SKILL_ALIASES).includes(s)) {
          const aliased = Object.entries(SKILL_ALIASES).find(([, value]) => value === s);
          return aliased?.[0] ?? s;
        }
        return s;
      })
  );

  const missing = Array.from(required).filter((skill) => !provided.has(skill));
  const total = required.size || 1;
  const matched = total - missing.length;

  return {
    complete: missing.length === 0,
    missing,
    score: Math.round((matched / total) * 100),
  };
}

export function listBootstrapHosts(): HostPublicId[] {
  const hostSet = new Set<HostPublicId>();
  setupPresets.forEach((preset) => hostSet.add(PRESET_TO_HOST[preset.id] ?? "custom"));
  return Array.from(hostSet);
}
