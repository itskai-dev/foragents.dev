/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { PerformanceBenchmarksPanel } from "@/components/performance/performance-benchmarks-panel";

export const metadata: Metadata = {
  title: "Caching Strategies — forAgents.dev",
  description:
    "Reduce AI costs by 60-90% and speed up responses 5-10x through intelligent caching. Learn tool result caching, conversation summarization, and semantic caching.",
  alternates: {
    canonical: "https://foragents.dev/performance/caching",
  },
};

export default function CachingStrategiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Breadcrumb */}
      <div className="border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/performance" className="hover:text-blue-400 transition-colors">
              Performance
            </Link>
            <span>/</span>
            <span className="text-white">Caching Strategies</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-6xl mb-6">⚡</div>
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 text-transparent bg-clip-text">
          Caching Strategies
        </h1>
        <p className="text-xl text-slate-400 leading-relaxed mb-8">
          Caching is the highest-leverage optimization. Cache intelligently and you&apos;ll see dramatic 
          improvements in both cost and latency.
        </p>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: "Cost Savings", value: "60-90%", icon: "💵" },
            { label: "Speed Gain", value: "5-10x", icon: "⚡" },
            { label: "Implementation", value: "4-8h", icon: "⏱️" },
          ].map((metric) => (
            <div
              key={metric.label}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center"
            >
              <div className="text-2xl mb-2">{metric.icon}</div>
              <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
              <div className="text-xs text-slate-400">{metric.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-16">
        <PerformanceBenchmarksPanel
          category="caching"
          title="Caching Benchmark Snapshot"
          description="Category-filtered metrics from the persistent performance benchmark API."
        />

        {/* Section 1: Tool Result Caching */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-blue-400">1.</span>
            Tool Result Caching
          </h2>
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-slate-300 leading-relaxed mb-6">
              Don&apos;t fetch the same data twice. Cache tool outputs (API calls, database queries, file reads) 
              with appropriate TTLs.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Python Implementation</h3>
              <pre className="text-sm text-slate-300 font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
{`import hashlib
import json
from functools import wraps
from datetime import datetime, timedelta

# Simple in-memory cache with TTL
_cache = {}

def cache_tool_result(ttl_seconds=300):
    """Cache tool results with time-to-live."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Create cache key from function name + args
            cache_key = hashlib.md5(
                f"{func.__name__}:{json.dumps(args)}:{json.dumps(kwargs)}".encode()
            ).hexdigest()
            
            # Check cache
            if cache_key in _cache:
                result, timestamp = _cache[cache_key]
                if datetime.now() - timestamp < timedelta(seconds=ttl_seconds):
                    print(f"Cache HIT: {func.__name__}")
                    return result
            
            # Cache miss - execute function
            print(f"Cache MISS: {func.__name__}")
            result = func(*args, **kwargs)
            _cache[cache_key] = (result, datetime.now())
            return result
        return wrapper
    return decorator

# Usage
@cache_tool_result(ttl_seconds=600)  # 10 minute cache
def fetch_weather(city: str):
    # Expensive API call
    response = requests.get(f"https://api.weather.com/{city}")
    return response.json()

@cache_tool_result(ttl_seconds=3600)  # 1 hour cache
def search_documentation(query: str):
    # Expensive embedding search
    results = vector_db.search(query, top_k=5)
    return results`}
              </pre>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">TypeScript Implementation</h3>
              <pre className="text-sm text-slate-300 font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
{`import crypto from 'crypto';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

class ToolCache {
  private cache = new Map<string, CacheEntry<any>>();

  getCacheKey(funcName: string, ...args: any[]): string {
    const key = \`\${funcName}:\${JSON.stringify(args)}\`;
    return crypto.createHash('md5').update(key).digest('hex');
  }

  get<T>(key: string, ttlSeconds: number): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = (Date.now() - entry.timestamp) / 1000;
    if (age > ttlSeconds) {
      this.cache.delete(key);
      return null;
    }

    console.log(\`Cache HIT: \${key.slice(0, 8)}...\`);
    return entry.value as T;
  }

  set<T>(key: string, value: T): void {
    this.cache.set(key, { value, timestamp: Date.now() });
  }
}

const toolCache = new ToolCache();

// Usage with decorator pattern
function cacheTool(ttlSeconds: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = toolCache.getCacheKey(propertyKey, ...args);
      
      const cached = toolCache.get(cacheKey, ttlSeconds);
      if (cached !== null) return cached;

      console.log(\`Cache MISS: \${propertyKey}\`);
      const result = await originalMethod.apply(this, args);
      toolCache.set(cacheKey, result);
      return result;
    };

    return descriptor;
  };
}

class WeatherService {
  @cacheTool(600) // 10 minute cache
  async fetchWeather(city: string) {
    const response = await fetch(\`https://api.weather.com/\${city}\`);
    return response.json();
  }
}`}
              </pre>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-blue-400 mb-4">💡 TTL Guidelines</h3>
              <div className="space-y-3 text-slate-300">
                <div className="flex justify-between items-center">
                  <span>Static content (docs, FAQs)</span>
                  <code className="bg-black/30 px-3 py-1 rounded text-blue-400">1-24 hours</code>
                </div>
                <div className="flex justify-between items-center">
                  <span>External APIs (weather, news)</span>
                  <code className="bg-black/30 px-3 py-1 rounded text-blue-400">5-60 minutes</code>
                </div>
                <div className="flex justify-between items-center">
                  <span>Database queries</span>
                  <code className="bg-black/30 px-3 py-1 rounded text-blue-400">1-10 minutes</code>
                </div>
                <div className="flex justify-between items-center">
                  <span>Real-time data</span>
                  <code className="bg-black/30 px-3 py-1 rounded text-blue-400">No cache</code>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Conversation Summarization */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-blue-400">2.</span>
            Conversation Summarization
          </h2>
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-slate-300 leading-relaxed mb-6">
              Long conversations kill context windows. Summarize aggressively to keep only essential history.
            </p>

            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 mb-4">
              <div className="text-sm text-rose-400 font-semibold mb-3">❌ Problem: Context Window Bloat</div>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
{`# After 20 messages, context is ~8,000 tokens
messages = [
  {"role": "user", "content": "What's the weather?"},
  {"role": "assistant", "content": "It's 72°F and sunny..."},
  {"role": "user", "content": "Should I bring an umbrella?"},
  # ... 17 more messages ...
]

# Every new message sends ALL previous messages
# Cost: 8,000 input tokens per request
# Risk: Hit context limit and fail`}
              </pre>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 mb-6">
              <div className="text-sm text-emerald-400 font-semibold mb-3">✅ Solution: Rolling Summarization</div>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
{`class ConversationManager:
    def __init__(self, max_messages=10):
        self.messages = []
        self.max_messages = max_messages
        self.summary = None
    
    def add_message(self, role: str, content: str):
        self.messages.append({"role": role, "content": content})
        
        # Summarize when we hit the limit
        if len(self.messages) >= self.max_messages:
            self._summarize_and_compress()
    
    def _summarize_and_compress(self):
        # Take oldest messages (except last 3)
        old_messages = self.messages[:-3]
        
        # Generate summary
        summary_prompt = f"""Summarize this conversation in 2-3 sentences:
        
{json.dumps(old_messages, indent=2)}

Focus on: key facts, decisions, and current context."""
        
        self.summary = call_llm(summary_prompt)
        
        # Keep only recent messages
        self.messages = self.messages[-3:]
    
    def get_context(self):
        """Build context for next LLM call."""
        context = []
        
        # Add summary if it exists
        if self.summary:
            context.append({
                "role": "system",
                "content": f"Previous conversation summary: {self.summary}"
            })
        
        # Add recent messages
        context.extend(self.messages)
        return context

# Usage
conv = ConversationManager(max_messages=10)
conv.add_message("user", "What's the weather?")
conv.add_message("assistant", "It's 72°F and sunny...")

# After 10 messages, automatically compresses to ~2,000 tokens`}
              </pre>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-amber-400 mb-4">⚠️ Don&apos;t Summarize Too Aggressively</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex gap-3">
                  <span className="text-amber-400 flex-shrink-0">→</span>
                  <span>Keep last 3-5 messages verbatim for immediate context</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-400 flex-shrink-0">→</span>
                  <span>Preserve critical facts (names, IDs, decisions)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-400 flex-shrink-0">→</span>
                  <span>Test that agent can still reference earlier context</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-400 flex-shrink-0">→</span>
                  <span>Consider task complexity when setting max_messages threshold</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: Semantic Cache */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-blue-400">3.</span>
            Semantic Cache for Similar Queries
          </h2>
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-slate-300 leading-relaxed mb-6">
              Users ask the same question in different ways. Use embeddings to cache semantically similar queries.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">How It Works</h3>
              <div className="space-y-4 text-slate-300">
                <div className="flex gap-3">
                  <span className="text-blue-400 flex-shrink-0 font-bold">1.</span>
                  <span>Generate embedding for user query</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-400 flex-shrink-0 font-bold">2.</span>
                  <span>Search cache for similar embeddings (cosine similarity &gt; 0.95)</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-400 flex-shrink-0 font-bold">3.</span>
                  <span>If match found, return cached response</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-400 flex-shrink-0 font-bold">4.</span>
                  <span>Otherwise, generate new response and cache it</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Python Implementation</h3>
              <pre className="text-sm text-slate-300 font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
{`from openai import OpenAI
import numpy as np
from datetime import datetime, timedelta

client = OpenAI()

class SemanticCache:
    def __init__(self, similarity_threshold=0.95, ttl_seconds=3600):
        self.cache = []  # List of (embedding, response, timestamp)
        self.threshold = similarity_threshold
        self.ttl = ttl_seconds
    
    def _get_embedding(self, text: str) -> list[float]:
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding
    
    def _cosine_similarity(self, a: list[float], b: list[float]) -> float:
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
    
    def get(self, query: str) -> str | None:
        query_embedding = self._get_embedding(query)
        
        # Check each cached item
        for cached_embedding, response, timestamp in self.cache:
            # Check if expired
            if datetime.now() - timestamp > timedelta(seconds=self.ttl):
                continue
            
            # Check similarity
            similarity = self._cosine_similarity(query_embedding, cached_embedding)
            if similarity >= self.threshold:
                print(f"Semantic cache HIT (similarity: {similarity:.3f})")
                return response
        
        return None
    
    def set(self, query: str, response: str):
        query_embedding = self._get_embedding(query)
        self.cache.append((query_embedding, response, datetime.now()))
        
        # Clean up old entries
        cutoff = datetime.now() - timedelta(seconds=self.ttl)
        self.cache = [(e, r, t) for e, r, t in self.cache if t > cutoff]

# Usage
semantic_cache = SemanticCache(similarity_threshold=0.95)

def answer_question(query: str) -> str:
    # Check semantic cache
    cached_response = semantic_cache.get(query)
    if cached_response:
        return cached_response
    
    # Generate new response
    response = call_llm(query)
    
    # Cache it
    semantic_cache.set(query, response)
    return response

# These queries are semantically similar and will hit cache:
answer_question("How do I reset my password?")
answer_question("What's the process for changing my password?")  # Cache HIT!
answer_question("I forgot my password, how do I recover it?")    # Cache HIT!`}
              </pre>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-purple-400 mb-4">🔍 When to Use Semantic Caching</h3>
              <div className="space-y-3 text-slate-300">
                <div className="flex items-start gap-3">
                  <span className="text-emerald-400 flex-shrink-0">✓</span>
                  <div>
                    <strong className="text-white">FAQ/Support bots:</strong> Users ask same questions differently
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-emerald-400 flex-shrink-0">✓</span>
                  <div>
                    <strong className="text-white">Documentation search:</strong> Many ways to ask about same topic
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-rose-400 flex-shrink-0">✗</span>
                  <div>
                    <strong className="text-white">Personalized responses:</strong> Each user needs unique answer
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-rose-400 flex-shrink-0">✗</span>
                  <div>
                    <strong className="text-white">Real-time data:</strong> Cache would return stale info
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Cache Invalidation */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-blue-400">4.</span>
            Cache Invalidation Patterns
          </h2>
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-slate-300 leading-relaxed mb-6">
              &ldquo;There are only two hard things in Computer Science: cache invalidation and naming things.&rdquo; 
              Don&apos;t let stale cache ruin your agent&apos;s accuracy.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Strategy 1: Time-Based (TTL)</h3>
              <p className="text-slate-300 mb-4">
                Simplest approach. Every cache entry expires after a fixed time.
              </p>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                <div className="text-sm text-emerald-400 mb-2">✓ Pros:</div>
                <ul className="text-sm text-slate-300 space-y-1 mb-3">
                  <li>→ Easy to implement</li>
                  <li>→ Predictable behavior</li>
                  <li>→ Works for most use cases</li>
                </ul>
                <div className="text-sm text-amber-400 mb-2">⚠️ Cons:</div>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>→ May serve stale data before TTL expires</li>
                  <li>→ May invalidate fresh data too early</li>
                </ul>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Strategy 2: Event-Based</h3>
              <p className="text-slate-300 mb-4">
                Invalidate cache when underlying data changes.
              </p>
              <pre className="text-sm text-slate-300 font-mono bg-black/30 p-4 rounded-lg overflow-x-auto mb-4">
{`class SmartCache:
    def __init__(self):
        self.cache = {}
        self.tags = {}  # tag -> set of cache keys
    
    def set(self, key: str, value: any, tags: list[str] = []):
        self.cache[key] = value
        for tag in tags:
            if tag not in self.tags:
                self.tags[tag] = set()
            self.tags[tag].add(key)
    
    def invalidate_by_tag(self, tag: str):
        """Invalidate all cache entries with this tag."""
        if tag in self.tags:
            for key in self.tags[tag]:
                self.cache.pop(key, None)
            del self.tags[tag]

# Usage
cache = SmartCache()

# Cache with tags
cache.set("user:123:profile", user_data, tags=["user:123"])
cache.set("user:123:posts", posts_data, tags=["user:123"])

# When user updates profile, invalidate all their cached data
def update_user_profile(user_id: int, new_data: dict):
    database.update(user_id, new_data)
    cache.invalidate_by_tag(f"user:{user_id}")  # Clear all user cache`}
              </pre>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                <div className="text-sm text-emerald-400 mb-2">✓ Pros:</div>
                <ul className="text-sm text-slate-300 space-y-1 mb-3">
                  <li>→ Never serves stale data</li>
                  <li>→ Maximizes cache hit rate</li>
                </ul>
                <div className="text-sm text-amber-400 mb-2">⚠️ Cons:</div>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>→ More complex to implement</li>
                  <li>→ Requires tracking dependencies</li>
                </ul>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Strategy 3: Hybrid (Recommended)</h3>
              <p className="text-slate-300 mb-4">
                Combine TTL with event-based invalidation for best of both worlds.
              </p>
              <pre className="text-sm text-slate-300 font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
{`class HybridCache:
    def set(self, key: str, value: any, ttl: int = 300, tags: list[str] = []):
        # Store with expiration
        expiry = datetime.now() + timedelta(seconds=ttl)
        self.cache[key] = (value, expiry, tags)
        
        # Track tags
        for tag in tags:
            self.tags.setdefault(tag, set()).add(key)
    
    def get(self, key: str):
        if key not in self.cache:
            return None
        
        value, expiry, _ = self.cache[key]
        
        # Check if expired
        if datetime.now() > expiry:
            del self.cache[key]
            return None
        
        return value

# Expires after 5 minutes OR when user updates
cache.set("user:123:profile", data, ttl=300, tags=["user:123"])`}
              </pre>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 rounded-2xl p-10">
          <h2 className="text-3xl font-bold text-white mb-6">Caching Best Practices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Cache expensive operations (API calls, DB queries)",
              "Use appropriate TTLs for each data type",
              "Implement conversation summarization after 8-10 messages",
              "Consider semantic caching for FAQ/support scenarios",
              "Use event-based invalidation for critical data",
              "Monitor cache hit rates (aim for >60%)",
              "Start simple with TTL, add complexity as needed",
              "Test that stale cache doesn't break functionality",
              "Log cache hits/misses for optimization",
              "Implement cache warming for common queries",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-emerald-400 flex-shrink-0">✓</span>
                <span className="text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/performance/tokens"
            className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center text-white font-medium transition-colors"
          >
            ← Token Optimization
          </Link>
          <Link
            href="/performance/scaling"
            className="flex-1 px-6 py-4 bg-blue-500 hover:bg-blue-600 rounded-xl text-center text-white font-medium transition-colors shadow-lg shadow-blue-500/25"
          >
            Next: Scaling Patterns →
          </Link>
        </div>
      </div>
    </div>
  );
}
