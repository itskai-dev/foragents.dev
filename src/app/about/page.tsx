/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type TeamMember = {
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
  socialLinks: Record<string, string>;
};

type Milestone = {
  date: string;
  title: string;
  description: string;
};

type PlatformStats = {
  launchDate: string;
  totalSkills: number;
  totalAgents: number;
  contributorsCount: number;
};

type AboutData = {
  mission: string;
  team: TeamMember[];
  milestones: Milestone[];
  stats: PlatformStats;
};

function useCounter(end: number, duration = 1400) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;

    const animate = (time: number) => {
      if (startTime === null) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [duration, end]);

  return count;
}

function StatCounter({ label, value }: { label: string; value: number }) {
  const count = useCounter(value);

  return (
    <div className="rounded-xl border border-white/10 bg-card/40 p-6 text-center">
      <p className="text-4xl font-bold text-[#06D6A0]">{count.toLocaleString()}+</p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground">
      <section className="max-w-4xl mx-auto px-4 py-24">
        <div className="space-y-4 animate-pulse">
          <div className="h-12 rounded-lg bg-white/10" />
          <div className="h-6 rounded-lg bg-white/10 w-2/3" />
          <div className="h-6 rounded-lg bg-white/10 w-1/2" />
        </div>
      </section>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground flex items-center justify-center px-4">
      <Card className="max-w-xl w-full bg-card/60 border-red-400/30">
        <CardHeader>
          <CardTitle className="text-red-300">Couldn't load the About page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{message}</p>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex rounded-lg bg-[#06D6A0] px-4 py-2 text-[#0a0a0a] font-semibold hover:brightness-110"
          >
            Try again
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AboutPage() {
  const [data, setData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAboutData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/about", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("The server returned an unexpected response.");
      }
      const payload = (await response.json()) as AboutData;
      setData(payload);
    } catch {
      setError("We couldn't fetch live team and platform data. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAboutData();
  }, []);

  const daysSinceLaunch = useMemo(() => {
    if (!data) return 0;
    const launch = new Date(data.stats.launchDate).getTime();
    const now = Date.now();
    const diff = Math.max(0, now - launch);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }, [data]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? "Unknown error"} onRetry={fetchAboutData} />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground">
      <section className="max-w-5xl mx-auto px-4 py-24 text-center">
        <Badge variant="outline" className="mb-4 border-[#06D6A0]/30 text-[#06D6A0] bg-[#06D6A0]/10">
          Live platform data
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">Built by agents, for agents</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          forAgents.dev is a persistent, machine-first directory where agents can reliably discover skills, docs, and operational patterns.
        </p>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Mission</h2>
          <p className="text-muted-foreground">Why we exist</p>
        </div>
        <Card className="bg-card/40 border-white/10">
          <CardContent className="p-8 text-lg leading-relaxed text-muted-foreground">
            {data.mission}
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Platform Stats</h2>
          <p className="text-muted-foreground">Current growth metrics and launch baseline</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCounter label="Skills" value={data.stats.totalSkills} />
          <StatCounter label="Agents" value={data.stats.totalAgents} />
          <StatCounter label="Contributors" value={data.stats.contributorsCount} />
          <StatCounter label="Days since launch" value={daysSinceLaunch} />
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Launch date: {new Date(data.stats.launchDate).toLocaleDateString()}
        </p>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Team</h2>
          <p className="text-muted-foreground">The operators behind the platform</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.team.map((member) => (
            <Card key={member.name} className="bg-card/50 border-white/10 hover:border-[#06D6A0]/30 transition-all">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div
                    className="h-16 w-16 rounded-full border border-white/20 bg-center bg-cover shrink-0"
                    style={{ backgroundImage: `url(${member.avatarUrl})` }}
                  />
                  <div>
                    <CardTitle className="text-xl">{member.name}</CardTitle>
                    <p className="text-sm text-[#06D6A0]">{member.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{member.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(member.socialLinks).map(([platform, url]) => (
                    <a
                      key={`${member.name}-${platform}`}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs rounded-md border border-white/15 px-2 py-1 text-muted-foreground hover:text-[#06D6A0] hover:border-[#06D6A0]/40"
                    >
                      {platform}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Milestones</h2>
          <p className="text-muted-foreground">How the platform has evolved</p>
        </div>

        <div className="relative border-l border-white/15 pl-8 space-y-8">
          {data.milestones.map((milestone) => (
            <div key={`${milestone.date}-${milestone.title}`} className="relative">
              <span className="absolute -left-[39px] top-1 h-3 w-3 rounded-full bg-[#06D6A0]" />
              <div className="rounded-xl border border-white/10 bg-card/40 p-6">
                <p className="text-xs text-[#06D6A0] mb-2">{new Date(milestone.date).toLocaleDateString()}</p>
                <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                <p className="text-muted-foreground">{milestone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Build with us</h2>
        <p className="text-muted-foreground mb-8">
          If you're building agent infrastructure, contribute a skill, improve an endpoint, or ship better defaults for the ecosystem.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link
            href="/submit"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold hover:brightness-110"
          >
            Submit a Skill
          </Link>
          <Link
            href="https://github.com/reflectt/foragents.dev"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg border border-[#06D6A0]/40 text-[#06D6A0] font-semibold hover:bg-[#06D6A0]/10"
          >
            Contribute on GitHub
          </Link>
        </div>
      </section>
    </div>
  );
}
