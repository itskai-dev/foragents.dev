/* eslint-disable react/no-unescaped-entities */
'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Creator = {
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  skills: string[];
  totalInstalls: number;
  totalReviews: number;
  rating: number;
  joinedAt: string;
  featured: boolean;
};

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"installs" | "rating" | "reviews">("installs");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        params.set("sort", sort);

        const response = await fetch(`/api/creators?${params.toString()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`);
        }

        const data = (await response.json()) as { creators: Creator[] };
        if (!ignore) {
          setCreators(data.creators);
        }
      } catch {
        if (!ignore) {
          setError("Couldn't load creators right now. Please try again.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      ignore = true;
    };
  }, [search, sort]);

  const featuredCount = useMemo(
    () => creators.filter((creator) => creator.featured).length,
    [creators]
  );

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-cyan/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">👥 Creator Directory</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6">
            Discover the people and teams building skills for AI agents.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 max-w-xl mx-auto text-sm">
            <div className="rounded-lg border border-white/10 bg-card/40 p-3">
              <div className="text-cyan text-2xl font-bold">{creators.length}</div>
              <div className="text-muted-foreground">Creators</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-card/40 p-3">
              <div className="text-cyan text-2xl font-bold">{featuredCount}</div>
              <div className="text-muted-foreground">Featured creators</div>
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid gap-3 md:grid-cols-[1fr,180px] mb-6">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search creators, bios, skills..."
            className="w-full rounded-lg border border-white/10 bg-card/40 px-3 py-2 text-sm outline-none focus:border-cyan/40"
          />

          <select
            value={sort}
            onChange={(event) =>
              setSort(event.target.value as "installs" | "rating" | "reviews")
            }
            className="rounded-lg border border-white/10 bg-card/40 px-3 py-2 text-sm outline-none focus:border-cyan/40"
          >
            <option value="installs">Sort: Installs</option>
            <option value="rating">Sort: Rating</option>
            <option value="reviews">Sort: Reviews</option>
          </select>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/5 bg-card/50 p-6 animate-pulse h-36"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
            {error}
          </div>
        ) : creators.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-card/40 p-6 text-sm text-muted-foreground">
            No creators found for that query.
          </div>
        ) : (
          <div className="grid gap-4">
            {creators.map((creator) => (
              <Link
                key={creator.username}
                href={`/creators/${encodeURIComponent(creator.username)}`}
                className="block rounded-xl border border-white/5 bg-card/50 p-6 transition-all hover:border-cyan/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-2xl">{creator.avatar}</span>
                      <h3 className="text-xl font-semibold text-[#F8FAFC]">{creator.displayName}</h3>
                      {creator.featured && (
                        <Badge variant="outline" className="bg-cyan/10 text-cyan border-cyan/20">
                          Featured
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">@{creator.username}</p>
                    <p className="text-sm text-muted-foreground mb-4">{creator.bio}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>📦 {creator.totalInstalls.toLocaleString()} installs</span>
                      <span>📝 {creator.totalReviews.toLocaleString()} reviews</span>
                      <span>⭐ {creator.rating.toFixed(1)} rating</span>
                      <span>🧰 {creator.skills.length} skills</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold mb-3">Become a Creator</h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Build skills for AI agents and join this directory.
        </p>
        <Button variant="outline" asChild>
          <Link href="/submit">📤 Submit Your Skill</Link>
        </Button>
      </section>
    </div>
  );
}
