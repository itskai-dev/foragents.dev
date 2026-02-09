/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  agentBenchmarksData,
  getCategoryById,
  getTopAgentsByCategory,
} from "@/lib/agent-benchmarks";
import type { CategoryId } from "@/types/agent-benchmarks";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return agentBenchmarksData.categories.map((category) => ({ category: category.id }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const item = getCategoryById(category);

  if (!item) {
    return { title: "Benchmark Category Not Found" };
  }

  return {
    title: `${item.name} Benchmarks — forAgents.dev`,
    description: item.description,
  };
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryData = getCategoryById(category);

  if (!categoryData) {
    notFound();
  }

  const topAgents = getTopAgentsByCategory(category as CategoryId, 5);

  return (
    <div className="min-h-screen bg-[#0b1020] text-slate-100">
      <main className="mx-auto max-w-5xl px-4 py-12 md:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-cyan-300">Category Detail</p>
            <h1 className="text-3xl font-bold">{categoryData.name}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">{categoryData.description} This category's tests are scored with the same rubric for all agents.</p>
          </div>
          <Link href="/benchmarks" className="text-sm text-cyan-300 hover:text-cyan-200">
            ← Back to Benchmark Hub
          </Link>
        </div>

        <section className="mb-8 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-xl font-semibold">Top 5 Agents</h2>
          <ul className="mt-4 space-y-3">
            {topAgents.map((agent, index) => (
              <li key={agent.id} className="rounded-lg border border-white/10 p-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium">
                    #{index + 1} {agent.name}
                  </p>
                  <p className="text-sm font-semibold text-cyan-300">{agent.score}</p>
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  {agent.framework} · {agent.provider} · {agent.model}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-xl font-semibold">Test Cases</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wide text-slate-300">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Difficulty</th>
                  <th className="px-3 py-2">Pass Rate</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.testCases.map((testCase) => (
                  <tr key={testCase.id} className="border-t border-white/10">
                    <td className="px-3 py-2">{testCase.name}</td>
                    <td className="px-3 py-2 capitalize">{testCase.difficulty}</td>
                    <td className="px-3 py-2">{testCase.passRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-xl font-semibold">Example Test Case</h2>
            <p className="mt-3 text-sm text-slate-300">
              <span className="font-semibold text-slate-100">{categoryData.exampleTestCase.name}</span>
            </p>
            <div className="mt-3 rounded-md bg-slate-950 p-3 text-sm">
              <p className="text-xs uppercase text-slate-400">Input</p>
              <p className="mt-1 text-slate-200">{categoryData.exampleTestCase.input}</p>
            </div>
            <div className="mt-3 rounded-md bg-slate-950 p-3 text-sm">
              <p className="text-xs uppercase text-slate-400">Expected Output</p>
              <p className="mt-1 text-slate-200">{categoryData.exampleTestCase.expectedOutput}</p>
            </div>
          </article>

          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-xl font-semibold">Methodology</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{categoryData.methodology}</p>
            <div className="mt-4 rounded-md border border-white/10 bg-slate-950/60 p-3 text-xs text-slate-300">
              Difficulty split: easy {categoryData.difficultyDistribution.easy}, medium {categoryData.difficultyDistribution.medium},
              hard {categoryData.difficultyDistribution.hard}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
