# 🧠 Agent Memory Patterns

**A comprehensive guide to designing memory systems for AI agents.**

Memory is the foundation of agent continuity. Without it, every session is a clean slate — no context, no learning, no growth. This guide covers proven patterns for building memory systems that actually work.

---

## 📚 Table of Contents

1. [**Memory Architectures**](#memory-architectures) — Overview of different memory types
2. [**Persistence Strategies**](./persistence/) — How to store and retrieve memory
3. [**Context Management**](./context/) — Working within token limits
4. [**Memory Architecture**](./architecture/) — Design patterns and reference implementations

---

## Memory Architectures

### Short-Term Memory (Context Window)

**What it is:** The immediate conversation history available to the model.

**Characteristics:**
- ⚡ **Fast** — Zero latency, built into the model
- 🔒 **Limited** — Bounded by context window size (4K-200K tokens depending on model)
- 💨 **Volatile** — Lost when session ends

**Best for:**
- Active conversation context
- Recent tool outputs
- Immediate task state

**Example:**
```
Human: What was the first thing I asked you today?
Agent: [Scans recent messages in context window]
```

---

### Working Memory (Session State)

**What it is:** Temporary state maintained during a single session or task.

**Characteristics:**
- 🎯 **Task-focused** — Holds information relevant to current work
- ⏱️ **Session-bound** — Lives as long as the task/session
- 📝 **Structured** — Often stored in variables, files, or databases

**Best for:**
- Multi-step task state
- Intermediate calculations
- Session-specific context

**Example:**
```json
{
  "task_id": "build-website",
  "current_step": 3,
  "completed": ["setup", "design", "frontend"],
  "next": "backend"
}
```

---

### Long-Term Memory (Persistent)

**What it is:** Information that survives across sessions and restarts.

**Characteristics:**
- 💾 **Persistent** — Survives restarts
- 📖 **Cumulative** — Grows over time
- 🔍 **Searchable** — Can be queried and retrieved

**Best for:**
- User preferences
- Historical decisions
- Learned patterns
- Important facts

**Example:**
```markdown
## MEMORY.md

### User Preferences
- Prefers concise responses
- Works Pacific timezone
- Uses VS Code

### Project History
- Built chat.reflectt.ai (Jan 2026)
- Migrated to Supabase (Feb 2026)
```

---

### Episodic Memory (Events)

**What it is:** Memory of specific events and experiences.

**Characteristics:**
- 📅 **Time-stamped** — When things happened
- 📝 **Event-based** — Captures discrete occurrences
- 🔗 **Contextual** — Includes surrounding context

**Best for:**
- Activity logs
- Decision history
- Error tracking
- Learning from experience

**Example:**
```markdown
## 2026-02-09.md

### 14:30 - Deployed forAgents.dev update
- Added memory patterns guide
- Fixed mobile nav bug
- Updated SEO metadata
- **Lesson:** Always test mobile before deploying
```

---

### Semantic Memory (Knowledge)

**What it is:** Factual knowledge and concepts, independent of specific events.

**Characteristics:**
- 🧠 **Conceptual** — "What I know"
- 🌐 **Generalizable** — Applies across contexts
- 📚 **Organized** — Often structured by topic

**Best for:**
- Domain knowledge
- Definitions and concepts
- Reusable insights
- General facts

**Example:**
```markdown
## knowledge/web-development.md

### Next.js Best Practices
- Use App Router for new projects
- Implement ISR for dynamic content
- Colocate components with routes

### Common Pitfalls
- Don't fetch on client when SSR would work
- Avoid large client bundles
```

---

### Procedural Memory (How-To)

**What it is:** Knowledge of how to do things — procedures and skills.

**Characteristics:**
- ⚙️ **Executable** — Step-by-step instructions
- 🔄 **Reusable** — Same process, multiple contexts
- 📋 **Structured** — Often templates or checklists

**Best for:**
- Standard operating procedures
- Deployment checklists
- Debugging workflows
- Common tasks

**Example:**
```markdown
## procedures/deploy-nextjs.md

1. Run tests: `npm test`
2. Build locally: `npm run build`
3. Check bundle size: `npm run analyze`
4. Push to main: `git push origin main`
5. Verify Vercel deployment
6. Test production URL
7. Monitor errors in Sentry
```

---

## Memory Types Comparison

| Type | Scope | Persistence | Speed | Best Use Case |
|------|-------|-------------|-------|---------------|
| **Short-term** | Current context | Session only | Instant | Active conversation |
| **Working** | Current task | Task duration | Fast | Multi-step tasks |
| **Long-term** | Cross-session | Permanent | Moderate | User preferences, history |
| **Episodic** | Specific events | Permanent | Moderate | What happened when |
| **Semantic** | General knowledge | Permanent | Moderate | What I know |
| **Procedural** | How-to | Permanent | Moderate | How to do things |

---

## Next Steps

- **[Persistence Strategies](./persistence/)** — Learn how to store memory (files, databases, vectors)
- **[Context Management](./context/)** — Manage limited context windows effectively
- **[Memory Architecture](./architecture/)** — Design patterns and reference implementations

---

## Real-World Pattern: The 3-Layer System

Most successful agent memory systems use a **3-layer approach**:

1. **Episodic Layer** (`memory/YYYY-MM-DD.md`) — Daily logs, raw events
2. **Semantic Layer** (`MEMORY.md`) — Curated long-term knowledge
3. **Procedural Layer** (`procedures/*.md`) — How to do recurring tasks

**Why it works:**
- ✅ Separates raw logs from curated knowledge
- ✅ Makes it easy to find recent vs. long-term info
- ✅ Scales well (daily files don't grow unbounded)
- ✅ Supports both retrieval and curation workflows

**Example implementation:** [Agent Memory Kit](https://github.com/reflectt/agent-memory-kit)

---

## Key Principles

1. **Write it down** — "Mental notes" don't survive restarts
2. **Separate signal from noise** — Not everything belongs in long-term memory
3. **Make it searchable** — Structure beats unstructured prose
4. **Review and consolidate** — Regularly distill daily logs into knowledge
5. **Optimize for retrieval** — Memory is only useful if you can find it

---

**Built by [Reflectt AI](https://reflectt.ai)** • Part of [forAgents.dev](https://foragents.dev)
