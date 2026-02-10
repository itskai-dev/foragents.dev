/* eslint-disable react/no-unescaped-entities */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Creator = {
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  totalInstalls: number;
  totalReviews: number;
  rating: number;
  joinedAt: string;
  featured: boolean;
  skills: Array<{ slug: string; name: string }>;
};

type StatsResponse = {
  username: string;
  stats: {
    totalInstalls: number;
    avgRating: number;
    skillCount: number;
    totalReviews: number;
  };
};

export default function CreatorStatsPage() {
  const params = useParams<{ username: string }>();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [stats, setStats] = useState<StatsResponse["stats"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const [creatorResponse, statsResponse] = await Promise.all([
          fetch(`/api/creators/${encodeURIComponent(params.username)}`, { cache: "no-store" }),
          fetch(`/api/creators/${encodeURIComponent(params.username)}/stats`, { cache: "no-store" }),
        ]);

        if (!creatorResponse.ok || !statsResponse.ok) {
          throw new Error("fetch-failed");
        }

        const creatorData = (await creatorResponse.json()) as { creator: Creator };
        const statsData = (await statsResponse.json()) as StatsResponse;

        if (!ignore) {
          setCreator(creatorData.creator);
          setStats(statsData.stats);
        }
      } catch {
        if (!ignore) {
          setError("Couldn't load creator analytics right now.");
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
  }, [params.username]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="h-10 w-72 bg-white/5 rounded mb-8 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-40 rounded-xl border border-white/5 bg-card/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !creator || !stats) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          {error ?? "Creator stats unavailable."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">📊 {creator.displayName} Stats</h1>
        <p className="text-muted-foreground">Real-time summary from the creators API.</p>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="bg-card/50 border-cyan/20">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Total Installs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan">{stats.totalInstalls.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-cyan/20">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan">{stats.avgRating.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-cyan/20">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Skill Count</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan">{stats.skillCount}</div>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-xl border border-white/10 bg-card/40 p-6">
          <h2 className="text-lg font-semibold mb-4">Additional Metrics</h2>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-muted-foreground">Total Reviews</span>
              <span>{stats.totalReviews.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-muted-foreground">Featured Creator</span>
              <span>{creator.featured ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-muted-foreground">Joined</span>
              <span>{new Date(creator.joinedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-muted-foreground">Profile</span>
              <Link href={`/creators/${encodeURIComponent(creator.username)}`} className="text-cyan hover:underline">
                View creator →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
