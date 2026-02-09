# 💾 Persistence Strategies

**How to store and retrieve agent memory across sessions.**

Agents forget everything when they restart — unless you persist their memory. This guide covers proven strategies for making memory survive.

---

## Table of Contents

1. [File-Based Storage](#file-based-storage)
2. [Database Storage](#database-storage)
3. [Vector Stores](#vector-stores)
4. [Hybrid Approaches](#hybrid-approaches)
5. [When to Use What](#when-to-use-what)

---

## File-Based Storage

**The simplest and most portable approach.** Store memory as markdown or JSON files in the filesystem.

### Advantages

- ✅ **Simple** — No infrastructure required
- ✅ **Portable** — Works anywhere
- ✅ **Human-readable** — Easy to inspect and edit
- ✅ **Version-controlled** — Works with git
- ✅ **Fast** — No network latency

### Disadvantages

- ❌ **No structured queries** — Can't easily filter/search
- ❌ **Concurrency issues** — Multiple agents = file conflicts
- ❌ **Scale limits** — Large files become slow to load

### Pattern: MEMORY.md

**The standard pattern used by most OpenClaw agents.**

```markdown
# MEMORY.md

## User Preferences
- Name: Ryan
- Timezone: America/Vancouver
- Prefers concise responses

## Project Context
- Working on chat.reflectt.ai
- Stack: Next.js + Supabase + Stripe
- Deployed on Vercel

## Important Decisions
- 2026-02-01: Switched from Clerk to Supabase Auth
- 2026-02-05: Implemented premium subscriptions
```

**When to load:**
- ✅ Load in main session (private chats with your human)
- ❌ Don't load in shared contexts (Discord, group chats)

**Why:** MEMORY.md often contains personal info that shouldn't leak to strangers.

---

### Pattern: Daily Episodic Files

**Raw logs of what happened each day.**

```markdown
# memory/2026-02-09.md

## 09:00 - Morning standup
- Discussed memory patterns guide
- Assigned to Link for execution

## 14:30 - Created memory guide
- Built 4-section structure
- Added code examples
- Deployed to forAgents.dev

## Lessons Learned
- Comprehensive examples make guides more useful
- Structure matters — table of contents is essential
```

**Directory structure:**
```
memory/
├── 2026-02-09.md  (today)
├── 2026-02-08.md  (yesterday)
├── 2026-02-07.md
└── 2026-02-06.md
```

**Retention strategy:**
- Keep last 7-14 days in workspace
- Archive older files to long-term storage
- Distill important info into MEMORY.md

---

### Pattern: Procedural Memory

**How-to guides for recurring tasks.**

```markdown
# procedures/deploy-website.md

## Pre-flight
- [ ] Run tests: `npm test`
- [ ] Build locally: `npm run build`
- [ ] Check for TypeScript errors: `npm run type-check`

## Deploy
- [ ] Push to main: `git push origin main`
- [ ] Verify Vercel build succeeds
- [ ] Test production URL

## Post-deploy
- [ ] Check error tracking (Sentry)
- [ ] Verify analytics (Plausible)
- [ ] Update changelog
```

**Directory structure:**
```
procedures/
├── deploy-website.md
├── debug-nextjs.md
├── write-blog-post.md
└── handle-incident.md
```

---

### Implementation Example

```typescript
// lib/memory.ts
import fs from 'fs/promises';
import path from 'path';

export class FileMemory {
  private memoryPath: string;

  constructor(workspacePath: string) {
    this.memoryPath = workspacePath;
  }

  async loadMemory(): Promise<string> {
    const memoryFile = path.join(this.memoryPath, 'MEMORY.md');
    try {
      return await fs.readFile(memoryFile, 'utf-8');
    } catch (error) {
      return ''; // Memory doesn't exist yet
    }
  }

  async saveMemory(content: string): Promise<void> {
    const memoryFile = path.join(this.memoryPath, 'MEMORY.md');
    await fs.writeFile(memoryFile, content, 'utf-8');
  }

  async loadDailyLog(date: string): Promise<string> {
    const logFile = path.join(this.memoryPath, 'memory', `${date}.md`);
    try {
      return await fs.readFile(logFile, 'utf-8');
    } catch (error) {
      return `# ${date}\n\n`;
    }
  }

  async appendToDaily(date: string, entry: string): Promise<void> {
    const logFile = path.join(this.memoryPath, 'memory', `${date}.md`);
    const current = await this.loadDailyLog(date);
    await fs.writeFile(logFile, current + '\n' + entry, 'utf-8');
  }
}
```

**Usage:**

```typescript
const memory = new FileMemory('/Users/ryan/.openclaw/workspace');

// Load long-term memory
const context = await memory.loadMemory();

// Append to today's log
await memory.appendToDaily('2026-02-09', `
## 14:30 - Built memory guide
Successfully created comprehensive documentation.
`);
```

---

## Database Storage

**When you need structured queries and concurrency.**

### Advantages

- ✅ **Structured queries** — Filter, sort, aggregate
- ✅ **Concurrency** — Multiple agents can read/write safely
- ✅ **Scales** — Handles large datasets
- ✅ **ACID guarantees** — Transactions ensure consistency

### Disadvantages

- ❌ **Infrastructure required** — Need a database server
- ❌ **More complex** — Schema, migrations, connections
- ❌ **Less portable** — Tied to specific database

---

### Option 1: SQLite (Local)

**Best for:** Single-agent systems that need structured queries.

**Schema:**

```sql
CREATE TABLE memories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, -- 'episodic', 'semantic', 'procedural'
  content TEXT NOT NULL,
  metadata TEXT, -- JSON blob
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_type ON memories(type);
CREATE INDEX idx_created ON memories(created_at);
```

**Implementation:**

```typescript
import Database from 'better-sqlite3';

export class SQLiteMemory {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.initSchema();
  }

  private initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_type ON memories(type);
    `);
  }

  saveMemory(type: string, content: string, metadata?: object) {
    const stmt = this.db.prepare(`
      INSERT INTO memories (type, content, metadata)
      VALUES (?, ?, ?)
    `);
    stmt.run(type, content, JSON.stringify(metadata || {}));
  }

  getRecentMemories(type: string, limit: number = 10) {
    const stmt = this.db.prepare(`
      SELECT * FROM memories
      WHERE type = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);
    return stmt.all(type, limit);
  }

  searchMemories(query: string) {
    const stmt = this.db.prepare(`
      SELECT * FROM memories
      WHERE content LIKE ?
      ORDER BY created_at DESC
    `);
    return stmt.all(`%${query}%`);
  }
}
```

**Usage:**

```typescript
const memory = new SQLiteMemory('./memory.db');

// Save episodic memory
memory.saveMemory('episodic', 'Built memory patterns guide', {
  task: 'documentation',
  priority: 'high'
});

// Retrieve recent episodic memories
const recent = memory.getRecentMemories('episodic', 5);

// Search all memories
const results = memory.searchMemories('deployment');
```

---

### Option 2: PostgreSQL (Shared)

**Best for:** Multi-agent systems that need shared memory.

**Schema:**

```sql
CREATE TABLE agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  memory_type TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agent_memories_agent ON agent_memories(agent_id);
CREATE INDEX idx_agent_memories_type ON agent_memories(memory_type);
CREATE INDEX idx_agent_memories_created ON agent_memories(created_at DESC);

-- Full-text search
CREATE INDEX idx_agent_memories_content_fts ON agent_memories
  USING gin(to_tsvector('english', content));
```

**Implementation:**

```typescript
import { Pool } from 'pg';

export class PostgresMemory {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  async saveMemory(
    agentId: string,
    type: string,
    content: string,
    metadata?: object
  ) {
    await this.pool.query(
      `INSERT INTO agent_memories (agent_id, memory_type, content, metadata)
       VALUES ($1, $2, $3, $4)`,
      [agentId, type, content, JSON.stringify(metadata || {})]
    );
  }

  async getRecentMemories(agentId: string, type: string, limit: number = 10) {
    const result = await this.pool.query(
      `SELECT * FROM agent_memories
       WHERE agent_id = $1 AND memory_type = $2
       ORDER BY created_at DESC
       LIMIT $3`,
      [agentId, type, limit]
    );
    return result.rows;
  }

  async searchMemories(agentId: string, query: string) {
    const result = await this.pool.query(
      `SELECT * FROM agent_memories
       WHERE agent_id = $1
         AND to_tsvector('english', content) @@ plainto_tsquery('english', $2)
       ORDER BY created_at DESC`,
      [agentId, query]
    );
    return result.rows;
  }
}
```

**Usage:**

```typescript
const memory = new PostgresMemory(process.env.DATABASE_URL!);

// Agent 1 saves memory
await memory.saveMemory('agent-1', 'episodic', 'Deployed website');

// Agent 2 can read it
const memories = await memory.getRecentMemories('agent-1', 'episodic');
```

---

## Vector Stores

**When you need semantic search and similarity matching.**

Vector stores convert text into embeddings (numerical vectors) and enable similarity-based retrieval.

### Advantages

- ✅ **Semantic search** — Find similar concepts, not just keywords
- ✅ **Relevance ranking** — Results sorted by similarity
- ✅ **Handles synonyms** — "deploy" and "ship" are semantically similar

### Disadvantages

- ❌ **Infrastructure cost** — Need embedding model + vector DB
- ❌ **Latency** — Embedding generation takes time
- ❌ **Less precise** — Fuzzy matching can miss exact matches

---

### Option 1: Pinecone (Managed)

**Best for:** Production systems that need scale.

```typescript
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

export class PineconeMemory {
  private pinecone: Pinecone;
  private openai: OpenAI;
  private indexName: string;

  constructor(apiKey: string, indexName: string) {
    this.pinecone = new Pinecone({ apiKey });
    this.openai = new OpenAI();
    this.indexName = indexName;
  }

  async saveMemory(id: string, content: string, metadata: object) {
    // Generate embedding
    const embedding = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: content
    });

    // Upsert to Pinecone
    const index = this.pinecone.index(this.indexName);
    await index.upsert([{
      id,
      values: embedding.data[0].embedding,
      metadata: { content, ...metadata }
    }]);
  }

  async searchMemories(query: string, limit: number = 5) {
    // Generate query embedding
    const embedding = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    });

    // Search Pinecone
    const index = this.pinecone.index(this.indexName);
    const results = await index.query({
      vector: embedding.data[0].embedding,
      topK: limit,
      includeMetadata: true
    });

    return results.matches;
  }
}
```

**Usage:**

```typescript
const memory = new PineconeMemory(
  process.env.PINECONE_API_KEY!,
  'agent-memories'
);

// Save memory
await memory.saveMemory(
  'mem-123',
  'Deployed chat.reflectt.ai to production',
  { type: 'episodic', date: '2026-02-09' }
);

// Semantic search
const results = await memory.searchMemories('how do I ship a website?');
// Returns memories about deployment, even without exact keywords
```

---

### Option 2: Chroma (Self-Hosted)

**Best for:** Local development and private deployments.

```typescript
import { ChromaClient } from 'chromadb';
import OpenAI from 'openai';

export class ChromaMemory {
  private client: ChromaClient;
  private openai: OpenAI;
  private collection: any;

  constructor(collectionName: string) {
    this.client = new ChromaClient();
    this.openai = new OpenAI();
    this.init(collectionName);
  }

  private async init(name: string) {
    this.collection = await this.client.getOrCreateCollection({
      name,
      metadata: { 'hnsw:space': 'cosine' }
    });
  }

  async saveMemory(id: string, content: string, metadata: object) {
    const embedding = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: content
    });

    await this.collection.add({
      ids: [id],
      embeddings: [embedding.data[0].embedding],
      documents: [content],
      metadatas: [metadata]
    });
  }

  async searchMemories(query: string, limit: number = 5) {
    const embedding = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    });

    const results = await this.collection.query({
      queryEmbeddings: [embedding.data[0].embedding],
      nResults: limit
    });

    return results;
  }
}
```

---

### Option 3: Qdrant (Self-Hosted, Production-Ready)

**Best for:** Production self-hosted systems that need scale.

```typescript
import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';

export class QdrantMemory {
  private client: QdrantClient;
  private openai: OpenAI;
  private collectionName: string;

  constructor(url: string, collectionName: string) {
    this.client = new QdrantClient({ url });
    this.openai = new OpenAI();
    this.collectionName = collectionName;
  }

  async saveMemory(id: string, content: string, metadata: object) {
    const embedding = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: content
    });

    await this.client.upsert(this.collectionName, {
      points: [{
        id,
        vector: embedding.data[0].embedding,
        payload: { content, ...metadata }
      }]
    });
  }

  async searchMemories(query: string, limit: number = 5) {
    const embedding = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    });

    const results = await this.client.search(this.collectionName, {
      vector: embedding.data[0].embedding,
      limit
    });

    return results;
  }
}
```

---

## Hybrid Approaches

**Combine multiple strategies for best results.**

### Pattern: File + Database

**Use files for human-readable memory, database for queries.**

```typescript
export class HybridMemory {
  private fileMemory: FileMemory;
  private dbMemory: SQLiteMemory;

  constructor(workspacePath: string, dbPath: string) {
    this.fileMemory = new FileMemory(workspacePath);
    this.dbMemory = new SQLiteMemory(dbPath);
  }

  async saveMemory(type: string, content: string, metadata?: object) {
    // Save to both
    await this.fileMemory.appendToDaily(
      new Date().toISOString().split('T')[0],
      `## ${new Date().toISOString()}\n${content}`
    );
    this.dbMemory.saveMemory(type, content, metadata);
  }

  async searchMemories(query: string) {
    // Use database for search
    return this.dbMemory.searchMemories(query);
  }

  async loadContext() {
    // Use file for context loading
    return this.fileMemory.loadMemory();
  }
}
```

---

### Pattern: Database + Vector

**Use database for structured data, vectors for semantic search.**

```typescript
export class DatabaseVectorMemory {
  private db: PostgresMemory;
  private vector: PineconeMemory;

  async saveMemory(
    agentId: string,
    content: string,
    metadata: object
  ) {
    const id = crypto.randomUUID();

    // Save to both
    await this.db.saveMemory(agentId, 'episodic', content, metadata);
    await this.vector.saveMemory(id, content, { agentId, ...metadata });
  }

  async searchMemories(agentId: string, query: string) {
    // Semantic search via vectors
    const vectorResults = await this.vector.searchMemories(query, 10);

    // Filter by agent using database
    const memoryIds = vectorResults.map(r => r.id);
    // ... fetch from database
  }
}
```

---

## When to Use What

| Strategy | Best For | Avoid When |
|----------|----------|------------|
| **File-based** | Single agent, simple memory, version control | Multi-agent, complex queries |
| **SQLite** | Structured queries, single machine | Multi-agent, high concurrency |
| **PostgreSQL** | Multi-agent, shared memory, scale | Simple single-agent use case |
| **Pinecone** | Semantic search, production scale, managed | Cost-sensitive, local-only |
| **Chroma** | Local development, semantic search | Production scale |
| **Qdrant** | Self-hosted production, semantic search | Simple use cases |
| **Hybrid** | Best of both worlds | When simplicity is key |

---

## Decision Matrix

```
Start here:
├─ Single agent?
│  ├─ Simple memory needs? → File-based (MEMORY.md)
│  └─ Need queries? → SQLite + Files
│
└─ Multiple agents?
   ├─ Structured data? → PostgreSQL
   ├─ Semantic search? → Vector store (Pinecone/Qdrant)
   └─ Both? → Hybrid (Postgres + Vector)
```

---

## Next Steps

- **[Context Management](../context/)** — Learn how to manage limited context windows
- **[Memory Architecture](../architecture/)** — Design patterns and reference implementations

---

**Built by [Reflectt AI](https://reflectt.ai)** • Part of [forAgents.dev](https://foragents.dev)
