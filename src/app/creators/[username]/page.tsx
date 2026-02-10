/* eslint-disable react/no-unescaped-entities */
'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Skill = {
  id: string;
  slug: string;
  name: string;
  description: string;
  author: string;
  install_cmd: string;
  repo_url: string;
  tags: string[];
};

type Creator = {
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  skills: Skill[];
  totalInstalls: number;
  totalReviews: number;
  rating: number;
  joinedAt: string;
  featured: boolean;
};

export default function CreatorProfilePage() {
  const params = useParams<{ username: string }>();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/creators/${encodeURIComponent(params.username)}`, {
          cache: "no-store",
        });

        if (response.status === 404) {
          throw new Error("not-found");
        }

        if (!response.ok) {
          throw new Error(`status-${response.status}`);
        }

        const data = (await response.json()) as { creator: Creator };

        if (!ignore) {
          setCreator(data.creator);
        }
      } catch (fetchError) {
        if (!ignore) {
          if (fetchError instanceof Error && fetchError.message === "not-found") {
            setError("Creator not found.");
          } else {
            setError("Couldn't load this creator profile right now.");
          }
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
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="h-12 w-64 bg-white/5 rounded mb-4 animate-pulse" />
        <div className="h-6 w-full max-w-xl bg-white/5 rounded mb-8 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-48 rounded-xl border border-white/5 bg-card/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-destructive text-sm">
          {error ?? "Creator not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-start gap-4 mb-4">
          <span className="text-5xl">{creator.avatar}</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-bold">{creator.displayName}</h1>
              {creator.featured && (
                <Badge variant="outline" className="bg-cyan/10 text-cyan border-cyan/20">
                  Featured
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">@{creator.username}</p>
          </div>
        </div>

        <p className="text-muted-foreground max-w-3xl mb-6">{creator.bio}</p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-white/10 bg-card/40 p-4">
            <div className="text-xs text-muted-foreground">Total installs</div>
            <div className="text-2xl font-bold text-cyan">{creator.totalInstalls.toLocaleString()}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-card/40 p-4">
            <div className="text-xs text-muted-foreground">Total reviews</div>
            <div className="text-2xl font-bold text-cyan">{creator.totalReviews.toLocaleString()}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-card/40 p-4">
            <div className="text-xs text-muted-foreground">Rating</div>
            <div className="text-2xl font-bold text-cyan">{creator.rating.toFixed(1)}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-card/40 p-4">
            <div className="text-xs text-muted-foreground">Joined</div>
            <div className="text-2xl font-bold text-cyan">
              {new Date(creator.joinedAt).getFullYear()}
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🧰 Published Skills</h2>
          <Link href={`/creators/${encodeURIComponent(creator.username)}/stats`} className="text-cyan text-sm hover:underline">
            View stats →
          </Link>
        </div>

        {creator.skills.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-card/40 p-6 text-sm text-muted-foreground">
            No linked skills yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {creator.skills.map((skill) => (
              <Card key={skill.id} className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-lg">{skill.name}</CardTitle>
                  <CardDescription>by {skill.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{skill.description}</p>
                  <code className="block text-xs text-green bg-black/30 rounded px-2 py-1.5 mb-3 overflow-x-auto">
                    {skill.install_cmd}
                  </code>
                  <div className="flex flex-wrap gap-1.5">
                    {skill.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs bg-white/5 border-white/10">
                        {tag}
                      </Badge>
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
