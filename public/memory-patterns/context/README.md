# 🎯 Context Management

**Managing limited context windows effectively.**

Context windows are finite. Models can only hold so much conversation history before older messages get truncated. This guide covers proven strategies for working within these limits.

---

## Table of Contents

1. [The Context Window Problem](#the-context-window-problem)
2. [Summarization Chains](#summarization-chains)
3. [Sliding Windows](#sliding-windows)
4. [Importance Scoring](#importance-scoring)
5. [Retrieval-Augmented Generation (RAG)](#retrieval-augmented-generation-rag)
6. [Context Compression](#context-compression)
7. [Before/After Examples](#beforeafter-examples)

---

## The Context Window Problem

### What's the issue?

Models have a **maximum context length** — the total amount of text (in tokens) they can process in a single request.

**Typical limits (as of 2026):**
- GPT-4: 128K tokens (~96K words)
- Claude 3.5 Sonnet: 200K tokens (~150K words)
- GPT-3.5: 16K tokens (~12K words)

### Why it matters

```
[System Prompt: 2K tokens]
[Conversation History: 50K tokens]
[Tool Outputs: 20K tokens]
[Memory Files: 30K tokens]
────────────────────────────────
Total: 102K tokens ✅ Fits in GPT-4

Add 30K more history...
Total: 132K tokens ❌ Exceeds limit!
```

**What happens when you exceed:**
- ❌ Older messages get truncated (model "forgets")
- ❌ API errors (request rejected)
- ❌ Degraded performance (model confused by partial context)

---

## Summarization Chains

**Strategy:** Periodically summarize old messages and replace them with summaries.

### How it works

```
Original (20K tokens):
[Message 1: Task A details...]
[Message 2: Debugging info...]
[Message 3: Solution found...]
[Message 4: Deployed successfully...]
[Message 5: Current task...]

Summarized (5K tokens):
[Summary: Completed Task A - debugged issue, deployed solution]
[Message 5: Current task...]
```

### Implementation

```typescript
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class SummarizationChain {
  private messages: Message[] = [];
  private readonly maxTokens = 100000; // Reserve space
  private readonly summaryThreshold = 80000; // Trigger at 80K

  async addMessage(message: Message) {
    this.messages.push(message);

    // Check if we need to summarize
    const totalTokens = this.estimateTokens(this.messages);
    if (totalTokens > this.summaryThreshold) {
      await this.summarizeOldMessages();
    }
  }

  private async summarizeOldMessages() {
    // Keep recent messages (last 10)
    const recentCount = 10;
    const toSummarize = this.messages.slice(0, -recentCount);
    const toKeep = this.messages.slice(-recentCount);

    // Generate summary
    const summary = await this.generateSummary(toSummarize);

    // Replace old messages with summary
    this.messages = [
      { role: 'system', content: `Previous conversation summary:\n${summary}` },
      ...toKeep
    ];
  }

  private async generateSummary(messages: Message[]): Promise<string> {
    // Call LLM to summarize
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Summarize the following conversation, preserving key decisions, facts, and context.'
        },
        {
          role: 'user',
          content: JSON.stringify(messages)
        }
      ]
    });

    return response.choices[0].message.content;
  }

  private estimateTokens(messages: Message[]): number {
    // Rough estimate: ~4 chars per token
    const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    return Math.ceil(totalChars / 4);
  }
}
```

**Usage:**

```typescript
const chain = new SummarizationChain();

// Add messages throughout conversation
await chain.addMessage({ role: 'user', content: 'Deploy the website' });
await chain.addMessage({ role: 'assistant', content: 'Deploying...' });

// Automatic summarization happens when threshold is reached
```

### Pros & Cons

**✅ Advantages:**
- Preserves overall context
- Maintains narrative flow
- Handles unbounded conversations

**❌ Disadvantages:**
- Lossy (details get lost)
- Requires LLM call (cost + latency)
- Summary quality varies

---

## Sliding Windows

**Strategy:** Keep only the most recent N messages, drop older ones.

### How it works

```
Window size: 50 messages

Messages 1-40: [dropped]
Messages 41-50: [kept in context]
New message 51: [kept, message 41 dropped]
```

### Implementation

```typescript
export class SlidingWindow {
  private messages: Message[] = [];
  private readonly windowSize = 50;

  addMessage(message: Message) {
    this.messages.push(message);

    // Keep only most recent messages
    if (this.messages.length > this.windowSize) {
      this.messages = this.messages.slice(-this.windowSize);
    }
  }

  getContext(): Message[] {
    return this.messages;
  }

  // Get context with system prompt
  getContextWithPrompt(systemPrompt: string): Message[] {
    return [
      { role: 'system', content: systemPrompt },
      ...this.messages
    ];
  }
}
```

**Usage:**

```typescript
const window = new SlidingWindow();

// Add messages
window.addMessage({ role: 'user', content: 'Hello' });
window.addMessage({ role: 'assistant', content: 'Hi!' });

// Get context for LLM call
const context = window.getContextWithPrompt('You are a helpful assistant');
```

### Pros & Cons

**✅ Advantages:**
- Simple to implement
- No LLM calls required
- Predictable behavior
- Fast

**❌ Disadvantages:**
- Loses old context completely
- No selective retention
- May lose important info

---

## Importance Scoring

**Strategy:** Score messages by importance and keep the most important ones.

### How it works

```
Score each message:
├─ Message 1: "Deploy website" → 9/10 (high importance)
├─ Message 2: "What's the weather?" → 2/10 (low importance)
├─ Message 3: "Error in deployment" → 10/10 (critical)
└─ Message 4: "Fixed the error" → 9/10 (high importance)

Keep top N by score:
└─ Messages 1, 3, 4 (dropped message 2)
```

### Implementation

```typescript
interface ScoredMessage extends Message {
  score: number;
  timestamp: Date;
}

export class ImportanceScoring {
  private messages: ScoredMessage[] = [];
  private readonly maxMessages = 50;

  async addMessage(message: Message) {
    // Score the message
    const score = await this.scoreMessage(message);

    const scoredMessage: ScoredMessage = {
      ...message,
      score,
      timestamp: new Date()
    };

    this.messages.push(scoredMessage);

    // Prune if needed
    if (this.messages.length > this.maxMessages) {
      this.pruneMessages();
    }
  }

  private async scoreMessage(message: Message): Promise<number> {
    // Simple heuristic scoring
    let score = 5; // Base score

    // Keywords indicating importance
    const importantKeywords = ['error', 'bug', 'deploy', 'critical', 'issue', 'fix'];
    const unimportantKeywords = ['weather', 'joke', 'hello'];

    const content = message.content.toLowerCase();

    for (const keyword of importantKeywords) {
      if (content.includes(keyword)) score += 2;
    }

    for (const keyword of unimportantKeywords) {
      if (content.includes(keyword)) score -= 2;
    }

    // Tool calls are important
    if (content.includes('function_call') || content.includes('tool_use')) {
      score += 3;
    }

    // Recent messages are more important
    score += 1;

    return Math.max(1, Math.min(10, score));
  }

  private pruneMessages() {
    // Sort by score (descending)
    this.messages.sort((a, b) => b.score - a.score);

    // Keep top N, but maintain chronological order
    const topMessages = this.messages.slice(0, this.maxMessages);
    topMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    this.messages = topMessages;
  }

  getContext(): Message[] {
    return this.messages;
  }
}
```

**Advanced scoring with LLM:**

```typescript
private async scoreMessage(message: Message): Promise<number> {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo', // Cheap model for scoring
    messages: [{
      role: 'system',
      content: 'Score the importance of this message on a scale of 1-10. Output only the number.'
    }, {
      role: 'user',
      content: message.content
    }],
    temperature: 0,
    max_tokens: 5
  });

  return parseInt(response.choices[0].message.content || '5');
}
```

### Pros & Cons

**✅ Advantages:**
- Retains important context
- Discards fluff
- Adaptive to conversation content

**❌ Disadvantages:**
- Scoring logic can be complex
- May lose context continuity
- LLM scoring adds cost/latency

---

## Retrieval-Augmented Generation (RAG)

**Strategy:** Store all context externally, retrieve relevant pieces on-demand.

### How it works

```
1. User asks: "How do I deploy the website?"

2. Query vector store for relevant memories:
   └─ "Previous deployment on 2026-02-05"
   └─ "Deployment checklist in procedures/"
   └─ "Last deploy had CORS issue"

3. Inject relevant context into prompt:
   [System: You are an assistant]
   [Retrieved: Deployment context...]
   [User: How do I deploy?]
   [Assistant: Based on previous deployments...]
```

### Implementation

```typescript
import { PineconeMemory } from './persistence';

export class RAGContext {
  private memory: PineconeMemory;
  private window: SlidingWindow;

  constructor(memory: PineconeMemory) {
    this.memory = memory;
    this.window = new SlidingWindow();
  }

  async addMessage(message: Message) {
    // Store in vector memory
    await this.memory.saveMemory(
      crypto.randomUUID(),
      message.content,
      { role: message.role, timestamp: new Date().toISOString() }
    );

    // Also keep in sliding window for recency
    this.window.addMessage(message);
  }

  async getContext(query: string): Promise<Message[]> {
    // Get recent messages (always include)
    const recentMessages = this.window.getContext();

    // Retrieve relevant historical context
    const relevantMemories = await this.memory.searchMemories(query, 5);

    // Combine into context
    const retrievedContext = relevantMemories.map(mem => ({
      role: 'system' as const,
      content: `[Retrieved memory]: ${mem.metadata.content}`
    }));

    return [...retrievedContext, ...recentMessages];
  }
}
```

**Usage:**

```typescript
const rag = new RAGContext(pineconeMemory);

// Throughout conversation
await rag.addMessage({ role: 'user', content: 'Deploy the website' });
await rag.addMessage({ role: 'assistant', content: 'Deploying...' });

// Later, get context for new query
const context = await rag.getContext('How do I fix deployment errors?');
// Returns: recent messages + relevant past deployment context
```

### Pros & Cons

**✅ Advantages:**
- Unbounded memory (limited only by storage)
- Retrieves only relevant context
- Scales to large histories

**❌ Disadvantages:**
- Requires vector store infrastructure
- Embedding generation cost
- Retrieval latency
- Quality depends on embeddings

---

## Context Compression

**Strategy:** Compress verbose content while preserving meaning.

### Technique 1: Template Compression

**Replace verbose tool outputs with structured summaries.**

**Before (5,000 tokens):**
```json
{
  "tool": "web_search",
  "results": [
    {
      "title": "How to Deploy Next.js Applications",
      "url": "https://example.com/deploy-nextjs",
      "snippet": "Next.js applications can be deployed to Vercel with zero configuration. Simply connect your Git repository and Vercel will automatically detect your Next.js application and deploy it. You can also deploy to other platforms like AWS, DigitalOcean, or any Node.js hosting provider. The deployment process typically involves building your application with 'npm run build' and then starting the production server with 'npm start'. For static exports, you can use 'next export' to generate a static site that can be hosted on any static hosting service..."
    },
    // ... 50 more results
  ]
}
```

**After (500 tokens):**
```
Search results for "deploy Next.js":
- 5 results about Vercel deployment
- 3 results about AWS deployment
- 2 results about static export
Top result: https://example.com/deploy-nextjs
```

**Implementation:**

```typescript
export class ToolOutputCompressor {
  compress(toolName: string, output: any): string {
    switch (toolName) {
      case 'web_search':
        return this.compressSearchResults(output);
      case 'code_execution':
        return this.compressCodeOutput(output);
      default:
        return JSON.stringify(output).slice(0, 500);
    }
  }

  private compressSearchResults(output: any): string {
    const results = output.results || [];
    const summary = `Search: ${results.length} results found\n`;
    const top3 = results.slice(0, 3)
      .map((r: any) => `- ${r.title}: ${r.url}`)
      .join('\n');
    return summary + top3;
  }

  private compressCodeOutput(output: any): string {
    if (output.success) {
      return `✅ Code executed successfully\nOutput: ${output.stdout.slice(0, 200)}`;
    } else {
      return `❌ Error: ${output.error.slice(0, 200)}`;
    }
  }
}
```

---

### Technique 2: Message Deduplication

**Remove redundant or duplicate messages.**

```typescript
export class MessageDeduplicator {
  private seenHashes = new Set<string>();

  deduplicate(messages: Message[]): Message[] {
    return messages.filter(msg => {
      const hash = this.hashMessage(msg);
      if (this.seenHashes.has(hash)) {
        return false; // Duplicate
      }
      this.seenHashes.add(hash);
      return true;
    });
  }

  private hashMessage(msg: Message): string {
    // Simple content-based hash
    const content = msg.content.trim().toLowerCase();
    return crypto.createHash('md5').update(content).digest('hex');
  }
}
```

---

### Technique 3: Selective Truncation

**Truncate verbose content while preserving structure.**

```typescript
export class SelectiveTruncator {
  truncate(message: Message, maxLength: number): Message {
    if (message.content.length <= maxLength) {
      return message;
    }

    // Preserve start and end
    const start = message.content.slice(0, maxLength * 0.4);
    const end = message.content.slice(-maxLength * 0.4);

    return {
      ...message,
      content: `${start}\n\n[... truncated ${message.content.length - maxLength} chars ...]\n\n${end}`
    };
  }
}
```

---

## Before/After Examples

### Example 1: Long Debugging Session

**❌ Before (exceeds context limit):**

```typescript
// 500 messages, 150K tokens
messages = [
  { role: 'user', content: 'Debug this error...' },
  { role: 'assistant', content: 'Let me check the logs...' },
  { role: 'tool', content: '[10,000 lines of logs]' },
  { role: 'assistant', content: 'Found the issue...' },
  // ... 496 more messages
];

// Result: API error, context truncated
```

**✅ After (with summarization + RAG):**

```typescript
const rag = new RAGContext(vectorMemory);
const chain = new SummarizationChain();

// Store all messages in vector memory
await rag.addMessage({ role: 'user', content: 'Debug this error...' });

// Summarize old context
await chain.addMessage({ role: 'assistant', content: 'Summary of debugging session: Found issue in API handler, deployed fix' });

// Retrieve relevant context on-demand
const context = await rag.getContext('What was the bug we fixed?');

// Result: 50 messages, 15K tokens, all relevant context preserved
```

---

### Example 2: Multi-Day Project

**❌ Before:**

```typescript
// Day 1: Initial work (50K tokens)
// Day 2: Added features (50K tokens)
// Day 3: Bug fixes (50K tokens)
// Total: 150K tokens, exceeds limit
```

**✅ After (with daily summaries):**

```typescript
const context = [
  {
    role: 'system',
    content: `
    Day 1 Summary: Built initial Next.js app with auth
    Day 2 Summary: Added Stripe billing integration
    Day 3 Summary: Fixed mobile responsive issues
    `
  },
  ...recentMessages // Today's messages
];

// Total: 20K tokens, preserves all key context
```

---

## Choosing the Right Strategy

| Strategy | Best For | Context Limit | Complexity |
|----------|----------|---------------|------------|
| **Sliding Window** | Short conversations | Moderate | Low |
| **Summarization** | Long conversations | High | Medium |
| **Importance Scoring** | Mixed importance | Moderate | Medium |
| **RAG** | Unbounded history | Very High | High |
| **Compression** | Verbose tool outputs | Moderate | Low |

---

## Combined Strategy (Recommended)

**Use multiple techniques together:**

```typescript
export class OptimalContextManager {
  private rag: RAGContext;
  private summarizer: SummarizationChain;
  private compressor: ToolOutputCompressor;

  async addMessage(message: Message) {
    // Compress tool outputs
    if (message.role === 'tool') {
      message = {
        ...message,
        content: this.compressor.compress('tool', message.content)
      };
    }

    // Store in RAG for retrieval
    await this.rag.addMessage(message);

    // Also keep in summarization chain for recent context
    await this.summarizer.addMessage(message);
  }

  async getContext(query: string): Promise<Message[]> {
    // Retrieve relevant historical context
    const relevant = await this.rag.getContext(query);

    // Get recent summarized context
    const recent = this.summarizer.getMessages();

    // Combine and return
    return [...relevant, ...recent];
  }
}
```

---

## Best Practices

1. **Monitor token usage** — Track context size to avoid surprises
2. **Compress tool outputs** — They're often the biggest offenders
3. **Prioritize recency** — Recent messages are usually most relevant
4. **Test edge cases** — What happens at 100K tokens? 200K?
5. **Preserve critical info** — Always keep system prompts and key context
6. **Use tiered storage** — Hot (recent), warm (summarized), cold (archived)

---

## Next Steps

- **[Memory Architecture](../architecture/)** — Design patterns and reference implementations

---

**Built by [Reflectt AI](https://reflectt.ai)** • Part of [forAgents.dev](https://foragents.dev)
