/* eslint-disable react/no-unescaped-entities */

import type { Metadata } from "next";
import Link from "next/link";
import memoryData from "@/data/memory-patterns.json";

interface MemoryLayer {
  id: string;
  name: string;
  summary: string;
  question: string;
}

interface Comparison {
  persistence: string;
  search: string;
  cost: string;
  complexity: string;
  scalability: string;
}

interface Pattern {
  slug: string;
  name: string;
  description: string;
  complexity: "simple" | "moderate" | "advanced";
  bestFor: string;
  storageType: string;
  comparison: Comparison;
}

const data = memoryData as {
  layers: MemoryLayer[];
  patterns: Pattern[];
};

export const metadata: Metadata = {
  title: "Agent Memory Patterns — forAgents.dev",
  description:
    "A practical guide to agent memory systems: session memory, persistent files, vector stores, knowledge graphs, summarization, and tool result caching.",
  openGraph: {
    title: "Agent Memory Patterns — forAgents.dev",
    description:
      "Compare memory strategies and implement the right architecture for your agent stack.",
    url: "https://foragents.dev/memory-patterns",
    siteName: "forAgents.dev",
    type: "website",
  },
};

const complexityClasses = {
  simple: "bg-green-500/15 text-green-300 border border-green-500/30",
  moderate: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  advanced: "bg-red-500/15 text-red-300 border border-red-500/30",
};

export default function MemoryPatternsHubPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Agent Memory Patterns Guide</h1>
          <p className="mt-5 max-w-3xl text-white/70">
            Memory is the difference between a stateless chatbot and an adaptive agent. This guide breaks memory down
            into layers and implementation patterns you can combine based on your latency, cost, and reliability goals.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/memory-patterns/cookbook"
              className="rounded-lg bg-[#06D6A0] px-4 py-2.5 text-sm font-semibold text-black hover:brightness-110"
            >
              Open Memory Cookbook
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <h2 className="text-2xl font-bold">The 3 Memory Layers</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {data.layers.map((layer) => (
              <div key={layer.id} className="rounded-xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-wide text-cyan">{layer.question}</p>
                <h3 className="mt-2 text-xl font-semibold">{layer.name}</h3>
                <p className="mt-3 text-sm text-white/70">{layer.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold">Pattern Cards</h2>
            <p className="text-sm text-white/50">6 practical patterns from simple to advanced</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {data.patterns.map((pattern) => (
              <Link
                href={`/memory-patterns/${pattern.slug}`}
                key={pattern.slug}
                className="group rounded-xl border border-white/10 bg-white/5 p-6 transition hover:border-white/30 hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold">{pattern.name}</h3>
                  <span className={`rounded px-2 py-1 text-xs font-medium capitalize ${complexityClasses[pattern.complexity]}`}>
                    {pattern.complexity}
                  </span>
                </div>
                <p className="mt-3 text-sm text-white/70">{pattern.description}</p>
                <div className="mt-5 space-y-2 text-sm">
                  <p>
                    <span className="text-white/50">Best for:</span> {pattern.bestFor}
                  </p>
                  <p>
                    <span className="text-white/50">Storage:</span> {pattern.storageType}
                  </p>
                </div>
                <p className="mt-5 text-sm font-medium text-cyan group-hover:underline">View deep dive →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <h2 className="text-2xl font-bold">Comparison Table</h2>
          <p className="mt-2 text-sm text-white/60">
            Quick scoring to compare tradeoffs across persistence, search, cost, complexity, and scalability.
          </p>

          <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-white/5 text-white/80">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Pattern</th>
                  <th className="px-4 py-3 text-left font-semibold">Persistence</th>
                  <th className="px-4 py-3 text-left font-semibold">Search</th>
                  <th className="px-4 py-3 text-left font-semibold">Cost</th>
                  <th className="px-4 py-3 text-left font-semibold">Complexity</th>
                  <th className="px-4 py-3 text-left font-semibold">Scalability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {data.patterns.map((pattern) => (
                  <tr key={pattern.slug} className="bg-black/20">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/memory-patterns/${pattern.slug}`} className="hover:text-cyan hover:underline">
                        {pattern.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 capitalize text-white/80">{pattern.comparison.persistence}</td>
                    <td className="px-4 py-3 capitalize text-white/80">{pattern.comparison.search}</td>
                    <td className="px-4 py-3 capitalize text-white/80">{pattern.comparison.cost}</td>
                    <td className="px-4 py-3 capitalize text-white/80">{pattern.comparison.complexity}</td>
                    <td className="px-4 py-3 capitalize text-white/80">{pattern.comparison.scalability}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
