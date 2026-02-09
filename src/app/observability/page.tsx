"use client";

import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BarChart3, Eye, Layers, Terminal, Zap } from "lucide-react";
import { useState } from "react";

interface ObservabilityTool {
  name: string;
  category: "logging" | "tracing" | "metrics";
  description: string;
  setup: string;
  hosts: string[];
  icon: React.ReactNode;
  codeSnippet?: string;
}

const tools: ObservabilityTool[] = [
  {
    name: "OpenTelemetry",
    category: "tracing",
    description: "Vendor-neutral observability framework for distributed tracing, metrics, and logs.",
    setup: "npm install @opentelemetry/api @opentelemetry/sdk-node",
    hosts: ["Node.js", "Python", "Java", "Go"],
    icon: <Layers className="w-5 h-5" />,
    codeSnippet: `// Setup OpenTelemetry
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();`,
  },
  {
    name: "Pino",
    category: "logging",
    description: "Fast, low-overhead JSON logger for Node.js applications.",
    setup: "npm install pino pino-pretty",
    hosts: ["Node.js"],
    icon: <Terminal className="w-5 h-5" />,
    codeSnippet: `// Setup Pino logger
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

logger.info({ agentId: '123' }, 'Agent started');`,
  },
  {
    name: "Winston",
    category: "logging",
    description: "Versatile logging library with multiple transports and formatting options.",
    setup: "npm install winston",
    hosts: ["Node.js"],
    icon: <Terminal className="w-5 h-5" />,
    codeSnippet: `// Setup Winston logger
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});`,
  },
  {
    name: "Prometheus",
    category: "metrics",
    description: "Time-series database and monitoring system with powerful query language.",
    setup: "npm install prom-client",
    hosts: ["Node.js", "Python", "Go", "Java"],
    icon: <BarChart3 className="w-5 h-5" />,
    codeSnippet: `// Setup Prometheus metrics
import client from 'prom-client';

const register = new client.Registry();
const counter = new client.Counter({
  name: 'agent_requests_total',
  help: 'Total agent requests',
  registers: [register]
});

counter.inc();`,
  },
  {
    name: "Jaeger",
    category: "tracing",
    description: "End-to-end distributed tracing for monitoring and troubleshooting microservices.",
    setup: "npm install jaeger-client",
    hosts: ["Node.js", "Python", "Go", "Java"],
    icon: <Activity className="w-5 h-5" />,
    codeSnippet: `// Setup Jaeger tracer
import { initTracer } from 'jaeger-client';

const config = {
  serviceName: 'my-agent',
  sampler: { type: 'const', param: 1 }
};

const tracer = initTracer(config);`,
  },
  {
    name: "Datadog",
    category: "metrics",
    description: "Full-stack observability platform with APM, logs, and infrastructure monitoring.",
    setup: "npm install dd-trace",
    hosts: ["Node.js", "Python", "Java", "Go"],
    icon: <Eye className="w-5 h-5" />,
    codeSnippet: `// Setup Datadog APM
import tracer from 'dd-trace';

tracer.init({
  service: 'my-agent',
  env: process.env.NODE_ENV,
  logInjection: true
});`,
  },
  {
    name: "Sentry",
    category: "logging",
    description: "Error tracking and performance monitoring for production applications.",
    setup: "npm install @sentry/node",
    hosts: ["Node.js", "Python", "Java", "Go"],
    icon: <Zap className="w-5 h-5" />,
    codeSnippet: `// Setup Sentry error tracking
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});`,
  },
  {
    name: "Grafana Loki",
    category: "logging",
    description: "Log aggregation system designed to store and query logs efficiently.",
    setup: "npm install pino-loki",
    hosts: ["Node.js", "Python", "Go"],
    icon: <Terminal className="w-5 h-5" />,
    codeSnippet: `// Setup Loki transport
import pino from 'pino';
import pinoLoki from 'pino-loki';

const logger = pino(pinoLoki({
  host: 'http://localhost:3100',
  labels: { app: 'my-agent' }
}));`,
  },
  {
    name: "Langfuse",
    category: "tracing",
    description: "Open-source LLM engineering platform for tracing, evaluating, and monitoring AI agents.",
    setup: "npm install langfuse",
    hosts: ["Node.js", "Python"],
    icon: <Activity className="w-5 h-5" />,
    codeSnippet: `// Setup Langfuse tracing
import { Langfuse } from 'langfuse';

const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
});

const trace = langfuse.trace({ name: 'agent-run' });
const span = trace.span({ name: 'tool-call' });
span.end();`,
  },
  {
    name: "Helicone",
    category: "metrics",
    description: "AI observability platform with LLM monitoring, caching, and cost tracking.",
    setup: "npm install @helicone/helicone",
    hosts: ["Node.js", "Python"],
    icon: <Eye className="w-5 h-5" />,
    codeSnippet: `// Setup Helicone proxy
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: 'https://anthropic.helicone.ai/',
  defaultHeaders: {
    'Helicone-Auth': \`Bearer \${process.env.HELICONE_API_KEY}\`,
  }
});`,
  },
  {
    name: "Braintrust",
    category: "metrics",
    description: "End-to-end platform for building and evaluating AI applications with logging and evals.",
    setup: "npm install braintrust",
    hosts: ["Node.js", "Python"],
    icon: <BarChart3 className="w-5 h-5" />,
    codeSnippet: `// Setup Braintrust logging
import { initLogger } from 'braintrust';

const logger = initLogger({
  projectName: 'my-agent',
  apiKey: process.env.BRAINTRUST_API_KEY,
});

logger.log({
  input: 'user query',
  output: 'agent response',
  metadata: { toolCalls: 3 }
});`,
  },
  {
    name: "Portkey",
    category: "tracing",
    description: "AI gateway with observability, caching, and load balancing for LLM applications.",
    setup: "npm install portkey-ai",
    hosts: ["Node.js", "Python"],
    icon: <Layers className="w-5 h-5" />,
    codeSnippet: `// Setup Portkey gateway
import Portkey from 'portkey-ai';

const portkey = new Portkey({
  apiKey: process.env.PORTKEY_API_KEY,
  virtualKey: process.env.PORTKEY_VIRTUAL_KEY,
});

const response = await portkey.chat.completions.create({
  messages: [{ role: 'user', content: 'Hello' }],
  model: 'claude-3-5-sonnet-20241022',
});`,
  },
  {
    name: "LangSmith",
    category: "tracing",
    description: "LangChain's observability platform for debugging, testing, and monitoring LLM apps.",
    setup: "npm install langsmith",
    hosts: ["Node.js", "Python"],
    icon: <Activity className="w-5 h-5" />,
    codeSnippet: `// Setup LangSmith tracing
import { Client } from 'langsmith';

const client = new Client({
  apiKey: process.env.LANGSMITH_API_KEY,
});

await client.createRun({
  name: 'agent-run',
  run_type: 'chain',
  inputs: { query: 'user input' },
  outputs: { response: 'agent output' }
});`,
  },
  {
    name: "Weights & Biases",
    category: "metrics",
    description: "MLOps platform with experiment tracking, model monitoring, and dataset versioning.",
    setup: "npm install wandb",
    hosts: ["Node.js", "Python"],
    icon: <BarChart3 className="w-5 h-5" />,
    codeSnippet: `// Setup W&B logging
import wandb from 'wandb';

wandb.init({
  project: 'agent-monitoring',
  config: { model: 'claude-3-5-sonnet' }
});

wandb.log({
  tool_calls: 5,
  latency_ms: 1234,
  tokens_used: 5678
});`,
  },
  {
    name: "Phoenix (Arize)",
    category: "tracing",
    description: "Open-source AI observability platform for LLM tracing, evaluation, and debugging.",
    setup: "pip install arize-phoenix",
    hosts: ["Python"],
    icon: <Activity className="w-5 h-5" />,
    codeSnippet: `# Setup Phoenix tracing
import phoenix as px
from openinference.instrumentation import using_session

px.launch_app()
session = px.Client().get_spans_dataframe()

# Auto-instrument your app
with using_session('my-agent-session'):
    # Your agent code here
    pass`,
  },
  {
    name: "Highlight.io",
    category: "logging",
    description: "Full-stack monitoring with session replay, error tracking, and logging for web apps.",
    setup: "npm install @highlight-run/node",
    hosts: ["Node.js"],
    icon: <Terminal className="w-5 h-5" />,
    codeSnippet: `// Setup Highlight error tracking
import { H } from '@highlight-run/node';

H.init({ projectID: process.env.HIGHLIGHT_PROJECT_ID });

try {
  // Your agent code
} catch (error) {
  H.consumeError(error);
}`,
  },
];

export default function ObservabilityPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedHost, setSelectedHost] = useState<string>("all");

  const categories = ["all", "logging", "tracing", "metrics"];
  const hosts = ["all", "Node.js", "Python", "Java", "Go"];

  const filteredTools = tools.filter((tool) => {
    const categoryMatch = selectedCategory === "all" || tool.category === selectedCategory;
    const hostMatch = selectedHost === "all" || tool.hosts.includes(selectedHost);
    return categoryMatch && hostMatch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "logging":
        return <Terminal className="w-4 h-4" />;
      case "tracing":
        return <Activity className="w-4 h-4" />;
      case "metrics":
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <main id="main-content" className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[300px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#06D6A0]/10 mb-6">
            <Eye className="w-8 h-8 text-[#06D6A0]" />
          </div>
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Agent <span className="aurora-text">Observability</span>
          </h1>
          <p className="text-xl text-foreground/80 max-w-2xl">
            Monitor, trace, and debug your AI agents with production-grade observability tools.
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="relative max-w-5xl mx-auto px-4 py-8">
        <Card className="bg-[#0f0f0f] border-white/10">
          <CardContent className="pt-6 space-y-4">
            <p className="text-foreground/80 leading-relaxed">
              Production AI agents need visibility into their behavior, performance, and errors. 
              This guide covers essential observability tools for logging, distributed tracing, 
              and metrics collection — helping you understand what your agents are doing and why.
            </p>
            <p className="text-sm text-foreground/70">
              💡 <strong>Before deploying:</strong> Use{" "}
              <a href="/diagnostics" className="text-[#06D6A0] hover:underline">
                Agent Diagnostics
              </a>{" "}
              to validate your configuration, or{" "}
              <a href="/trace" className="text-[#06D6A0] hover:underline">
                Trace Viewer
              </a>{" "}
              to inspect live agent runs.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Filters */}
      <section className="relative max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-[#06D6A0] text-[#0a0a0a]"
                      : "bg-[#0f0f0f] text-foreground/70 hover:bg-[#0f0f0f]/80"
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Host</label>
            <div className="flex gap-2">
              {hosts.map((host) => (
                <button
                  key={host}
                  onClick={() => setSelectedHost(host)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedHost === host
                      ? "bg-[#06D6A0] text-[#0a0a0a]"
                      : "bg-[#0f0f0f] text-foreground/70 hover:bg-[#0f0f0f]/80"
                  }`}
                >
                  {host}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="relative max-w-5xl mx-auto px-4 py-6 pb-16">
        <div className="grid gap-6">
          {filteredTools.map((tool, idx) => (
            <Card key={idx} className="bg-[#0f0f0f] border-white/10">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#06D6A0]/10">
                      {tool.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{tool.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#06D6A0]/10 text-[#06D6A0] text-xs font-medium">
                          {getCategoryIcon(tool.category)}
                          {tool.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tool.hosts.map((host) => (
                      <span
                        key={host}
                        className="px-2 py-1 rounded bg-white/5 text-xs text-foreground/60"
                      >
                        {host}
                      </span>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/80">{tool.description}</p>
                
                <div>
                  <h4 className="text-sm font-semibold mb-2">Installation</h4>
                  <code className="block px-4 py-2 bg-[#0a0a0a] border border-white/5 rounded text-sm text-[#06D6A0] font-mono">
                    {tool.setup}
                  </code>
                </div>

                {tool.codeSnippet && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Quick Start</h4>
                    <pre className="px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded text-xs text-foreground/80 font-mono overflow-x-auto">
                      {tool.codeSnippet}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <Card className="bg-[#0f0f0f] border-white/10">
            <CardContent className="py-12 text-center">
              <p className="text-foreground/60">
                No tools match your filters. Try adjusting your selection.
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Integration Matrix */}
      <section className="relative max-w-5xl mx-auto px-4 py-8 pb-16">
        <Card className="bg-[#0f0f0f] border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Integration Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 font-semibold">Tool</th>
                    <th className="text-center py-3 px-4 font-semibold">Node.js</th>
                    <th className="text-center py-3 px-4 font-semibold">Python</th>
                    <th className="text-center py-3 px-4 font-semibold">Java</th>
                    <th className="text-center py-3 px-4 font-semibold">Go</th>
                  </tr>
                </thead>
                <tbody>
                  {tools.map((tool, idx) => (
                    <tr key={idx} className="border-b border-white/5">
                      <td className="py-3 px-4 font-medium">{tool.name}</td>
                      <td className="text-center py-3 px-4">
                        {tool.hosts.includes("Node.js") ? "✅" : "—"}
                      </td>
                      <td className="text-center py-3 px-4">
                        {tool.hosts.includes("Python") ? "✅" : "—"}
                      </td>
                      <td className="text-center py-3 px-4">
                        {tool.hosts.includes("Java") ? "✅" : "—"}
                      </td>
                      <td className="text-center py-3 px-4">
                        {tool.hosts.includes("Go") ? "✅" : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
