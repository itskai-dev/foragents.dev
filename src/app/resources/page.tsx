"use client";

import Link from "next/link";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

type ResourceType = "Guide" | "Video" | "Docs" | "Tool" | "Blog";

type Resource = {
  id: string;
  title: string;
  description: string;
  url: string;
  type: ResourceType;
};

const resources: Record<string, Resource[]> = {
  "Getting Started": [
    {
      id: "agent-basics",
      title: "Building Your First AI Agent",
      description:
        "A comprehensive introduction to AI agent development, covering architecture patterns, prompt engineering, and tool integration fundamentals.",
      url: "https://docs.anthropic.com/claude/docs/building-with-claude",
      type: "Guide",
    },
    {
      id: "mcp-intro",
      title: "Model Context Protocol: The Complete Guide",
      description:
        "Learn how to use MCP to give agents structured access to data sources, tools, and external services with standardized interfaces.",
      url: "https://modelcontextprotocol.io/introduction",
      type: "Docs",
    },
    {
      id: "agent-quickstart",
      title: "Agent Development Quickstart (15min)",
      description:
        "A fast-paced video walkthrough showing you how to scaffold, configure, and deploy your first conversational agent in under 15 minutes.",
      url: "https://www.youtube.com/watch?v=example",
      type: "Video",
    },
  ],
  Documentation: [
    {
      id: "anthropic-docs",
      title: "Anthropic Claude Documentation",
      description:
        "Official documentation for Claude API, including prompt engineering best practices, function calling, streaming, and vision capabilities.",
      url: "https://docs.anthropic.com/",
      type: "Docs",
    },
    {
      id: "openai-agents",
      title: "OpenAI Agents & Assistants API",
      description:
        "Build stateful agents with the Assistants API — supports code interpreter, retrieval, and custom function calling out of the box.",
      url: "https://platform.openai.com/docs/assistants/overview",
      type: "Docs",
    },
    {
      id: "langchain-docs",
      title: "LangChain Agent Framework",
      description:
        "Documentation for LangChain&apos;s agent toolkit — chains, memory, callbacks, and over 100 integrations for building production agents.",
      url: "https://python.langchain.com/docs/modules/agents/",
      type: "Docs",
    },
    {
      id: "mcp-spec",
      title: "MCP Protocol Specification",
      description:
        "Technical specification for Model Context Protocol — schema definitions, transport layers, and implementation guidelines for servers and clients.",
      url: "https://spec.modelcontextprotocol.io/",
      type: "Docs",
    },
  ],
  Tutorials: [
    {
      id: "rag-tutorial",
      title: "Building a RAG Agent from Scratch",
      description:
        "Step-by-step guide to building a retrieval-augmented generation system with vector embeddings, semantic search, and context injection.",
      url: "https://www.anthropic.com/tutorials/rag-agent",
      type: "Guide",
    },
    {
      id: "function-calling",
      title: "Mastering Function Calling & Tool Use",
      description:
        "Learn how to give your agent access to APIs, databases, and custom functions — with error handling, retries, and validation strategies.",
      url: "https://cookbook.openai.com/examples/how_to_call_functions_with_chat_models",
      type: "Guide",
    },
    {
      id: "multi-agent-systems",
      title: "Multi-Agent Coordination Tutorial",
      description:
        "Build a system where multiple specialized agents collaborate — task delegation, message passing, and consensus mechanisms explained.",
      url: "https://www.deeplearning.ai/short-courses/multi-ai-agent-systems/",
      type: "Video",
    },
    {
      id: "agent-eval",
      title: "Evaluating & Testing AI Agents",
      description:
        "Practical guide to agent evaluation — creating test suites, measuring accuracy, debugging hallucinations, and building evals that scale.",
      url: "https://hamel.dev/blog/posts/evals/",
      type: "Blog",
    },
  ],
  "Tools & Libraries": [
    {
      id: "openclaw",
      title: "OpenClaw Agent Runtime",
      description:
        "Production-ready agent runtime with tool orchestration, session management, browser control, and cross-platform node communication built-in.",
      url: "https://openclaw.com/",
      type: "Tool",
    },
    {
      id: "langchain-lib",
      title: "LangChain (Python/JS)",
      description:
        "The most popular agent framework — abstractions for chains, memory, retrieval, callbacks, and integrations with 100+ LLM providers.",
      url: "https://github.com/langchain-ai/langchain",
      type: "Tool",
    },
    {
      id: "autogen",
      title: "Microsoft AutoGen",
      description:
        "Framework for building multi-agent conversational systems — agents can chat with each other, delegate tasks, and collaborate autonomously.",
      url: "https://github.com/microsoft/autogen",
      type: "Tool",
    },
    {
      id: "semantic-kernel",
      title: "Semantic Kernel SDK",
      description:
        "Microsoft&apos;s lightweight SDK for orchestrating AI — native C#, Python, and Java support with plugin architecture and memory connectors.",
      url: "https://github.com/microsoft/semantic-kernel",
      type: "Tool",
    },
    {
      id: "instructor",
      title: "Instructor (Structured Outputs)",
      description:
        "Python library for reliable structured outputs from LLMs — uses Pydantic schemas to guarantee type-safe, validated responses every time.",
      url: "https://github.com/jxnl/instructor",
      type: "Tool",
    },
  ],
  "Community Content": [
    {
      id: "latent-space",
      title: "Latent Space Podcast",
      description:
        "Weekly podcast covering agent frameworks, new model releases, and interviews with builders pushing the boundaries of AI engineering.",
      url: "https://www.latent.space/podcast",
      type: "Video",
    },
    {
      id: "agent-patterns",
      title: "Common Agent Design Patterns",
      description:
        "Blog series breaking down proven architectures — ReAct, Chain-of-Thought, Tree of Thoughts, Reflexion, and when to use each approach.",
      url: "https://lilianweng.github.io/posts/2023-06-23-agent/",
      type: "Blog",
    },
    {
      id: "swyx-agents",
      title: "The AI Engineer&apos;s Guide to Agents",
      description:
        "swyx&apos;s comprehensive overview of the agent landscape — tools, mental models, and the shift from prompt engineering to agent engineering.",
      url: "https://www.latent.space/p/ai-engineer-agents",
      type: "Blog",
    },
    {
      id: "hamel-agents",
      title: "What We Learned Building Real Agents",
      description:
        "Hamel Husain&apos;s honest retrospective on production agent deployments — what worked, what didn&apos;t, and lessons learned the hard way.",
      url: "https://hamel.dev/blog/posts/prompt/",
      type: "Blog",
    },
  ],
};

const allTypes: ResourceType[] = ["Guide", "Video", "Docs", "Tool", "Blog"];

export default function ResourcesPage() {
  const [selectedType, setSelectedType] = useState<ResourceType | "All">("All");

  const filteredResources = Object.entries(resources).reduce(
    (acc, [category, items]) => {
      const filtered =
        selectedType === "All"
          ? items
          : items.filter((item) => item.type === selectedType);
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
      return acc;
    },
    {} as Record<string, Resource[]>
  );

  const totalCount =
    selectedType === "All"
      ? Object.values(resources).flat().length
      : Object.values(resources)
          .flat()
          .filter((r) => r.type === selectedType).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-[#0a0a0a]/80 relative">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="text-xs text-muted-foreground font-mono">
              forAgents.dev
            </span>
          </Link>
          <MobileNav />
        </div>
      </header>

      <main id="main-content" className="max-w-4xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3">
            Learning <span className="text-[#06D6A0]">Resources</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Curated guides, docs, tutorials, and tools to help you build better
            AI agents.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedType("All")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedType === "All"
                ? "bg-[#06D6A0] text-black"
                : "bg-white/5 text-muted-foreground hover:bg-white/10"
            }`}
          >
            All ({Object.values(resources).flat().length})
          </button>
          {allTypes.map((type) => {
            const count = Object.values(resources)
              .flat()
              .filter((r) => r.type === type).length;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedType === type
                    ? "bg-[#06D6A0] text-black"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                }`}
              >
                {type} ({count})
              </button>
            );
          })}
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-6">
          Showing {totalCount} resource{totalCount !== 1 ? "s" : ""}
          {selectedType !== "All" && ` in ${selectedType}`}
        </p>

        {/* Resource Sections */}
        <div className="space-y-12">
          {Object.entries(filteredResources).map(([category, items]) => (
            <section key={category}>
              <h2 className="text-2xl font-bold mb-5 flex items-center gap-3">
                <span className="text-white">{category}</span>
                <span className="text-sm text-muted-foreground font-normal">
                  ({items.length})
                </span>
              </h2>

              <div className="grid gap-4">
                {items.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-xl border border-white/10 bg-white/[0.02] p-5 hover:border-[#06D6A0]/50 hover:bg-white/[0.05] transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-white group-hover:text-[#06D6A0] transition-colors">
                        {resource.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className="shrink-0 border-[#06D6A0]/30 text-[#06D6A0] bg-[#06D6A0]/10"
                      >
                        {resource.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {resource.description}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-[#06D6A0] font-mono">
                      <span>View resource</span>
                      <svg
                        className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* No Results State */}
        {Object.keys(filteredResources).length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              No resources found for &ldquo;{selectedType}&rdquo;
            </p>
            <button
              onClick={() => setSelectedType("All")}
              className="text-[#06D6A0] hover:underline text-sm"
            >
              Show all resources
            </button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 rounded-xl border border-white/10 bg-gradient-to-br from-[#06D6A0]/5 via-white/[0.02] to-purple-500/5 p-8">
          <h2 className="text-2xl font-bold mb-3">Want to contribute?</h2>
          <p className="text-muted-foreground mb-5">
            Know a great resource that&apos;s missing? Submit a skill, tool, or
            guide to help the community learn and build better agents.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/submit"
              className="px-6 py-2.5 bg-[#06D6A0] text-black font-semibold rounded-lg hover:bg-[#05c294] transition-colors"
            >
              Submit a Resource
            </Link>
            <Link
              href="/guides"
              className="px-6 py-2.5 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/5 transition-colors"
            >
              Browse Guides
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
