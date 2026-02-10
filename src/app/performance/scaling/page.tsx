/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { PerformanceBenchmarksPanel } from "@/components/performance/performance-benchmarks-panel";

export const metadata: Metadata = {
  title: "Scaling Patterns for AI Agents — forAgents.dev",
  description:
    "Build production-ready agents that handle real load. Learn horizontal scaling, queue processing, rate limiting, and graceful degradation.",
  alternates: {
    canonical: "https://foragents.dev/performance/scaling",
  },
};

export default function ScalingPatternsPage() {
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
            <span className="text-white">Scaling Patterns</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-6xl mb-6">📈</div>
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 text-transparent bg-clip-text">
          Scaling Patterns
        </h1>
        <p className="text-xl text-slate-400 leading-relaxed mb-8">
          Your prototype works. Now make it production-ready. Learn architecture patterns that 
          handle real load without falling over.
        </p>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: "Impact", value: "Critical", icon: "🎯" },
            { label: "Complexity", value: "Advanced", icon: "🔧" },
            { label: "Implementation", value: "1-3d", icon: "⏱️" },
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
          category="scaling"
          title="Scaling Benchmark Snapshot"
          description="Throughput and latency observations filtered to scaling benchmarks."
        />

        {/* Section 1: Horizontal Scaling */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-blue-400">1.</span>
            Horizontal Scaling
          </h2>
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-slate-300 leading-relaxed mb-6">
              One agent instance can&apos;t handle thousands of users. Scale horizontally: run multiple 
              instances behind a load balancer.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Architecture Diagram</h3>
              <pre className="text-sm text-slate-300 font-mono bg-black/30 p-6 rounded-lg overflow-x-auto">
{`┌─────────────────┐
│   Load Balancer │  (nginx, AWS ALB, Cloudflare)
│   (Round Robin) │
└────────┬────────┘
         │
    ┌────┴────┬────────┬────────┐
    │         │        │        │
┌───▼──┐  ┌───▼──┐ ┌───▼──┐ ┌───▼──┐
│Agent │  │Agent │ │Agent │ │Agent │  (Stateless workers)
│  1   │  │  2   │ │  3   │ │  4   │
└───┬──┘  └───┬──┘ └───┬──┘ └───┬──┘
    │         │        │        │
    └────┬────┴────────┴────────┘
         │
    ┌────▼──────────┐
    │ Shared State  │  (Redis, PostgreSQL)
    │   - Sessions  │
    │   - Cache     │
    │   - Queue     │
    └───────────────┘`}
              </pre>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Key Principles</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex gap-3">
                  <span className="text-blue-400 flex-shrink-0 font-bold">1.</span>
                  <div>
                    <strong className="text-white">Stateless agents:</strong> No in-memory state. 
                    All state lives in shared storage (Redis, DB).
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 flex-shrink-0 font-bold">2.</span>
                  <div>
                    <strong className="text-white">Session affinity (optional):</strong> Route same 
                    user to same instance for cache locality.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 flex-shrink-0 font-bold">3.</span>
                  <div>
                    <strong className="text-white">Health checks:</strong> Load balancer removes 
                    unhealthy instances automatically.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 flex-shrink-0 font-bold">4.</span>
                  <div>
                    <strong className="text-white">Auto-scaling:</strong> Add/remove instances based 
                    on CPU, memory, or queue depth.
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Docker Compose Example</h3>
              <pre className="text-sm text-slate-300 font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
{`version: &apos;3.8&apos;

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - agent

  agent:
    build: .
    deploy:
      replicas: 4  # Run 4 agent instances
      resources:
        limits:
          cpus: &apos;0.5&apos;
          memory: 512M
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgres://db:5432/agent
    depends_on:
      - redis
      - db

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  db:
    image: postgres:15-alpine
    volumes:
      - db_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=\${DB_PASSWORD}

volumes:
  redis_data:
  db_data:`}
              </pre>
            </div>
          </div>
        </section>

        {/* Section 2: Queue-Based Processing */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-blue-400">2.</span>
            Queue-Based Processing
          </h2>
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-slate-300 leading-relaxed mb-6">
              Don&apos;t make users wait for slow operations. Use queues to decouple request/response 
              from background work.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Pattern: Task Queue</h3>
              <pre className="text-sm text-slate-300 font-mono bg-black/30 p-6 rounded-lg overflow-x-auto mb-4">
{`┌──────┐      ┌──────┐      ┌────────┐      ┌───────┐
│Client│ ───► │ API  │ ───► │ Queue  │ ───► │Worker │
└──────┘  1   └──────┘  2   └────────┘  3   └───────┘
  ▲             │                              │
  │             │ Job ID                       │
  │             ▼                              │
  │         ┌──────┐                           │
  └─────────┤Status│ ◄─────────────────────────┘
      5     └──────┘          4

1. Client submits task
2. API creates job, returns job ID immediately  
3. Job sits in queue
4. Worker picks up job, processes, updates status
5. Client polls for status/result`}
              </pre>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Python Implementation (Celery)</h3>
              <pre className="text-sm text-slate-300 font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
{`# tasks.py
from celery import Celery
import time

app = Celery(&apos;agent&apos;, broker=&apos;redis://localhost:6379/0&apos;)

@app.task(bind=True)
def process_complex_query(self, query: str, user_id: int):
    """Long-running agent task."""
    # Update progress
    self.update_state(state=&apos;PROCESSING', meta={'progress': 0})
    
    # Step 1: Fetch context
    context = fetch_user_context(user_id)
    self.update_state(state='PROCESSING', meta={'progress': 25})
    
    # Step 2: Call LLM
    response = call_llm(query, context)
    self.update_state(state='PROCESSING', meta={'progress': 75})
    
    # Step 3: Store result
    save_result(user_id, response)
    self.update_state(state='PROCESSING', meta={'progress': 100})
    
    return {'result': response, 'user_id': user_id}

# api.py
from fastapi import FastAPI
from tasks import process_complex_query

app = FastAPI()

@app.post("/query")
async def submit_query(query: str, user_id: int):
    # Queue the task
    task = process_complex_query.delay(query, user_id)
    
    # Return immediately with task ID
    return {
        "job_id": task.id,
        "status": "queued",
        "status_url": f"/status/{task.id}"
    }

@app.get("/status/{job_id}")
async def check_status(job_id: str):
    task = process_complex_query.AsyncResult(job_id)
    
    if task.state == 'PENDING':
        return {"status": "queued"}
    elif task.state == 'PROCESSING':
        return {"status": "processing", "progress": task.info.get('progress', 0)}
    elif task.state == 'SUCCESS':
        return {"status": "complete", "result": task.result}
    else:
        return {"status": "failed", "error": str(task.info)}`}
              </pre>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-blue-400 mb-4">💡 When to Use Queues</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-emerald-400 text-sm font-semibold mb-2">✓ Good For:</div>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li>→ Tasks taking &gt;5 seconds</li>
                    <li>→ Batch processing</li>
                    <li>→ Email/notification sending</li>
                    <li>→ Document analysis</li>
                    <li>→ Report generation</li>
                  </ul>
                </div>
                <div>
                  <div className="text-rose-400 text-sm font-semibold mb-2">✗ Not For:</div>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li>→ Real-time chat</li>
                    <li>→ Simple queries (&lt;2s)</li>
                    <li>→ High interactivity needs</li>
                    <li>→ User expects instant response</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Rate Limit Management */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-blue-400">3.</span>
            Rate Limit Management
          </h2>
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-slate-300 leading-relaxed mb-6">
              LLM APIs have rate limits. Don&apos;t crash when you hit them. Implement intelligent 
              backoff and retry strategies.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Exponential Backoff with Jitter</h3>
              <pre className="text-sm text-slate-300 font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
{`import time
import random
from openai import OpenAI, RateLimitError

client = OpenAI()

def call_llm_with_retry(
    messages: list,
    max_retries: int = 5,
    base_delay: float = 1.0,
    max_delay: float = 60.0
):
    """Call LLM with exponential backoff on rate limits."""
    
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="gpt-4",
                messages=messages
            )
            return response
            
        except RateLimitError as e:
            if attempt == max_retries - 1:
                raise  # Final attempt failed
            
            # Calculate delay: 2^attempt * base_delay + random jitter
            delay = min(
                (2 ** attempt) * base_delay + random.uniform(0, 1),
                max_delay
            )
            
            print(f"Rate limited. Retrying in {delay:.2f}s (attempt {attempt + 1}/{max_retries})")
            time.sleep(delay)
    
    raise Exception("Max retries exceeded")

# Usage
response = call_llm_with_retry([
    {"role": "user", "content": "Hello!"}
])

# Retry delays: ~1s, ~2s, ~4s, ~8s, ~16s (with jitter)`}
              </pre>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Token Bucket Rate Limiter</h3>
              <p className="text-slate-300 mb-4">
                Proactively limit your own request rate to stay under API limits.
              </p>
              <pre className="text-sm text-slate-300 font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
{`import time
import asyncio

class TokenBucket:
    """Rate limiter using token bucket algorithm."""
    
    def __init__(self, rate: float, capacity: float):
        """
        Args:
            rate: Tokens per second (e.g., 60 for 60 req/min)
            capacity: Max burst size
        """
        self.rate = rate
        self.capacity = capacity
        self.tokens = capacity
        self.last_update = time.time()
    
    async def acquire(self, tokens: float = 1.0):
        """Wait until tokens are available."""
        while True:
            now = time.time()
            elapsed = now - self.last_update
            
            # Add tokens based on elapsed time
            self.tokens = min(
                self.capacity,
                self.tokens + elapsed * self.rate
            )
            self.last_update = now
            
            # Check if we have enough tokens
            if self.tokens >= tokens:
                self.tokens -= tokens
                return
            
            # Wait for more tokens
            wait_time = (tokens - self.tokens) / self.rate
            await asyncio.sleep(wait_time)

# Create limiter: 50 requests per minute
limiter = TokenBucket(rate=50/60, capacity=10)

async def call_llm_rate_limited(prompt: str):
    # Wait for rate limit token
    await limiter.acquire()
    
    # Now safe to call API
    return client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )

# Multiple concurrent calls will automatically queue
tasks = [call_llm_rate_limited(f"Query {i}") for i in range(100)]
results = await asyncio.gather(*tasks)  # Respects rate limit`}
              </pre>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-amber-400 mb-4">⚠️ Multi-Tenant Considerations</h3>
              <p className="text-slate-300 mb-4">
                In SaaS scenarios, don&apos;t let one user exhaust rate limits for everyone:
              </p>
              <ul className="space-y-2 text-slate-300">
                <li className="flex gap-3">
                  <span className="text-amber-400 flex-shrink-0">→</span>
                  <span>Implement <strong>per-user</strong> rate limits</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-400 flex-shrink-0">→</span>
                  <span>Use separate API keys per customer (enterprise)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-400 flex-shrink-0">→</span>
                  <span>Queue lower-priority requests behind high-priority ones</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-400 flex-shrink-0">→</span>
                  <span>Monitor per-user usage and throttle heavy users</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4: Graceful Degradation */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-blue-400">4.</span>
            Graceful Degradation
          </h2>
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-slate-300 leading-relaxed mb-6">
              LLM APIs go down. Your agent should degrade gracefully, not crash completely.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Strategy 1: Fallback Models</h3>
              <pre className="text-sm text-slate-300 font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
{`class LLMClient:
    def __init__(self):
        self.models = [
            ("gpt-4-turbo", OpenAI()),           # Primary
            ("claude-3.5-sonnet", Anthropic()),   # Fallback 1
            ("gpt-3.5-turbo", OpenAI()),         # Fallback 2
        ]
    
    async def generate(self, prompt: str, max_attempts: int = 3):
        last_error = None
        
        for model_name, client in self.models[:max_attempts]:
            try:
                print(f"Trying {model_name}...")
                response = await client.generate(prompt)
                print(f"✓ Success with {model_name}")
                return response
                
            except Exception as e:
                print(f"✗ {model_name} failed: {e}")
                last_error = e
                continue
        
        # All models failed
        raise Exception(f"All models failed. Last error: {last_error}")

# Usage
llm = LLMClient()
response = await llm.generate("Hello!")  # Auto-falls back if needed`}
              </pre>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Strategy 2: Cached/Template Responses</h3>
              <pre className="text-sm text-slate-300 font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
{`class ResilientAgent:
    def __init__(self):
        self.llm = LLMClient()
        self.cache = SemanticCache()
        self.templates = {
            "greeting": "Hello! I&apos;m experiencing high load. Your request has been queued.",
            "status": "System status: {status}. Expected recovery: {eta}",
            "error": "I&apos;m temporarily unavailable. Please try again in a few minutes."
        }
    
    async def respond(self, user_message: str):
        # Try cache first
        cached = self.cache.get(user_message)
        if cached:
            return cached
        
        # Try LLM
        try:
            response = await self.llm.generate(user_message, timeout=5)
            self.cache.set(user_message, response)
            return response
            
        except TimeoutError:
            # LLM is slow - queue it
            job_id = self.queue.submit(user_message)
            return self.templates[&quot;greeting&quot;].format(job_id=job_id)
            
        except Exception:
            # LLM is down - return template
            return self.templates[&quot;error&quot;]`}
              </pre>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Strategy 3: Circuit Breaker</h3>
              <p className="text-slate-300 mb-4">
                Stop calling a failing service to avoid cascading failures.
              </p>
              <pre className="text-sm text-slate-300 font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
{`from enum import Enum
import time

class CircuitState(Enum):
    CLOSED = "closed"    # Normal operation
    OPEN = "open"        # Failing, reject requests
    HALF_OPEN = "half_open"  # Testing recovery

class CircuitBreaker:
    def __init__(self, failure_threshold: int = 5, timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failures = 0
        self.last_failure_time = None
        self.state = CircuitState.CLOSED
    
    def call(self, func, *args, **kwargs):
        # Check if circuit should reset
        if self.state == CircuitState.OPEN:
            if time.time() - self.last_failure_time > self.timeout:
                print("Circuit HALF_OPEN - testing recovery")
                self.state = CircuitState.HALF_OPEN
            else:
                raise Exception("Circuit breaker OPEN - service unavailable")
        
        # Attempt call
        try:
            result = func(*args, **kwargs)
            
            # Success - reset if we were testing
            if self.state == CircuitState.HALF_OPEN:
                print("Circuit CLOSED - service recovered")
                self.state = CircuitState.CLOSED
                self.failures = 0
            
            return result
            
        except Exception as e:
            self.failures += 1
            self.last_failure_time = time.time()
            
            # Open circuit if threshold exceeded
            if self.failures >= self.failure_threshold:
                print(f"Circuit OPEN - {self.failures} failures")
                self.state = CircuitState.OPEN
            
            raise e

# Usage
breaker = CircuitBreaker(failure_threshold=3, timeout=30)

def call_llm_protected(prompt):
    return breaker.call(call_llm, prompt)

# After 3 failures, circuit opens for 30 seconds
# Prevents hammering a failing service`}
              </pre>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-purple-400 mb-4">🎯 Degradation Hierarchy</h3>
              <div className="space-y-3 text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 flex-shrink-0 font-bold">1.</span>
                  <div>
                    <strong>Full service:</strong> Primary LLM with all features
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 flex-shrink-0 font-bold">2.</span>
                  <div>
                    <strong>Fallback model:</strong> Secondary LLM, maybe lower quality
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 flex-shrink-0 font-bold">3.</span>
                  <div>
                    <strong>Cached responses:</strong> Serve from semantic cache
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 flex-shrink-0 font-bold">4.</span>
                  <div>
                    <strong>Queue + template:</strong> &ldquo;Request queued, check back later&rdquo;
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-rose-400 flex-shrink-0 font-bold">5.</span>
                  <div>
                    <strong>Error message:</strong> &ldquo;Service temporarily unavailable&rdquo;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Monitoring & Observability */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-blue-400">5.</span>
            Monitoring & Observability
          </h2>
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-slate-300 leading-relaxed mb-6">
              You can&apos;t scale what you can&apos;t measure. Instrument your agents to understand 
              performance and bottlenecks.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Key Metrics to Track</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    metric: "Request Rate",
                    target: "requests/second",
                    why: "Capacity planning"
                  },
                  {
                    metric: "Latency (p50, p95, p99)",
                    target: "&lt;2s, &lt;5s, &lt;10s",
                    why: "User experience"
                  },
                  {
                    metric: "Error Rate",
                    target: "&lt;1%",
                    why: "Reliability"
                  },
                  {
                    metric: "Token Usage",
                    target: "tokens/request",
                    why: "Cost control"
                  },
                  {
                    metric: "Cache Hit Rate",
                    target: "&gt;60%",
                    why: "Efficiency"
                  },
                  {
                    metric: "Queue Depth",
                    target: "&lt;100",
                    why: "Backpressure"
                  },
                ].map((item) => (
                  <div key={item.metric} className="bg-black/30 rounded-lg p-4">
                    <div className="text-white font-semibold mb-1">{item.metric}</div>
                    <div className="text-blue-400 text-sm mb-2">{item.target}</div>
                    <div className="text-slate-400 text-xs">{item.why}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Simple Python Instrumentation</h3>
              <pre className="text-sm text-slate-300 font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
{`import time
import logging
from functools import wraps
from prometheus_client import Counter, Histogram

# Metrics
requests_total = Counter(&apos;agent_requests_total&apos;, &apos;Total requests&apos;, [&apos;status'])
request_duration = Histogram('agent_request_duration_seconds', 'Request duration')
tokens_used = Counter('agent_tokens_used_total', 'Total tokens', ['model'])

def monitor_agent_call(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start = time.time()
        status = "success"
        
        try:
            result = await func(*args, **kwargs)
            
            # Track token usage
            if hasattr(result, 'usage'):
                tokens_used.labels(model=result.model).inc(result.usage.total_tokens)
            
            return result
            
        except Exception as e:
            status = "error"
            logging.error(f"Agent call failed: {e}")
            raise
            
        finally:
            # Record metrics
            duration = time.time() - start
            request_duration.observe(duration)
            requests_total.labels(status=status).inc()
            
            logging.info(f"Call completed in {duration:.2f}s - {status}")
    
    return wrapper

@monitor_agent_call
async def process_query(query: str):
    # Your agent logic here
    response = await call_llm(query)
    return response`}
              </pre>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 rounded-2xl p-10">
          <h2 className="text-3xl font-bold text-white mb-6">Scaling Checklist</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Design stateless agents (externalize all state)",
              "Deploy behind load balancer with auto-scaling",
              "Use queues for long-running tasks",
              "Implement exponential backoff for rate limits",
              "Add per-user rate limiting in multi-tenant setups",
              "Build fallback chain (primary → secondary → cache → template)",
              "Implement circuit breaker for external dependencies",
              "Monitor request rate, latency, errors, token usage",
              "Set up alerts for high error rates or latency spikes",
              "Load test before production (10x expected traffic)",
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
            href="/performance/caching"
            className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center text-white font-medium transition-colors"
          >
            ← Caching Strategies
          </Link>
          <Link
            href="/performance"
            className="flex-1 px-6 py-4 bg-blue-500 hover:bg-blue-600 rounded-xl text-center text-white font-medium transition-colors shadow-lg shadow-blue-500/25"
          >
            Back to Performance Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
