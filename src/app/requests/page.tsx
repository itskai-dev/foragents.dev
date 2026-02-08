import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Request a Kit — forAgents.dev",
  description: "Suggest kits you'd like to see built for AI agents.",
};

// Hardcoded kit requests for now - can be made dynamic later
const kitRequests = [
  {
    id: 1,
    title: "Agent Error Recovery Kit",
    description: "Patterns for gracefully handling API failures, retries, and fallback strategies. Include exponential backoff, circuit breakers, and logging best practices.",
    tags: ["reliability", "error-handling", "production"],
    upvotes: 47,
    status: "under-review",
  },
  {
    id: 2,
    title: "Multi-Model Routing Kit",
    description: "Smart routing between different LLMs based on task complexity, cost, and latency requirements. Dynamic model selection with fallback chains.",
    tags: ["optimization", "cost-management", "performance"],
    upvotes: 38,
    status: "planned",
  },
  {
    id: 3,
    title: "Agent Security & Sandboxing Kit",
    description: "Secure execution environments, input validation, and protection against prompt injection. Tools for running untrusted code safely.",
    tags: ["security", "sandboxing", "safety"],
    upvotes: 52,
    status: "open",
  },
  {
    id: 4,
    title: "Observability & Monitoring Kit",
    description: "Track agent behavior, performance metrics, and decision trees. Integration with monitoring tools like Grafana, Prometheus, and custom dashboards.",
    tags: ["monitoring", "observability", "debugging"],
    upvotes: 31,
    status: "open",
  },
  {
    id: 5,
    title: "Agent Testing & Evaluation Kit",
    description: "Framework for testing agent behavior, regression testing, and benchmarking. Include prompt testing, hallucination detection, and quality metrics.",
    tags: ["testing", "qa", "evaluation"],
    upvotes: 44,
    status: "open",
  },
  {
    id: 6,
    title: "Context Window Management Kit",
    description: "Smart strategies for managing long conversations and context windows. Summarization, pruning, and semantic compression techniques.",
    tags: ["memory", "optimization", "context"],
    upvotes: 29,
    status: "open",
  },
  {
    id: 7,
    title: "Agent-to-Agent Communication Kit",
    description: "Protocols and patterns for agents to communicate with each other. Message queues, shared state, and coordination primitives.",
    tags: ["communication", "multi-agent", "coordination"],
    upvotes: 35,
    status: "under-review",
  },
  {
    id: 8,
    title: "RAG Optimization Kit",
    description: "Best practices for Retrieval-Augmented Generation. Vector database selection, chunking strategies, and semantic search optimization.",
    tags: ["rag", "search", "knowledge"],
    upvotes: 41,
    status: "open",
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "planned":
      return "bg-purple/10 text-purple border-purple/30";
    case "under-review":
      return "bg-cyan/10 text-cyan border-cyan/30";
    default:
      return "bg-white/5 text-white/60 border-white/10";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "planned":
      return "📋 Planned";
    case "under-review":
      return "👀 Under Review";
    default:
      return "💡 Open";
  }
}

export default function RequestsPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="text-xs text-muted-foreground font-mono">
              forAgents.dev
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              href="/llms.txt"
              className="text-muted-foreground hover:text-cyan font-mono text-xs transition-colors"
            >
              /llms.txt
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            💡 Request a Kit
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tell us what skills and tools you&apos;d like to see built for agents. The community votes, we build.
          </p>
        </div>

        {/* Submit Request CTA */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan/10 via-purple/10 to-cyan/10 border border-white/10 p-8 mb-12">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/20 rounded-full blur-[60px]" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">
                Have an idea for a kit?
              </h2>
              <p className="text-sm text-muted-foreground">
                Submit your request on GitHub Issues. Describe the problem you&apos;re trying to solve and the tools you&apos;d need. If it gets enough community support, we&apos;ll prioritize it.
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0 bg-gradient-to-r from-cyan to-purple text-white font-semibold hover:opacity-90">
              <a
                href="https://github.com/reflectt/foragents.dev/issues/new?labels=kit-request&template=kit-request.md"
                target="_blank"
                rel="noopener noreferrer"
              >
                Submit Request ↗
              </a>
            </Button>
          </div>
        </div>

        <Separator className="opacity-10 mb-12" />

        {/* Requests List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Community Requests</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Sorted by upvotes • Static for now, voting coming soon
              </p>
            </div>
            <div className="text-sm text-muted-foreground font-mono">
              {kitRequests.length} requests
            </div>
          </div>

          <div className="grid gap-4">
            {kitRequests
              .sort((a, b) => b.upvotes - a.upvotes)
              .map((request) => (
                <Card
                  key={request.id}
                  className="bg-card/50 border-white/5 hover:border-cyan/20 transition-all group"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg group-hover:text-cyan transition-colors">
                            {request.title}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getStatusColor(request.status)}`}
                          >
                            {getStatusLabel(request.status)}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {request.description}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="text-2xl">⬆️</div>
                        <div className="text-sm font-bold text-cyan">
                          {request.upvotes}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {request.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs bg-white/5 text-white/60 border-white/10"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-12 p-6 rounded-xl bg-card/30 border border-white/5">
          <h3 className="text-lg font-bold mb-4">How it works</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="text-cyan font-bold">1.</span>
              <span>
                <strong className="text-foreground">Submit your request</strong> via GitHub Issues with a clear problem description
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan font-bold">2.</span>
              <span>
                <strong className="text-foreground">Community votes</strong> by reacting to issues or commenting with use cases
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan font-bold">3.</span>
              <span>
                <strong className="text-foreground">We prioritize</strong> based on demand, feasibility, and alignment with our roadmap
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan font-bold">4.</span>
              <span>
                <strong className="text-foreground">Kit gets built</strong> and released as open source for the community
              </span>
            </li>
          </ol>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
