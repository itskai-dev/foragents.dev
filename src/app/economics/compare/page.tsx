/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { readEconomicsEntries, type EconomicsCategory } from "@/lib/economics";

const categoryOrder: EconomicsCategory[] = ["pricing", "costs", "revenue", "roi"];

const categoryNarrative: Record<EconomicsCategory, string> = {
  pricing: "How to package, tier, and position value metrics.",
  costs: "How to control spend and improve operational efficiency.",
  revenue: "How to increase conversion, retention, and expansion.",
  roi: "How to prove measurable business outcomes from deployment.",
};

export default async function EconomicsComparePage() {
  const entries = await readEconomicsEntries();

  const grouped = categoryOrder.map((category) => {
    const items = entries.filter((entry) => entry.category === category);
    const latest = items[0];
    const tags = Array.from(new Set(items.flatMap((entry) => entry.tags))).slice(0, 6);

    return {
      category,
      count: items.length,
      latest,
      tags,
    };
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Badge className="mb-4 border border-[#06D6A0]/30 bg-[#06D6A0]/15 text-[#06D6A0]">
          Economics Category Comparison
        </Badge>
        <h1 className="mb-3 text-4xl font-bold">Compare economics categories side-by-side</h1>
        <p className="max-w-3xl text-foreground/70">
          This page reads persistent entries from data/economics.json and summarizes depth, latest updates, and common themes by category.
        </p>
        <div className="mt-6">
          <Link href="/economics" className="text-sm text-white/70 hover:text-white">
            ← Back to economics hub
          </Link>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-foreground/70">Total entries: {entries.length}</p>
          <a href="/api/economics" className="text-sm text-foreground/70 hover:text-white">
            API endpoint →
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {grouped.map((group) => (
            <Card key={group.category} className="border-white/10 bg-card/40">
              <CardHeader>
                <div className="mb-2 flex items-center justify-between">
                  <Badge className="border border-white/20 bg-white/10 text-white/80 capitalize">
                    {group.category}
                  </Badge>
                  <span className="text-xs text-foreground/60">{group.count} entries</span>
                </div>
                <CardTitle className="text-xl text-white capitalize">{group.category}</CardTitle>
                <p className="text-sm text-foreground/65">{categoryNarrative[group.category]}</p>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {group.latest ? (
                  <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                    <p className="mb-1 text-xs uppercase text-foreground/50">Latest update</p>
                    <p className="font-medium text-white">{group.latest.title}</p>
                    <p className="mt-1 text-foreground/70">
                      {new Date(group.latest.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-foreground/60">No entries in this category yet.</p>
                )}

                <div>
                  <p className="mb-2 text-xs uppercase text-foreground/50">Top tags</p>
                  <div className="flex flex-wrap gap-2">
                    {group.tags.length > 0 ? (
                      group.tags.map((tag) => (
                        <span
                          key={`${group.category}-${tag}`}
                          className="rounded-md bg-black/30 px-2 py-1 text-xs text-white/70"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-foreground/60">No tags yet.</span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/economics?category=${group.category}`}
                  className="inline-block text-[#06D6A0] hover:underline"
                >
                  View {group.category} entries →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
