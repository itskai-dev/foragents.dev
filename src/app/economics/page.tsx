/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  filterEconomicsEntries,
  readEconomicsEntries,
  type EconomicsCategory,
} from "@/lib/economics";

type EconomicsPageProps = {
  searchParams?: Promise<{
    category?: string;
    search?: string;
  }>;
};

const categoryOrder: EconomicsCategory[] = ["pricing", "costs", "revenue", "roi"];

const categoryDescription: Record<EconomicsCategory, string> = {
  pricing: "Packaging, tiering, and value-metric strategy",
  costs: "Operating expenses, token spend, and infrastructure",
  revenue: "Conversion, expansion, and retention outcomes",
  roi: "Payback windows, baseline metrics, and impact tracking",
};

export default async function EconomicsHubPage({ searchParams }: EconomicsPageProps) {
  const sp = (await searchParams) || {};
  const entries = await readEconomicsEntries();
  const filtered = filterEconomicsEntries(entries, {
    category: sp.category,
    search: sp.search,
  });

  const counts = categoryOrder.reduce<Record<EconomicsCategory, number>>((acc, category) => {
    acc[category] = entries.filter((entry) => entry.category === category).length;
    return acc;
  }, { pricing: 0, costs: 0, revenue: 0, roi: 0 });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Badge className="mb-4 border border-[#06D6A0]/30 bg-[#06D6A0]/15 text-[#06D6A0]">
          Economics Knowledge Base
        </Badge>
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">Economics playbooks for AI products</h1>
        <p className="max-w-3xl text-foreground/70">
          Persistent economics entries covering pricing, costs, revenue, and ROI. Filter content directly on this page or query the JSON API.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href="/economics"
            className="rounded-full border border-white/20 px-3 py-1 text-sm text-white/80 hover:border-white/40 hover:text-white"
          >
            All ({entries.length})
          </Link>
          {categoryOrder.map((category) => (
            <Link
              key={category}
              href={`/economics?category=${category}`}
              className="rounded-full border border-white/20 px-3 py-1 text-sm capitalize text-white/80 hover:border-white/40 hover:text-white"
            >
              {category} ({counts[category]})
            </Link>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-foreground/70">Showing {filtered.length} entries</p>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/economics/compare" className="text-[#06D6A0] hover:underline">
              Compare categories →
            </Link>
            <a href="/api/economics" className="text-foreground/70 hover:text-white">
              API endpoint →
            </a>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center text-foreground/70">
            No economics entries matched this filter.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((entry) => (
              <Card key={entry.id} className="border-white/10 bg-card/40">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <Badge className="border border-white/20 bg-white/10 text-white/80 capitalize">
                      {entry.category}
                    </Badge>
                    <span className="text-xs text-foreground/50">
                      Updated {new Date(entry.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-xl text-white">{entry.title}</CardTitle>
                  <p className="text-sm text-foreground/60">{categoryDescription[entry.category]}</p>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-foreground/75">{entry.content}</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                      <span
                        key={`${entry.id}-${tag}`}
                        className="rounded-md bg-black/30 px-2 py-1 text-xs text-white/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
