/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { Skill } from "@/lib/data";
import { parseCompareSkillsParam } from "@/lib/compare";
import type { AggregatedScorecard } from "@/lib/server/canaryScorecardStore";

import { Button } from "@/components/ui/button";

type RatingSummary = {
  artifact_slug: string;
  count: number;
  avg: number | null;
  updated_at: string;
};

type ComparedSkill = Skill & {
  installs: number;
  ratings: RatingSummary;
  canary: AggregatedScorecard | null;
};

type CompareApiResponse = {
  updated_at: string;
  slugs: string[];
  skills: Array<ComparedSkill | { slug: string; error: string }>;
};

function getDefaultSlugs(allSkills: Skill[]): [string, string] {
  const first = allSkills[0]?.slug ?? "";
  const second = allSkills[1]?.slug ?? first;
  return [first, second];
}

function formatRating(avg: number | null, count: number): string {
  if (avg == null) return "—";
  return `${avg.toFixed(2)} / 5 (${count} ratings)`;
}

function formatCanary(canary: AggregatedScorecard | null): string {
  if (!canary) return "—";
  return `${(canary.passRate * 100).toFixed(2)}% pass · ${Math.round(canary.avgLatencyMs)}ms · ${canary.testsPassed}/${canary.testsRun}`;
}

function valueForField(skill: ComparedSkill | null, field: string): string {
  if (!skill) return "—";

  switch (field) {
    case "id":
      return skill.id;
    case "slug":
      return skill.slug;
    case "name":
      return skill.name;
    case "author":
      return skill.author;
    case "description":
      return skill.description;
    case "install_cmd":
      return skill.install_cmd;
    case "repo_url":
      return skill.repo_url;
    case "tags":
      return skill.tags?.join(", ") || "—";
    case "verified":
      return skill.verification ? "Yes" : "No";
    case "install_count":
      return String(skill.installs ?? 0);
    case "rating":
      return formatRating(skill.ratings?.avg ?? null, skill.ratings?.count ?? 0);
    case "canary":
      return formatCanary(skill.canary ?? null);
    default:
      return "—";
  }
}

export default function CompareSkillsPageClient({
  initialSlugs,
  allSkills,
}: {
  initialSlugs: string[];
  allSkills: Skill[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const defaults = useMemo(() => getDefaultSlugs(allSkills), [allSkills]);

  const urlSlugs = useMemo(() => {
    const parsed = parseCompareSkillsParam(searchParams.get("skills")).slice(0, 2);
    if (parsed.length === 2) return [parsed[0]!, parsed[1]!] as [string, string];

    const initial = initialSlugs.slice(0, 2);
    if (initial.length === 2) return [initial[0]!, initial[1]!] as [string, string];

    return defaults;
  }, [searchParams, initialSlugs, defaults]);

  const [leftSlug, setLeftSlug] = useState<string>(urlSlugs[0] ?? defaults[0]);
  const [rightSlug, setRightSlug] = useState<string>(urlSlugs[1] ?? defaults[1]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leftSkill, setLeftSkill] = useState<ComparedSkill | null>(null);
  const [rightSkill, setRightSkill] = useState<ComparedSkill | null>(null);

  useEffect(() => {
    setLeftSlug(urlSlugs[0]);
    setRightSlug(urlSlugs[1]);
  }, [urlSlugs]);

  useEffect(() => {
    if (!leftSlug || !rightSlug) return;

    const next = `/compare?skills=${encodeURIComponent(`${leftSlug},${rightSlug}`)}`;
    const current = searchParams.get("skills") || "";
    const currentNormalized = parseCompareSkillsParam(current).slice(0, 2).join(",");
    const nextNormalized = `${leftSlug},${rightSlug}`;

    if (currentNormalized !== nextNormalized) {
      router.replace(next);
    }
  }, [leftSlug, rightSlug, router, searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function loadComparison() {
      if (!leftSlug || !rightSlug) {
        setLeftSkill(null);
        setRightSkill(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/compare?skills=${encodeURIComponent(`${leftSlug},${rightSlug}`)}`
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to load comparison");
        }

        const data = (await res.json()) as CompareApiResponse;
        const a = data.skills[0];
        const b = data.skills[1];

        const aOk = a && !("error" in a) ? a : null;
        const bOk = b && !("error" in b) ? b : null;

        if (!cancelled) {
          setLeftSkill(aOk);
          setRightSkill(bOk);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load comparison");
          setLeftSkill(null);
          setRightSkill(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadComparison();

    return () => {
      cancelled = true;
    };
  }, [leftSlug, rightSlug]);

  const fields = [
    { key: "id", label: "ID" },
    { key: "slug", label: "Slug" },
    { key: "name", label: "Name" },
    { key: "author", label: "Author" },
    { key: "description", label: "Description" },
    { key: "install_cmd", label: "Install command" },
    { key: "repo_url", label: "Repository" },
    { key: "tags", label: "Tags" },
    { key: "verified", label: "Verified" },
    { key: "install_count", label: "Install count" },
    { key: "rating", label: "Rating" },
    { key: "canary", label: "Canary score" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <header className="mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <div>
            <h1 className="text-2xl font-bold">Compare skills</h1>
            <p className="text-sm text-muted-foreground">
              Pick two skills and compare real install, rating, and canary data side-by-side.
            </p>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href="/skills">Browse skills</Link>
          </Button>
        </div>

        <div className="rounded-xl border border-white/10 bg-card/40 p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="block text-xs font-mono text-muted-foreground mb-2">Skill A</span>
            <select
              value={leftSlug}
              onChange={(e) => setLeftSlug(e.target.value)}
              className="w-full bg-background border border-white/10 rounded-md px-3 py-2 text-sm text-foreground"
            >
              {allSkills.map((skill) => (
                <option key={skill.slug} value={skill.slug}>
                  {skill.name} ({skill.slug})
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="block text-xs font-mono text-muted-foreground mb-2">Skill B</span>
            <select
              value={rightSlug}
              onChange={(e) => setRightSlug(e.target.value)}
              className="w-full bg-background border border-white/10 rounded-md px-3 py-2 text-sm text-foreground"
            >
              {allSkills.map((skill) => (
                <option key={skill.slug} value={skill.slug}>
                  {skill.name} ({skill.slug})
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100 mb-4">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-white/10 bg-card/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-background/50">
                <th className="text-left p-3 font-mono text-xs text-muted-foreground">Field</th>
                <th className="text-left p-3">
                  {leftSkill ? (
                    <Link href={`/skills/${leftSkill.slug}`} className="text-cyan hover:underline">
                      {leftSkill.name}
                    </Link>
                  ) : (
                    leftSlug
                  )}
                </th>
                <th className="text-left p-3">
                  {rightSkill ? (
                    <Link href={`/skills/${rightSkill.slug}`} className="text-cyan hover:underline">
                      {rightSkill.name}
                    </Link>
                  ) : (
                    rightSlug
                  )}
                </th>
              </tr>
            </thead>

            <tbody>
              {fields.map((field) => {
                const leftValue = valueForField(leftSkill, field.key);
                const rightValue = valueForField(rightSkill, field.key);
                const different = leftValue !== rightValue;

                return (
                  <tr key={field.key} className="border-b border-white/5 align-top">
                    <td className="p-3 font-mono text-xs text-muted-foreground">{field.label}</td>
                    <td className={`p-3 ${different ? "bg-cyan/10" : ""}`}>{leftValue}</td>
                    <td className={`p-3 ${different ? "bg-cyan/10" : ""}`}>{rightValue}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-white/10 bg-background/40">
          <p className="text-xs text-muted-foreground">
            {loading ? "Loading latest comparison data…" : "Rows highlighted in cyan are different between the two skills."}
          </p>
        </div>
      </div>
    </div>
  );
}
