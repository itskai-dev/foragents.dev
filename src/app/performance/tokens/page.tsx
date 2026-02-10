/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { PerformanceBenchmarksPanel } from "@/components/performance/performance-benchmarks-panel";

export const metadata: Metadata = {
  title: "Token Optimization Guide — forAgents.dev",
  description:
    "Reduce AI agent costs by 40-70% through intelligent token management. Learn prompt compression, response control, and model selection strategies.",
  alternates: {
    canonical: "https://foragents.dev/performance/tokens",
  },
};

export default function TokenOptimizationPage() {
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
            <span className="text-white">Token Optimization</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-6xl mb-6">💰</div>
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 text-transparent bg-clip-text">
          Token Optimization
        </h1>
        <p className="text-xl text-slate-400 leading-relaxed mb-8">
          Tokens are the currency of AI. Every prompt and response costs money and time. 
          Learn to optimize both through intelligent token management.
        </p>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: "Cost Savings", value: "40-70%", icon: "💵" },
            { label: "Speed Gain", value: "2-3x", icon: "⚡" },
            { label: "Implementation", value: "2-4h", icon: "⏱️" },
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
          category="tokens"
          title="Token Benchmark Snapshot"
          description="Prompt and cost metrics filtered to token optimization benchmarks."
        />

        {/* Section 1: Prompt Compression */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-blue-400">1.</span>
            Prompt Compression Techniques
          </h2>
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-slate-300 leading-relaxed mb-6">
              Most prompts contain redundant information. Every word costs tokens. Be ruthless about brevity.
            </p>

            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 mb-4">
              <div className="text-sm text-rose-400 font-semibold mb-3">❌ Before (312 tokens)</div>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
{`You are an extremely helpful AI assistant that specializes in helping users
with programming questions. Please analyze the following code snippet very
carefully and provide detailed feedback about what might be wrong with it.
If you find any issues, please explain them thoroughly and suggest how the
user might fix them. Also, please make sure to explain your reasoning clearly
so that the user can understand the problem.

Here is the code:
def calculate_sum(numbers):
    total = 0
    for num in numbers:
        total += num
    return total

Please provide your analysis below.`}
              </pre>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 mb-6">
              <div className="text-sm text-emerald-400 font-semibold mb-3">✅ After (89 tokens, 71% reduction)</div>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
{`Review this code for issues and suggest fixes:

\`\`\`python
def calculate_sum(numbers):
    total = 0
    for num in numbers:
        total += num
    return total
\`\`\``}
              </pre>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Compression Strategies</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex gap-3">
                  <span className="text-blue-400 flex-shrink-0">→</span>
                  <span><strong>Remove pleasantries:</strong> Skip &quot;please&quot;, &quot;thank you&quot;, filler words</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 flex-shrink-0">→</span>
                  <span><strong>Use instructions, not requests:</strong> &ldquo;List features&rdquo; not &ldquo;Can you list...&rdquo;</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 flex-shrink-0">→</span>
                  <span><strong>Eliminate redundancy:</strong> Say it once, clearly</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 flex-shrink-0">→</span>
                  <span><strong>Use code blocks:</strong> More token-efficient than prose descriptions</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 flex-shrink-0">→</span>
                  <span><strong>Abbreviate when clear:</strong> &ldquo;docs&rdquo; vs &ldquo;documentation&rdquo;, &ldquo;config&rdquo; vs &ldquo;configuration&rdquo;</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: Response Length Control */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-blue-400">2.</span>
            Control Response Length
          </h2>
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-slate-300 leading-relaxed mb-6">
              Output tokens cost just as much as input tokens. Constrain responses to what you need.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Explicit Length Constraints</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-blue-400 font-medium mb-2">For summaries:</div>
                  <code className="text-sm bg-black/30 px-3 py-1 rounded text-slate-300">
                    &ldquo;Summarize in 3 bullet points, max 15 words each&rdquo;
                  </code>
                </div>
                <div>
                  <div className="text-sm text-blue-400 font-medium mb-2">For code:</div>
                  <code className="text-sm bg-black/30 px-3 py-1 rounded text-slate-300">
                    &ldquo;Return only the function, no explanation&rdquo;
                  </code>
                </div>
                <div>
                  <div className="text-sm text-blue-400 font-medium mb-2">For analysis:</div>
                  <code className="text-sm bg-black/30 px-3 py-1 rounded text-slate-300">
                    &ldquo;Respond in &lt;100 words&rdquo;
                  </code>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-amber-400 mb-4">⚠️ Use max_tokens Parameter</h3>
              <p className="text-slate-300 mb-4">
                Set <code className="bg-black/30 px-2 py-1 rounded text-blue-400">max_tokens</code> in your API calls to hard-limit response size:
              </p>
              <pre className="text-sm text-slate-300 font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
{`# Python example
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": prompt}],
    max_tokens=150  # Hard limit
)`}
              </pre>
            </div>
          </div>
        </section>

        {/* Section 3: Few-Shot vs Zero-Shot */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-blue-400">3.</span>
            Few-Shot vs Zero-Shot Tradeoffs
          </h2>
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-slate-300 leading-relaxed mb-6">
              Examples (few-shot) improve accuracy but cost tokens. Use them wisely.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Zero-Shot ⚡</h3>
                <div className="text-sm text-emerald-400 mb-2">When to use:</div>
                <ul className="space-y-2 text-sm text-slate-300 mb-4">
                  <li>→ Task is straightforward</li>
                  <li>→ Model is highly capable (GPT-4, Claude)</li>
                  <li>→ Speed/cost is priority</li>
                  <li>→ Formatting is flexible</li>
                </ul>
                <div className="text-xs text-slate-400">~50-200 tokens</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Few-Shot 🎯</h3>
                <div className="text-sm text-amber-400 mb-2">When to use:</div>
                <ul className="space-y-2 text-sm text-slate-300 mb-4">
                  <li>→ Specific format required</li>
                  <li>→ Edge cases are common</li>
                  <li>→ Accuracy is critical</li>
                  <li>→ Using smaller/cheaper model</li>
                </ul>
                <div className="text-xs text-slate-400">~300-800 tokens</div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-blue-400 mb-4">💡 Best Practice: Progressive Enhancement</h3>
              <ol className="space-y-3 text-slate-300">
                <li className="flex gap-3">
                  <span className="text-blue-400 flex-shrink-0 font-bold">1.</span>
                  <span>Start with zero-shot for new tasks</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 flex-shrink-0 font-bold">2.</span>
                  <span>Monitor failure cases</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 flex-shrink-0 font-bold">3.</span>
                  <span>Add 1-2 examples only when needed</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 flex-shrink-0 font-bold">4.</span>
                  <span>Test if you can remove examples after fine-tuning</span>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* Section 4: Model Selection */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-blue-400">4.</span>
            Model Selection by Task
          </h2>
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-slate-300 leading-relaxed mb-6">
              Use the smallest model that can handle the task. GPT-4 for everything is wasteful.
            </p>

            <div className="space-y-4">
              {[
                {
                  task: "Simple classification",
                  model: "gpt-3.5-turbo",
                  cost: "$0.0005/1K",
                  example: "Categorize email as spam/not spam",
                },
                {
                  task: "Data extraction",
                  model: "gpt-3.5-turbo",
                  cost: "$0.0015/1K",
                  example: "Parse invoice fields from text",
                },
                {
                  task: "Code generation (simple)",
                  model: "gpt-4o-mini",
                  cost: "$0.150/1M",
                  example: "Generate CRUD API endpoint",
                },
                {
                  task: "Complex reasoning",
                  model: "gpt-4-turbo",
                  cost: "$0.01/1K",
                  example: "Multi-step problem solving",
                },
                {
                  task: "Code review/architecture",
                  model: "claude-3.5-sonnet",
                  cost: "$0.003/1K",
                  example: "Review system design, suggest improvements",
                },
              ].map((item) => (
                <div
                  key={item.task}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/[0.07] transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{item.task}</h3>
                    <div className="flex gap-3">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-mono">
                        {item.model}
                      </span>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-mono">
                        {item.cost}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">{item.example}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-purple-400 mb-4">🧪 A/B Test Model Performance</h3>
              <p className="text-slate-300 mb-4">
                Don&apos;t assume. Measure quality vs cost for your specific use case:
              </p>
              <pre className="text-sm text-slate-300 font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
{`# Test framework
models = ["gpt-3.5-turbo", "gpt-4o-mini", "gpt-4-turbo"]
results = {}

for model in models:
    results[model] = {
        "accuracy": evaluate_on_test_set(model),
        "avg_cost": calculate_avg_cost(model),
        "latency": measure_latency(model)
    }

# Pick the cheapest model that meets your accuracy threshold`}
              </pre>
            </div>
          </div>
        </section>

        {/* Section 5: Batching */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-blue-400">5.</span>
            Batching Strategies
          </h2>
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-slate-300 leading-relaxed mb-6">
              Process multiple items in a single request when possible. Reduces overhead and latency.
            </p>

            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 mb-4">
              <div className="text-sm text-rose-400 font-semibold mb-3">❌ Before: 10 separate API calls</div>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
{`for email in emails:
    result = classify_email(email)  # 10 API calls
    results.append(result)

# Cost: 10x API overhead
# Latency: ~10-20 seconds total`}
              </pre>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 mb-6">
              <div className="text-sm text-emerald-400 font-semibold mb-3">✅ After: 1 batched call</div>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
{`prompt = """Classify each email as spam/not spam.
Return JSON array: [{&quot;id&quot;: 1, &quot;spam&quot;: true}, ...]

Emails:
1. &quot;You won $1M! Click here...&quot;
2. &quot;Meeting notes from today...&quot;
..."""

result = classify_batch(prompt)  # 1 API call

# Cost: 60-70% reduction
# Latency: ~2-3 seconds total`}
              </pre>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Batching Guidelines</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex gap-3">
                  <span className="text-blue-400 flex-shrink-0">→</span>
                  <span><strong>Batch size:</strong> 5-20 items works well for most tasks</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 flex-shrink-0">→</span>
                  <span><strong>Use structured output:</strong> JSON arrays for easy parsing</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 flex-shrink-0">→</span>
                  <span><strong>Include IDs:</strong> Match results back to inputs</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 flex-shrink-0">→</span>
                  <span><strong>Don&apos;t over-batch:</strong> Very large batches can reduce accuracy</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 flex-shrink-0">→</span>
                  <span><strong>Handle partial failures:</strong> One bad item shouldn&apos;t kill the whole batch</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 rounded-2xl p-10">
          <h2 className="text-3xl font-bold text-white mb-6">Token Optimization Checklist</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Compress prompts ruthlessly",
              "Set explicit response length limits",
              "Use max_tokens parameter",
              "Start with zero-shot, add examples only when needed",
              "Choose smallest model that works",
              "A/B test model performance vs cost",
              "Batch similar requests together",
              "Monitor token usage in production",
              "Cache common prompts/responses",
              "Remove examples after fine-tuning",
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
            href="/performance"
            className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center text-white font-medium transition-colors"
          >
            ← Back to Performance Hub
          </Link>
          <Link
            href="/performance/caching"
            className="flex-1 px-6 py-4 bg-blue-500 hover:bg-blue-600 rounded-xl text-center text-white font-medium transition-colors shadow-lg shadow-blue-500/25"
          >
            Next: Caching Strategies →
          </Link>
        </div>
      </div>
    </div>
  );
}
