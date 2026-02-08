"use client";

import { useState } from "react";
import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";

type ResourceType = "Guide" | "Video" | "Docs" | "Tool";

type Resource = {
  id: string;
  title: string;
  description: string;
  url: string;
  type: ResourceType;
  section: string;
};

const resources: Resource[] = [
  // Getting Started
  {
    id: "intro-to-agents",
    title: "Introduction to AI Agents",
    description:
      "A comprehensive beginner&apos;s guide covering the fundamentals of AI agents, their architecture, and common use cases.",
    url: "https://example.com/intro-agents",
    type: "Guide",
    section: "Getting Started",
  },
  {
    id: "building-first-agent",
    title: "Building Your First Agent",
    description:
      "Step-by-step tutorial for creating a simple AI agent from scratch, covering setup, basic capabilities, and deployment.",
    url: "https://example.com/first-agent",
    type: "Guide",
    section: "Getting Started",
  },
  {
    id: "agent-quickstart-video",
    title: "Agent Development Quickstart",
    description:
      "15-minute video walkthrough of setting up your development environment and creating a basic conversational agent.",
    url: "https://example.com/quickstart-video",
    type: "Video",
    section: "Getting Started",
  },
  // Documentation
  {
    id: "openclaw-docs",
    title: "OpenClaw Documentation",
    description:
      "Official documentation for OpenClaw, the agentic runtime platform. Includes API reference, tool guides, and examples.",
    url: "https://openclaw.com/docs",
    type: "Docs",
    section: "Documentation",
  },
  {
    id: "anthropic-claude-api",
    title: "Anthropic Claude API Reference",
    description:
      "Complete API documentation for Claude, including model capabilities, prompt engineering best practices, and code examples.",
    url: "https://docs.anthropic.com/claude/reference",
    type: "Docs",
    section: "Documentation",
  },
  {
    id: "mcp-protocol",
    title: "Model Context Protocol (MCP) Spec",
    description:
      "Technical specification for the Model Context Protocol, enabling standardized communication between agents and data sources.",
    url: "https://modelcontextprotocol.io/docs",
    type: "Docs",
    section: "Documentation",
  },
  {
    id: "openai-agents-guide",
    title: "OpenAI Assistants API Guide",
    description:
      "Official guide to building agents with OpenAI&apos;s Assistants API, including function calling and retrieval patterns.",
    url: "https://platform.openai.com/docs/assistants",
    type: "Docs",
    section: "Documentation",
  },
  // Tutorials
  {
    id: "tool-use-tutorial",
    title: "Mastering Tool Use in Agents",
    description:
      "Deep dive into implementing tool calling, handling responses, error recovery, and chaining multiple tools together.",
    url: "https://example.com/tool-use",
    type: "Guide",
    section: "Tutorials",
  },
  {
    id: "agent-memory-patterns",
    title: "Building Agent Memory Systems",
    description:
      "Tutorial on implementing short-term and long-term memory for agents, including vector databases and retrieval strategies.",
    url: "https://example.com/memory-patterns",
    type: "Guide",
    section: "Tutorials",
  },
  {
    id: "multi-agent-systems",
    title: "Designing Multi-Agent Systems",
    description:
      "Learn how to coordinate multiple specialized agents, handle inter-agent communication, and manage distributed workflows.",
    url: "https://example.com/multi-agent",
    type: "Guide",
    section: "Tutorials",
  },
  {
    id: "deploying-agents-video",
    title: "Production Deployment Strategies",
    description:
      "Video tutorial covering deployment patterns, scaling considerations, monitoring, and cost optimization for production agents.",
    url: "https://example.com/deploy-video",
    type: "Video",
    section: "Tutorials",
  },
  // Tools & Libraries
  {
    id: "langchain",
    title: "LangChain Framework",
    description:
      "Popular Python/JavaScript framework for building LLM-powered applications with chains, agents, and memory abstractions.",
    url: "https://langchain.com",
    type: "Tool",
    section: "Tools & Libraries",
  },
  {
    id: "autogen",
    title: "Microsoft AutoGen",
    description:
      "Open-source framework for building multi-agent conversational systems with customizable agent roles and capabilities.",
    url: "https://microsoft.github.io/autogen",
    type: "Tool",
    section: "Tools & Libraries",
  },
  {
    id: "crewai",
    title: "CrewAI",
    description:
      "Framework for orchestrating role-playing, autonomous AI agents that collaborate on complex tasks with defined workflows.",
    url: "https://crewai.com",
    type: "Tool",
    section: "Tools & Libraries",
  },
  {
    id: "semantic-kernel",
    title: "Semantic Kernel",
    description:
      "Microsoft&apos;s SDK for integrating LLMs into applications, featuring plugins, planners, and multi-language support.",
    url: "https://github.com/microsoft/semantic-kernel",
    type: "Tool",
    section: "Tools & Libraries",
  },
  // Community Content
  {
    id: "agent-engineering-blog",
    title: "The Agent Engineering Blog",
    description:
      "Weekly insights on agent architecture patterns, debugging techniques, and real-world case studies from production deployments.",
    url: "https://example.com/agent-blog",
    type: "Guide",
    section: "Community Content",
  },
  {
    id: "building-reliable-agents",
    title: "Building Reliable Agents at Scale",
    description:
      "Conference talk exploring strategies for testing, monitoring, and maintaining agent reliability in production environments.",
    url: "https://example.com/reliable-agents-talk",
    type: "Video",
    section: "Community Content",
  },
  {
    id: "agent-ux-patterns",
    title: "UX Patterns for Agent Interactions",
    description:
      "Blog post series examining user experience design principles specific to conversational agents and tool-augmented workflows.",
    url: "https://example.com/agent-ux",
    type: "Guide",
    section: "Community Content",
  },
];

const sections = [
  "Getting Started",
  "Documentation",
  "Tutorials",
  "Tools & Libraries",
  "Community Content",
];

const typeColors: Record<ResourceType, string> = {
  Guide: "bg-cyan/10 text-cyan border-cyan/20",
  Video: "bg-purple/10 text-purple border-purple/20",
  Docs: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Tool: "bg-green-500/10 text-green-400 border-green-500/20",
};

export default function ResourcesPage() {
  const [filterType, setFilterType] = useState<ResourceType | "All">("All");

  const filteredResources =
    filterType === "All"
      ? resources
      : resources.filter((r) => r.type === filterType);

  const groupedResources = sections.reduce(
    (acc, section) => {
      acc[section] = filteredResources.filter((r) => r.section === section);
      return acc;
    },
    {} as Record<string, Resource[]>
  );

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

      <main id="main-content" className="max-w-5xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">
            Learning <span style={{ color: "#06D6A0" }}>Resources</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Curated guides, documentation, and tools for building better agents.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilterType("All")}
            className={`px-4 py-2 rounded-lg border transition-all ${
              filterType === "All"
                ? "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30"
                : "bg-white/5 text-muted-foreground border-white/10 hover:border-white/20"
            }`}
          >
            All
          </button>
          {(["Guide", "Video", "Docs", "Tool"] as ResourceType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                filterType === type
                  ? typeColors[type]
                  : "bg-white/5 text-muted-foreground border-white/10 hover:border-white/20"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Resources by Section */}
        <div className="space-y-12">
          {sections.map((section) => {
            const sectionResources = groupedResources[section];
            if (sectionResources.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-2xl font-bold mb-4">{section}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {sectionResources.map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-5 rounded-xl border border-white/10 bg-card/50 hover:border-[#06D6A0]/50 hover:bg-card/70 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-base group-hover:text-[#06D6A0] transition-colors">
                          {resource.title}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium border shrink-0 ${
                            typeColors[resource.type]
                          }`}
                        >
                          {resource.type}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {resource.description}
                      </p>
                      <div className="mt-3 flex items-center gap-1 text-xs text-[#06D6A0] font-mono">
                        Visit resource
                        <span className="group-hover:translate-x-1 transition-transform">
                          →
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No resources found for this filter.
            </p>
            <button
              onClick={() => setFilterType("All")}
              className="mt-4 text-[#06D6A0] hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-xl border border-white/10 bg-gradient-to-br from-[#06D6A0]/5 via-card/70 to-purple/5 p-6">
          <h2 className="text-lg font-bold">Want to contribute?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Know a great resource that&apos;s missing? Submit it via{" "}
            <Link href="/submit" className="text-[#06D6A0] hover:underline">
              /submit
            </Link>{" "}
            or open a PR on{" "}
            <a
              href="https://github.com/reflectt/foragents.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#06D6A0] hover:underline"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </main>

    </div>
  );
}
