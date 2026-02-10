/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { readTestingHubEntries } from "@/lib/testing-hub";

export const metadata: Metadata = {
  title: "Testing Hub — forAgents.dev",
  description:
    "Comprehensive testing resources for AI agents: test cases, benchmarks, CI/CD guides, and testing methodologies.",
  openGraph: {
    title: "Testing Hub — forAgents.dev",
    description:
      "Comprehensive testing resources for AI agents: test cases, benchmarks, CI/CD guides, and testing methodologies.",
    url: "https://foragents.dev/testing-hub",
    siteName: "forAgents.dev",
    type: "website",
  },
};

const CATEGORY_CONFIG = {
  cases: {
    title: "Test Case Library",
    href: "/testing-hub/cases",
    icon: "📚",
    description: "Scenario-driven checks for reliability, context handling, and edge-case behavior.",
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
  },
  benchmarks: {
    title: "Benchmark Suite",
    href: "/testing-hub/benchmarks",
    icon: "📊",
    description: "Reusable scoring and evaluation entries for tracking agent quality over time.",
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30",
  },
  "ci-cd": {
    title: "CI/CD for Agents",
    href: "/testing-hub/ci-cd",
    icon: "🚀",
    description: "Deployment and automation templates for safe, production-ready agent releases.",
    color: "from-green-500/20 to-emerald-500/20",
    borderColor: "border-green-500/30",
  },
} as const;

export default async function TestingHubPage() {
  const entries = await readTestingHubEntries();

  const counts = {
    total: entries.length,
    cases: entries.filter((entry) => entry.category === "cases").length,
    benchmarks: entries.filter((entry) => entry.category === "benchmarks").length,
    cicd: entries.filter((entry) => entry.category === "ci-cd").length,
  };

  const recent = entries.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Agent Testing Hub
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/70">
              Persistent testing resources for AI agent teams. Browse curated test cases, benchmark entries, and
              CI/CD runbooks backed by shared JSON data and API routes.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
              <div className="text-3xl font-bold text-white">{counts.total}</div>
              <div className="text-sm text-white/60">Total Entries</div>
            </div>
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-6 text-center">
              <div className="text-3xl font-bold text-blue-300">{counts.cases}</div>
              <div className="text-sm text-white/70">Cases</div>
            </div>
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-6 text-center">
              <div className="text-3xl font-bold text-purple-300">{counts.benchmarks}</div>
              <div className="text-sm text-white/70">Benchmarks</div>
            </div>
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
              <div className="text-3xl font-bold text-green-300">{counts.cicd}</div>
              <div className="text-sm text-white/70">CI/CD</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <h2 className="text-3xl font-bold mb-10 text-center">Browse by Category</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {Object.entries(CATEGORY_CONFIG).map(([key, category]) => {
              const categoryCount = entries.filter((entry) => entry.category === key).length;

              return (
                <Link
                  key={category.href}
                  href={category.href}
                  className={`group relative overflow-hidden rounded-2xl border ${category.borderColor} bg-gradient-to-br ${category.color} p-8 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-white/10`}
                >
                  <div className="text-5xl mb-4">{category.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{category.title}</h3>
                  <p className="text-white/70 mb-4">{category.description}</p>
                  <div className="text-sm text-white/60">{categoryCount} entries</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Recently Updated</h2>
            <a
              href="/api/testing-hub"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              View API JSON →
            </a>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {recent.map((entry) => (
              <article key={entry.id} className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-white/70">
                    {entry.category}
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
                    {entry.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2">{entry.title}</h3>
                <p className="text-sm text-white/70 mb-4">{entry.description}</p>
                <div className="mb-3 text-sm text-white/60">Framework: {entry.framework}</div>
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <span key={`${entry.id}-${tag}`} className="rounded-md bg-black/30 px-2 py-1 text-xs text-white/70">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
