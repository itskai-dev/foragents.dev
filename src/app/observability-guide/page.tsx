"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, CheckCircle, XCircle } from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  description: string;
  guide: string;
}

const CHECKLIST: ChecklistItem[] = [
  {
    id: "structured-logging",
    title: "Structured Logging",
    priority: "critical",
    category: "Logging",
    description: "Implement JSON-formatted logs with correlation IDs for all agent decisions and tool calls",
    guide: "/observability-guide/logging",
  },
  {
    id: "error-tracking",
    title: "Error Tracking & Alerts",
    priority: "critical",
    category: "Metrics",
    description: "Track error rates, failures, and set up alerts for degraded agent performance",
    guide: "/observability-guide/metrics",
  },
  {
    id: "distributed-tracing",
    title: "Distributed Tracing",
    priority: "high",
    category: "Tracing",
    description: "Instrument multi-agent workflows with OpenTelemetry for end-to-end visibility",
    guide: "/observability-guide/tracing",
  },
  {
    id: "token-usage-metrics",
    title: "Token Usage Tracking",
    priority: "high",
    category: "Metrics",
    description: "Monitor token consumption, costs, and model latency across all LLM calls",
    guide: "/observability-guide/metrics#token-tracking",
  },
  {
    id: "correlation-ids",
    title: "Request Correlation",
    priority: "high",
    category: "Logging",
    description: "Propagate correlation IDs through all log statements for request tracing",
    guide: "/observability-guide/logging#correlation",
  },
  {
    id: "decision-logging",
    title: "Decision Audit Trail",
    priority: "medium",
    category: "Logging",
    description: "Log all agent reasoning steps, tool selections, and parameter choices",
    guide: "/observability-guide/logging#decisions",
  },
  {
    id: "latency-percentiles",
    title: "Latency Percentiles",
    priority: "medium",
    category: "Metrics",
    description: "Track p50, p95, p99 latencies for agent responses and tool executions",
    guide: "/observability-guide/metrics#latency",
  },
  {
    id: "span-instrumentation",
    title: "Span Instrumentation",
    priority: "medium",
    category: "Tracing",
    description: "Create spans for all tool calls, LLM requests, and context switches",
    guide: "/observability-guide/tracing#spans",
  },
];

const OBSERVABILITY_PILLARS = [
  {
    name: "Logs",
    icon: "📝",
    color: "blue",
    description: "Timestamped records of discrete events",
    useCases: [
      "Debugging agent decisions and failures",
      "Audit trails for compliance",
      "Root cause analysis",
      "Security incident investigation",
    ],
    keyMetrics: ["Log volume", "Error log rate", "Log ingestion lag"],
    guide: "/observability-guide/logging",
  },
  {
    name: "Metrics",
    icon: "📊",
    color: "green",
    description: "Numerical measurements aggregated over time",
    useCases: [
      "Performance monitoring and alerting",
      "Capacity planning",
      "Cost tracking (tokens, API calls)",
      "SLA/SLO tracking",
    ],
    keyMetrics: ["Latency percentiles", "Error rates", "Token usage", "Success rates"],
    guide: "/observability-guide/metrics",
  },
  {
    name: "Traces",
    icon: "🔍",
    color: "purple",
    description: "End-to-end request flow through distributed systems",
    useCases: [
      "Multi-agent workflow visibility",
      "Latency bottleneck identification",
      "Dependency mapping",
      "Tool call chain analysis",
    ],
    keyMetrics: ["Trace completion rate", "Span count", "Critical path latency"],
    guide: "/observability-guide/tracing",
  },
];

const MATURITY_LEVELS = [
  {
    level: 1,
    name: "Reactive",
    description: "Basic logging to console/files, manual debugging",
    characteristics: [
      "Print statements and console.log debugging",
      "No structured logging",
      "Manual log grepping",
      "No metrics or dashboards",
    ],
    limitations: "Can't answer: Why did the agent fail? What's the p95 latency? Which tool call is slow?",
  },
  {
    level: 2,
    name: "Aware",
    description: "Centralized logging, basic metrics",
    characteristics: [
      "Logs aggregated in central system (e.g., CloudWatch, Datadog)",
      "JSON structured logging with some context",
      "Basic metrics (error count, request count)",
      "Manual dashboard creation",
    ],
    limitations: "Limited correlation between logs and metrics. No distributed tracing. Reactive debugging.",
  },
  {
    level: 3,
    name: "Proactive",
    description: "Full observability with logs, metrics, traces",
    characteristics: [
      "Structured logging with correlation IDs",
      "Comprehensive metrics and alerting",
      "Distributed tracing with OpenTelemetry",
      "Pre-built dashboards for agent health",
    ],
    capabilities: "Can answer: What failed? Where? Why? How often? What's the user impact?",
  },
  {
    level: 4,
    name: "Predictive",
    description: "AI-powered observability, anomaly detection",
    characteristics: [
      "Automated anomaly detection on metrics",
      "Predictive alerting (issues before they impact users)",
      "Auto-remediation for known failure patterns",
      "Continuous profiling and optimization",
    ],
    capabilities:
      "System self-heals and auto-scales. Proactive alerts before user impact. Agent performance continuously optimized.",
  },
];

const TOOL_LANDSCAPE = [
  {
    category: "All-in-One Platforms",
    tools: [
      { name: "Datadog", features: ["Logs", "Metrics", "Traces", "APM"], agentFriendly: true },
      { name: "New Relic", features: ["Logs", "Metrics", "Traces", "AI Monitoring"], agentFriendly: true },
      { name: "Dynatrace", features: ["Full-stack observability", "AI ops"], agentFriendly: false },
    ],
  },
  {
    category: "Open Source",
    tools: [
      { name: "Grafana Stack", features: ["Loki (logs)", "Prometheus (metrics)", "Tempo (traces)"], agentFriendly: true },
      { name: "Elastic Stack", features: ["Elasticsearch", "Logstash", "Kibana"], agentFriendly: true },
      { name: "OpenTelemetry", features: ["Vendor-neutral instrumentation"], agentFriendly: true },
    ],
  },
  {
    category: "Specialized",
    tools: [
      { name: "Langfuse", features: ["LLM observability", "Token tracking", "Prompt management"], agentFriendly: true },
      { name: "LangSmith", features: ["LangChain tracing", "Eval workflows"], agentFriendly: true },
      { name: "Helicone", features: ["LLM proxy", "Cost tracking", "Caching"], agentFriendly: true },
    ],
  },
];

const QUICK_START_CODE = [
  {
    step: 1,
    title: "Structured Logging Setup",
    code: `// Use a structured logging library
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
});

// Log with context and correlation
logger.info({
  correlationId: req.id,
  userId: req.user.id,
  action: 'tool_call',
  tool: 'web_search',
  query: 'observability best practices',
  durationMs: 234,
}, 'Tool call completed');`,
  },
  {
    step: 2,
    title: "Basic Metrics with Prometheus",
    code: `import { Counter, Histogram } from 'prom-client';

// Define metrics
const toolCallCounter = new Counter({
  name: 'agent_tool_calls_total',
  help: 'Total number of tool calls',
  labelNames: ['tool', 'status'],
});

const llmLatency = new Histogram({
  name: 'agent_llm_latency_seconds',
  help: 'LLM request latency',
  labelNames: ['model', 'operation'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

// Instrument your code
const start = Date.now();
const result = await callLLM(prompt);
llmLatency.observe({ model: 'gpt-4', operation: 'completion' }, (Date.now() - start) / 1000);`,
  },
  {
    step: 3,
    title: "Distributed Tracing with OpenTelemetry",
    code: `import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('agent-runtime');

async function executeToolCall(toolName: string, params: any) {
  return tracer.startActiveSpan(\`tool.\${toolName}\`, async (span) => {
    try {
      span.setAttribute('tool.name', toolName);
      span.setAttribute('tool.params', JSON.stringify(params));
      
      const result = await tools[toolName](params);
      
      span.setStatus({ code: SpanStatusCode.OK });
      span.setAttribute('tool.result.size', JSON.stringify(result).length);
      
      return result;
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}`,
  },
];

export default function ObservabilityGuidePage() {
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const priorityColors = {
    critical: "text-red-600 bg-red-50 border-red-200",
    high: "text-orange-600 bg-orange-50 border-orange-200",
    medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
    low: "text-blue-600 bg-blue-50 border-blue-200",
  };

  const filteredChecklist =
    selectedPriority === "all"
      ? CHECKLIST
      : CHECKLIST.filter((item) => item.priority === selectedPriority);

  const toggleComplete = (id: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedItems(newCompleted);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Eye className="w-10 h-10 text-purple-600" />
          <h1 className="text-4xl font-bold">Agent Observability & Monitoring</h1>
        </div>
        <p className="text-lg text-gray-600">
          Comprehensive observability guide for AI agents. Monitor, debug, and optimize agent behavior with logs,
          metrics, and distributed tracing.
        </p>
      </div>

      {/* Three Pillars */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">The Three Pillars of Observability</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {OBSERVABILITY_PILLARS.map((pillar) => (
            <div
              key={pillar.name}
              className={`border-2 border-${pillar.color}-200 rounded-lg p-6 bg-${pillar.color}-50/50`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">{pillar.icon}</span>
                <h3 className="text-xl font-bold">{pillar.name}</h3>
              </div>
              <p className="text-sm text-gray-700 mb-4">{pillar.description}</p>
              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2">Use Cases:</h4>
                <ul className="text-sm space-y-1">
                  {pillar.useCases.map((useCase) => (
                    <li key={useCase} className="flex items-start gap-1">
                      <span className="text-xs mt-1">•</span>
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2">Key Metrics:</h4>
                <div className="flex flex-wrap gap-1">
                  {pillar.keyMetrics.map((metric) => (
                    <span key={metric} className="text-xs px-2 py-1 bg-white rounded border border-gray-300">
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
              <Link href={pillar.guide} className="text-sm font-semibold hover:underline inline-flex items-center gap-1">
                Deep Dive →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Why Observability Matters for Agents */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Why Observability Matters for AI Agents</h2>
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
          <p className="text-gray-700 mb-4">
            AI agents are <strong>non-deterministic black boxes</strong> that make autonomous decisions, call external
            tools, and chain complex reasoning steps. Without observability, you&apos;re flying blind:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-bold mb-2 text-red-600">❌ Without Observability</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• &quot;The agent failed&quot; — but why?</li>
                <li>• Debugging requires code changes & redeployment</li>
                <li>• Can&apos;t measure performance improvements</li>
                <li>• Users report issues before you know they exist</li>
                <li>• No visibility into cost (tokens, API calls)</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-bold mb-2 text-green-600">✅ With Observability</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Real-time dashboards show agent health</li>
                <li>• Trace requests end-to-end across tools</li>
                <li>• Debug production issues without redeployment</li>
                <li>• Alerts trigger before users notice degradation</li>
                <li>• Optimize costs with token/latency metrics</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-gray-600 italic">
            <strong>Rule of thumb:</strong> If you can&apos;t answer &quot;Why did this agent request fail?&quot; in under 2 minutes,
            your observability is insufficient.
          </p>
        </div>
      </section>

      {/* Maturity Model */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Observability Maturity Model</h2>
        <div className="space-y-4">
          {MATURITY_LEVELS.map((level) => (
            <div key={level.level} className="border border-gray-300 rounded-lg p-6 bg-white">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl">
                  {level.level}
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-xl mb-1">{level.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{level.description}</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Characteristics:</h4>
                      <ul className="text-sm space-y-1 text-gray-700">
                        {level.characteristics.map((char) => (
                          <li key={char} className="flex items-start gap-1">
                            <span className="text-xs mt-1">•</span>
                            <span>{char}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">
                        {level.capabilities ? "Capabilities:" : "Limitations:"}
                      </h4>
                      <p className="text-sm text-gray-700 italic">
                        {level.capabilities || level.limitations}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tool Landscape */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Observability Tool Landscape</h2>
        <div className="space-y-6">
          {TOOL_LANDSCAPE.map((category) => (
            <div key={category.category}>
              <h3 className="font-bold text-lg mb-3">{category.category}</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {category.tools.map((tool) => (
                  <div key={tool.name} className="border border-gray-300 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold">{tool.name}</h4>
                      {tool.agentFriendly && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Agent-friendly</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {tool.features.map((feature) => (
                        <span key={feature} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Start Checklist */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Quick Start Checklist</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPriority("all")}
              className={`px-3 py-1 rounded text-sm ${
                selectedPriority === "all" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedPriority("critical")}
              className={`px-3 py-1 rounded text-sm ${
                selectedPriority === "critical" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setSelectedPriority("high")}
              className={`px-3 py-1 rounded text-sm ${
                selectedPriority === "high" ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              High
            </button>
            <button
              onClick={() => setSelectedPriority("medium")}
              className={`px-3 py-1 rounded text-sm ${
                selectedPriority === "medium" ? "bg-yellow-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              Medium
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredChecklist.map((item) => (
            <div key={item.id} className={`border rounded-lg p-4 ${priorityColors[item.priority]}`}>
              <div className="flex items-start gap-3">
                <button onClick={() => toggleComplete(item.id)} className="mt-1 flex-shrink-0">
                  {completedItems.has(item.id) ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-gray-400" />
                  )}
                </button>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/50 uppercase font-semibold">
                      {item.priority}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/30">{item.category}</span>
                  </div>
                  <p className="text-sm mb-3">{item.description}</p>
                  <Link
                    href={item.guide}
                    className="text-sm font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    View Guide →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Start Code Examples */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Quick Start: 3 Essential Steps</h2>
        <div className="space-y-6">
          {QUICK_START_CODE.map((item) => (
            <div key={item.step} className="border border-gray-300 rounded-lg p-6 bg-white">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-lg mb-3">{item.title}</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                    <code>{item.code}</code>
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deep Dive Links */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Deep Dive Guides</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            href="/observability-guide/logging"
            className="border border-gray-300 rounded-lg p-6 hover:border-purple-500 hover:shadow-lg transition"
          >
            <h3 className="font-bold text-lg mb-2">📝 Logging Best Practices</h3>
            <p className="text-sm text-gray-600">
              Structured logging, correlation IDs, log levels, what to log, aggregation strategies
            </p>
          </Link>
          <Link
            href="/observability-guide/metrics"
            className="border border-gray-300 rounded-lg p-6 hover:border-purple-500 hover:shadow-lg transition"
          >
            <h3 className="font-bold text-lg mb-2">📊 Metrics & Dashboards</h3>
            <p className="text-sm text-gray-600">
              Key agent metrics, instrumentation patterns, dashboard design, alerting thresholds
            </p>
          </Link>
          <Link
            href="/observability-guide/tracing"
            className="border border-gray-300 rounded-lg p-6 hover:border-purple-500 hover:shadow-lg transition"
          >
            <h3 className="font-bold text-lg mb-2">🔍 Distributed Tracing</h3>
            <p className="text-sm text-gray-600">
              Multi-agent tracing, OpenTelemetry setup, span design, trace visualization
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
