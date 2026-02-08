"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Category = "All" | "Development" | "Productivity" | "Communication" | "Data";

interface UseCase {
  id: string;
  icon: string;
  title: string;
  description: string;
  category: Exclude<Category, "All">;
  relatedSkills: Array<{ name: string; slug: string }>;
}

const useCases: UseCase[] = [
  {
    id: "code-review",
    icon: "🔍",
    title: "Code Review Automation",
    description: "Automatically review pull requests for common issues, style violations, and potential bugs. Agents can analyze code quality, suggest improvements, and enforce best practices across your team&apos;s codebase.",
    category: "Development",
    relatedSkills: [
      { name: "github-tools", slug: "github-tools" },
      { name: "code-analyzer", slug: "code-analyzer" },
      { name: "git-operations", slug: "git-operations" },
    ],
  },
  {
    id: "content-generation",
    icon: "✍️",
    title: "Content Generation",
    description: "Generate blog posts, documentation, marketing copy, and social media content. Agents can maintain brand voice, optimize for SEO, and adapt content for different platforms automatically.",
    category: "Productivity",
    relatedSkills: [
      { name: "markdown-tools", slug: "markdown-tools" },
      { name: "seo-optimizer", slug: "seo-optimizer" },
      { name: "content-scheduler", slug: "content-scheduler" },
    ],
  },
  {
    id: "data-analysis",
    icon: "📊",
    title: "Data Analysis & Insights",
    description: "Process large datasets, generate reports, and extract actionable insights. Agents can identify trends, create visualizations, and deliver automated analytics summaries to stakeholders.",
    category: "Data",
    relatedSkills: [
      { name: "data-tools", slug: "data-tools" },
      { name: "chart-generator", slug: "chart-generator" },
      { name: "csv-parser", slug: "csv-parser" },
    ],
  },
  {
    id: "customer-support",
    icon: "💬",
    title: "Customer Support",
    description: "Handle common customer inquiries, route complex issues to humans, and maintain conversation context. Agents can resolve tickets faster while learning from each interaction to improve over time.",
    category: "Communication",
    relatedSkills: [
      { name: "slack-integration", slug: "slack-integration" },
      { name: "discord-bot", slug: "discord-bot" },
      { name: "email-handler", slug: "email-handler" },
    ],
  },
  {
    id: "devops-monitoring",
    icon: "🔧",
    title: "DevOps Monitoring",
    description: "Monitor system health, detect anomalies, and respond to incidents automatically. Agents can analyze logs, trigger alerts, and execute remediation scripts based on predefined playbooks.",
    category: "Development",
    relatedSkills: [
      { name: "server-monitor", slug: "server-monitor" },
      { name: "log-analyzer", slug: "log-analyzer" },
      { name: "alert-system", slug: "alert-system" },
    ],
  },
  {
    id: "research-assistant",
    icon: "🔬",
    title: "Research Assistant",
    description: "Gather information from multiple sources, synthesize findings, and compile comprehensive research reports. Agents can track citations, fact-check claims, and organize knowledge efficiently.",
    category: "Data",
    relatedSkills: [
      { name: "web-scraper", slug: "web-scraper" },
      { name: "pdf-parser", slug: "pdf-parser" },
      { name: "citation-manager", slug: "citation-manager" },
    ],
  },
  {
    id: "email-triage",
    icon: "📧",
    title: "Email Triage",
    description: "Automatically categorize, prioritize, and draft responses to incoming emails. Agents can identify urgent messages, suggest replies, and maintain organized inbox workflows for busy professionals.",
    category: "Productivity",
    relatedSkills: [
      { name: "gmail-tools", slug: "gmail-tools" },
      { name: "email-parser", slug: "email-parser" },
      { name: "calendar-sync", slug: "calendar-sync" },
    ],
  },
  {
    id: "meeting-summarizer",
    icon: "📝",
    title: "Meeting Summarizer",
    description: "Transcribe meetings, extract action items, and generate shareable summaries. Agents can identify key decisions, assign tasks, and distribute notes to participants automatically.",
    category: "Communication",
    relatedSkills: [
      { name: "transcription", slug: "transcription" },
      { name: "note-taker", slug: "note-taker" },
      { name: "task-extractor", slug: "task-extractor" },
    ],
  },
  {
    id: "code-documentation",
    icon: "📚",
    title: "Code Documentation",
    description: "Generate and maintain up-to-date documentation from source code. Agents can create API references, update README files, and ensure documentation stays in sync with code changes.",
    category: "Development",
    relatedSkills: [
      { name: "docgen", slug: "docgen" },
      { name: "markdown-tools", slug: "markdown-tools" },
      { name: "api-docs", slug: "api-docs" },
    ],
  },
  {
    id: "data-pipeline",
    icon: "🔄",
    title: "Data Pipeline Orchestration",
    description: "Automate ETL workflows, monitor data quality, and handle pipeline failures gracefully. Agents can transform data between formats, validate integrity, and trigger downstream processes.",
    category: "Data",
    relatedSkills: [
      { name: "etl-tools", slug: "etl-tools" },
      { name: "data-validator", slug: "data-validator" },
      { name: "workflow-engine", slug: "workflow-engine" },
    ],
  },
];

export default function UseCasesClient() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");

  const categories: Category[] = ["All", "Development", "Productivity", "Communication", "Data"];

  const filteredUseCases =
    selectedCategory === "All"
      ? useCases
      : useCases.filter((useCase) => useCase.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        {/* Subtle aurora background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Real-World Agent <span className="text-[#06D6A0]">Use Cases</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover how AI agents are transforming workflows across development, productivity, communication, and data analysis.
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-[#06D6A0] text-[#0a0a0a]"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          {filteredUseCases.map((useCase) => (
            <Card
              key={useCase.id}
              className="bg-card/50 border-white/10 hover:border-[#06D6A0]/30 transition-all group"
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{useCase.icon}</div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 group-hover:text-[#06D6A0] transition-colors">
                      {useCase.title}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-xs bg-white/5 text-white/60 border-white/10"
                    >
                      {useCase.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {useCase.description}
                </p>

                {/* Related Skills */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">
                    Related Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {useCase.relatedSkills.map((skill) => (
                      <Link
                        key={skill.slug}
                        href={`/skills/${skill.slug}`}
                        className="text-xs px-3 py-1 rounded-md bg-[#06D6A0]/10 text-[#06D6A0] border border-[#06D6A0]/20 hover:bg-[#06D6A0]/20 transition-colors"
                      >
                        {skill.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredUseCases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No use cases found for this category.
            </p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/10 via-card/80 to-purple/5 p-8 md:p-12 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Ready to Build Your Agent?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Explore our skills directory to find the tools you need to bring these use cases to life.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/skills"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Browse Skills →
              </Link>
              <Link
                href="/getting-started"
                className="text-sm text-[#06D6A0] hover:underline"
              >
                Getting Started Guide
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
