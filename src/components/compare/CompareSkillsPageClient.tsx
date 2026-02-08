"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { Skill } from "@/lib/data";
import { parseCompareIdsParam } from "@/lib/compare";
import type { TrendingBadgeKind } from "@/lib/trendingTypes";
import type { AggregatedScorecard } from "@/lib/server/canaryScorecardStore";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InstallCount } from "@/components/InstallCount";
import { RunInReflecttButton } from "@/components/RunInReflecttButton";
import { SkillTrendingBadge } from "@/components/skill-trending-badge";
import { VerifiedSkillBadge } from "@/components/verified-badge";

function formatMs(ms: number) {
  if (!Number.isFinite(ms)) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatPct(n: number) {
  if (!Number.isFinite(n)) return "—";
  return `${(n * 100).toFixed(2)}%`;
}

function skillCategory(skill: Skill | null) {
  if (!skill) return "—";
  const n = skill.name.toLowerCase();
  if (n.includes("kit")) return "Kit";
  if (n.includes("template")) return "Template";
  return "Skill";
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

  const inputRef = useRef<HTMLInputElement | null>(null);

  const slugs = useMemo(() => {
    const raw = searchParams.get("skills");
    return parseCompareIdsParam(raw);
  }, [searchParams]);

  // Used for rendering even before the first client navigation sync.
  const effectiveSlugs = slugs.length ? slugs : initialSlugs;

  const selectedSkills = useMemo(() => {
    const bySlug = new Map(allSkills.map((s) => [s.slug, s] as const));
    return effectiveSlugs.map((slug) => bySlug.get(slug) ?? null);
  }, [effectiveSlugs, allSkills]);

  const [query, setQuery] = useState("");
  const [limitHit, setLimitHit] = useState(false);
  const [copied, setCopied] = useState(false);

  const [trendingBadgesBySlug, setTrendingBadgesBySlug] = useState<
    Record<string, TrendingBadgeKind | null>
  >({});
  const [scorecardsBySlug, setScorecardsBySlug] = useState<
    Record<string, AggregatedScorecard | null>
  >({});

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(t);
  }, [copied]);

  // Trending badges
  useEffect(() => {
    let cancelled = false;

    async function loadTrending() {
      try {
        const res = await fetch("/api/trending/skills");
        if (!res.ok) return;
        const data = (await res.json()) as {
          skills?: Array<{ slug: string; trendingBadge: TrendingBadgeKind | null }>;
        };
        const next: Record<string, TrendingBadgeKind | null> = {};
        for (const s of data.skills ?? []) {
          if (!s?.slug) continue;
          next[s.slug] = s.trendingBadge ?? null;
        }
        if (!cancelled) setTrendingBadgesBySlug(next);
      } catch {
        // ignore
      }
    }

    loadTrending();
    return () => {
      cancelled = true;
    };
  }, []);

  // Canary scorecards (pass rate / latency)
  useEffect(() => {
    let cancelled = false;

    async function loadScorecards() {
      try {
        if (effectiveSlugs.length === 0) {
          if (!cancelled) setScorecardsBySlug({});
          return;
        }

        const res = await fetch(
          `/api/canary/scorecards?skills=${encodeURIComponent(
            effectiveSlugs.join(",")
          )}`
        );
        if (!res.ok) return;

        const data = (await res.json()) as {
          scorecards?: Record<string, AggregatedScorecard | null>;
        };

        if (!cancelled) setScorecardsBySlug(data.scorecards ?? {});
      } catch {
        // ignore
      }
    }

    loadScorecards();
    return () => {
      cancelled = true;
    };
  }, [effectiveSlugs.join(",")]);

  function buildUrl(next: string[]) {
    const safe = next.filter(Boolean).slice(0, 4);
    return safe.length > 0
      ? `/compare?skills=${encodeURIComponent(safe.join(","))}`
      : "/compare";
  }

  function sync(next: string[]) {
    setLimitHit(false);
    router.replace(buildUrl(next));
  }

  function addSkill(slug: string) {
    const current = effectiveSlugs;
    if (current.includes(slug)) {
      setQuery("");
      return;
    }
    if (current.length >= 4) {
      setLimitHit(true);
      return;
    }
    sync([...current, slug]);
    setQuery("");
  }

  function removeSkill(slug: string) {
    const current = effectiveSlugs;
    sync(current.filter((s) => s !== slug));
  }

  async function copyLink() {
    const url = window.location.href;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    } else {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
  }

  const empty = effectiveSlugs.length === 0;
  const notEnough = effectiveSlugs.length > 0 && effectiveSlugs.length < 2;
  const canCompare = effectiveSlugs.length >= 2;

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const selected = new Set(effectiveSlugs);

    const scored = allSkills
      .filter((s) => !selected.has(s.slug))
      .map((s) => {
        const hay = `${s.name} ${s.slug} ${s.author} ${(s.tags || []).join(" ")}`.toLowerCase();
        const idx = hay.indexOf(q);
        // Simple ranking: early substring matches first.
        const score = idx === -1 ? 10_000 : idx;
        return { s, score };
      })
      .filter((x) => x.score !== 10_000)
      .sort((a, b) => a.score - b.score || a.s.name.localeCompare(b.s.name))
      .slice(0, 8)
      .map((x) => x.s);

    return scored;
  }, [query, allSkills, effectiveSlugs]);

  // Calculate unique tags for highlighting (like diff markers).
  const allTagsPerSkill = selectedSkills.map((s) => new Set(s?.tags || []));
  const uniqueTagsPerSkill = allTagsPerSkill.map((tags, idx) => {
    const otherTags = allTagsPerSkill
      .filter((_, i) => i !== idx)
      .flatMap((set) => Array.from(set));
    return Array.from(tags).filter((tag) => !otherTags.includes(tag));
  });

  const rows: Array<{
    label: string;
    render: (s: Skill | null, idx: number) => React.ReactNode;
  }> = [
    {
      label: "Description",
      render: (s) => (
        <p className="text-sm text-foreground/80 leading-relaxed">
          {s?.description || "—"}
        </p>
      ),
    },
    {
      label: "Category",
      render: (s) => <span className="text-sm text-foreground/90">{skillCategory(s)}</span>,
    },
    {
      label: "Tags",
      render: (s, idx) => (
        <div className="flex flex-wrap gap-1">
          {(s?.tags || []).map((tag) => {
            const isUnique = uniqueTagsPerSkill[idx]?.includes(tag);
            return (
              <span
                key={tag}
                className={`text-[11px] font-mono rounded border px-2 py-0.5 ${
                  isUnique
                    ? "bg-cyan/20 border-cyan/40 text-cyan"
                    : "border-white/10 bg-white/5 text-foreground/70"
                }`}
              >
                {tag}
              </span>
            );
          })}
          {(s?.tags || []).length === 0 ? (
            <span className="text-sm text-muted-foreground">—</span>
          ) : null}
        </div>
      ),
    },
    {
      label: "Installs",
      render: (s) =>
        s ? (
          <InstallCount skillSlug={s.slug} className="text-sm text-cyan" />
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      label: "Verified",
      render: (s) => (
        <span className="text-sm text-foreground/90">
          {s?.verification ? "✓ Verified" : "—"}
        </span>
      ),
    },
    {
      label: "Trending",
      render: (s) => (
        <div className="flex items-center gap-2">
          {s ? <SkillTrendingBadge badge={trendingBadgesBySlug[s.slug] ?? null} /> : null}
          {!s || !trendingBadgesBySlug[s?.slug ?? ""] ? (
            <span className="text-sm text-muted-foreground">—</span>
          ) : null}
        </div>
      ),
    },
    {
      label: "Reliability (canary)",
      render: (s) => {
        if (!s) return <span className="text-sm text-muted-foreground">—</span>;
        const sc = scorecardsBySlug[s.slug];
        if (!sc) return <span className="text-sm text-muted-foreground">—</span>;
        return (
          <div className="text-sm text-foreground/90">
            <div>
              <span className="text-muted-foreground">Pass rate:</span> {formatPct(sc.passRate)}
            </div>
            <div>
              <span className="text-muted-foreground">Avg latency:</span> {formatMs(sc.avgLatencyMs)}
            </div>
          </div>
        );
      },
    },
    {
      label: "Repository",
      render: (s) =>
        s?.repo_url ? (
          <a
            className="text-sm text-cyan hover:underline break-all"
            href={s.repo_url}
            target="_blank"
            rel="noreferrer"
          >
            {s.repo_url}
          </a>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <header className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Compare skills</h1>
            <p className="text-sm text-muted-foreground">
              Compare up to 4 skills/kits side-by-side.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/skills">Browse skills</Link>
            </Button>

            {effectiveSlugs.length > 0 ? (
              <>
                <Button variant="outline" size="sm" onClick={() => sync([])}>
                  Clear
                </Button>
                <Button size="sm" onClick={() => copyLink().catch(() => null)}>
                  {copied ? "Copied" : "Share comparison"}
                </Button>
              </>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-card/40 p-4">
          <label className="block text-xs font-mono text-muted-foreground mb-2">
            Add a skill
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setLimitHit(false);
                setQuery(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && suggestions[0]) {
                  e.preventDefault();
                  addSkill(suggestions[0].slug);
                }
              }}
              placeholder="Search by name, slug, tag, or author…"
              className="w-full bg-background border border-white/10 rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-cyan/50"
              aria-label="Search skills to compare"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.focus()}
            >
              Focus
            </Button>
          </div>

          {limitHit ? (
            <p className="mt-2 text-xs text-muted-foreground">
              You can compare up to <span className="text-foreground">4</span> skills.
            </p>
          ) : null}

          {suggestions.length > 0 ? (
            <div className="mt-3 rounded-lg border border-white/10 overflow-hidden">
              {suggestions.map((s) => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => addSkill(s.slug)}
                  className="w-full text-left px-3 py-2 bg-background/40 hover:bg-white/5 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm text-foreground font-medium truncate">
                      {s.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate font-mono">
                      {s.slug} · {s.author}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs bg-white/5 text-white/70 border-white/10">
                    Add
                  </Badge>
                </button>
              ))}
            </div>
          ) : null}

          {effectiveSlugs.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedSkills.map((s, idx) => {
                const slug = effectiveSlugs[idx]!;
                const name = s?.name ?? slug;
                return (
                  <span
                    key={slug}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs"
                  >
                    <Link href={s ? `/skills/${s.slug}` : `/skills/${slug}`} className="hover:text-cyan">
                      {name}
                    </Link>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => removeSkill(slug)}
                      aria-label={`Remove ${name} from comparison`}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>
      </header>

      {empty ? (
        <div className="rounded-xl border border-white/10 bg-card/40 p-6 text-center">
          <p className="text-muted-foreground">No skills selected yet.</p>
          <p className="text-xs text-muted-foreground mt-2">
            Tip: try <span className="font-mono">agent-memory-kit</span> or <span className="font-mono">agent-autonomy-kit</span>.
          </p>
        </div>
      ) : null}

      {notEnough ? (
        <div className="rounded-xl border border-white/10 bg-card/40 p-6 text-center">
          <p className="text-muted-foreground">Add at least 2 skills to compare.</p>
        </div>
      ) : null}

      {canCompare ? (
        <div className="rounded-xl border border-white/10 bg-card/30 overflow-hidden">
          <div className="overflow-x-auto">
            <div
              className="grid"
              style={{
                gridTemplateColumns: `minmax(140px, 220px) repeat(${effectiveSlugs.length}, minmax(300px, 1fr))`,
              }}
            >
              {/* Header row */}
              <div className="sticky left-0 z-20 bg-background/90 backdrop-blur border-b border-white/10 p-4">
                <span className="text-xs font-mono text-muted-foreground">Field</span>
              </div>

              {selectedSkills.map((s, idx) => {
                const slug = effectiveSlugs[idx]!;
                const trending = s ? (trendingBadgesBySlug[s.slug] ?? null) : null;
                return (
                  <div key={slug} className="border-b border-white/10 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={s ? `/skills/${s.slug}` : `/skills/${slug}`}
                            className="font-semibold text-lg text-foreground hover:text-cyan transition-colors"
                          >
                            {s?.name ?? slug}
                          </Link>
                          {s ? <VerifiedSkillBadge info={s.verification ?? null} mode="icon" /> : null}
                          {trending ? <SkillTrendingBadge badge={trending} /> : null}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                          <span className="font-mono">{slug}</span>
                          <span className="text-white/20">•</span>
                          {s ? <InstallCount skillSlug={s.slug} className="text-xs text-cyan" /> : null}
                        </div>
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          {s ? (
                            <RunInReflecttButton
                              skillSlug={s.slug}
                              name={s.name}
                              size="sm"
                              variant="secondary"
                              className="bg-white/5 border border-white/10 hover:bg-white/10"
                            />
                          ) : null}
                          <Button variant="outline" size="sm" onClick={() => removeSkill(slug)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Data rows */}
              {rows.map((row) => (
                <div key={row.label} className="contents">
                  <div className="sticky left-0 z-10 bg-background/90 backdrop-blur border-b border-white/5 p-4">
                    <span className="text-xs font-mono text-muted-foreground">
                      {row.label}
                    </span>
                  </div>
                  {selectedSkills.map((s, i) => (
                    <div
                      key={`${row.label}:${effectiveSlugs[i]}`}
                      className="border-b border-white/5 p-4"
                    >
                      {row.render(s, i)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 py-3 border-t border-white/10 bg-background/40">
            <p className="text-xs text-muted-foreground">
              Tags highlighted in <span className="text-cyan">cyan</span> are unique to that skill.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
