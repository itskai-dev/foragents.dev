"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, AlertCircle, Info, AlertTriangle, XOctagon } from "lucide-react";

interface LogExample {
  title: string;
  description: string;
  level: "debug" | "info" | "warn" | "error";
  good: string;
  bad?: string;
}

const LOG_EXAMPLES: LogExample[] = [
  {
    title: "Tool Call Execution",
    description: "Log every tool invocation with parameters, duration, and result status",
    level: "info",
    good: `logger.info({
  correlationId: "req-abc123",
  userId: "user-456",
  action: "tool_call",
  tool: "web_search",
  params: { query: "best practices", maxResults: 5 },
  durationMs: 234,
  status: "success",
  resultSize: 1024,
}, "Tool call completed");`,
    bad: `console.log("web search done");`,
  },
  {
    title: "Agent Decision Point",
    description: "Log reasoning steps and why specific tools or approaches were chosen",
    level: "info",
    good: `logger.info({
  correlationId: "req-abc123",
  action: "reasoning",
  thought: "User wants weather, need location first",
  selectedTool: "get_location",
  alternatives: ["web_search", "ask_user"],
  confidence: 0.92,
}, "Agent decision");`,
    bad: `console.log("Choosing get_location tool");`,
  },
  {
    title: "Error Handling",
    description: "Capture full error context including stack, retry attempts, and impact",
    level: "error",
    good: `logger.error({
  correlationId: "req-abc123",
  action: "tool_call",
  tool: "database_query",
  error: {
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: error.code,
  },
  retryAttempt: 2,
  maxRetries: 3,
  userImpact: "Request failed, fallback to cached data",
}, "Tool execution failed");`,
    bad: `console.error("DB query failed:", error);`,
  },
  {
    title: "Context Switch",
    description: "Log when agent changes conversation context or workspace",
    level: "info",
    good: `logger.info({
  correlationId: "req-abc123",
  action: "context_switch",
  from: { workspace: "/project-a", sessionId: "sess-111" },
  to: { workspace: "/project-b", sessionId: "sess-222" },
  reason: "User explicitly requested project switch",
  preservedContext: ["user_preferences", "auth_token"],
}, "Context switched");`,
    bad: `console.log("Switched to project-b");`,
  },
  {
    title: "Token Usage",
    description: "Track LLM token consumption for cost and performance analysis",
    level: "info",
    good: `logger.info({
  correlationId: "req-abc123",
  action: "llm_call",
  model: "gpt-4-turbo",
  operation: "completion",
  tokens: {
    prompt: 1234,
    completion: 567,
    total: 1801,
  },
  cost: 0.0234, // USD
  durationMs: 1820,
  cached: false,
}, "LLM request completed");`,
    bad: `console.log("GPT-4 call done");`,
  },
  {
    title: "Security Event",
    description: "Always log potential security violations for audit trails",
    level: "warn",
    good: `logger.warn({
  correlationId: "req-abc123",
  userId: "user-789",
  action: "security_violation",
  type: "prompt_injection_detected",
  input: sanitizedInput.substring(0, 200), // Truncated for privacy
  patterns: ["ignore previous instructions"],
  blocked: true,
  severity: "high",
}, "Potential prompt injection blocked");`,
    bad: `console.log("Blocked suspicious input");`,
  },
];

const LOG_LEVELS = [
  {
    level: "DEBUG",
    icon: Info,
    color: "text-gray-600 bg-gray-100 border-gray-300",
    when: "Development/troubleshooting only",
    examples: [
      "Variable state changes",
      "Loop iterations",
      "Detailed function entry/exit",
      "Interim computation results",
    ],
    production: false,
  },
  {
    level: "INFO",
    icon: Info,
    color: "text-blue-600 bg-blue-100 border-blue-300",
    when: "Normal operations worth recording",
    examples: [
      "Tool calls started/completed",
      "Agent decisions and reasoning",
      "Context switches",
      "Session start/end",
    ],
    production: true,
  },
  {
    level: "WARN",
    icon: AlertTriangle,
    color: "text-yellow-600 bg-yellow-100 border-yellow-300",
    when: "Unexpected but recoverable situations",
    examples: [
      "Retry attempts after transient failures",
      "Deprecated API usage",
      "Approaching rate limits",
      "Potential security issues (blocked)",
    ],
    production: true,
  },
  {
    level: "ERROR",
    icon: XOctagon,
    color: "text-red-600 bg-red-100 border-red-300",
    when: "Failures that prevent operation completion",
    examples: [
      "Unhandled exceptions",
      "Tool execution failures",
      "External API errors",
      "Data validation failures",
    ],
    production: true,
  },
];

const CORRELATION_STRATEGIES = [
  {
    strategy: "Request ID Propagation",
    description: "Generate a unique ID for each user request and propagate it through all logs, traces, and metrics",
    code: `import { randomUUID } from 'crypto';
import { AsyncLocalStorage } from 'async_hooks';

const asyncLocalStorage = new AsyncLocalStorage();

// Middleware to create correlation context
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || randomUUID();
  asyncLocalStorage.run({ correlationId }, () => {
    req.correlationId = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    next();
  });
});

// Logger automatically includes correlation ID
function createLogger() {
  return {
    info: (data, msg) => {
      const context = asyncLocalStorage.getStore();
      console.log(JSON.stringify({
        ...data,
        correlationId: context?.correlationId,
        timestamp: new Date().toISOString(),
        level: 'info',
        message: msg,
      }));
    },
  };
}`,
  },
  {
    strategy: "Trace Context Injection",
    description: "Use OpenTelemetry to automatically inject trace IDs into logs for correlation",
    code: `import { trace } from '@opentelemetry/api';
import pino from 'pino';

const logger = pino({
  mixin: () => {
    const span = trace.getActiveSpan();
    if (!span) return {};
    
    const spanContext = span.spanContext();
    return {
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
      traceFlags: spanContext.traceFlags,
    };
  },
});

// Now all logs automatically include trace/span IDs
logger.info({ action: 'tool_call', tool: 'search' }, 'Executing tool');
// Output includes: { ..., traceId: "abc123...", spanId: "def456..." }`,
  },
  {
    strategy: "Hierarchical Context",
    description: "Maintain parent-child relationships in logs for multi-agent or nested operations",
    code: `class ExecutionContext {
  constructor(parentId = null) {
    this.id = randomUUID();
    this.parentId = parentId;
    this.startTime = Date.now();
  }
  
  createChild() {
    return new ExecutionContext(this.id);
  }
  
  toLogContext() {
    return {
      executionId: this.id,
      parentExecutionId: this.parentId,
      executionDepth: this.getDepth(),
      executionDurationMs: Date.now() - this.startTime,
    };
  }
}

// Usage
const rootCtx = new ExecutionContext();
logger.info({ ...rootCtx.toLogContext(), action: 'main_task' }, 'Starting task');

const childCtx = rootCtx.createChild();
logger.info({ ...childCtx.toLogContext(), action: 'sub_task' }, 'Delegated to sub-agent');`,
  },
];

const LOG_AGGREGATION = [
  {
    name: "Structured Format",
    description: "Always use JSON for logs. Never plain text.",
    example: {
      good: `{ "timestamp": "2026-02-09T21:00:00Z", "level": "info", "correlationId": "req-123", "action": "tool_call", "tool": "search", "durationMs": 234 }`,
      bad: `[INFO] 2026-02-09 21:00:00 - Tool search completed in 234ms`,
    },
    why: "JSON logs are machine-parseable, filterable, and can be queried in log aggregation tools. Plain text requires regex parsing.",
  },
  {
    name: "Standard Fields",
    description: "Use consistent field names across all logs",
    fields: [
      { name: "timestamp", type: "ISO8601 string", required: true },
      { name: "level", type: "debug|info|warn|error", required: true },
      { name: "correlationId", type: "string (UUID)", required: true },
      { name: "action", type: "string", required: false, description: "What happened (tool_call, reasoning, etc.)" },
      { name: "userId", type: "string", required: false },
      { name: "sessionId", type: "string", required: false },
      { name: "message", type: "string", required: true },
    ],
  },
  {
    name: "Sampling & Volume Control",
    description: "High-volume logs (like debug) should be sampled in production",
    code: `const shouldSample = (level: string, sampleRate: number) => {
  if (level === 'error') return true; // Always log errors
  if (level === 'debug' && process.env.NODE_ENV === 'production') {
    return Math.random() < sampleRate; // Sample 1% of debug logs
  }
  return true;
};

logger.debug = (data, msg) => {
  if (!shouldSample('debug', 0.01)) return;
  // ... log normally
};`,
  },
];

const BEST_PRACTICES = [
  {
    practice: "Log at Boundaries",
    description: "Always log when crossing system boundaries (API calls, database queries, external tool invocations)",
    why: "These are the most common failure points and debugging blind spots.",
  },
  {
    practice: "Avoid Logging Secrets",
    description: "Never log API keys, passwords, tokens, or PII. Redact sensitive fields.",
    code: `const redact = (obj: any) => {
  const sensitive = ['password', 'apiKey', 'token', 'secret', 'ssn', 'creditCard'];
  const redacted = { ...obj };
  for (const key of Object.keys(redacted)) {
    if (sensitive.some(s => key.toLowerCase().includes(s))) {
      redacted[key] = '[REDACTED]';
    }
  }
  return redacted;
};

logger.info(redact(userData), "User authenticated");`,
  },
  {
    practice: "Include Error Context",
    description: "When logging errors, include the full context needed to reproduce the issue",
    code: `try {
  const result = await tool.execute(params);
} catch (error) {
  logger.error({
    correlationId,
    action: 'tool_execution',
    tool: tool.name,
    params: redact(params), // Params that caused the error
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    retryable: isRetryable(error),
    userImpact: 'Request failed',
  }, 'Tool execution failed');
  throw error;
}`,
  },
  {
    practice: "Use Log Levels Consistently",
    description: "Don't use ERROR for warnings or INFO for errors. Be consistent across your codebase.",
    why: "Alerts and dashboards depend on accurate log levels. Mis-leveled logs cause alert fatigue or missed incidents.",
  },
  {
    practice: "Make Logs Searchable",
    description: "Use consistent field names and values that you can query in log aggregation tools",
    examples: [
      "action: 'tool_call' (not 'executing tool', 'tool exec', 'calling tool')",
      "status: 'success'|'failure' (not 'ok', 'done', 'error')",
    ],
  },
];

export default function LoggingPage() {
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  const filteredExamples =
    selectedLevel === "all" ? LOG_EXAMPLES : LOG_EXAMPLES.filter((ex) => ex.level === selectedLevel);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-12">
        <Link href="/observability-guide" className="text-purple-600 hover:underline mb-4 inline-block">
          ← Back to Observability Guide
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold">Logging Best Practices</h1>
        </div>
        <p className="text-lg text-gray-600">
          Structured logging strategies for AI agents. Learn what to log, how to format it, and how to make logs
          actionable.
        </p>
      </div>

      {/* What to Log */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">What to Log in AI Agents</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <p className="text-gray-700 mb-4">
            <strong>Golden Rule:</strong> Log everything needed to answer these questions:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">•</span>
              <span>What did the agent decide to do?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">•</span>
              <span>Why did it make that decision?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">•</span>
              <span>Which tools were called and with what parameters?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">•</span>
              <span>What was the outcome (success, failure, partial)?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">•</span>
              <span>How long did each operation take?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">•</span>
              <span>What was the cost (tokens, API calls)?</span>
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Log Examples by Category</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedLevel("all")}
                className={`px-3 py-1 rounded text-sm ${
                  selectedLevel === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedLevel("info")}
                className={`px-3 py-1 rounded text-sm ${
                  selectedLevel === "info" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                Info
              </button>
              <button
                onClick={() => setSelectedLevel("warn")}
                className={`px-3 py-1 rounded text-sm ${
                  selectedLevel === "warn" ? "bg-yellow-600 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                Warn
              </button>
              <button
                onClick={() => setSelectedLevel("error")}
                className={`px-3 py-1 rounded text-sm ${
                  selectedLevel === "error" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                Error
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {filteredExamples.map((example) => (
              <div key={example.title} className="border border-gray-300 rounded-lg p-6 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="font-bold text-lg">{example.title}</h4>
                  <span
                    className={`text-xs px-2 py-1 rounded uppercase font-semibold ${
                      example.level === "error"
                        ? "bg-red-100 text-red-800"
                        : example.level === "warn"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {example.level}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{example.description}</p>

                <div className="space-y-3">
                  {example.bad && (
                    <div>
                      <div className="text-sm font-semibold mb-2 text-red-600">❌ Bad:</div>
                      <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                        <code>{example.bad}</code>
                      </pre>
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold mb-2 text-green-600">✅ Good:</div>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                      <code>{example.good}</code>
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Log Levels */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Log Levels: When to Use Each</h2>
        <div className="space-y-4">
          {LOG_LEVELS.map((level) => {
            const Icon = level.icon;
            return (
              <div key={level.level} className={`border rounded-lg p-6 ${level.color}`}>
                <div className="flex items-start gap-4">
                  <Icon className="w-8 h-8 mt-1 flex-shrink-0" />
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-bold text-xl">{level.level}</h3>
                      {level.production ? (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          Production enabled
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">Dev only</span>
                      )}
                    </div>
                    <p className="text-sm mb-3">
                      <strong>When to use:</strong> {level.when}
                    </p>
                    <div>
                      <p className="text-sm font-semibold mb-2">Examples:</p>
                      <ul className="text-sm space-y-1">
                        {level.examples.map((ex) => (
                          <li key={ex} className="flex items-start gap-1">
                            <span className="text-xs mt-1">•</span>
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Correlation IDs */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6" id="correlation">
          Correlation IDs: Tracing Requests End-to-End
        </h2>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
          <p className="text-gray-700 mb-4">
            <strong>Why correlation IDs matter:</strong> Without them, you can't answer "What happened during this specific
            user request?" when you have thousands of concurrent requests.
          </p>
          <p className="text-sm text-gray-600">
            A correlation ID (or request ID) is a unique identifier that connects all logs, metrics, and traces for a
            single user request, even across multiple services or agents.
          </p>
        </div>

        <div className="space-y-6">
          {CORRELATION_STRATEGIES.map((strategy) => (
            <div key={strategy.strategy} className="border border-gray-300 rounded-lg p-6 bg-white">
              <h3 className="font-bold text-lg mb-2">{strategy.strategy}</h3>
              <p className="text-sm text-gray-600 mb-4">{strategy.description}</p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                <code>{strategy.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* Log Aggregation */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Log Aggregation & Structured Formats</h2>

        {LOG_AGGREGATION.map((topic, idx) => (
          <div key={topic.name} className={`${idx > 0 ? "mt-8" : ""}`}>
            <h3 className="font-bold text-lg mb-3">{topic.name}</h3>
            <p className="text-gray-700 mb-4">{topic.description}</p>

            {topic.example && (
              <div className="space-y-3 mb-4">
                <div>
                  <div className="text-sm font-semibold mb-2 text-green-600">✅ Good (JSON):</div>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                    <code>{topic.example.good}</code>
                  </pre>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2 text-red-600">❌ Bad (Plain text):</div>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                    <code>{topic.example.bad}</code>
                  </pre>
                </div>
                {topic.why && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-gray-700">
                      <strong>Why:</strong> {topic.why}
                    </p>
                  </div>
                )}
              </div>
            )}

            {topic.fields && (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 rounded text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-3 py-2 text-left">Field</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Type</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Required</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topic.fields.map((field) => (
                      <tr key={field.name}>
                        <td className="border border-gray-300 px-3 py-2 font-mono text-xs">{field.name}</td>
                        <td className="border border-gray-300 px-3 py-2">{field.type}</td>
                        <td className="border border-gray-300 px-3 py-2">
                          {field.required ? (
                            <span className="text-green-600 font-semibold">Yes</span>
                          ) : (
                            <span className="text-gray-500">No</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-xs">{field.description || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {topic.code && (
              <div className="mt-4">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                  <code>{topic.code}</code>
                </pre>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Best Practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Best Practices Checklist</h2>
        <div className="space-y-4">
          {BEST_PRACTICES.map((item) => (
            <div key={item.practice} className="border border-gray-300 rounded-lg p-6 bg-white">
              <h3 className="font-bold text-lg mb-2">{item.practice}</h3>
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              {item.why && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                  <p className="text-sm text-gray-700">
                    <strong>Why:</strong> {item.why}
                  </p>
                </div>
              )}
              {item.code && (
                <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                  <code>{item.code}</code>
                </pre>
              )}
              {item.examples && (
                <div className="mt-3">
                  <p className="text-sm font-semibold mb-2">Examples:</p>
                  <ul className="text-sm space-y-1">
                    {item.examples.map((ex) => (
                      <li key={ex} className="flex items-start gap-1">
                        <span className="text-xs mt-1">•</span>
                        <span className="font-mono text-xs">{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Related Guides */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/observability-guide/metrics"
            className="border border-gray-300 rounded-lg p-6 hover:border-purple-500 hover:shadow-lg transition"
          >
            <h3 className="font-bold text-lg mb-2">📊 Metrics & Dashboards</h3>
            <p className="text-sm text-gray-600">
              Track agent performance with key metrics, instrumentation patterns, and alerting
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
