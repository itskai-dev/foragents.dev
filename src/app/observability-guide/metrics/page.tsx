"use client";

import { useState } from "react";
import Link from "next/link";
import { LineChart, TrendingUp, AlertCircle, Activity } from "lucide-react";

interface Metric {
  name: string;
  category: "performance" | "cost" | "reliability" | "business";
  description: string;
  type: "counter" | "gauge" | "histogram";
  labels?: string[];
  alertThreshold?: string;
  code: string;
}

const KEY_METRICS: Metric[] = [
  {
    name: "agent_requests_total",
    category: "performance",
    description: "Total number of agent requests (success + failure)",
    type: "counter",
    labels: ["status", "userId", "agentType"],
    code: `import { Counter } from 'prom-client';

const requestCounter = new Counter({
  name: 'agent_requests_total',
  help: 'Total agent requests',
  labelNames: ['status', 'userId', 'agentType'],
});

// Instrument
requestCounter.inc({ status: 'success', userId: 'user-123', agentType: 'assistant' });`,
  },
  {
    name: "agent_request_duration_seconds",
    category: "performance",
    description: "Agent request latency (p50, p95, p99)",
    type: "histogram",
    labels: ["agentType", "operation"],
    alertThreshold: "p95 > 5s",
    code: `import { Histogram } from 'prom-client';

const requestDuration = new Histogram({
  name: 'agent_request_duration_seconds',
  help: 'Agent request latency',
  labelNames: ['agentType', 'operation'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30], // seconds
});

// Instrument
const start = Date.now();
const result = await agent.execute(request);
requestDuration.observe(
  { agentType: 'assistant', operation: 'chat' },
  (Date.now() - start) / 1000
);`,
  },
  {
    name: "agent_llm_tokens_total",
    category: "cost",
    description: "Total LLM tokens consumed (prompt + completion)",
    type: "counter",
    labels: ["model", "operation", "cached"],
    code: `const tokenCounter = new Counter({
  name: 'agent_llm_tokens_total',
  help: 'Total LLM tokens consumed',
  labelNames: ['model', 'operation', 'cached'],
});

// After LLM call
tokenCounter.inc(
  { model: 'gpt-4-turbo', operation: 'completion', cached: 'false' },
  response.usage.total_tokens
);`,
  },
  {
    name: "agent_llm_cost_usd",
    category: "cost",
    description: "Estimated LLM cost in USD",
    type: "counter",
    labels: ["model", "userId"],
    alertThreshold: "Daily cost > $100",
    code: `const costCounter = new Counter({
  name: 'agent_llm_cost_usd',
  help: 'Estimated LLM cost',
  labelNames: ['model', 'userId'],
});

// Calculate cost based on token pricing
const cost = calculateCost(response.usage, 'gpt-4-turbo');
costCounter.inc({ model: 'gpt-4-turbo', userId: 'user-123' }, cost);`,
  },
  {
    name: "agent_tool_calls_total",
    category: "performance",
    description: "Tool invocations by tool name and status",
    type: "counter",
    labels: ["tool", "status"],
    code: `const toolCallCounter = new Counter({
  name: 'agent_tool_calls_total',
  help: 'Tool invocations',
  labelNames: ['tool', 'status'],
});

try {
  await tools[toolName].execute(params);
  toolCallCounter.inc({ tool: toolName, status: 'success' });
} catch (error) {
  toolCallCounter.inc({ tool: toolName, status: 'failure' });
  throw error;
}`,
  },
  {
    name: "agent_tool_duration_seconds",
    category: "performance",
    description: "Tool execution latency",
    type: "histogram",
    labels: ["tool"],
    alertThreshold: "p99 > 10s",
    code: `const toolDuration = new Histogram({
  name: 'agent_tool_duration_seconds',
  help: 'Tool execution latency',
  labelNames: ['tool'],
  buckets: [0.05, 0.1, 0.5, 1, 2, 5, 10],
});

const start = Date.now();
const result = await tools[toolName].execute(params);
toolDuration.observe({ tool: toolName }, (Date.now() - start) / 1000);`,
  },
  {
    name: "agent_errors_total",
    category: "reliability",
    description: "Total errors by type and severity",
    type: "counter",
    labels: ["errorType", "severity", "recoverable"],
    alertThreshold: "Error rate > 5%",
    code: `const errorCounter = new Counter({
  name: 'agent_errors_total',
  help: 'Total errors',
  labelNames: ['errorType', 'severity', 'recoverable'],
});

catch (error) {
  errorCounter.inc({
    errorType: error.name,
    severity: getSeverity(error),
    recoverable: isRetryable(error) ? 'true' : 'false',
  });
}`,
  },
  {
    name: "agent_queue_depth",
    category: "performance",
    description: "Current number of queued agent requests",
    type: "gauge",
    labels: ["priority"],
    alertThreshold: "Queue depth > 100",
    code: `import { Gauge } from 'prom-client';

const queueDepth = new Gauge({
  name: 'agent_queue_depth',
  help: 'Queued agent requests',
  labelNames: ['priority'],
});

// Update as queue changes
queueDepth.set({ priority: 'high' }, highPriorityQueue.length);
queueDepth.set({ priority: 'normal' }, normalPriorityQueue.length);`,
  },
  {
    name: "agent_success_rate",
    category: "reliability",
    description: "Percentage of successful requests (business metric)",
    type: "gauge",
    labels: ["agentType"],
    alertThreshold: "Success rate < 95%",
    code: `// Derived from agent_requests_total
// Calculate in your monitoring tool (Prometheus, Datadog, etc.)
// Prometheus query:
// rate(agent_requests_total{status="success"}[5m]) / 
// rate(agent_requests_total[5m])`,
  },
  {
    name: "agent_context_switches_total",
    category: "business",
    description: "Number of times agent switches context (workspace, project, etc.)",
    type: "counter",
    labels: ["fromContext", "toContext"],
    code: `const contextSwitchCounter = new Counter({
  name: 'agent_context_switches_total',
  help: 'Context switches',
  labelNames: ['fromContext', 'toContext'],
});

contextSwitchCounter.inc({
  fromContext: 'project-a',
  toContext: 'project-b',
});`,
  },
];

const DASHBOARD_PATTERNS = [
  {
    name: "Agent Health Overview",
    description: "Single-pane view of overall agent health",
    panels: [
      { metric: "Request Rate", query: "rate(agent_requests_total[5m])", viz: "Line chart" },
      { metric: "Success Rate", query: "success / total requests", viz: "Single stat (95%+)" },
      { metric: "Error Rate", query: "rate(agent_errors_total[5m])", viz: "Line chart (alert if > 5%)" },
      { metric: "p95 Latency", query: "histogram_quantile(0.95, agent_request_duration_seconds)", viz: "Line chart" },
      { metric: "Queue Depth", query: "agent_queue_depth", viz: "Gauge" },
      { metric: "Active Users", query: "count(distinct userId)", viz: "Single stat" },
    ],
  },
  {
    name: "Cost & Token Usage",
    description: "Track LLM costs and optimize spend",
    panels: [
      { metric: "Daily Cost", query: "increase(agent_llm_cost_usd[1d])", viz: "Bar chart by model" },
      { metric: "Tokens/Request", query: "avg(tokens) by model", viz: "Line chart" },
      { metric: "Cost per User", query: "sum(cost) by userId", viz: "Table (top 10)" },
      { metric: "Cache Hit Rate", query: "cached / total tokens", viz: "Single stat" },
      { metric: "Model Distribution", query: "count by model", viz: "Pie chart" },
    ],
  },
  {
    name: "Tool Performance",
    description: "Analyze tool usage and bottlenecks",
    panels: [
      { metric: "Tool Call Volume", query: "rate(agent_tool_calls_total[5m]) by tool", viz: "Stacked area" },
      { metric: "Tool Latency", query: "histogram_quantile(0.95, tool_duration) by tool", viz: "Bar chart" },
      { metric: "Tool Error Rate", query: "errors / total by tool", viz: "Heatmap" },
      { metric: "Slowest Tools", query: "topk(5, p95 latency by tool)", viz: "Table" },
    ],
  },
  {
    name: "User Experience",
    description: "User-centric metrics for product teams",
    panels: [
      { metric: "Session Duration", query: "avg(session_duration_seconds)", viz: "Line chart" },
      { metric: "Messages per Session", query: "avg(messages)", viz: "Histogram" },
      { metric: "User Satisfaction", query: "thumbs_up / (thumbs_up + thumbs_down)", viz: "Single stat" },
      { metric: "Retry Rate", query: "retries / total requests", viz: "Line chart" },
    ],
  },
];

const ALERT_RULES = [
  {
    name: "High Error Rate",
    severity: "critical",
    condition: "Error rate > 5% for 5 minutes",
    query: "rate(agent_errors_total[5m]) / rate(agent_requests_total[5m]) > 0.05",
    action: "Page on-call engineer",
    why: "Users are experiencing failures. Immediate investigation required.",
  },
  {
    name: "Slow Response Time",
    severity: "warning",
    condition: "p95 latency > 5 seconds for 10 minutes",
    query: "histogram_quantile(0.95, rate(agent_request_duration_seconds_bucket[5m])) > 5",
    action: "Notify team Slack channel",
    why: "Degraded user experience. May indicate scaling issues or slow LLM responses.",
  },
  {
    name: "Queue Buildup",
    severity: "warning",
    condition: "Queue depth > 100 for 5 minutes",
    query: "agent_queue_depth > 100",
    action: "Auto-scale workers or notify ops team",
    why: "Requests are backing up. May need to add capacity or shed load.",
  },
  {
    name: "Cost Spike",
    severity: "warning",
    condition: "Hourly cost > 2x baseline",
    query: "increase(agent_llm_cost_usd[1h]) > 2 * avg_over_time(increase(agent_llm_cost_usd[1h])[7d])",
    action: "Notify finance/eng leads",
    why: "Unexpected cost increase. Could indicate a runaway agent, attack, or usage spike.",
  },
  {
    name: "Tool Failure Spike",
    severity: "high",
    condition: "Tool error rate > 10% for any tool",
    query: "rate(agent_tool_calls_total{status='failure'}[5m]) / rate(agent_tool_calls_total[5m]) > 0.10",
    action: "Alert on-call, investigate tool health",
    why: "A critical tool is failing. May cascade to agent failures.",
  },
  {
    name: "Zero Traffic",
    severity: "critical",
    condition: "No requests for 5 minutes",
    query: "rate(agent_requests_total[5m]) == 0",
    action: "Page on-call (potential outage)",
    why: "Complete service outage. Users cannot reach the agent.",
  },
];

const INSTRUMENTATION_CODE = {
  expressMiddleware: `import express from 'express';
import { register, collectDefaultMetrics } from 'prom-client';

collectDefaultMetrics(); // CPU, memory, etc.

const app = express();

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Request metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    requestDuration.observe(
      { method: req.method, route: req.route?.path, status: res.statusCode },
      duration
    );
    requestCounter.inc({ method: req.method, status: res.statusCode });
  });
  next();
});`,

  llmInstrumentation: `async function callLLM(prompt: string, model: string) {
  const start = Date.now();
  const operationId = randomUUID();
  
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
    });
    
    // Record metrics
    const durationSec = (Date.now() - start) / 1000;
    llmLatency.observe({ model, operation: 'completion' }, durationSec);
    
    const tokens = response.usage;
    tokenCounter.inc({ model, type: 'prompt' }, tokens.prompt_tokens);
    tokenCounter.inc({ model, type: 'completion' }, tokens.completion_tokens);
    
    const cost = calculateCost(tokens, model);
    costCounter.inc({ model }, cost);
    
    llmCallCounter.inc({ model, status: 'success' });
    
    return response;
  } catch (error) {
    llmCallCounter.inc({ model, status: 'failure' });
    throw error;
  }
}`,

  customBusinessMetrics: `// Track business-specific metrics
const userFeedbackGauge = new Gauge({
  name: 'agent_user_satisfaction',
  help: 'User satisfaction score (1-5)',
  labelNames: ['agentType'],
});

const sessionLengthHistogram = new Histogram({
  name: 'agent_session_duration_seconds',
  help: 'User session duration',
  buckets: [60, 300, 600, 1800, 3600], // 1min to 1hr
});

// Instrument
userFeedbackGauge.set({ agentType: 'assistant' }, averageRating);
sessionLengthHistogram.observe(sessionDurationSec);`,
};

export default function MetricsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredMetrics =
    selectedCategory === "all" ? KEY_METRICS : KEY_METRICS.filter((m) => m.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-12">
        <Link href="/observability-guide" className="text-purple-600 hover:underline mb-4 inline-block">
          ← Back to Observability Guide
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <LineChart className="w-10 h-10 text-green-600" />
          <h1 className="text-4xl font-bold">Metrics & Dashboards</h1>
        </div>
        <p className="text-lg text-gray-600">
          Key performance indicators for AI agents. Learn what to measure, how to instrument, and how to build
          actionable dashboards.
        </p>
      </div>

      {/* Why Metrics Matter */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Why Metrics Matter</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-gray-700 mb-4">
            Logs tell you <strong>what happened</strong>. Metrics tell you <strong>how often</strong>, <strong>how
            fast</strong>, and <strong>how much</strong>.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold mb-2">Metrics enable:</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Real-time dashboards and alerts</li>
                <li>• Performance regression detection</li>
                <li>• Capacity planning and autoscaling</li>
                <li>• Cost tracking and optimization</li>
                <li>• SLA/SLO compliance monitoring</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">Without metrics, you can't answer:</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Is the agent slower than yesterday?</li>
                <li>• Are we within budget for LLM costs?</li>
                <li>• Which tool is the bottleneck?</li>
                <li>• Can we handle 10x traffic?</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Metric Types */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Metric Types</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="border border-blue-300 rounded-lg p-6 bg-blue-50">
            <h3 className="font-bold text-lg mb-2">Counter</h3>
            <p className="text-sm text-gray-700 mb-3">
              Monotonically increasing value. Only goes up (or resets to 0).
            </p>
            <p className="text-xs text-gray-600 mb-2">
              <strong>Examples:</strong> Total requests, total errors, total tokens
            </p>
            <p className="text-xs text-gray-600">
              <strong>Query:</strong> <code className="bg-white px-1 rounded">rate(counter[5m])</code> for per-second rate
            </p>
          </div>
          <div className="border border-green-300 rounded-lg p-6 bg-green-50">
            <h3 className="font-bold text-lg mb-2">Gauge</h3>
            <p className="text-sm text-gray-700 mb-3">Current value that can go up or down.</p>
            <p className="text-xs text-gray-600 mb-2">
              <strong>Examples:</strong> Queue depth, active users, memory usage
            </p>
            <p className="text-xs text-gray-600">
              <strong>Query:</strong> <code className="bg-white px-1 rounded">gauge</code> (current value)
            </p>
          </div>
          <div className="border border-purple-300 rounded-lg p-6 bg-purple-50">
            <h3 className="font-bold text-lg mb-2">Histogram</h3>
            <p className="text-sm text-gray-700 mb-3">
              Distribution of values, calculates percentiles (p50, p95, p99).
            </p>
            <p className="text-xs text-gray-600 mb-2">
              <strong>Examples:</strong> Request latency, tool duration, token count per request
            </p>
            <p className="text-xs text-gray-600">
              <strong>Query:</strong> <code className="bg-white px-1 rounded">histogram_quantile(0.95, ...)</code>
            </p>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Key Agent Metrics</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1 rounded text-sm ${
                selectedCategory === "all" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory("performance")}
              className={`px-3 py-1 rounded text-sm ${
                selectedCategory === "performance" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => setSelectedCategory("cost")}
              className={`px-3 py-1 rounded text-sm ${
                selectedCategory === "cost" ? "bg-yellow-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              Cost
            </button>
            <button
              onClick={() => setSelectedCategory("reliability")}
              className={`px-3 py-1 rounded text-sm ${
                selectedCategory === "reliability" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              Reliability
            </button>
            <button
              onClick={() => setSelectedCategory("business")}
              className={`px-3 py-1 rounded text-sm ${
                selectedCategory === "business" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              Business
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {filteredMetrics.map((metric) => (
            <div key={metric.name} className="border border-gray-300 rounded-lg p-6 bg-white">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg font-mono">{metric.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{metric.description}</p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded uppercase font-semibold ${
                      metric.type === "counter"
                        ? "bg-blue-100 text-blue-800"
                        : metric.type === "gauge"
                          ? "bg-green-100 text-green-800"
                          : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {metric.type}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      metric.category === "performance"
                        ? "bg-blue-50 text-blue-700"
                        : metric.category === "cost"
                          ? "bg-yellow-50 text-yellow-700"
                          : metric.category === "reliability"
                            ? "bg-red-50 text-red-700"
                            : "bg-purple-50 text-purple-700"
                    }`}
                  >
                    {metric.category}
                  </span>
                </div>
              </div>

              {metric.labels && (
                <div className="mb-3">
                  <span className="text-xs font-semibold text-gray-600">Labels: </span>
                  <span className="text-xs font-mono text-gray-700">{metric.labels.join(", ")}</span>
                </div>
              )}

              {metric.alertThreshold && (
                <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded p-2">
                  <span className="text-xs font-semibold text-yellow-800">⚠️ Alert Threshold: </span>
                  <span className="text-xs text-yellow-700">{metric.alertThreshold}</span>
                </div>
              )}

              <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                <code>{metric.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard Patterns */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Dashboard Design Patterns</h2>
        <div className="space-y-6">
          {DASHBOARD_PATTERNS.map((dashboard) => (
            <div key={dashboard.name} className="border border-gray-300 rounded-lg p-6 bg-white">
              <h3 className="font-bold text-lg mb-2">{dashboard.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{dashboard.description}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-3 py-2 text-left">Panel</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Query/Metric</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Visualization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.panels.map((panel, idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-300 px-3 py-2 font-semibold">{panel.metric}</td>
                        <td className="border border-gray-300 px-3 py-2 font-mono text-xs">{panel.query}</td>
                        <td className="border border-gray-300 px-3 py-2">{panel.viz}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Alert Rules */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Alerting Best Practices</h2>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
          <p className="text-gray-700 mb-2">
            <strong>Golden Rule:</strong> Only alert on symptoms users care about (errors, latency, downtime).
          </p>
          <p className="text-sm text-gray-600">
            Don't alert on causes (high CPU, memory) unless they directly impact user experience.
          </p>
        </div>

        <div className="space-y-4">
          {ALERT_RULES.map((rule) => (
            <div
              key={rule.name}
              className={`border rounded-lg p-6 ${
                rule.severity === "critical"
                  ? "bg-red-50 border-red-300"
                  : rule.severity === "high"
                    ? "bg-orange-50 border-orange-300"
                    : "bg-yellow-50 border-yellow-300"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{rule.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{rule.condition}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded uppercase font-semibold ${
                    rule.severity === "critical"
                      ? "bg-red-200 text-red-900"
                      : rule.severity === "high"
                        ? "bg-orange-200 text-orange-900"
                        : "bg-yellow-200 text-yellow-900"
                  }`}
                >
                  {rule.severity}
                </span>
              </div>

              <div className="mb-3">
                <span className="text-xs font-semibold text-gray-700">Prometheus Query:</span>
                <pre className="bg-gray-900 text-gray-100 p-2 rounded text-xs mt-1 overflow-x-auto">
                  <code>{rule.query}</code>
                </pre>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-gray-700">Action:</span>
                  <p className="text-sm text-gray-700">{rule.action}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-700">Why it matters:</span>
                  <p className="text-sm text-gray-700">{rule.why}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Instrumentation Code */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Instrumentation Code Examples</h2>

        <div className="space-y-6">
          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <h3 className="font-bold text-lg mb-3">Express.js Middleware (Automatic Instrumentation)</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
              <code>{INSTRUMENTATION_CODE.expressMiddleware}</code>
            </pre>
          </div>

          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <h3 className="font-bold text-lg mb-3" id="token-tracking">
              LLM Call Instrumentation
            </h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
              <code>{INSTRUMENTATION_CODE.llmInstrumentation}</code>
            </pre>
          </div>

          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <h3 className="font-bold text-lg mb-3">Custom Business Metrics</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
              <code>{INSTRUMENTATION_CODE.customBusinessMetrics}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Related Guides */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/observability-guide/logging"
            className="border border-gray-300 rounded-lg p-6 hover:border-purple-500 hover:shadow-lg transition"
          >
            <h3 className="font-bold text-lg mb-2">📝 Logging Best Practices</h3>
            <p className="text-sm text-gray-600">
              Structured logging, correlation IDs, and what to log for debugging
            </p>
          </Link>
          <Link
            href="/observability-guide/tracing"
            className="border border-gray-300 rounded-lg p-6 hover:border-purple-500 hover:shadow-lg transition"
          >
            <h3 className="font-bold text-lg mb-2">🔍 Distributed Tracing</h3>
            <p className="text-sm text-gray-600">
              Trace multi-agent workflows with OpenTelemetry and span instrumentation
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
