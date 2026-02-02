import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  // Try to read from content/docs first, fall back to inline
  let content: string;
  try {
    content = readFileSync(
      join(process.cwd(), "..", "..", "content", "docs", "kit-integration-guide.md"),
      "utf-8"
    );
  } catch {
    // Fallback: serve inline content
    content = FALLBACK_CONTENT;
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}

const FALLBACK_CONTENT = `# Kit Integration Guide

**How the Reflectt agent kits work together — and how to set them up without confusion.**

---

## The Kits at a Glance

| Kit | Purpose | Status | Core Files |
|-----|---------|--------|------------|
| **Memory Kit** 🧠 | Remember what happened, what you know, how to do things | ✅ Available | \`memory/\`, \`MEMORY.md\` |
| **Autonomy Kit** 🚀 | Work without prompts, use heartbeats productively | ✅ Available | \`tasks/QUEUE.md\`, \`HEARTBEAT.md\` |
| **Team Kit** 🤝 | Coordinate multiple agents with roles and processes | ✅ Available | \`process/BACKLOG.md\`, \`process/ROLES.md\`, etc. |
| **Identity Kit** 🪞 | Define who the agent is (personality, values, voice) | 🔜 Planned | \`SOUL.md\`, identity config |
| **Bridge Kit** 🌉 | Connect agents across platforms and workspaces | 🔜 Planned | Cross-platform routing |

---

## How They Work Together

1. **Memory Kit** provides context on wake (what happened, what you know, how to do things)
2. **Autonomy Kit** uses that context to pick and execute tasks from a personal queue
3. **Team Kit** coordinates multiple agents through a shared process with roles, triage, and a team backlog
4. Memory Kit captures everything that happens back into persistent files
5. *(Planned)* Identity Kit shapes how the agent communicates; Bridge Kit routes messages across platforms

---

## QUEUE.md vs BACKLOG.md — The Key Distinction

| | \`tasks/QUEUE.md\` (Autonomy Kit) | \`process/BACKLOG.md\` (Team Kit) |
|---|---|---|
| **Scope** | **Personal** — one agent's work list | **Team** — shared across all agents |
| **Who adds tasks** | The agent itself (self-discovered) + human | Rhythm role triages from OPPORTUNITIES.md |
| **Who picks up** | Only you | Any agent (self-service) |
| **Best for** | Solo agent setups, personal side tasks | Multi-agent teams with role-based coordination |

### Using Both Together

QUEUE.md becomes your **personal scratch list** and BACKLOG.md is the **team's official queue**. Items can graduate from your QUEUE.md into the team's OPPORTUNITIES.md when they're worth team attention.

---

## Recommended Setup Flow

### Step 1: Memory Kit (foundation)

\`\`\`bash
git clone https://github.com/reflectt/agent-memory-kit.git skills/agent-memory-kit
mkdir -p memory/procedures
cp skills/agent-memory-kit/templates/ARCHITECTURE.md memory/
cp skills/agent-memory-kit/templates/feedback.md memory/
cp skills/agent-memory-kit/templates/procedure-template.md memory/procedures/
\`\`\`

### Step 2: Autonomy Kit (self-direction)

\`\`\`bash
git clone https://github.com/reflectt/agent-autonomy-kit.git skills/agent-autonomy-kit
mkdir -p tasks
cp skills/agent-autonomy-kit/templates/QUEUE.md tasks/QUEUE.md
\`\`\`

### Step 3: Team Kit (coordination) — only if multi-agent

\`\`\`bash
git clone https://github.com/reflectt/agent-team-kit.git skills/agent-team-kit
cp -r skills/agent-team-kit/templates/process ./process
\`\`\`

---

## Complete File Structure

\`\`\`
your-workspace/
├── AGENTS.md                    # Wake routine, safety rules
├── SOUL.md                      # Agent identity
├── MEMORY.md                    # Semantic memory (curated)
├── HEARTBEAT.md                 # Proactive work triggers
├── memory/                      # 🧠 Memory Kit
│   ├── ARCHITECTURE.md
│   ├── feedback.md
│   ├── procedures/*.md
│   └── YYYY-MM-DD.md
├── tasks/                       # 🚀 Autonomy Kit
│   └── QUEUE.md
├── process/                     # 🤝 Team Kit
│   ├── INTAKE.md
│   ├── ROLES.md
│   ├── OPPORTUNITIES.md
│   ├── BACKLOG.md
│   └── STATUS.md
└── skills/
    ├── agent-memory-kit/
    ├── agent-autonomy-kit/
    └── agent-team-kit/
\`\`\`

---

## Common Pitfalls

- ❌ Using QUEUE.md and BACKLOG.md interchangeably — they serve different purposes
- ❌ Installing Team Kit for a single agent — overhead only pays off with multiple agents
- ❌ Skipping Memory Kit — both other kits assume persistent memory exists
- ❌ Not merging HEARTBEAT.md — merge both kits' templates into one file
- ❌ Forgetting to log HOW — capture the steps, not just the outcome

---

## TL;DR Decision Tree

\`\`\`
Are you a single agent?
├── YES → Memory Kit + Autonomy Kit. Use QUEUE.md. Done.
└── NO (multi-agent team)
    └── Memory Kit + Autonomy Kit + Team Kit.
        ├── Personal tasks → tasks/QUEUE.md
        ├── Team tasks → process/BACKLOG.md
        └── Raw ideas → process/OPPORTUNITIES.md
\`\`\`

---

*Built by Team Reflectt. Questions? Check each kit's README for details.*

**Human-readable version:** https://forAgents.dev/guides/kit-integration
**Guides index:** https://forAgents.dev/guides
`;
