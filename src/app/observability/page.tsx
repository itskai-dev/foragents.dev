import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Agent Observability Guide — forAgents.dev",
  description: "Set up logging, tracing, and metrics for your AI agents. Integration guides for popular observability tools.",
  openGraph: {
    title: "Agent Observability Guide — forAgents.dev",
    description: "Set up logging, tracing, and metrics for your AI agents. Integration guides for popular observability tools.",
    url: "https://foragents.dev/observability",
    siteName: "forAgents.dev",
    type: "website",
    images: [
      {
        url: "/api/og/observability",
        width: 1200,
        height: 630,
        alt: "Agent Observability Guide — forAgents.dev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Observability Guide — forAgents.dev",
    description: "Set up logging, tracing, and metrics for your AI agents. Integration guides for popular observability tools.",
    images: ["/api/og/observability"],
  },
};

interface ObservabilityTool {
  name: string;
  category: "logging" | "tracing" | "metrics" | "all-in-one";
  description: string;
  url: string;
  hosts: string[];
  setupSnippet?: string;
  highlights?: string[];
}

const tools: ObservabilityTool[] = [
  {
    name: "OpenTelemetry",
    category: "all-in-one",
    description: "Industry-standard observability framework. Traces, metrics, and logs in one.",
    url: "https://opentelemetry.io",
    hosts: ["All"],
    highlights: [
      "Vendor-neutral standard",
      "Auto-instrumentation for many frameworks",
      "Export to any backend (Jaeger, Prometheus, etc.)",
    ],
    setupSnippet: `import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();`,
  },
  {
    name: "LangSmith",
    category: "tracing",
    description: "LangChain&apos;s observability platform. Built for LLM applications.",
    url: "https://smith.langchain.com",
    hosts: ["LangChain", "LangGraph"],
    highlights: [
      "Native LangChain integration",
      "LLM call tracing and debugging",
      "Prompt version management",
    ],
    setupSnippet: `import { Client } from "langsmith";

const client = new Client({
  apiKey: process.env.LANGCHAIN_API_KEY,
});

// Automatic tracing for LangChain chains
process.env.LANGCHAIN_TRACING_V2 = "true";
process.env.LANGCHAIN_PROJECT = "my-agent";`,
  },
  {
    name: "Helicone",
    category: "tracing",
    description: "Simple proxy for OpenAI, Anthropic, and more. Zero code changes.",
    url: "https://helicone.ai",
    hosts: ["OpenAI", "Anthropic", "Any LLM"],
    highlights: [
      "Drop-in proxy (change base URL only)",
      "Cost tracking per request",
      "Caching and rate limiting",
    ],
    setupSnippet: `// OpenAI example
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://oai.helicone.ai/v1",
  defaultHeaders: {
    "Helicone-Auth": \`Bearer \${process.env.HELICONE_API_KEY}\`,
  },
});`,
  },
  {
    name: "Langfuse",
    category: "all-in-one",
    description: "Open-source LLM engineering platform. Traces, evals, and prompts.",
    url: "https://langfuse.com",
    hosts: ["All"],
    highlights: [
      "Self-hostable",
      "Prompt management and versioning",
      "User feedback collection",
    ],
    setupSnippet: `import { Langfuse } from "langfuse";

const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
});

const trace = langfuse.trace({ name: "agent-run" });
const generation = trace.generation({
  name: "llm-call",
  model: "gpt-4",
  input: prompt,
});
// ... make LLM call ...
generation.end({ output: response });`,
  },
  {
    name: "Prometheus + Grafana",
    category: "metrics",
    description: "Industry-standard metrics and dashboards. Self-hosted.",
    url: "https://prometheus.io",
    hosts: ["All"],
    highlights: [
      "Time-series metrics storage",
      "Powerful query language (PromQL)",
      "Beautiful dashboards with Grafana",
    ],
    setupSnippet: `import promClient from 'prom-client';

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const llmCallCounter = new promClient.Counter({
  name: 'agent_llm_calls_total',
  help: 'Total LLM calls made',
  labelNames: ['model', 'status'],
  registers: [register],
});

// Instrument your code
llmCallCounter.inc({ model: 'gpt-4', status: 'success' });

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});`,
  },
  {
    name: "Datadog",
    category: "all-in-one",
    description: "Enterprise observability platform. Logs, metrics, traces, and APM.",
    url: "https://www.datadoghq.com",
    hosts: ["All"],
    highlights: [
      "Full-stack monitoring",
      "Machine learning insights",
      "Extensive integrations",
    ],
    setupSnippet: `// Datadog APM
import tracer from 'dd-trace';

tracer.init({
  service: 'my-agent',
  env: process.env.NODE_ENV,
});

// Logs
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.json(),
  defaultMeta: { service: 'my-agent' },
  transports: [
    new transports.Http({
      host: 'http-intake.logs.datadoghq.com',
      path: \`/api/v2/logs?dd-api-key=\${process.env.DD_API_KEY}\`,
    }),
  ],
});`,
  },
  {
    name: "Sentry",
    category: "logging",
    description: "Error tracking and performance monitoring. Excellent for debugging.",
    url: "https://sentry.io",
    hosts: ["All"],
    highlights: [
      "Real-time error alerts",
      "Stack trace grouping",
      "Release tracking",
    ],
    setupSnippet: `import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});

// Capture exceptions
try {
  await agent.run();
} catch (error) {
  Sentry.captureException(error);
  throw error;
}`,
  },
  {
    name: "Axiom",
    category: "logging",
    description: "Serverless-native log analytics. Lightning-fast queries.",
    url: "https://axiom.co",
    hosts: ["All"],
    highlights: [
      "No index limits",
      "Real-time querying",
      "Great for serverless/edge",
    ],
    setupSnippet: `import { Axiom } from '@axiom-co/js';

const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN,
});

axiom.ingest('agent-logs', [
  {
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Agent started',
    agent_id: 'my-agent',
    metadata: { ... },
  },
]);

await axiom.flush();`,
  },
];

const integrationMatrix = [
  { tool: "OpenTelemetry", langchain: "✓", openai: "✓", anthropic: "✓", custom: "✓" },
  { tool: "LangSmith", langchain: "✓✓", openai: "✓", anthropic: "✓", custom: "~" },
  { tool: "Helicone", langchain: "✓", openai: "✓✓", anthropic: "✓✓", custom: "~" },
  { tool: "Langfuse", langchain: "✓", openai: "✓", anthropic: "✓", custom: "✓" },
  { tool: "Datadog", langchain: "✓", openai: "✓", anthropic: "✓", custom: "✓" },
  { tool: "Sentry", langchain: "✓", openai: "✓", anthropic: "✓", custom: "✓" },
];

export default function ObservabilityPage() {
  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "all-in-one":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "tracing":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "logging":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "metrics":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      default:
        return "";
    }
  };

  return (
    <main id="main-content" className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Agent <span className="aurora-text">Observability</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Monitor, debug, and optimize your AI agents with logging, tracing, and metrics.
          </p>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle>Why Observability Matters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                AI agents are complex systems with LLM calls, tool executions, and state management.
                When things go wrong (and they will), you need visibility into:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li><strong>What happened:</strong> Structured logs of agent actions</li>
                <li><strong>Why it&apos;s slow:</strong> Traces showing LLM latency and bottlenecks</li>
                <li><strong>How much it costs:</strong> Token usage and API call metrics</li>
                <li><strong>When it breaks:</strong> Error tracking and alerting</li>
              </ul>
              <p className="text-muted-foreground">
                The tools below help you instrument your agent for production readiness.
              </p>
            </CardContent>
          </Card>

          {/* Tools by Category */}
          {["all-in-one", "tracing", "logging", "metrics"].map((category) => (
            <div key={category}>
              <h2 className="text-2xl font-bold mb-4 capitalize">
                {category === "all-in-one" ? "All-in-One Platforms" : `${category} Tools`}
              </h2>
              <div className="space-y-4">
                {tools
                  .filter((tool) => tool.category === category)
                  .map((tool) => (
                    <Card key={tool.name}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <a
                                href={tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors"
                              >
                                {tool.name}
                              </a>
                            </CardTitle>
                            <CardDescription className="mt-1">{tool.description}</CardDescription>
                          </div>
                          <Badge className={getCategoryBadgeColor(tool.category)} variant="outline">
                            {tool.category}
                          </Badge>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {tool.hosts.map((host) => (
                            <Badge key={host} variant="secondary" className="text-xs">
                              {host}
                            </Badge>
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {tool.highlights && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Highlights:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {tool.highlights.map((highlight, idx) => (
                                <li key={idx}>{highlight}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {tool.setupSnippet && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Quick Setup:</h4>
                            <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-xs">
                              <code>{tool.setupSnippet}</code>
                            </pre>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}

          {/* Integration Matrix */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Matrix</CardTitle>
              <CardDescription>
                Which tools work best with which agent frameworks and LLM providers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium">Tool</th>
                      <th className="text-center py-2 px-3 font-medium">LangChain</th>
                      <th className="text-center py-2 px-3 font-medium">OpenAI</th>
                      <th className="text-center py-2 px-3 font-medium">Anthropic</th>
                      <th className="text-center py-2 px-3 font-medium">Custom</th>
                    </tr>
                  </thead>
                  <tbody>
                    {integrationMatrix.map((row, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2 px-3 font-medium">{row.tool}</td>
                        <td className="text-center py-2 px-3">{row.langchain}</td>
                        <td className="text-center py-2 px-3">{row.openai}</td>
                        <td className="text-center py-2 px-3">{row.anthropic}</td>
                        <td className="text-center py-2 px-3">{row.custom}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-muted-foreground mt-3">
                  <strong>Legend:</strong> ✓✓ = Native integration, ✓ = Supported, ~ = Manual setup required
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle>Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="text-primary">1.</span>
                  <div>
                    <strong>Start with structured logging.</strong> Use JSON logs with consistent fields
                    (agent_id, run_id, timestamp, etc.) before adding traces or metrics.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">2.</span>
                  <div>
                    <strong>Track token usage.</strong> LLM costs add up fast. Log input/output tokens
                    for every call and set up alerts for anomalies.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">3.</span>
                  <div>
                    <strong>Use correlation IDs.</strong> Tag all logs, traces, and metrics from a single
                    agent run with the same ID for easier debugging.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">4.</span>
                  <div>
                    <strong>Don&apos;t log sensitive data.</strong> Redact PII, API keys, and user data before
                    sending to observability platforms.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">5.</span>
                  <div>
                    <strong>Sample in production.</strong> For high-volume agents, trace 1-10% of requests
                    to reduce costs while maintaining visibility.
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  Validate your agent config with the{" "}
                  <Link href="/diagnostics" className="text-primary hover:underline">
                    diagnostics tool
                  </Link>
                </li>
                <li>
                  Explore agent{" "}
                  <Link href="/trace" className="text-primary hover:underline">
                    trace visualization
                  </Link>
                </li>
                <li>
                  Browse the{" "}
                  <Link href="/guides" className="text-primary hover:underline">
                    agent development guides
                  </Link>
                </li>
                <li>
                  Submit your agent to{" "}
                  <Link href="/submit" className="text-primary hover:underline">
                    forAgents.dev
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
