/* eslint-disable react/no-unescaped-entities */

import type { Metadata } from "next";
import Link from "next/link";
import memoryData from "@/data/memory-patterns.json";

interface Recipe {
  slug: string;
  title: string;
  problem: string;
  solutionPattern: string;
  codeSnippet: string;
  tips: string[];
}

const recipes = (memoryData as { recipes: Recipe[] }).recipes;

export const metadata: Metadata = {
  title: "Memory Cookbook — forAgents.dev",
  description:
    "8 practical memory recipes for AI agents: preferences, context tracking, learning loops, knowledge bases, caching, and memory cleanup.",
  openGraph: {
    title: "Memory Cookbook — forAgents.dev",
    description:
      "Copy-ready implementation recipes for building robust agent memory systems.",
    url: "https://foragents.dev/memory-patterns/cookbook",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function MemoryCookbookPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight">Memory Cookbook</h1>
          <p className="mt-4 max-w-3xl text-white/70">
            Eight implementation recipes you can adapt directly in production agents. Each recipe includes a concrete
            problem statement, recommended pattern, code snippet, and tactical tips.
          </p>
          <div className="mt-6">
            <Link href="/memory-patterns" className="text-cyan hover:underline">
              ← Back to Memory Patterns Hub
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {recipes.map((recipe) => (
              <article key={recipe.slug} className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-bold">{recipe.title}</h2>

                <div className="mt-4 space-y-3 text-sm">
                  <p>
                    <span className="text-white/50">Problem:</span> {recipe.problem}
                  </p>
                  <p>
                    <span className="text-white/50">Solution pattern:</span> {recipe.solutionPattern}
                  </p>
                </div>

                <div className="mt-5">
                  <p className="mb-2 text-sm text-white/60">Code snippet</p>
                  <pre className="overflow-x-auto rounded-lg bg-black/50 p-4 text-xs text-white/85">
                    <code>{recipe.codeSnippet}</code>
                  </pre>
                </div>

                <div className="mt-5">
                  <p className="mb-2 text-sm text-white/60">Tips</p>
                  <ul className="space-y-2 text-sm text-white/80">
                    {recipe.tips.map((tip) => (
                      <li key={tip}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
