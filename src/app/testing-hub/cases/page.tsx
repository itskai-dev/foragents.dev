/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { filterTestingHubEntries, readTestingHubEntries } from "@/lib/testing-hub";

type TestCasesPageProps = {
  searchParams?: Promise<{
    status?: string;
    search?: string;
  }>;
};

export default async function TestCasesPage({ searchParams }: TestCasesPageProps) {
  const sp = (await searchParams) || {};
  const entries = await readTestingHubEntries();
  const testCases = filterTestingHubEntries(entries, {
    category: "cases",
    status: sp.status,
    search: sp.search,
  });

  const statusCounts = {
    draft: testCases.filter((entry) => entry.status === "draft").length,
    active: testCases.filter((entry) => entry.status === "active").length,
    stable: testCases.filter((entry) => entry.status === "stable").length,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mb-8">
            <Link href="/testing-hub" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors">
              ← Back to Testing Hub
            </Link>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">Test Case Library</h1>
          <p className="text-lg text-white/70 max-w-3xl">
            Persistent test case entries for validating agent reliability, context retention, and resilient behavior.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm">
              <span className="text-white/60">Total:</span> {testCases.length}
            </div>
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm">
              <span className="text-yellow-300">Draft:</span> {statusCounts.draft}
            </div>
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm">
              <span className="text-blue-300">Active:</span> {statusCounts.active}
            </div>
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm">
              <span className="text-green-300">Stable:</span> {statusCounts.stable}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-white/70">Showing {testCases.length} test cases</div>
          <a href="/api/testing-hub?category=cases" className="text-sm text-white/60 hover:text-white transition-colors">
            API endpoint →
          </a>
        </div>

        <div className="space-y-4">
          {testCases.map((entry) => (
            <article key={entry.id} className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-wide text-blue-300">
                  {entry.status}
                </span>
                <span className="text-xs text-white/50">
                  Updated {new Date(entry.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-xl font-bold mb-2">{entry.title}</h2>
              <p className="text-white/70 mb-4">{entry.description}</p>
              <div className="text-sm text-white/60 mb-4">Framework: {entry.framework}</div>
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

        {testCases.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center text-white/60">
            No test case entries matched your filters.
          </div>
        )}
      </div>
    </div>
  );
}
