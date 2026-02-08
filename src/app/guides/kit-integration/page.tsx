import Link from "next/link";

export const metadata = {
  title: "Kit Integration Guide — forAgents.dev",
  description:
    "How the Reflectt agent kits work together — Memory, Autonomy, Team — and how to set them up.",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mt-0 mb-4">{title}</h2>
      {children}
    </section>
  );
}

export default function KitIntegrationGuidePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-invert prose-cyan">
        <div className="mb-4">
          <Link
            href="/guides"
            className="text-sm text-muted-foreground hover:text-cyan transition-colors no-underline"
          >
            ← Back to Guides
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-2">Kit Integration Guide</h1>
        <p className="text-xl text-muted-foreground mb-8">
          How the Reflectt agent kits work together — and how to set them up
          without confusion.
        </p>

        <div className="not-prose p-4 rounded-lg bg-card border border-white/10 mb-8 font-mono text-xs text-muted-foreground">
          Agent-readable version:{" "}
          <a href="/api/guides/integration.md" className="text-cyan hover:underline">
            GET /api/guides/integration.md
          </a>
        </div>

        {/* Kits at a Glance */}
        <Section title="The Kits at a Glance">
          <div className="not-prose grid gap-3">
            {[
              {
                emoji: "🧠",
                name: "Memory Kit",
                purpose: "Remember what happened, what you know, how to do things",
                status: "Available",
                statusColor: "text-[#06D6A0]",
                files: "memory/, MEMORY.md",
              },
              {
                emoji: "🚀",
                name: "Autonomy Kit",
                purpose: "Work without prompts, use heartbeats productively",
                status: "Available",
                statusColor: "text-[#06D6A0]",
                files: "tasks/QUEUE.md, HEARTBEAT.md",
              },
              {
                emoji: "🤝",
                name: "Team Kit",
                purpose: "Coordinate multiple agents with roles and processes",
                status: "Available",
                statusColor: "text-[#06D6A0]",
                files: "process/BACKLOG.md, process/ROLES.md",
              },
              {
                emoji: "🪞",
                name: "Identity Kit",
                purpose: "Define who the agent is (personality, values, voice)",
                status: "Planned",
                statusColor: "text-[#F59E0B]",
                files: "SOUL.md, identity config",
              },
              {
                emoji: "🌉",
                name: "Bridge Kit",
                purpose: "Connect agents across platforms and workspaces",
                status: "Planned",
                statusColor: "text-[#F59E0B]",
                files: "Cross-platform routing",
              },
            ].map((kit) => (
              <div
                key={kit.name}
                className="rounded-lg border border-[#1A1F2E] bg-card/50 p-4"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[#F8FAFC]">
                    {kit.emoji} {kit.name}
                  </span>
                  <span
                    className={`font-mono text-[11px] font-bold uppercase tracking-[0.08em] ${kit.statusColor}`}
                  >
                    {kit.status}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 mb-1">{kit.purpose}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {kit.files}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* How They Work Together */}
        <Section title="How They Work Together">
          <pre className="bg-card border border-white/10 rounded-lg p-4 overflow-x-auto text-xs leading-relaxed">
{`┌─────────────────────────────────────────────────────┐
│                   AGENT WORKSPACE                   │
│                                                     │
│  Identity Kit ─── WHO AM I? ──────► Bridge Kit      │
│       │                            (cross-platform) │
│       │ personality & voice              │           │
│       ▼                                  ▼           │
│  Memory Kit ◀──────────────┐   Discord / Slack /... │
│  (memory/, MEMORY.md)      │                        │
│       │                    │                        │
│  context & procedures      │                        │
│       │                    │                        │
│       ▼                    │                        │
│  Autonomy Kit ─────────────┤                        │
│  (tasks/QUEUE.md)          │                        │
│       │                    │                        │
│  heartbeat triggers        │                        │
│       │                    │                        │
│       ▼                    │                        │
│  Team Kit ─── completes ───┘                        │
│  (process/BACKLOG.md)                               │
└─────────────────────────────────────────────────────┘`}
          </pre>
          <ol>
            <li>
              <strong>Memory Kit</strong> provides context on wake (what
              happened, what you know, how to do things)
            </li>
            <li>
              <strong>Autonomy Kit</strong> uses that context to pick and execute
              tasks from a personal queue
            </li>
            <li>
              <strong>Team Kit</strong> coordinates multiple agents through a
              shared process with roles, triage, and a team backlog
            </li>
            <li>
              Memory Kit captures everything that happens back into persistent
              files
            </li>
          </ol>
        </Section>

        {/* QUEUE.md vs BACKLOG.md */}
        <Section title="QUEUE.md vs BACKLOG.md — The Key Distinction">
          <p>This is the overlap that causes confusion. Here&apos;s the clear rule:</p>
          <div className="not-prose grid gap-3 md:grid-cols-2 mb-6">
            <div className="rounded-lg border border-[#1A1F2E] bg-card/50 p-4">
              <h4 className="font-semibold text-[#F8FAFC] mb-2 font-mono text-sm">
                tasks/QUEUE.md
              </h4>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Autonomy Kit — Personal
              </p>
              <ul className="text-sm text-foreground/80 space-y-1 list-disc list-inside">
                <li>One agent&apos;s work list</li>
                <li>Added by the agent itself + human</li>
                <li>Only you pick up tasks</li>
                <li>No formal triage</li>
              </ul>
            </div>
            <div className="rounded-lg border border-[#1A1F2E] bg-card/50 p-4">
              <h4 className="font-semibold text-[#F8FAFC] mb-2 font-mono text-sm">
                process/BACKLOG.md
              </h4>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Team Kit — Shared
              </p>
              <ul className="text-sm text-foreground/80 space-y-1 list-disc list-inside">
                <li>Shared across all agents</li>
                <li>Rhythm role triages from OPPORTUNITIES</li>
                <li>Any agent can pick up</li>
                <li>Full lifecycle with feedback</li>
              </ul>
            </div>
          </div>

          <p>
            <strong>Using both together:</strong> QUEUE.md becomes your personal
            scratch list; BACKLOG.md is the team&apos;s official queue. Items can
            graduate from QUEUE.md into OPPORTUNITIES.md when they&apos;re worth team
            attention.
          </p>
        </Section>

        {/* Setup Flow */}
        <Section title="Recommended Setup Flow">
          <p>
            Install in this order — each kit builds on the previous one.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-3">
            Step 1: Memory Kit (foundation)
          </h3>
          <p>Everything else depends on persistent memory.</p>
          <pre className="bg-card border border-white/10 rounded-lg p-4 overflow-x-auto text-sm">
{`git clone https://github.com/reflectt/agent-memory-kit.git skills/agent-memory-kit
mkdir -p memory/procedures
cp skills/agent-memory-kit/templates/ARCHITECTURE.md memory/
cp skills/agent-memory-kit/templates/feedback.md memory/
cp skills/agent-memory-kit/templates/procedure-template.md memory/procedures/`}
          </pre>

          <h3 className="text-xl font-bold mt-8 mb-3">
            Step 2: Autonomy Kit (self-direction)
          </h3>
          <p>Now your agent can work between prompts.</p>
          <pre className="bg-card border border-white/10 rounded-lg p-4 overflow-x-auto text-sm">
{`git clone https://github.com/reflectt/agent-autonomy-kit.git skills/agent-autonomy-kit
mkdir -p tasks
cp skills/agent-autonomy-kit/templates/QUEUE.md tasks/QUEUE.md`}
          </pre>

          <h3 className="text-xl font-bold mt-8 mb-3">
            Step 3: Team Kit (coordination) — only if multi-agent
          </h3>
          <pre className="bg-card border border-white/10 rounded-lg p-4 overflow-x-auto text-sm">
{`git clone https://github.com/reflectt/agent-team-kit.git skills/agent-team-kit
cp -r skills/agent-team-kit/templates/process ./process`}
          </pre>
        </Section>

        {/* File Structure */}
        <Section title="Complete File Structure">
          <pre className="bg-card border border-white/10 rounded-lg p-4 overflow-x-auto text-sm">
{`your-workspace/
├── AGENTS.md                    # Wake routine, safety rules
├── SOUL.md                      # Agent identity
├── MEMORY.md                    # Semantic memory (curated)
├── HEARTBEAT.md                 # Proactive work triggers
│
├── memory/                      # 🧠 Memory Kit
│   ├── ARCHITECTURE.md
│   ├── feedback.md
│   ├── procedures/*.md
│   └── YYYY-MM-DD.md            # Daily logs
│
├── tasks/                       # 🚀 Autonomy Kit
│   └── QUEUE.md
│
├── process/                     # 🤝 Team Kit
│   ├── INTAKE.md
│   ├── ROLES.md
│   ├── OPPORTUNITIES.md
│   ├── BACKLOG.md
│   └── STATUS.md
│
└── skills/                      # Kit source
    ├── agent-memory-kit/
    ├── agent-autonomy-kit/
    └── agent-team-kit/`}
          </pre>
        </Section>

        {/* Common Pitfalls */}
        <Section title="Common Pitfalls">
          <div className="not-prose grid gap-3">
            {[
              {
                title: "Using QUEUE.md and BACKLOG.md interchangeably",
                desc: "They serve different purposes. QUEUE.md = personal. BACKLOG.md = team.",
              },
              {
                title: "Installing Team Kit for a single agent",
                desc: "The overhead only pays off with multiple agents. Solo agents: Memory + Autonomy.",
              },
              {
                title: "Skipping Memory Kit",
                desc: "Both Autonomy and Team Kits assume persistent memory exists. Without it, agents lose context.",
              },
              {
                title: "Not merging HEARTBEAT.md",
                desc: "Both kits include heartbeat templates. Merge them into one file with sections for both.",
              },
              {
                title: "Forgetting to log HOW",
                desc: 'Capture the steps, not just the outcome. "Deployed the thing" is useless.',
              },
            ].map((pitfall) => (
              <div
                key={pitfall.title}
                className="rounded-lg border border-[#1A1F2E] bg-card/50 p-4"
              >
                <p className="font-semibold text-[#EC4899] text-sm mb-1">
                  ❌ {pitfall.title}
                </p>
                <p className="text-sm text-foreground/80">{pitfall.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Decision Tree */}
        <Section title="TL;DR Decision Tree">
          <pre className="bg-card border border-white/10 rounded-lg p-4 overflow-x-auto text-sm">
{`Are you a single agent?
├── YES → Memory Kit + Autonomy Kit. Use QUEUE.md. Done.
└── NO (multi-agent team)
    └── Memory Kit + Autonomy Kit + Team Kit.
        ├── Personal tasks → tasks/QUEUE.md
        ├── Team tasks → process/BACKLOG.md
        └── Raw ideas → process/OPPORTUNITIES.md`}
          </pre>
        </Section>

        <hr className="border-white/10 my-8" />

        <p className="text-sm text-muted-foreground italic">
          Built by Team Reflectt. Check each kit&apos;s README for details.
        </p>
      </article>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Built by</span>
            <a
              href="https://reflectt.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="aurora-text font-semibold hover:opacity-80 transition-opacity"
            >
              Team Reflectt
            </a>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <a href="/llms.txt" className="hover:text-cyan transition-colors">
              llms.txt
            </a>
            <a
              href="/api/feed.md"
              className="hover:text-cyan transition-colors"
            >
              feed.md
            </a>
            <a
              href="https://github.com/reflectt"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
