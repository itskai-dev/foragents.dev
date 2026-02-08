"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

type Difficulty = "beginner" | "intermediate" | "advanced";
type Category = "getting-started" | "integration" | "best-practices" | "advanced";

interface Guide {
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  readTime: string;
  category: Category;
  icon: string;
}

const guides: Guide[] = [
  {
    slug: "your-first-agent-skill",
    title: "Your First Agent Skill",
    description: "Learn the basics of creating and installing your first agent skill. Perfect for developers new to the agent ecosystem.",
    difficulty: "beginner",
    readTime: "10 min",
    category: "getting-started",
    icon: "🚀",
  },
  {
    slug: "memory-kit-deep-dive",
    title: "Memory Kit Deep Dive",
    description: "Master persistent memory patterns for agents. Explore daily logs, semantic memory, and procedure documentation.",
    difficulty: "intermediate",
    readTime: "25 min",
    category: "integration",
    icon: "🧠",
  },
  {
    slug: "publishing-to-clawhub",
    title: "Publishing to ClawHub",
    description: "Package and publish your agent skills to the ClawHub registry. Learn best practices for documentation and versioning.",
    difficulty: "intermediate",
    readTime: "15 min",
    category: "integration",
    icon: "📦",
  },
  {
    slug: "agent-identity-with-agent-json",
    title: "Agent Identity with agent.json",
    description: "Define your agent&apos;s public identity with agent.json. Configure personality, capabilities, and discovery endpoints.",
    difficulty: "beginner",
    readTime: "12 min",
    category: "getting-started",
    icon: "🪪",
  },
  {
    slug: "building-multi-agent-teams",
    title: "Building Multi-Agent Teams",
    description: "Coordinate multiple agents with roles, intake loops, and shared backlogs. Learn the Team Kit architecture patterns.",
    difficulty: "advanced",
    readTime: "35 min",
    category: "advanced",
    icon: "🤝",
  },
  {
    slug: "monitoring-with-observability-kit",
    title: "Monitoring with Observability Kit",
    description: "Track agent performance, debug issues, and monitor resource usage with structured logging and metrics.",
    difficulty: "intermediate",
    readTime: "20 min",
    category: "best-practices",
    icon: "📊",
  },
  {
    slug: "security-best-practices",
    title: "Security Best Practices",
    description: "Protect your agent from common security pitfalls. Learn about safe tool use, data handling, and permission models.",
    difficulty: "intermediate",
    readTime: "18 min",
    category: "best-practices",
    icon: "🔒",
  },
  {
    slug: "mcp-server-integration",
    title: "MCP Server Integration",
    description: "Connect your agent to Model Context Protocol servers. Discover, configure, and use MCP tools effectively.",
    difficulty: "advanced",
    readTime: "30 min",
    category: "advanced",
    icon: "🔌",
  },
];

const difficultyColors: Record<Difficulty, string> = {
  beginner: "bg-green-500/20 text-green-300 border-green-400/30",
  intermediate: "bg-yellow-500/20 text-yellow-300 border-yellow-400/30",
  advanced: "bg-red-500/20 text-red-300 border-red-400/30",
};

const categoryLabels: Record<Category, string> = {
  "getting-started": "Getting Started",
  "integration": "Integration",
  "best-practices": "Best Practices",
  "advanced": "Advanced",
};

export default function GuidesPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "all">("all");

  const filteredGuides =
    selectedDifficulty === "all"
      ? guides
      : guides.filter((guide) => guide.difficulty === selectedDifficulty);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">
            📚 <span className="text-[#06D6A0]">Guides & Tutorials</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Step-by-step tutorials for building, deploying, and scaling AI agents.
          </p>
        </div>

        {/* Difficulty Filter */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className="text-sm text-muted-foreground">Filter by difficulty:</span>
          <button
            onClick={() => setSelectedDifficulty("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedDifficulty === "all"
                ? "bg-[#06D6A0] text-[#0a0a0a]"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            All Guides
          </button>
          <button
            onClick={() => setSelectedDifficulty("beginner")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedDifficulty === "beginner"
                ? "bg-green-500 text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            Beginner
          </button>
          <button
            onClick={() => setSelectedDifficulty("intermediate")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedDifficulty === "intermediate"
                ? "bg-yellow-500 text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            Intermediate
          </button>
          <button
            onClick={() => setSelectedDifficulty("advanced")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedDifficulty === "advanced"
                ? "bg-red-500 text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            Advanced
          </button>
        </div>

        {/* Guide Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGuides.map((guide) => (
            <Link key={guide.slug} href={`/guides/${guide.slug}`}>
              <Card className="bg-card/50 border-white/5 hover:border-[#06D6A0]/30 transition-all group h-full">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-3xl">{guide.icon}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs font-semibold ${difficultyColors[guide.difficulty]}`}
                    >
                      {guide.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-[#06D6A0] transition-colors">
                    {guide.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    <Badge variant="outline" className="text-xs bg-white/5 text-white/60 border-white/10 mt-2">
                      {categoryLabels[guide.category]}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {guide.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">⏱️ {guide.readTime}</span>
                    <span className="text-xs text-[#06D6A0] group-hover:underline">
                      Read guide →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredGuides.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No guides found for this difficulty level.
            </p>
          </div>
        )}
      </section>

      {/* More Guides Coming Soon */}
      <section className="max-w-5xl mx-auto px-4 py-8 mb-12">
        <div className="rounded-xl border border-white/5 bg-card/50 p-6 text-center">
          <p className="text-muted-foreground text-sm">
            More guides coming soon! Have a topic you&apos;d like to see?{" "}
            <Link href="/requests" className="text-[#06D6A0] hover:underline">
              Request it here
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Built by</span>
            <a
              href="https://reflectt.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="aurora-text font-semibold hover:opacity-80 transition-opacity"
            >
              Team Reflectt
            </a>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <a href="/llms.txt" className="hover:text-[#06D6A0] transition-colors">
              llms.txt
            </a>
            <a href="/api/feed.md" className="hover:text-[#06D6A0] transition-colors">
              feed.md
            </a>
            <a
              href="https://github.com/reflectt"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#06D6A0] transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
