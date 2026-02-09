"use client";

import { useState } from "react";
import Link from "next/link";
import { Network, GitBranch, Layers, Zap } from "lucide-react";

interface SpanExample {
  name: string;
  description: string;
  spanKind: "CLIENT" | "SERVER" | "INTERNAL" | "PRODUCER" | "CONSUMER";
  attributes: { key: string; value: string; description: string }[];
  code: string;
}

const SPAN_EXAMPLES: SpanExample[] = [
  {
    name: "Agent Request (Root Span)",
    description: "Top-level span representing the entire user request",
    spanKind: "SERVER",
    attributes: [
      { key: "agent.id", value: "agent-123", description: "Unique agent identifier" },
      { key: "user.id", value: "user-456", description: "User making the request" },
      { key: "agent.type", value: "assistant", description: "Agent type (assistant, analyst, etc.)" },
      { key: "request.type", value: "chat", description: "Request operation type" },
    ],
    code: `import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('agent-runtime');

async function handleRequest(req: Request) {
  return tracer.startActiveSpan('agent.request', async (span) => {
    try {
      span.setAttribute('agent.id', 'agent-123');
      span.setAttribute('user.id', req.userId);
      span.setAttribute('agent.type', 'assistant');
      span.setAttribute('request.type', 'chat');
      
      const response = await processRequest(req);
      
      span.setStatus({ code: SpanStatusCode.OK });
      return response;
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
  {
    name: "LLM API Call",
    description: "Span for LLM completion requests (OpenAI, Anthropic, etc.)",
    spanKind: "CLIENT",
    attributes: [
      { key: "llm.model", value: "gpt-4-turbo", description: "Model name" },
      { key: "llm.operation", value: "completion", description: "API operation type" },
      { key: "llm.prompt.tokens", value: "1234", description: "Input token count" },
      { key: "llm.completion.tokens", value: "567", description: "Output token count" },
      { key: "llm.cached", value: "false", description: "Whether response was cached" },
    ],
    code: `async function callLLM(prompt: string, model: string) {
  return tracer.startActiveSpan('llm.completion', async (span) => {
    span.setAttributes({
      'llm.model': model,
      'llm.operation': 'completion',
      'llm.prompt.length': prompt.length,
    });
    
    try {
      const response = await openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
      });
      
      span.setAttributes({
        'llm.prompt.tokens': response.usage.prompt_tokens,
        'llm.completion.tokens': response.usage.completion_tokens,
        'llm.total.tokens': response.usage.total_tokens,
        'llm.cached': false,
      });
      
      span.setStatus({ code: SpanStatusCode.OK });
      return response;
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  });
}`,
  },
  {
    name: "Tool Call Execution",
    description: "Span for individual tool invocations",
    spanKind: "INTERNAL",
    attributes: [
      { key: "tool.name", value: "web_search", description: "Tool identifier" },
      { key: "tool.params", value: "{...}", description: "Serialized parameters" },
      { key: "tool.result.size", value: "2048", description: "Result size in bytes" },
      { key: "tool.cache.hit", value: "false", description: "Whether tool result was cached" },
    ],
    code: `async function executeTool(toolName: string, params: any) {
  return tracer.startActiveSpan(\`tool.\${toolName}\`, async (span) => {
    span.setAttributes({
      'tool.name': toolName,
      'tool.params': JSON.stringify(params),
    });
    
    try {
      const result = await tools[toolName].execute(params);
      
      span.setAttributes({
        'tool.result.size': JSON.stringify(result).length,
        'tool.cache.hit': false,
      });
      
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  });
}`,
  },
  {
    name: "Agent Reasoning Step",
    description: "Span for agent decision-making and planning",
    spanKind: "INTERNAL",
    attributes: [
      { key: "reasoning.type", value: "plan", description: "Type of reasoning (plan, decide, reflect)" },
      { key: "reasoning.thought", value: "User wants...", description: "Agent's internal thought" },
      { key: "reasoning.selected_tool", value: "web_search", description: "Tool chosen by reasoning" },
      { key: "reasoning.confidence", value: "0.92", description: "Confidence score (0-1)" },
    ],
    code: `async function agentReasoning(context: Context) {
  return tracer.startActiveSpan('agent.reasoning', async (span) => {
    span.setAttribute('reasoning.type', 'plan');
    
    const thought = await generateThought(context);
    span.setAttribute('reasoning.thought', thought);
    
    const selectedTool = selectBestTool(thought, context);
    span.setAttributes({
      'reasoning.selected_tool': selectedTool.name,
      'reasoning.confidence': selectedTool.confidence,
      'reasoning.alternatives': JSON.stringify(selectedTool.alternatives),
    });
    
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();
    
    return selectedTool;
  });
}`,
  },
  {
    name: "Multi-Agent Delegation",
    description: "Span when delegating to another agent",
    spanKind: "CLIENT",
    attributes: [
      { key: "delegation.from_agent", value: "orchestrator", description: "Delegating agent" },
      { key: "delegation.to_agent", value: "specialist", description: "Receiving agent" },
      { key: "delegation.task", value: "analyze_data", description: "Task being delegated" },
      { key: "delegation.reason", value: "Requires domain expertise", description: "Why delegated" },
    ],
    code: `async function delegateToAgent(task: Task, targetAgent: string) {
  return tracer.startActiveSpan('agent.delegation', async (span) => {
    span.setAttributes({
      'delegation.from_agent': 'orchestrator',
      'delegation.to_agent': targetAgent,
      'delegation.task': task.type,
      'delegation.reason': task.delegationReason,
    });
    
    // Propagate trace context to the other agent
    const result = await callAgent(targetAgent, task, {
      headers: {
        'traceparent': getCurrentTraceContext(),
      },
    });
    
    span.setAttribute('delegation.result.status', result.status);
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();
    
    return result;
  });
}`,
  },
];

const TRACE_PROPAGATION = {
  httpHeaders: `// W3C Trace Context (standard)
// https://www.w3.org/TR/trace-context/

import { propagation, context } from '@opentelemetry/api';

// SENDING side (Agent A → Agent B)
async function callExternalAgent(url: string, data: any) {
  const headers = {};
  
  // Inject current trace context into headers
  propagation.inject(context.active(), headers);
  
  // Headers now contain: traceparent, tracestate
  // traceparent format: 00-{trace-id}-{parent-span-id}-{flags}
  
  return fetch(url, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

// RECEIVING side (Agent B)
function handleIncomingRequest(req: Request) {
  // Extract trace context from headers
  const ctx = propagation.extract(context.active(), req.headers);
  
  // Continue trace in new span
  return context.with(ctx, () => {
    return tracer.startActiveSpan('agent.handle_request', async (span) => {
      // This span is now a child of the remote span!
      const result = await processRequest(req);
      span.end();
      return result;
    });
  });
}`,

  messageQueue: `// Propagating trace context through message queues

import { TextMapPropagator } from '@opentelemetry/api';

// PRODUCER: Inject trace context into message metadata
async function publishMessage(topic: string, payload: any) {
  return tracer.startActiveSpan('queue.publish', async (span) => {
    const metadata = {};
    propagation.inject(context.active(), metadata);
    
    await messageQueue.publish({
      topic,
      payload,
      metadata, // Contains trace context
    });
    
    span.setAttribute('queue.topic', topic);
    span.end();
  });
}

// CONSUMER: Extract trace context from message metadata
async function consumeMessage(message: Message) {
  const ctx = propagation.extract(context.active(), message.metadata);
  
  return context.with(ctx, () => {
    return tracer.startActiveSpan('queue.consume', async (span) => {
      span.setAttribute('queue.topic', message.topic);
      
      const result = await handleMessage(message.payload);
      
      span.end();
      return result;
    });
  });
}`,

  localStorage: `// For single-process multi-agent systems (AsyncLocalStorage)

import { AsyncLocalStorage } from 'async_hooks';

const traceStorage = new AsyncLocalStorage<TraceContext>();

// Store trace context
function executeWithTrace(traceId: string, fn: () => Promise<any>) {
  return traceStorage.run({ traceId }, fn);
}

// Retrieve trace context anywhere in the call stack
function getCurrentTraceId() {
  return traceStorage.getStore()?.traceId;
}

// Usage
await executeWithTrace('trace-abc123', async () => {
  await agentA.process(); // Can access traceId
  await agentB.delegate(); // Inherits same traceId
  await tool.execute(); // All share the same trace
});`,
};

const OPENTELEMETRY_SETUP = {
  basic: `// 1. Install dependencies
// npm install @opentelemetry/api @opentelemetry/sdk-node \\
//   @opentelemetry/auto-instrumentations-node

// 2. instrumentation.ts (run BEFORE your app code)
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces', // Jaeger, Tempo, etc.
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Automatically instruments http, express, fetch, etc.
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown().then(() => console.log('Tracing terminated'));
});`,

  custom: `// 3. Custom instrumentation in your agent code
import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('my-agent', '1.0.0');

export async function myAgentFunction(input: string) {
  return tracer.startActiveSpan('my_agent.process', async (span) => {
    span.setAttribute('input.length', input.length);
    
    try {
      const result = await doWork(input);
      span.setStatus({ code: SpanStatusCode.OK });
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

  backends: `// Popular trace backends (choose one)

// Option 1: Jaeger (open-source, easy local setup)
// docker run -p 16686:16686 -p 4318:4318 jaegertracing/all-in-one:latest
// UI: http://localhost:16686

// Option 2: Grafana Tempo (open-source, scalable)
// Integrated with Grafana for visualization

// Option 3: Datadog APM (commercial, full observability platform)
traceExporter: new DatadogSpanExporter({
  agentUrl: 'http://localhost:8126',
}),

// Option 4: Honeycomb (commercial, powerful querying)
traceExporter: new OTLPTraceExporter({
  url: 'https://api.honeycomb.io/v1/traces',
  headers: { 'x-honeycomb-team': process.env.HONEYCOMB_API_KEY },
}),

// Option 5: AWS X-Ray (AWS-native)
import { AWSXRayPropagator } from '@opentelemetry/propagator-aws-xray';
import { AwsInstrumentation } from '@opentelemetry/instrumentation-aws-sdk';`,
};

const VISUALIZATION_PATTERNS = [
  {
    name: "Waterfall View",
    description: "Shows the chronological sequence of spans and their durations",
    useCases: ["Identify slow operations", "See which tool calls block others", "Find critical path"],
    image: "Shows spans as horizontal bars on a timeline, with parent-child nesting",
  },
  {
    name: "Dependency Graph",
    description: "Visualizes relationships between agents and services",
    useCases: ["Understand multi-agent architecture", "Identify chatty communication", "Detect circular dependencies"],
    image: "Node-edge graph showing which agents/services call which",
  },
  {
    name: "Latency Heatmap",
    description: "Color-coded view of span durations across many traces",
    useCases: ["Spot performance regressions", "Compare latencies over time", "Identify outliers"],
    image: "Grid where color intensity represents duration (green=fast, red=slow)",
  },
  {
    name: "Trace Comparison",
    description: "Side-by-side view of two traces (e.g., fast vs slow)",
    useCases: ["Debug why some requests are slow", "Compare before/after optimization", "Understand variation"],
    image: "Two waterfall views stacked vertically for comparison",
  },
];

const BEST_PRACTICES = [
  {
    practice: "Keep Spans Focused",
    description: "Each span should represent a single logical operation",
    good: "Separate spans for: LLM call, tool execution, database query",
    bad: "One giant span for the entire agent workflow",
  },
  {
    practice: "Use Semantic Attributes",
    description: "Follow OpenTelemetry semantic conventions for common attributes",
    good: "http.method, http.status_code, db.statement, messaging.destination",
    bad: "method, status, sql, queue (non-standard names)",
    link: "https://opentelemetry.io/docs/specs/semconv/",
  },
  {
    practice: "Propagate Trace Context Everywhere",
    description: "Always pass trace context when crossing boundaries (HTTP, queues, agents)",
    good: "Inject traceparent header in all outbound requests",
    bad: "Starting a new trace for each service (loses correlation)",
  },
  {
    practice: "Sample Strategically",
    description: "In high-traffic systems, sample traces to reduce overhead",
    good: "Sample 10% of normal requests, 100% of errors and slow requests",
    bad: "Sample randomly without considering error/latency (lose debugging data)",
  },
  {
    practice: "Add Business Context",
    description: "Include user/session/request IDs as span attributes",
    good: "user.id, session.id, request.id, tenant.id",
    bad: "Only technical attributes (no way to correlate to user reports)",
  },
  {
    practice: "Record Exceptions Properly",
    description: "Use span.recordException() instead of just setting error status",
    good: "span.recordException(error) includes stack trace and message",
    bad: "span.setStatus(ERROR) without exception details",
  },
];

export default function TracingPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-12">
        <Link href="/observability-guide" className="text-purple-600 hover:underline mb-4 inline-block">
          ← Back to Observability Guide
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <Network className="w-10 h-10 text-purple-600" />
          <h1 className="text-4xl font-bold">Distributed Tracing</h1>
        </div>
        <p className="text-lg text-gray-600">
          End-to-end visibility for multi-agent systems. Learn how to instrument, propagate, and visualize traces with
          OpenTelemetry.
        </p>
      </div>

      {/* Why Tracing Matters */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Why Distributed Tracing?</h2>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <p className="text-gray-700 mb-4">
            <strong>The Problem:</strong> When a user request touches 5 agents, 10 LLM calls, and 20 tool executions, how
            do you debug a slow request?
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-bold mb-2 text-red-600">❌ Without Tracing</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Logs scattered across services</li>
                <li>• Can&apos;t correlate requests across agents</li>
                <li>• No visibility into call chains</li>
                <li>• Debugging requires code changes</li>
                <li>• Can&apos;t identify bottlenecks</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-green-600">✅ With Tracing</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• See entire request flow in one view</li>
                <li>• Drill down into any operation</li>
                <li>• Instantly spot the slowest span</li>
                <li>• Correlate logs/metrics by trace ID</li>
                <li>• Understand agent dependencies</li>
              </ul>
            </div>
          </div>
          <div className="bg-white border border-purple-300 rounded p-4">
            <p className="text-sm text-gray-700">
              <strong>Example:</strong> &quot;Request took 8 seconds&quot; → Trace shows: LLM call (6s), tool execution (1.5s),
              reasoning (0.5s). Now you know where to optimize.
            </p>
          </div>
        </div>
      </section>

      {/* Core Concepts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Core Concepts</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="border border-blue-300 rounded-lg p-6 bg-blue-50">
            <GitBranch className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-bold text-lg mb-2">Trace</h3>
            <p className="text-sm text-gray-700">
              A trace represents one user request&apos;s journey through your entire system. It has a unique trace ID.
            </p>
            <p className="text-xs text-gray-600 mt-2">
              <strong>Example:</strong> User asks &quot;What&apos;s the weather?&quot; → Trace ID: abc123
            </p>
          </div>
          <div className="border border-green-300 rounded-lg p-6 bg-green-50">
            <Layers className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-bold text-lg mb-2">Span</h3>
            <p className="text-sm text-gray-700">
              A span represents a single operation within a trace (LLM call, tool execution, etc.). Spans nest to form a
              tree.
            </p>
            <p className="text-xs text-gray-600 mt-2">
              <strong>Example:</strong> Span &quot;llm.completion&quot; (2.3s) → child of &quot;agent.request&quot;
            </p>
          </div>
          <div className="border border-purple-300 rounded-lg p-6 bg-purple-50">
            <Zap className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-bold text-lg mb-2">Context Propagation</h3>
            <p className="text-sm text-gray-700">
              Passing trace ID and parent span ID across service boundaries (HTTP, queues, agents) to maintain the trace.
            </p>
            <p className="text-xs text-gray-600 mt-2">
              <strong>Standard:</strong> W3C Trace Context (traceparent header)
            </p>
          </div>
        </div>
      </section>

      {/* Span Examples */}
      <section className="mb-12" id="spans">
        <h2 className="text-2xl font-bold mb-6">Span Instrumentation Patterns</h2>
        <div className="space-y-6">
          {SPAN_EXAMPLES.map((example) => (
            <div key={example.name} className="border border-gray-300 rounded-lg p-6 bg-white">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{example.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{example.description}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800 font-semibold uppercase">
                  {example.spanKind}
                </span>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2">Standard Attributes:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-left">Key</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Example Value</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {example.attributes.map((attr) => (
                        <tr key={attr.key}>
                          <td className="border border-gray-300 px-2 py-1 font-mono">{attr.key}</td>
                          <td className="border border-gray-300 px-2 py-1 font-mono text-gray-600">{attr.value}</td>
                          <td className="border border-gray-300 px-2 py-1">{attr.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                <code>{example.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* Trace Propagation */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Trace Context Propagation</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <p className="text-gray-700 mb-2">
            <strong>Critical:</strong> Without propagation, each service starts a new trace. You lose end-to-end
            visibility.
          </p>
          <p className="text-sm text-gray-600">
            Always inject trace context when calling external services, agents, or queues.
          </p>
        </div>

        <div className="space-y-6">
          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <h3 className="font-bold text-lg mb-3">HTTP Headers (Agent-to-Agent)</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
              <code>{TRACE_PROPAGATION.httpHeaders}</code>
            </pre>
          </div>

          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <h3 className="font-bold text-lg mb-3">Message Queues (Async Communication)</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
              <code>{TRACE_PROPAGATION.messageQueue}</code>
            </pre>
          </div>

          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <h3 className="font-bold text-lg mb-3">In-Process Multi-Agent (AsyncLocalStorage)</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
              <code>{TRACE_PROPAGATION.localStorage}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* OpenTelemetry Setup */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">OpenTelemetry Setup Guide</h2>

        <div className="space-y-6">
          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <h3 className="font-bold text-lg mb-3">Step 1: Install & Configure SDK</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
              <code>{OPENTELEMETRY_SETUP.basic}</code>
            </pre>
          </div>

          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <h3 className="font-bold text-lg mb-3">Step 2: Custom Instrumentation</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
              <code>{OPENTELEMETRY_SETUP.custom}</code>
            </pre>
          </div>

          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <h3 className="font-bold text-lg mb-3">Step 3: Choose a Backend</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
              <code>{OPENTELEMETRY_SETUP.backends}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Visualization Patterns */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Trace Visualization Patterns</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {VISUALIZATION_PATTERNS.map((pattern) => (
            <div key={pattern.name} className="border border-gray-300 rounded-lg p-6 bg-white">
              <h3 className="font-bold text-lg mb-2">{pattern.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
              <div className="mb-3 bg-gray-100 border border-gray-300 rounded p-3">
                <p className="text-xs italic text-gray-700">{pattern.image}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Use Cases:</h4>
                <ul className="text-sm space-y-1">
                  {pattern.useCases.map((useCase) => (
                    <li key={useCase} className="flex items-start gap-1">
                      <span className="text-xs mt-1">•</span>
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Best Practices</h2>
        <div className="space-y-4">
          {BEST_PRACTICES.map((practice) => (
            <div key={practice.practice} className="border border-gray-300 rounded-lg p-6 bg-white">
              <h3 className="font-bold text-lg mb-2">{practice.practice}</h3>
              <p className="text-sm text-gray-600 mb-3">{practice.description}</p>
              {practice.good && practice.bad && (
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-sm font-semibold mb-1 text-green-600">✅ Good:</div>
                    <p className="text-xs text-gray-700 bg-green-50 border border-green-200 rounded p-2">
                      {practice.good}
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-1 text-red-600">❌ Bad:</div>
                    <p className="text-xs text-gray-700 bg-red-50 border border-red-200 rounded p-2">{practice.bad}</p>
                  </div>
                </div>
              )}
              {practice.link && (
                <a href={practice.link} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 hover:underline">
                  Learn more →
                </a>
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
            href="/observability-guide/logging"
            className="border border-gray-300 rounded-lg p-6 hover:border-purple-500 hover:shadow-lg transition"
          >
            <h3 className="font-bold text-lg mb-2">📝 Logging Best Practices</h3>
            <p className="text-sm text-gray-600">
              Structured logging with correlation IDs to complement your traces
            </p>
          </Link>
          <Link
            href="/observability-guide/metrics"
            className="border border-gray-300 rounded-lg p-6 hover:border-purple-500 hover:shadow-lg transition"
          >
            <h3 className="font-bold text-lg mb-2">📊 Metrics & Dashboards</h3>
            <p className="text-sm text-gray-600">
              Track agent performance with metrics that complement trace data
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
