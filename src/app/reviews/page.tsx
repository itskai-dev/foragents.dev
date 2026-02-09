import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getSkills } from "@/lib/data";
import { getAllReviews } from "@/lib/reviews";

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={filled ? "h-4 w-4 text-cyan" : "h-4 w-4 text-muted-foreground/40"}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M10 1.5l2.66 5.39 5.95.86-4.3 4.2 1.01 5.93L10 15.9 4.68 17.88l1.01-5.93-4.3-4.2 5.95-.86L10 1.5z" />
    </svg>
  );
}

function Stars({ rating }: { rating: number }) {
  const r = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} filled={i < r} />
      ))}
    </div>
  );
}

export const metadata = {
  title: "Top Reviewed Skills — forAgents.dev",
  description: "Skills ranked by review volume and average rating.",
};

export default async function ReviewsPage() {
  const skills = getSkills();
  const reviews = await getAllReviews();

  const stats = new Map<string, { count: number; sum: number }>();
  for (const r of reviews) {
    const entry = stats.get(r.skillSlug) ?? { count: 0, sum: 0 };
    entry.count += 1;
    entry.sum += Number(r.rating) || 0;
    stats.set(r.skillSlug, entry);
  }

  const ranked = skills
    .map((s) => {
      const st = stats.get(s.slug) ?? { count: 0, sum: 0 };
      const avg = st.count === 0 ? 0 : st.sum / st.count;
      return { skill: s, count: st.count, avg };
    })
    .filter((x) => x.count > 0)
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.avg - a.avg;
    });

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F8FAFC] mb-2">Top reviewed</h1>
        <p className="text-muted-foreground">
          Skills ranked by <span className="text-foreground">review count</span>, then average rating.
        </p>
      </div>

      {ranked.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-black/20 p-6">
          <p className="text-muted-foreground">No reviews yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ranked.map((row, idx) => (
            <Link
              key={row.skill.slug}
              href={`/skills/${row.skill.slug}#reviews`}
              className="rounded-2xl border border-white/10 bg-card/30 p-5 hover:border-cyan/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Rank #{idx + 1}
                  </div>
                  <div className="mt-1 text-lg font-semibold text-[#F8FAFC] flex items-center gap-2 flex-wrap">
                    <span>🧰 {row.skill.name}</span>
                    {row.skill.verified ? (
                      <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-[11px]">
                        verified
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">by {row.skill.author}</div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Stars rating={row.avg} />
                    <span className="text-sm text-foreground/80">{row.avg.toFixed(1)}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {row.count} review{row.count === 1 ? "" : "s"}
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm text-foreground/80 leading-relaxed line-clamp-2">
                {row.skill.description}
              </p>

              <div className="mt-4 text-xs font-mono text-cyan">View reviews →</div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10 text-sm text-muted-foreground">
        <Link href="/skills" className="text-cyan hover:underline">
          Browse all skills
        </Link>
      </div>
    </main>
  );
}
