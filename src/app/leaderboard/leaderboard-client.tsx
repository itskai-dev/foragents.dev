"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LeaderboardRow = {
  rank: number;
  slug: string;
  name: string;
  score: number;
  installs: number;
  reviews: number;
  avgRating: number;
};

type LeaderboardResponse = {
  rankings: LeaderboardRow[];
  total: number;
};

const TOP_BADGE: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export function LeaderboardClient({ categories }: { categories: string[] }) {
  const [category, setCategory] = useState<string>("");
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);

      const params = new URLSearchParams();
      if (category) params.set("category", category);
      params.set("limit", "20");

      const res = await fetch(`/api/leaderboard?${params.toString()}`, { cache: "no-store" });
      const data = (await res.json()) as LeaderboardResponse;

      if (!cancelled) {
        setRows(Array.isArray(data.rankings) ? data.rankings : []);
        setTotal(typeof data.total === "number" ? data.total : 0);
        setLoading(false);
      }
    }

    run().catch(() => {
      if (!cancelled) {
        setRows([]);
        setTotal(0);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [category]);

  const subtitle = useMemo(() => {
    if (loading) return "Loading rankings…";
    return `${rows.length} shown of ${total} total`;
  }, [loading, rows.length, total]);

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 border-white/5">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base">Rankings</CardTitle>
              <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
            </div>

            <label className="text-xs text-muted-foreground flex items-center gap-2">
              <span>Category</span>
              <select
                className="bg-black/30 border border-white/10 rounded-md px-2 py-1 text-sm text-foreground"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-card/50 border-white/5 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Rank</th>
                  <th className="text-left font-medium px-4 py-3">Skill</th>
                  <th className="text-left font-medium px-4 py-3">Score</th>
                  <th className="text-left font-medium px-4 py-3">Installs</th>
                  <th className="text-left font-medium px-4 py-3">Reviews</th>
                  <th className="text-left font-medium px-4 py-3">Avg rating</th>
                </tr>
              </thead>
              <tbody>
                {!loading && rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                      No rankings found for this filter.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const badge = TOP_BADGE[row.rank] ?? null;

                    return (
                      <tr key={row.slug} className="border-t border-white/5">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">#{row.rank}</span>
                            {badge ? <span title={`Rank ${row.rank}`}>{badge}</span> : null}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/skills/${row.slug}`}
                            className="text-foreground hover:text-cyan hover:underline font-semibold"
                          >
                            {row.name}
                          </Link>
                          <div className="text-xs text-muted-foreground">{row.slug}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-foreground">{row.score.toFixed(2)}</td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">{row.installs}</td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">{row.reviews}</td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">{row.avgRating.toFixed(2)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
