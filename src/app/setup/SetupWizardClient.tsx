/* eslint-disable react/no-unescaped-entities */
"use client";

import { useMemo, useState } from "react";

import presets from "@/data/setup-presets.json";
import mcpServers from "@/data/mcp-servers.json";
import { Button } from "@/components/ui/button";

type HostId = "openclaw" | "claude-desktop" | "cursor" | "custom";
type SkillId = "memory-kit" | "autonomy-kit" | "team-kit" | "identity-kit";

type SetupPreset = {
  id: HostId;
  name: string;
  description: string;
  detectHints: string[];
  defaultSkills: SkillId[];
  defaultMcpServers: string[];
  agentCapabilities: string[];
  bootstrapCommand: string;
};

type McpServer = {
  id: string;
  slug: string;
  name: string;
  description: string;
  install_cmd: string;
  featured?: boolean;
};

type IdentityConfig = {
  name: string;
  version: string;
  role: string;
  capabilities: string[];
};

type VerificationReport = {
  checks: Array<{ label: string; passed: boolean; detail: string }>;
  score: number;
};

const ALL_STEPS = [
  "Host Detection",
  "Essential Skills",
  "MCP Connections",
  "Identity",
  "Verification",
] as const;

const SKILL_OPTIONS: Array<{ id: SkillId; label: string; install: string; note: string }> = [
  {
    id: "memory-kit",
    label: "memory-kit",
    install: "npx -y @foragents/memory-kit",
    note: "Persistent memory patterns and session continuity.",
  },
  {
    id: "autonomy-kit",
    label: "autonomy-kit",
    install: "npx -y @foragents/autonomy-kit",
    note: "Reliable planning, execution loops, and safe delegation.",
  },
  {
    id: "team-kit",
    label: "team-kit",
    install: "npx -y @foragents/team-kit",
    note: "Shared conventions, handoff templates, and multi-agent coordination.",
  },
  {
    id: "identity-kit",
    label: "identity-kit",
    install: "npx -y @foragents/identity-kit",
    note: "Agent profile, voice, and capability declaration scaffolding.",
  },
];

const MCP_CHOICES = (mcpServers as McpServer[])
  .filter((server) => server.featured)
  .slice(0, 8);

const SETUP_PRESETS = presets as SetupPreset[];

function HostDetectionStep({
  selectedHost,
  onHostChange,
}: {
  selectedHost: HostId | null;
  onHostChange: (host: HostId) => void;
}) {
  const detectedHint = useMemo(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return "Auto-detect hint: host detection runs after the page loads.";
    }

    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();

    if (userAgent.includes("openclaw") || window.location.hostname.includes("openclaw")) {
      return "Auto-detect hint: this looks like OpenClaw.";
    }

    if (userAgent.includes("claude") || userAgent.includes("anthropic")) {
      return "Auto-detect hint: Claude tooling signatures found.";
    }

    if (userAgent.includes("cursor") || platform.includes("macintel")) {
      return "Auto-detect hint: Cursor-like desktop environment likely.";
    }

    return "Auto-detect hint: no direct host signature found — use Custom if unsure.";
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{detectedHint}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {SETUP_PRESETS.map((preset) => {
          const active = selectedHost === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onHostChange(preset.id)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                active
                  ? "border-[#06D6A0]/60 bg-[#06D6A0]/10"
                  : "border-white/10 bg-black/20 hover:bg-black/30"
              }`}
            >
              <div className="font-semibold">{preset.name}</div>
              <p className="mt-2 text-sm text-muted-foreground">{preset.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SkillsChecklistStep({
  selectedSkills,
  defaultSkills,
  onSkillsChange,
}: {
  selectedSkills: SkillId[];
  defaultSkills: SkillId[];
  onSkillsChange: (skills: SkillId[]) => void;
}) {
  const [localSkills, setLocalSkills] = useState<SkillId[]>(
    selectedSkills.length ? selectedSkills : defaultSkills
  );

  const toggleSkill = (skillId: SkillId) => {
    const nextSkills = localSkills.includes(skillId)
      ? localSkills.filter((id) => id !== skillId)
      : [...localSkills, skillId];
    setLocalSkills(nextSkills);
    onSkillsChange(nextSkills);
  };

  return (
    <div className="space-y-4">
      {SKILL_OPTIONS.map((skill) => {
        const checked = localSkills.includes(skill.id);
        return (
          <label
            key={skill.id}
            className="block rounded-xl border border-white/10 bg-black/20 p-4 hover:bg-black/30"
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleSkill(skill.id)}
                className="mt-1"
              />
              <div>
                <div className="font-semibold">{skill.label}</div>
                <p className="text-sm text-muted-foreground">{skill.note}</p>
                <code className="mt-2 block rounded bg-black/40 px-2 py-1 text-xs text-[#06D6A0]">
                  {skill.install}
                </code>
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}

function McpConnectionsStep({
  selectedMcp,
  defaultMcp,
  onMcpChange,
}: {
  selectedMcp: string[];
  defaultMcp: string[];
  onMcpChange: (servers: string[]) => void;
}) {
  const [localMcp, setLocalMcp] = useState<string[]>(selectedMcp.length ? selectedMcp : defaultMcp);

  const toggleMcp = (slug: string) => {
    const nextMcp = localMcp.includes(slug)
      ? localMcp.filter((item) => item !== slug)
      : [...localMcp, slug];
    setLocalMcp(nextMcp);
    onMcpChange(nextMcp);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Pick from the /mcp hub featured servers. Connection strings are generated from each server's install command.
      </p>
      <div className="space-y-3">
        {MCP_CHOICES.map((server) => {
          const checked = localMcp.includes(server.slug);
          const connectionString = `mcp://${server.slug}?transport=stdio&command=${encodeURIComponent(server.install_cmd)}`;

          return (
            <label key={server.id} className="block rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleMcp(server.slug)}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{server.name}</div>
                  <p className="text-sm text-muted-foreground">{server.description}</p>
                  <code className="mt-2 block overflow-x-auto rounded bg-black/40 px-2 py-1 text-xs text-[#06D6A0]">
                    {connectionString}
                  </code>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function IdentitySetupStep({
  identity,
  hostCapabilities,
  onIdentityChange,
}: {
  identity: IdentityConfig;
  hostCapabilities: string[];
  onIdentityChange: (identity: IdentityConfig) => void;
}) {
  const [localIdentity, setLocalIdentity] = useState<IdentityConfig>(identity);

  const updateIdentity = (nextIdentity: IdentityConfig) => {
    setLocalIdentity(nextIdentity);
    onIdentityChange(nextIdentity);
  };

  const agentJsonPreview = useMemo(
    () =>
      JSON.stringify(
        {
          name: localIdentity.name,
          version: localIdentity.version,
          role: localIdentity.role,
          capabilities: localIdentity.capabilities,
        },
        null,
        2
      ),
    [localIdentity]
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-muted-foreground">Agent Name</span>
          <input
            value={localIdentity.name}
            onChange={(e) => updateIdentity({ ...localIdentity, name: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-muted-foreground">Version</span>
          <input
            value={localIdentity.version}
            onChange={(e) => updateIdentity({ ...localIdentity, version: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2"
          />
        </label>
      </div>

      <label className="text-sm block">
        <span className="mb-1 block text-muted-foreground">Role</span>
        <input
          value={localIdentity.role}
          onChange={(e) => updateIdentity({ ...localIdentity, role: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2"
        />
      </label>

      <div>
        <div className="mb-2 text-sm text-muted-foreground">Capabilities</div>
        <div className="flex flex-wrap gap-2">
          {hostCapabilities.map((capability) => {
            const checked = localIdentity.capabilities.includes(capability);
            return (
              <button
                key={capability}
                type="button"
                onClick={() =>
                  updateIdentity({
                    ...localIdentity,
                    capabilities: checked
                      ? localIdentity.capabilities.filter((item) => item !== capability)
                      : [...localIdentity.capabilities, capability],
                  })
                }
                className={`rounded-lg border px-3 py-1 text-sm ${
                  checked
                    ? "border-[#06D6A0]/60 bg-[#06D6A0]/10 text-[#06D6A0]"
                    : "border-white/10 bg-black/20"
                }`}
              >
                {capability}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm text-muted-foreground">Generated agent.json template</div>
        <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs">
          <code>{agentJsonPreview}</code>
        </pre>
      </div>
    </div>
  );
}

function VerificationStep({ report }: { report: VerificationReport }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="text-sm text-muted-foreground">Readiness Score</div>
        <div className="text-4xl font-bold text-[#06D6A0]">{report.score}%</div>
      </div>

      <div className="space-y-2">
        {report.checks.map((check) => (
          <div key={check.label} className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="flex items-center justify-between text-sm">
              <span>{check.label}</span>
              <span className={check.passed ? "text-emerald-400" : "text-amber-400"}>
                {check.passed ? "PASS" : "ACTION NEEDED"}
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{check.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function copyText(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    void navigator.clipboard.writeText(text);
  }
}

export default function SetupWizardClient() {
  const [step, setStep] = useState(1);
  const [host, setHost] = useState<HostId | null>(null);
  const [skills, setSkills] = useState<SkillId[]>([]);
  const [mcpSelection, setMcpSelection] = useState<string[]>([]);
  const [identity, setIdentity] = useState<IdentityConfig>({
    name: "Agent Nova",
    version: "1.0.0",
    role: "generalist-agent",
    capabilities: ["chat"],
  });

  const selectedPreset = useMemo(
    () => SETUP_PRESETS.find((preset) => preset.id === host) ?? null,
    [host]
  );

  const handleHostChange = (nextHost: HostId) => {
    const preset = SETUP_PRESETS.find((item) => item.id === nextHost);
    setHost(nextHost);
    if (!preset) return;
    setSkills(preset.defaultSkills);
    setMcpSelection(preset.defaultMcpServers);
    setIdentity((prev) => ({
      ...prev,
      capabilities: preset.agentCapabilities,
    }));
  };

  const progress = (step / ALL_STEPS.length) * 100;

  const verification = useMemo<VerificationReport>(() => {
    const checks = [
      {
        label: "Host selected",
        passed: Boolean(host),
        detail: host ? `Using ${selectedPreset?.name}` : "Pick your runtime host",
      },
      {
        label: "Essential skills installed",
        passed: skills.length >= 3,
        detail: `${skills.length}/4 selected`,
      },
      {
        label: "MCP servers connected",
        passed: mcpSelection.length >= 1,
        detail: mcpSelection.length ? mcpSelection.join(", ") : "Select at least one MCP server",
      },
      {
        label: "Identity configured",
        passed: Boolean(identity.name && identity.capabilities.length),
        detail: identity.name ? `${identity.name} ready` : "Provide agent name and capabilities",
      },
    ];

    const passedCount = checks.filter((check) => check.passed).length;
    return {
      checks,
      score: Math.round((passedCount / checks.length) * 100),
    };
  }, [host, identity.capabilities.length, identity.name, mcpSelection, selectedPreset?.name, skills.length]);

  const fullSetupScript = useMemo(() => {
    const chosenHost = selectedPreset?.id ?? "custom";
    const skillInstalls = SKILL_OPTIONS.filter((skill) => skills.includes(skill.id)).map((skill) => skill.install);
    const mcpConfig = MCP_CHOICES.filter((server) => mcpSelection.includes(server.slug)).map((server) => ({
      slug: server.slug,
      connection: `mcp://${server.slug}?transport=stdio&command=${encodeURIComponent(server.install_cmd)}`,
    }));

    const identityJson = JSON.stringify(
      {
        name: identity.name,
        version: identity.version,
        role: identity.role,
        capabilities: identity.capabilities,
      },
      null,
      2
    );

    return [
      "# forAgents.dev setup export",
      `export FORAGENTS_HOST=${chosenHost}`,
      "",
      "# Install essential skills",
      ...skillInstalls,
      "",
      "# Register MCP servers",
      ...mcpConfig.map((item) => `echo '${item.connection}'`),
      "",
      "# Write agent identity",
      "cat <<'JSON' > agent.json",
      identityJson,
      "JSON",
      "",
      "echo 'Setup complete ✅'",
    ].join("\n");
  }, [identity, mcpSelection, selectedPreset?.id, skills]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold">Agent Environment Setup Wizard</h1>
        <p className="mt-3 text-muted-foreground max-w-3xl">
          Configure your environment in 5 steps: detect host, install essential kits, connect MCP servers, set
          identity, and verify readiness.
        </p>

        <div className="mt-8 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Step {step} of {ALL_STEPS.length}
            </span>
            <span>{ALL_STEPS[step - 1]}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-[#06D6A0]" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
          {step === 1 && <HostDetectionStep selectedHost={host} onHostChange={handleHostChange} />}
          {step === 2 && (
            <SkillsChecklistStep
              selectedSkills={skills}
              defaultSkills={selectedPreset?.defaultSkills ?? []}
              onSkillsChange={setSkills}
            />
          )}
          {step === 3 && (
            <McpConnectionsStep
              selectedMcp={mcpSelection}
              defaultMcp={selectedPreset?.defaultMcpServers ?? []}
              onMcpChange={setMcpSelection}
            />
          )}
          {step === 4 && (
            <IdentitySetupStep
              identity={identity}
              hostCapabilities={selectedPreset?.agentCapabilities ?? ["chat"]}
              onIdentityChange={setIdentity}
            />
          )}
          {step === 5 && <VerificationStep report={verification} />}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <Button variant="outline" onClick={() => setStep((prev) => Math.max(1, prev - 1))} disabled={step === 1}>
            Back
          </Button>
          <Button onClick={() => setStep((prev) => Math.min(ALL_STEPS.length, prev + 1))} disabled={step === ALL_STEPS.length}>
            Next
          </Button>
        </div>

        {step === ALL_STEPS.length && (
          <div className="mt-6 rounded-xl border border-[#06D6A0]/30 bg-[#06D6A0]/5 p-4">
            <div className="mb-2 text-sm font-semibold text-[#06D6A0]">Full Config Script</div>
            <pre className="max-h-80 overflow-auto rounded bg-black/40 p-3 text-xs">
              <code>{fullSetupScript}</code>
            </pre>
            <div className="mt-3">
              <Button className="bg-[#06D6A0] text-black hover:bg-[#06D6A0]/90" onClick={() => copyText(fullSetupScript)}>
                Copy full config
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
