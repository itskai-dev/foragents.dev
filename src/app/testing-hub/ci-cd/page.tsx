/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { filterTestingHubEntries, readTestingHubEntries } from "@/lib/testing-hub";

type CICDPageProps = {
  searchParams?: Promise<{
    status?: string;
    search?: string;
  }>;
};

export default async function CICDPage({ searchParams }: CICDPageProps) {
  const sp = (await searchParams) || {};
  const entries = await readTestingHubEntries();
  const cicdEntries = filterTestingHubEntries(entries, {
    category: "ci-cd",
    status: sp.status,
    search: sp.search,
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mb-8">
            <Link href="/testing-hub" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors">
              ← Back to Testing Hub
            </Link>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">CI/CD for Agents</h1>
          <p className="text-lg text-white/70 max-w-3xl">
            Persistent deployment and automation entries for shipping agents safely with observability and rollback
            guardrails.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-white/70">
            Showing <strong className="text-white">{cicdEntries.length}</strong> CI/CD entries
          </div>
          <a href="/api/testing-hub?category=ci-cd" className="text-sm text-white/60 hover:text-white transition-colors">
            API endpoint →
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {cicdEntries.map((entry) => (
            <article key={entry.id} className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1 text-xs uppercase tracking-wide text-green-300">
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

        {cicdEntries.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center text-white/60">
            No CI/CD entries matched your filters.
          </div>
        )}
      </div>
    </div>
  );
}
