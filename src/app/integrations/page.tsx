"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/footer";

type IntegrationStatus = "Available" | "Coming Soon";

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  learnMoreUrl: string;
  status: IntegrationStatus;
}

const integrations: Integration[] = [
  {
    id: "openclaw",
    name: "OpenClaw",
    icon: "🦞",
    description: "Multi-agent orchestration platform with native forAgents.dev integration. Built for autonomous workflows.",
    learnMoreUrl: "https://openclaw.dev",
    status: "Available",
  },
  {
    id: "claude-code",
    name: "Claude Code",
    icon: "🤖",
    description: "Anthropic&apos;s official CLI for Claude. Access forAgents.dev skills directly from your terminal.",
    learnMoreUrl: "https://claude.ai",
    status: "Available",
  },
  {
    id: "cursor",
    name: "Cursor",
    icon: "⚡",
    description: "AI-first code editor with integrated forAgents.dev skill discovery and execution.",
    learnMoreUrl: "https://cursor.sh",
    status: "Available",
  },
  {
    id: "windsurf",
    name: "Windsurf",
    icon: "🏄",
    description: "Collaborative AI coding environment. Browse and use forAgents.dev skills in your development workflow.",
    learnMoreUrl: "https://codeium.com/windsurf",
    status: "Available",
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    icon: "🐙",
    description: "Your AI pair programmer. Seamlessly integrate forAgents.dev skills into GitHub Copilot workflows.",
    learnMoreUrl: "https://github.com/features/copilot",
    status: "Coming Soon",
  },
  {
    id: "cline",
    name: "Cline",
    icon: "🔧",
    description: "Autonomous coding agent for VS Code. Access the full forAgents.dev skill library from your editor.",
    learnMoreUrl: "https://github.com/cline/cline",
    status: "Available",
  },
  {
    id: "continue",
    name: "Continue.dev",
    icon: "➡️",
    description: "Open-source autopilot for software development. Native support for forAgents.dev skills.",
    learnMoreUrl: "https://continue.dev",
    status: "Available",
  },
  {
    id: "codex-cli",
    name: "Codex CLI",
    icon: "💻",
    description: "Command-line interface for AI-powered development. Query and execute forAgents.dev skills from bash.",
    learnMoreUrl: "#",
    status: "Coming Soon",
  },
];

export default function IntegrationsPage() {
  const [statusFilter, setStatusFilter] = useState<IntegrationStatus | "All">("All");

  const filteredIntegrations =
    statusFilter === "All"
      ? integrations
      : integrations.filter((integration) => integration.status === statusFilter);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="text-xs text-muted-foreground font-mono">
              forAgents.dev
            </span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        {/* Subtle aurora background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Integrations
          </h1>
          <p className="text-xl text-foreground/80 mb-2">
            Platforms and tools that work with forAgents.dev
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Filter Section */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setStatusFilter("All")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === "All"
                ? "bg-[#06D6A0] text-[#0a0a0a]"
                : "border border-white/10 text-foreground hover:bg-white/5"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("Available")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === "Available"
                ? "bg-[#06D6A0] text-[#0a0a0a]"
                : "border border-white/10 text-foreground hover:bg-white/5"
            }`}
          >
            Available
          </button>
          <button
            onClick={() => setStatusFilter("Coming Soon")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === "Coming Soon"
                ? "bg-[#06D6A0] text-[#0a0a0a]"
                : "border border-white/10 text-foreground hover:bg-white/5"
            }`}
          >
            Coming Soon
          </button>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="max-w-6xl mx-auto px-4 py-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => (
            <Card
              key={integration.id}
              className="relative overflow-hidden bg-card/30 border-white/10 hover:border-[#06D6A0]/30 transition-all group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#06D6A0]/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{integration.icon}</span>
                    <CardTitle className="text-xl">{integration.name}</CardTitle>
                  </div>
                  <Badge
                    variant={integration.status === "Available" ? "default" : "outline"}
                    className={
                      integration.status === "Available"
                        ? "bg-[#06D6A0]/20 text-[#06D6A0] border-[#06D6A0]/30 hover:bg-[#06D6A0]/30"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }
                  >
                    {integration.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {integration.description}
                </p>
                {integration.learnMoreUrl !== "#" ? (
                  <a
                    href={integration.learnMoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#06D6A0] hover:underline"
                  >
                    Learn more ↗
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground/50">
                    Learn more ↗
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No integrations found for this filter.
            </p>
          </div>
        )}
      </section>

      <Separator className="opacity-10" />

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Want to integrate with forAgents.dev?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We&apos;re building the agent-native directory with machine-readable endpoints.
              Join us in creating the infrastructure for autonomous AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Get in Touch →
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
