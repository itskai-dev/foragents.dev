"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type IntegrationCategory = "CI/CD" | "Communication" | "Project Management" | "Cloud";

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: "API" | "CLI" | "Plugin" | "Webhook";
  category: IntegrationCategory;
  learnMoreUrl: string;
}

const integrations: Integration[] = [
  {
    id: "github",
    name: "GitHub",
    icon: "🐙",
    description: "Automate workflows, manage repositories, and integrate CI/CD pipelines with forAgents.dev kits.",
    type: "API",
    category: "CI/CD",
    learnMoreUrl: "https://docs.github.com/en/rest",
  },
  {
    id: "vscode",
    name: "VS Code",
    icon: "💻",
    description: "Build extensions and integrate agent capabilities directly into your development environment.",
    type: "Plugin",
    category: "CI/CD",
    learnMoreUrl: "https://code.visualstudio.com/api",
  },
  {
    id: "slack",
    name: "Slack",
    icon: "💬",
    description: "Send notifications, create interactive workflows, and build custom bot integrations.",
    type: "Webhook",
    category: "Communication",
    learnMoreUrl: "https://api.slack.com",
  },
  {
    id: "discord",
    name: "Discord",
    icon: "🎮",
    description: "Create bots, automate server management, and build community engagement tools.",
    type: "API",
    category: "Communication",
    learnMoreUrl: "https://discord.com/developers/docs",
  },
  {
    id: "notion",
    name: "Notion",
    icon: "📝",
    description: "Automate documentation, sync data, and create intelligent knowledge management systems.",
    type: "API",
    category: "Project Management",
    learnMoreUrl: "https://developers.notion.com",
  },
  {
    id: "linear",
    name: "Linear",
    icon: "📊",
    description: "Automate issue tracking, sync project data, and streamline development workflows.",
    type: "API",
    category: "Project Management",
    learnMoreUrl: "https://developers.linear.app",
  },
  {
    id: "jira",
    name: "Jira",
    icon: "🎯",
    description: "Connect agile workflows, automate ticket management, and integrate with development processes.",
    type: "API",
    category: "Project Management",
    learnMoreUrl: "https://developer.atlassian.com/cloud/jira",
  },
  {
    id: "vercel",
    name: "Vercel",
    icon: "▲",
    description: "Deploy applications, manage deployments, and automate CI/CD pipelines seamlessly.",
    type: "API",
    category: "CI/CD",
    learnMoreUrl: "https://vercel.com/docs/rest-api",
  },
  {
    id: "aws",
    name: "AWS",
    icon: "☁️",
    description: "Manage cloud infrastructure, automate deployments, and integrate with AWS services.",
    type: "CLI",
    category: "Cloud",
    learnMoreUrl: "https://aws.amazon.com/cli",
  },
  {
    id: "docker",
    name: "Docker",
    icon: "🐳",
    description: "Build, deploy, and manage containerized applications with automated workflows.",
    type: "CLI",
    category: "Cloud",
    learnMoreUrl: "https://docs.docker.com/engine/api",
  },
  {
    id: "kubernetes",
    name: "Kubernetes",
    icon: "☸️",
    description: "Orchestrate containers, manage clusters, and automate deployment strategies.",
    type: "CLI",
    category: "Cloud",
    learnMoreUrl: "https://kubernetes.io/docs/reference",
  },
  {
    id: "terraform",
    name: "Terraform",
    icon: "🏗️",
    description: "Automate infrastructure as code, manage cloud resources, and enable GitOps workflows.",
    type: "CLI",
    category: "Cloud",
    learnMoreUrl: "https://developer.hashicorp.com/terraform/docs",
  },
];

export default function IntegrationsPage() {
  const [categoryFilter, setCategoryFilter] = useState<IntegrationCategory | "All">("All");

  const filteredIntegrations =
    categoryFilter === "All"
      ? integrations
      : integrations.filter((integration) => integration.category === categoryFilter);

  const getTypeBadgeColor = (type: Integration["type"]) => {
    switch (type) {
      case "API":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "CLI":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Plugin":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Webhook":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        {/* Subtle aurora background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Platform Integrations
          </h1>
          <p className="text-xl text-foreground/80 mb-2">
            Connect forAgents.dev kits with the tools you already use
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Filter Section */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setCategoryFilter("All")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              categoryFilter === "All"
                ? "bg-[#06D6A0] text-[#0a0a0a]"
                : "border border-white/10 text-foreground hover:bg-white/5"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setCategoryFilter("CI/CD")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              categoryFilter === "CI/CD"
                ? "bg-[#06D6A0] text-[#0a0a0a]"
                : "border border-white/10 text-foreground hover:bg-white/5"
            }`}
          >
            CI/CD
          </button>
          <button
            onClick={() => setCategoryFilter("Communication")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              categoryFilter === "Communication"
                ? "bg-[#06D6A0] text-[#0a0a0a]"
                : "border border-white/10 text-foreground hover:bg-white/5"
            }`}
          >
            Communication
          </button>
          <button
            onClick={() => setCategoryFilter("Project Management")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              categoryFilter === "Project Management"
                ? "bg-[#06D6A0] text-[#0a0a0a]"
                : "border border-white/10 text-foreground hover:bg-white/5"
            }`}
          >
            Project Management
          </button>
          <button
            onClick={() => setCategoryFilter("Cloud")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              categoryFilter === "Cloud"
                ? "bg-[#06D6A0] text-[#0a0a0a]"
                : "border border-white/10 text-foreground hover:bg-white/5"
            }`}
          >
            Cloud
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
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{integration.icon}</span>
                    <CardTitle className="text-xl">{integration.name}</CardTitle>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={getTypeBadgeColor(integration.type)}
                >
                  {integration.type}
                </Badge>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {integration.description}
                </p>
                <a
                  href={integration.learnMoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#06D6A0] hover:underline"
                >
                  Learn more ↗
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No integrations found for this category.
            </p>
          </div>
        )}
      </section>

      <Separator className="opacity-10" />

      {/* CTA Section - Request Integration */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Don&apos;t see your platform?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We&apos;re constantly adding new integrations to help agents work with the tools you use every day.
              Request an integration or contribute your own.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Request Integration →
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

    </div>
  );
}
