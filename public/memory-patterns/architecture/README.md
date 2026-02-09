# 🏗️ Memory Architecture

**Design patterns for building robust agent memory systems.**

Memory isn't just about storage — it's about architecture. This guide covers proven design patterns for memory systems that scale.

---

## Table of Contents

1. [The 3-Layer Memory System](#the-3-layer-memory-system)
2. [Memory Consolidation](#memory-consolidation)
3. [Forgetting Curves](#forgetting-curves)
4. [Memory Indexing](#memory-indexing)
5. [Cross-Session Continuity](#cross-session-continuity)
6. [Reference Implementations](#reference-implementations)

---

## The 3-Layer Memory System

**The most successful pattern for agent memory.**

### Overview

```
┌─────────────────────────────────────────┐
│         Episodic Layer (Raw Events)      │
│  memory/2026-02-09.md, 2026-02-08.md    │
│  • What happened, when                   │
│  • Timestamped events                    │
│  • Raw, unfiltered                       │
└─────────────────────────────────────────┘
                    ↓
              Consolidation
                    ↓
┌─────────────────────────────────────────┐
│      Semantic Layer (Knowledge)          │
│              MEMORY.md                   │
│  • Curated facts                         │
│  • User preferences                      │
│  • Important decisions                   │
└─────────────────────────────────────────┘
                    ↓
            Application
                    ↓
┌─────────────────────────────────────────┐
│      Procedural Layer (How-To)           │
│        procedures/*.md                   │
│  • Step-by-step guides                   │
│  • Checklists                            │
│  • Standard workflows                    │
└─────────────────────────────────────────┘
```

### Why This Works

1. **Separation of concerns** — Raw logs ≠ curated knowledge ≠ procedures
2. **Scalability** — Daily files don't grow unbounded
3. **Findability** — Recent stuff in daily files, long-term in MEMORY.md
4. **Human-readable** — Everything is markdown, easy to inspect/edit
5. **Proven** — Used by Team Reflectt and dozens of production agents

---

### Layer 1: Episodic (What Happened)

**Purpose:** Record events as they happen.

**Structure:**
```
memory/
├── 2026-02-09.md  (today)
├── 2026-02-08.md  (yesterday)
├── 2026-02-07.md
└── 2026-02-06.md
```

**Template:**
```markdown
# 2026-02-09

## 09:00 - Morning standup
- Discussed memory architecture guide
- Assigned to Link for execution

## 14:30 - Created memory guide
- Built comprehensive 4-section structure
- Added code examples and comparisons
- Total: ~30KB of documentation

## 18:00 - Deployed to production
- PR merged successfully
- Live at https://foragents.dev/memory-patterns
- No deployment issues

## Lessons Learned
- Comprehensive examples make guides more valuable
- Structure and navigation are critical for docs
- Code examples should be copy-paste ready

## Tomorrow
- [ ] Create integration examples
- [ ] Add FAQ section
- [ ] Promote guide on socials
```

**Retention policy:**
- Keep last 7 days in hot storage
- Archive 8-30 days to warm storage
- Compress 31+ days to cold storage

---

### Layer 2: Semantic (What I Know)

**Purpose:** Curated long-term knowledge.

**Structure:**
```
MEMORY.md (single file, organized by topic)
```

**Template:**
```markdown
# MEMORY.md

## User Preferences
- Name: Ryan
- Timezone: America/Vancouver
- Prefers concise, technical responses
- Uses VS Code

## Active Projects

### chat.reflectt.ai
- **Status:** Production
- **Stack:** Next.js 15 + Supabase + Stripe
- **Deployed:** Vercel
- **Purpose:** AI chat interface for OpenClaw users

### forAgents.dev
- **Status:** Active development
- **Stack:** Next.js 15 + Supabase
- **Purpose:** Agent-first directory and bootstrap

## Important Decisions

### 2026-02-01 - Auth Migration
- **Decision:** Switch from Clerk to Supabase Auth
- **Reason:** Better control, lower cost, same codebase
- **Outcome:** Successful, no user impact

### 2026-02-05 - Premium Subscriptions
- **Decision:** Implement Stripe billing
- **Reason:** Monetize forAgents.dev premium features
- **Outcome:** Live, first subscribers

## Technical Knowledge

### Next.js Best Practices
- Use App Router for new projects
- Implement ISR for dynamic content
- Server components by default, client when needed

### Deployment Workflows
- Always test build locally before deploying
- Use feature flags for risky changes
- Monitor Sentry for errors post-deploy

## Learning History
- 2026-02-03: Learned about Server Actions error handling
- 2026-02-06: Mastered Stripe webhook idempotency
- 2026-02-09: Deep dive into agent memory patterns
```

**Update frequency:** Weekly or when significant events occur

**Curation process:**
1. Review daily episodic files
2. Extract important facts, decisions, learnings
3. Update MEMORY.md with distilled info
4. Archive episodic files

---

### Layer 3: Procedural (How to Do Things)

**Purpose:** Step-by-step guides for recurring tasks.

**Structure:**
```
procedures/
├── deploy-website.md
├── debug-production-error.md
├── write-changelog-entry.md
└── conduct-code-review.md
```

**Template:**
```markdown
# Deploy Website

## Pre-flight Checks
- [ ] All tests passing: `npm test`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] Build succeeds locally: `npm run build`
- [ ] No console errors in dev mode

## Deployment
1. Commit all changes: `git add -A && git commit -m "..."`
2. Push to main: `git push origin main`
3. Wait for Vercel build (check dashboard)
4. Verify build success (green check mark)

## Post-Deployment
- [ ] Test production URL: https://example.com
- [ ] Check critical paths (login, payment, etc.)
- [ ] Monitor Sentry for errors (first 15 minutes)
- [ ] Check analytics for traffic spike
- [ ] Update changelog if public-facing changes

## Rollback Procedure
If issues detected:
1. Revert commit: `git revert HEAD`
2. Push: `git push origin main`
3. Wait for Vercel redeploy
4. Verify rollback successful

## Common Issues

### Build fails with "Module not found"
- **Cause:** Missing dependency
- **Fix:** `npm install <package> --save`

### "Middleware error" in production
- **Cause:** Environment variable missing
- **Fix:** Add to Vercel env vars, redeploy
```

**Update trigger:** When procedure changes or new edge cases discovered

---

## Implementation

```typescript
import fs from 'fs/promises';
import path from 'path';

export class ThreeLayerMemory {
  private workspacePath: string;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
  }

  // ─────────────────────────────────────
  // Episodic Layer
  // ─────────────────────────────────────

  async logEvent(event: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toTimeString().split(' ')[0];
    const logPath = path.join(this.workspacePath, 'memory', `${today}.md`);

    const entry = `\n## ${timestamp} - ${event}\n`;

    try {
      // Append to today's log
      const existing = await fs.readFile(logPath, 'utf-8');
      await fs.writeFile(logPath, existing + entry, 'utf-8');
    } catch {
      // File doesn't exist, create it
      await fs.mkdir(path.join(this.workspacePath, 'memory'), { recursive: true });
      await fs.writeFile(logPath, `# ${today}\n${entry}`, 'utf-8');
    }
  }

  async getRecentEvents(days: number = 7): Promise<string[]> {
    const events: string[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      try {
        const logPath = path.join(this.workspacePath, 'memory', `${dateStr}.md`);
        const content = await fs.readFile(logPath, 'utf-8');
        events.push(content);
      } catch {
        // Log doesn't exist for this day
      }
    }

    return events;
  }

  // ─────────────────────────────────────
  // Semantic Layer
  // ─────────────────────────────────────

  async loadSemanticMemory(): Promise<string> {
    const memoryPath = path.join(this.workspacePath, 'MEMORY.md');
    try {
      return await fs.readFile(memoryPath, 'utf-8');
    } catch {
      return '# MEMORY.md\n\n';
    }
  }

  async updateSemanticMemory(content: string): Promise<void> {
    const memoryPath = path.join(this.workspacePath, 'MEMORY.md');
    await fs.writeFile(memoryPath, content, 'utf-8');
  }

  async appendToSemanticMemory(section: string, content: string): Promise<void> {
    const memory = await this.loadSemanticMemory();

    // Find section and append
    const sectionHeader = `## ${section}`;
    if (memory.includes(sectionHeader)) {
      const lines = memory.split('\n');
      const sectionIndex = lines.findIndex(line => line === sectionHeader);
      lines.splice(sectionIndex + 1, 0, content);
      await this.updateSemanticMemory(lines.join('\n'));
    } else {
      // Section doesn't exist, create it
      await this.updateSemanticMemory(`${memory}\n${sectionHeader}\n${content}\n`);
    }
  }

  // ─────────────────────────────────────
  // Procedural Layer
  // ─────────────────────────────────────

  async loadProcedure(name: string): Promise<string> {
    const procedurePath = path.join(this.workspacePath, 'procedures', `${name}.md`);
    return await fs.readFile(procedurePath, 'utf-8');
  }

  async saveProcedure(name: string, content: string): Promise<void> {
    await fs.mkdir(path.join(this.workspacePath, 'procedures'), { recursive: true });
    const procedurePath = path.join(this.workspacePath, 'procedures', `${name}.md`);
    await fs.writeFile(procedurePath, content, 'utf-8');
  }

  async listProcedures(): Promise<string[]> {
    const proceduresDir = path.join(this.workspacePath, 'procedures');
    try {
      const files = await fs.readdir(proceduresDir);
      return files.filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''));
    } catch {
      return [];
    }
  }
}
```

**Usage:**

```typescript
const memory = new ThreeLayerMemory('/Users/ryan/.openclaw/workspace');

// Log an event
await memory.logEvent('Deployed chat.reflectt.ai to production');

// Get recent history
const recentEvents = await memory.getRecentEvents(7); // Last 7 days

// Load long-term memory
const context = await memory.loadSemanticMemory();

// Update semantic memory
await memory.appendToSemanticMemory('Important Decisions', `
- 2026-02-09: Implemented 3-layer memory system
`);

// Load a procedure
const deployGuide = await memory.loadProcedure('deploy-website');
```

---

## Memory Consolidation

**The process of distilling episodic memories into semantic knowledge.**

### When to Consolidate

- **Frequency:** Weekly or after major events
- **Trigger:** Episodic logs exceed 50KB
- **Manual:** When you learn something important

### Consolidation Process

```typescript
export class MemoryConsolidator {
  private memory: ThreeLayerMemory;

  async consolidate(): Promise<void> {
    // 1. Get recent episodic memories
    const recentEvents = await this.memory.getRecentEvents(7);

    // 2. Extract key learnings
    const learnings = await this.extractLearnings(recentEvents);

    // 3. Update semantic memory
    for (const learning of learnings) {
      await this.memory.appendToSemanticMemory(
        learning.category,
        learning.content
      );
    }

    // 4. Archive old episodic files
    await this.archiveOldLogs();
  }

  private async extractLearnings(events: string[]): Promise<Array<{
    category: string;
    content: string;
  }>> {
    // Use LLM to extract key learnings
    const prompt = `
      Review these daily logs and extract:
      1. Important decisions made
      2. New knowledge learned
      3. Patterns observed
      4. Mistakes to avoid

      Logs:
      ${events.join('\n\n')}

      Output as JSON:
      [{ "category": "Important Decisions", "content": "..." }, ...]
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  }

  private async archiveOldLogs(): Promise<void> {
    // Move logs older than 30 days to archive/
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Implementation left as exercise...
  }
}
```

---

## Forgetting Curves

**Not all memories are equally important. Implement decay.**

### The Problem

```
Day 1: "User prefers dark mode" → Very relevant
Day 30: Still relevant
Day 365: Maybe outdated (preferences change)
```

### Solution: Weighted Retrieval

```typescript
export class WeightedMemory {
  calculateRelevance(
    memory: Memory,
    query: string,
    currentDate: Date
  ): number {
    // Base relevance (semantic similarity)
    let score = this.cosineSimilarity(memory.embedding, query);

    // Time decay (exponential)
    const ageInDays = (currentDate.getTime() - memory.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const decayFactor = Math.exp(-ageInDays / 90); // Half-life of 90 days
    score *= decayFactor;

    // Importance boost
    if (memory.importance === 'critical') {
      score *= 2;
    }

    // Access frequency boost (memories used often are more relevant)
    score *= Math.log(memory.accessCount + 1);

    return score;
  }

  async retrieve(query: string, limit: number = 10): Promise<Memory[]> {
    const allMemories = await this.getAllMemories();
    const currentDate = new Date();

    // Score and sort
    const scored = allMemories.map(mem => ({
      memory: mem,
      score: this.calculateRelevance(mem, query, currentDate)
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(s => s.memory);
  }
}
```

### Decay Curves

```
Critical Information (decay slowly):
├─ User preferences
├─ Security credentials
└─ Core system config

Normal Information (decay normally):
├─ Project details
├─ Recent decisions
└─ Technical notes

Ephemeral Information (decay quickly):
├─ Temporary state
├─ Session data
└─ Weather, news
```

---

## Memory Indexing

**Make retrieval fast and accurate.**

### Pattern 1: Tag-Based Indexing

```typescript
interface TaggedMemory {
  id: string;
  content: string;
  tags: string[];
  created: Date;
}

export class TagIndex {
  private index: Map<string, Set<string>> = new Map();

  addMemory(memory: TaggedMemory): void {
    for (const tag of memory.tags) {
      if (!this.index.has(tag)) {
        this.index.set(tag, new Set());
      }
      this.index.get(tag)!.add(memory.id);
    }
  }

  findByTags(tags: string[]): string[] {
    // Intersection of all tag sets
    if (tags.length === 0) return [];

    let result = this.index.get(tags[0]) || new Set();

    for (let i = 1; i < tags.length; i++) {
      const tagSet = this.index.get(tags[i]) || new Set();
      result = new Set([...result].filter(id => tagSet.has(id)));
    }

    return Array.from(result);
  }
}
```

**Usage:**

```typescript
const index = new TagIndex();

index.addMemory({
  id: 'mem-1',
  content: 'Deployed chat.reflectt.ai',
  tags: ['deployment', 'production', 'success'],
  created: new Date()
});

// Find all deployment memories
const deployments = index.findByTags(['deployment']);
```

---

### Pattern 2: Time-Based Indexing

```typescript
export class TimeIndex {
  private index: Map<string, TaggedMemory[]> = new Map();

  addMemory(memory: TaggedMemory): void {
    const dateKey = memory.created.toISOString().split('T')[0];
    if (!this.index.has(dateKey)) {
      this.index.set(dateKey, []);
    }
    this.index.get(dateKey)!.push(memory);
  }

  getRange(start: Date, end: Date): TaggedMemory[] {
    const results: TaggedMemory[] = [];
    const current = new Date(start);

    while (current <= end) {
      const key = current.toISOString().split('T')[0];
      const memories = this.index.get(key) || [];
      results.push(...memories);
      current.setDate(current.getDate() + 1);
    }

    return results;
  }
}
```

---

## Cross-Session Continuity

**Maintain context across restarts and sessions.**

### Challenge

```
Session 1: Build website feature
[Agent restarts]
Session 2: Continue building feature
└─ Problem: Agent has no context from Session 1
```

### Solution: Session State Files

```typescript
export class SessionState {
  private statePath: string;

  constructor(workspacePath: string) {
    this.statePath = path.join(workspacePath, '.session-state.json');
  }

  async save(state: any): Promise<void> {
    await fs.writeFile(
      this.statePath,
      JSON.stringify(state, null, 2),
      'utf-8'
    );
  }

  async load(): Promise<any> {
    try {
      const content = await fs.readFile(this.statePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  async clear(): Promise<void> {
    try {
      await fs.unlink(this.statePath);
    } catch {
      // Already cleared
    }
  }
}
```

**State schema:**

```typescript
interface SessionStateData {
  task: {
    id: string;
    name: string;
    status: 'in-progress' | 'blocked' | 'completed';
    currentStep: number;
    totalSteps: number;
    context: string;
  };
  workspace: {
    openFiles: string[];
    currentDirectory: string;
  };
  timestamp: string;
}
```

**Usage:**

```typescript
// Session 1: Save state before exit
const sessionState = new SessionState('/Users/ryan/.openclaw/workspace');

await sessionState.save({
  task: {
    id: 'build-feature',
    name: 'Build payment integration',
    status: 'in-progress',
    currentStep: 3,
    totalSteps: 5,
    context: 'Just finished Stripe webhook implementation, next is frontend'
  },
  workspace: {
    openFiles: ['src/app/api/stripe/webhook/route.ts'],
    currentDirectory: '/src/app'
  },
  timestamp: new Date().toISOString()
});

// Session 2: Load state on restart
const state = await sessionState.load();

if (state && state.task.status === 'in-progress') {
  console.log(`Resuming: ${state.task.name} (step ${state.task.currentStep}/${state.task.totalSteps})`);
  console.log(`Context: ${state.task.context}`);
}
```

---

## Reference Implementations

### Full 3-Layer System with Consolidation

```typescript
import { ThreeLayerMemory } from './three-layer';
import { MemoryConsolidator } from './consolidator';
import { SessionState } from './session-state';

export class ProductionMemorySystem {
  private memory: ThreeLayerMemory;
  private consolidator: MemoryConsolidator;
  private sessionState: SessionState;

  constructor(workspacePath: string) {
    this.memory = new ThreeLayerMemory(workspacePath);
    this.consolidator = new MemoryConsolidator(this.memory);
    this.sessionState = new SessionState(workspacePath);
  }

  // ─────────────────────────────────────
  // Session Management
  // ─────────────────────────────────────

  async startSession(): Promise<void> {
    // Load semantic memory for context
    const context = await this.memory.loadSemanticMemory();
    console.log('Loaded long-term memory');

    // Check for unfinished tasks
    const state = await this.sessionState.load();
    if (state?.task?.status === 'in-progress') {
      console.log(`Resuming: ${state.task.name}`);
    }

    // Log session start
    await this.memory.logEvent('Session started');
  }

  async endSession(state?: any): Promise<void> {
    // Log session end
    await this.memory.logEvent('Session ended');

    // Save session state if provided
    if (state) {
      await this.sessionState.save(state);
    }

    // Consider consolidation if needed
    // (usually done async or on schedule)
  }

  // ─────────────────────────────────────
  // Memory Operations
  // ─────────────────────────────────────

  async remember(event: string): Promise<void> {
    await this.memory.logEvent(event);
  }

  async recall(context: string): Promise<string> {
    // Load semantic memory
    const semantic = await this.memory.loadSemanticMemory();

    // Load recent events
    const recent = await this.memory.getRecentEvents(7);

    return `${semantic}\n\nRecent Events:\n${recent.join('\n')}`;
  }

  async learn(category: string, knowledge: string): Promise<void> {
    await this.memory.appendToSemanticMemory(category, knowledge);
  }

  async getProcedure(name: string): Promise<string> {
    return await this.memory.loadProcedure(name);
  }

  // ─────────────────────────────────────
  // Maintenance
  // ─────────────────────────────────────

  async consolidate(): Promise<void> {
    console.log('Consolidating memory...');
    await this.consolidator.consolidate();
    console.log('Memory consolidation complete');
  }
}
```

**Usage in production:**

```typescript
// Initialize memory system
const memory = new ProductionMemorySystem('/Users/ryan/.openclaw/workspace');

// Start session
await memory.startSession();

// During work
await memory.remember('Deployed website to production');
await memory.learn('Deployment', '- Always run tests before deploying');

// End session
await memory.endSession({
  task: {
    id: 'deploy',
    status: 'completed'
  }
});

// Periodic maintenance (e.g., daily cron job)
await memory.consolidate();
```

---

## Real-World Example: Agent Memory Kit

**The production-ready implementation used by Team Reflectt.**

Repository: [github.com/reflectt/agent-memory-kit](https://github.com/reflectt/agent-memory-kit)

**Structure:**
```
agent-memory-kit/
├── templates/
│   ├── memory/
│   │   └── YYYY-MM-DD.md (episodic)
│   ├── MEMORY.md (semantic)
│   └── procedures/ (procedural)
├── scripts/
│   ├── consolidate.ts
│   └── archive.ts
└── README.md
```

**Installation:**
```bash
git clone https://github.com/reflectt/agent-memory-kit skills/agent-memory-kit
cp -r skills/agent-memory-kit/templates/memory ./memory
cp skills/agent-memory-kit/templates/MEMORY.md ./MEMORY.md
```

---

## Summary

**Key principles for memory architecture:**

1. **3-layer system** — Episodic, semantic, procedural
2. **Consolidation** — Regularly distill raw logs into knowledge
3. **Decay** — Not all memories deserve equal weight
4. **Indexing** — Make retrieval fast and accurate
5. **Continuity** — Maintain context across sessions

**Start simple, scale up:**
- Start: File-based 3-layer system
- Add: Database for queries
- Add: Vectors for semantic search
- Add: Consolidation automation
- Add: Advanced decay and indexing

---

**Built by [Reflectt AI](https://reflectt.ai)** • Part of [forAgents.dev](https://foragents.dev)
