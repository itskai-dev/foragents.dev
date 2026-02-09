"use client";

import Link from "next/link";
import { useState } from "react";

interface HostingOption {
  name: string;
  type: "local" | "cloud" | "serverless";
  icon: string;
  description: string;
  costRating: 1 | 2 | 3 | 4 | 5;
  scalingRating: 1 | 2 | 3 | 4 | 5;
  complexityRating: 1 | 2 | 3 | 4 | 5;
  bestFor: string[];
  link: string;
}

const hostingOptions: HostingOption[] = [
  {
    name: "OpenClaw Local",
    type: "local",
    icon: "💻",
    description: "Run agents locally on your machine with full control and zero cloud costs",
    costRating: 1,
    scalingRating: 2,
    complexityRating: 2,
    bestFor: ["Personal use", "Development", "Privacy-first", "Offline capability"],
    link: "/hosting/local#openclaw",
  },
  {
    name: "LangChain Local",
    type: "local",
    icon: "🔗",
    description: "Python-based agent framework for local development and prototyping",
    costRating: 1,
    scalingRating: 2,
    complexityRating: 3,
    bestFor: ["Python developers", "Rapid prototyping", "Research", "Custom workflows"],
    link: "/hosting/local#langchain",
  },
  {
    name: "AWS EC2/ECS",
    type: "cloud",
    icon: "☁️",
    description: "Scalable cloud hosting with full infrastructure control on AWS",
    costRating: 3,
    scalingRating: 5,
    complexityRating: 4,
    bestFor: ["Production", "Enterprise", "High availability", "Custom scaling"],
    link: "/hosting/cloud#aws",
  },
  {
    name: "Google Cloud Run",
    type: "cloud",
    icon: "🔵",
    description: "Serverless containers on GCP with automatic scaling and zero-config SSL",
    costRating: 2,
    scalingRating: 5,
    complexityRating: 3,
    bestFor: ["Containerized agents", "Pay-per-use", "Quick deployment", "Auto-scaling"],
    link: "/hosting/cloud#gcp",
  },
  {
    name: "Azure Container Instances",
    type: "cloud",
    icon: "🔷",
    description: "Fast container deployment on Azure with integrated Microsoft services",
    costRating: 3,
    scalingRating: 4,
    complexityRating: 3,
    bestFor: ["Microsoft ecosystem", "Enterprise", "Compliance", "Hybrid cloud"],
    link: "/hosting/cloud#azure",
  },
  {
    name: "Railway",
    type: "cloud",
    icon: "🚂",
    description: "Simple platform for deploying agents with Git-based deployments",
    costRating: 2,
    scalingRating: 3,
    complexityRating: 1,
    bestFor: ["Indie hackers", "Quick deployment", "Git workflow", "Side projects"],
    link: "/hosting/cloud#railway",
  },
  {
    name: "Fly.io",
    type: "cloud",
    icon: "🪰",
    description: "Edge-deployed containers with global distribution and low latency",
    costRating: 2,
    scalingRating: 4,
    complexityRating: 2,
    bestFor: ["Edge computing", "Global users", "Low latency", "WebSocket apps"],
    link: "/hosting/cloud#flyio",
  },
  {
    name: "AWS Lambda",
    type: "serverless",
    icon: "λ",
    description: "Event-driven serverless functions with pay-per-execution pricing",
    costRating: 1,
    scalingRating: 5,
    complexityRating: 4,
    bestFor: ["Event-driven", "Microservices", "Cost optimization", "Burst traffic"],
    link: "/hosting/cloud#lambda",
  },
  {
    name: "Vercel Functions",
    type: "serverless",
    icon: "▲",
    description: "Serverless functions optimized for Next.js and edge deployment",
    costRating: 2,
    scalingRating: 4,
    complexityRating: 2,
    bestFor: ["Next.js agents", "Web interfaces", "Edge functions", "Quick setup"],
    link: "/hosting/cloud#vercel",
  },
  {
    name: "Raspberry Pi",
    type: "local",
    icon: "🥧",
    description: "Low-power home server for always-on agents on a budget",
    costRating: 1,
    scalingRating: 1,
    complexityRating: 3,
    bestFor: ["Home automation", "Always-on", "Energy efficient", "Learning"],
    link: "/hosting/local#raspberry-pi",
  },
];

const RATING_LABELS = {
  cost: ["Very Low", "Low", "Moderate", "High", "Very High"],
  scaling: ["Limited", "Basic", "Good", "Excellent", "Elite"],
  complexity: ["Easy", "Simple", "Moderate", "Complex", "Expert"],
};

function RatingBar({ rating, type }: { rating: number; type: "cost" | "scaling" | "complexity" }) {
  const colorMap = {
    cost: rating <= 2 ? "bg-emerald-500" : rating === 3 ? "bg-amber-500" : "bg-rose-500",
    scaling: rating >= 4 ? "bg-emerald-500" : rating === 3 ? "bg-amber-500" : "bg-gray-500",
    complexity: rating <= 2 ? "bg-emerald-500" : rating === 3 ? "bg-amber-500" : "bg-rose-500",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-2 w-6 rounded-sm ${
              i <= rating ? colorMap[type] : "bg-gray-700"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-400">{RATING_LABELS[type][rating - 1]}</span>
    </div>
  );
}

export default function HostingPage() {
  const [filterType, setFilterType] = useState<"all" | "local" | "cloud" | "serverless">("all");

  const filteredOptions = hostingOptions.filter(
    (option) => filterType === "all" || option.type === filterType
  );

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Agent Hosting & Deployment — forAgents.dev",
    description:
      "Comprehensive guide to hosting AI agents: local setups, cloud platforms, containers, and serverless. Compare options and find the best deployment strategy.",
    url: "https://foragents.dev/hosting",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="relative">
          <div className="absolute inset-0 -z-10 opacity-30">
            <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#06D6A0]/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px]" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            🚀 Agent Hosting & Deployment
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-2">
            From local development to global scale — find the perfect hosting solution for your
            agents
          </p>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            Compare platforms, deployment strategies, and infrastructure options
          </p>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/hosting/cloud"
            className="group p-6 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-[#06D6A0]/50 transition-all"
          >
            <div className="text-3xl mb-3">☁️</div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#06D6A0] transition-colors">
              Cloud Deployment
            </h3>
            <p className="text-sm text-gray-400">
              Step-by-step guides for AWS, GCP, Azure, Railway, and Fly.io
            </p>
          </Link>

          <Link
            href="/hosting/local"
            className="group p-6 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-[#06D6A0]/50 transition-all"
          >
            <div className="text-3xl mb-3">💻</div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#06D6A0] transition-colors">
              Local Setup
            </h3>
            <p className="text-sm text-gray-400">
              Run agents on your machine: OpenClaw, LangChain, and home servers
            </p>
          </Link>

          <Link
            href="/hosting/containers"
            className="group p-6 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-[#06D6A0]/50 transition-all"
          >
            <div className="text-3xl mb-3">🐳</div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#06D6A0] transition-colors">
              Docker & Containers
            </h3>
            <p className="text-sm text-gray-400">
              Containerize agents with Docker, Compose, and Kubernetes
            </p>
          </Link>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="flex gap-2 flex-wrap">
          {[
            { id: "all", label: "All Options", icon: "📋" },
            { id: "local", label: "Local", icon: "💻" },
            { id: "cloud", label: "Cloud", icon: "☁️" },
            { id: "serverless", label: "Serverless", icon: "⚡" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterType(filter.id as any)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                filterType === filter.id
                  ? "bg-[#06D6A0]/10 border-[#06D6A0] text-[#06D6A0]"
                  : "bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700"
              }`}
            >
              <span className="mr-2">{filter.icon}</span>
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {/* Hosting Options Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOptions.map((option) => (
            <Link
              key={option.name}
              href={option.link}
              className="group p-6 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-[#06D6A0]/50 transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{option.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-[#06D6A0] transition-colors">
                    {option.name}
                  </h3>
                  <p className="text-sm text-gray-400">{option.description}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Cost</span>
                  </div>
                  <RatingBar rating={option.costRating} type="cost" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Scaling</span>
                  </div>
                  <RatingBar rating={option.scalingRating} type="scaling" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Complexity</span>
                  </div>
                  <RatingBar rating={option.complexityRating} type="complexity" />
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-500 block mb-2">Best for:</span>
                <div className="flex flex-wrap gap-2">
                  {option.bestFor.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded text-xs bg-gray-800 text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Decision Helper */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="p-8 rounded-lg border border-gray-800 bg-gray-900/50">
          <h2 className="text-2xl font-bold text-white mb-6">🎯 Not sure where to start?</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="text-2xl">💡</div>
              <div>
                <h3 className="font-semibold text-white mb-1">Just getting started?</h3>
                <p className="text-sm text-gray-400">
                  Start with <Link href="/hosting/local" className="text-[#06D6A0] hover:underline">local setup</Link> 
                  {" "}(OpenClaw or LangChain) for zero cost and full control while learning.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-2xl">🚀</div>
              <div>
                <h3 className="font-semibold text-white mb-1">Need production reliability?</h3>
                <p className="text-sm text-gray-400">
                  Go with <Link href="/hosting/cloud#railway" className="text-[#06D6A0] hover:underline">Railway</Link>
                  {" "}or <Link href="/hosting/cloud#flyio" className="text-[#06D6A0] hover:underline">Fly.io</Link>
                  {" "}for simple deployment with high uptime.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-2xl">🏢</div>
              <div>
                <h3 className="font-semibold text-white mb-1">Enterprise requirements?</h3>
                <p className="text-sm text-gray-400">
                  Choose <Link href="/hosting/cloud#aws" className="text-[#06D6A0] hover:underline">AWS</Link>, 
                  {" "}<Link href="/hosting/cloud#gcp" className="text-[#06D6A0] hover:underline">GCP</Link>, or
                  {" "}<Link href="/hosting/cloud#azure" className="text-[#06D6A0] hover:underline">Azure</Link>
                  {" "}for compliance, SLAs, and advanced infrastructure.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-2xl">⚡</div>
              <div>
                <h3 className="font-semibold text-white mb-1">Optimizing for cost?</h3>
                <p className="text-sm text-gray-400">
                  Use <Link href="/hosting/cloud#lambda" className="text-[#06D6A0] hover:underline">serverless</Link>
                  {" "}(Lambda, Cloud Functions) for sporadic workloads that don't need 24/7 uptime.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-2xl">🔒</div>
              <div>
                <h3 className="font-semibold text-white mb-1">Privacy-first or air-gapped?</h3>
                <p className="text-sm text-gray-400">
                  Stick with <Link href="/hosting/local" className="text-[#06D6A0] hover:underline">local hosting</Link>
                  {" "}— nothing beats running on your own hardware for data sovereignty.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-white mb-6">📚 Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/guides"
            className="p-4 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-[#06D6A0]/50 transition-all"
          >
            <h3 className="font-semibold text-white mb-2">📖 Deployment Guides</h3>
            <p className="text-sm text-gray-400">
              Step-by-step tutorials for deploying agents to production
            </p>
          </Link>

          <Link
            href="/security"
            className="p-4 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-[#06D6A0]/50 transition-all"
          >
            <h3 className="font-semibold text-white mb-2">🔒 Security Best Practices</h3>
            <p className="text-sm text-gray-400">
              Secure your deployments with proper authentication and encryption
            </p>
          </Link>

          <Link
            href="/monitoring"
            className="p-4 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-[#06D6A0]/50 transition-all"
          >
            <h3 className="font-semibold text-white mb-2">📊 Monitoring & Observability</h3>
            <p className="text-sm text-gray-400">
              Track agent health, performance, and costs in production
            </p>
          </Link>

          <Link
            href="/benchmarks"
            className="p-4 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-[#06D6A0]/50 transition-all"
          >
            <h3 className="font-semibold text-white mb-2">⚡ Performance Benchmarks</h3>
            <p className="text-sm text-gray-400">
              Compare response times and throughput across platforms
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
