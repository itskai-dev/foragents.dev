import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getSkills } from "@/lib/data";
import {
  getDependencyGraph,
  getSkillDependencyChain,
  type DependencyGraph,
  type SkillSlug,
} from "@/lib/dependencies";

export function generateMetadata(): Metadata {
  return {
    title: "Skill Dependency Graph — forAgents.dev",
    description:
      "Explore how skills relate: dependencies, dependents, and full dependency chains. Includes verified vs unverified dependency links.",
    openGraph: {
      title: "Skill Dependency Graph — forAgents.dev",
      description:
        "Explore how skills relate: dependencies, dependents, and full dependency chains. Includes verified vs unverified dependency links.",
      url: "https://foragents.dev/dependencies",
      siteName: "forAgents.dev",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Skill Dependency Graph — forAgents.dev",
      description:
        "Explore how skills relate: dependencies, dependents, and full dependency chains.",
    },
  };
}

function EdgeBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-[11px]">
      verified
    </Badge>
  ) : (
    <Badge className="bg-amber-500/15 text-amber-300 border border-amber-500/25 text-[11px]">
      unverified
    </Badge>
  );
}

function SkillLink({ slug, label }: { slug: SkillSlug; label: string }) {
  return (
    <Link href={`/skills/${slug}`} className="text-cyan hover:underline">
      {label}
    </Link>
  );
}

function renderDependencyTree(opts: {
  graph: DependencyGraph;
  slug: SkillSlug;
  skillNameBySlug: Map<string, string>;
  depth?: number;
  seen?: Set<string>;
}) {
  const { graph, slug, skillNameBySlug } = opts;
  const depth = opts.depth ?? 0;
  const seen = opts.seen ?? new Set<string>();

  if (depth > 8) return null;
  if (seen.has(slug)) {
    return (
      <div className="text-xs text-muted-foreground">
        ↩︎ cycle detected at <span className="text-foreground">{slug}</span>
      </div>
    );
  }

  seen.add(slug);
  const deps = graph.bySkill[slug]?.dependsOn ?? [];

  if (deps.length === 0) {
    return <div className="text-sm text-muted-foreground">No declared dependencies.</div>;
  }

  return (
    <ul className="mt-2 space-y-2 border-l border-white/10 pl-4">
      {deps.map((d) => (
        <li key={`${slug}__${d.slug}`} className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">→</span>
            <SkillLink slug={d.slug} label={skillNameBySlug.get(d.slug) ?? d.slug} />
            <EdgeBadge verified={d.verified} />
            <Link
              href={`/dependencies?skill=${encodeURIComponent(d.slug)}#skill-details`}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              view
            </Link>
          </div>
          <div className="ml-4">{renderDependencyTree({ graph, slug: d.slug, skillNameBySlug, depth: depth + 1, seen: new Set(seen) })}</div>
        </li>
      ))}
    </ul>
  );
}

function renderDependentsTree(opts: {
  graph: DependencyGraph;
  slug: SkillSlug;
  skillNameBySlug: Map<string, string>;
  depth?: number;
  seen?: Set<string>;
}) {
  const { graph, slug, skillNameBySlug } = opts;
  const depth = opts.depth ?? 0;
  const seen = opts.seen ?? new Set<string>();

  if (depth > 8) return null;
  if (seen.has(slug)) return null;
  seen.add(slug);

  const usedBy = graph.bySkill[slug]?.usedBy ?? [];
  if (usedBy.length === 0) return null;

  return (
    <ul className="mt-2 space-y-2 border-l border-white/10 pl-4">
      {usedBy.map((u) => (
        <li key={`${slug}__usedby__${u.slug}`} className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">←</span>
            <SkillLink slug={u.slug} label={skillNameBySlug.get(u.slug) ?? u.slug} />
            <EdgeBadge verified={u.verified} />
            <Link
              href={`/dependencies?skill=${encodeURIComponent(u.slug)}#skill-details`}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              view
            </Link>
          </div>
          <div className="ml-4">{renderDependentsTree({ graph, slug: u.slug, skillNameBySlug, depth: depth + 1, seen: new Set(seen) })}</div>
        </li>
      ))}
    </ul>
  );
}

export default async function DependenciesPage({
  searchParams,
}: {
  searchParams: Promise<{ skill?: string }>;
}) {
  const sp = await searchParams;

  const skills = getSkills();
  const graph = await getDependencyGraph();

  const skillNameBySlug = new Map(skills.map((s) => [s.slug, s.name] as const));
  const knownSkillSlugs = new Set(skills.map((s) => s.slug));

  const selected: SkillSlug =
    (sp.skill && typeof sp.skill === "string" && sp.skill) || "agent-team-kit";

  const selectedSkill = knownSkillSlugs.has(selected)
    ? skills.find((s) => s.slug === selected)
    : null;

  const selectedSlug: SkillSlug = selectedSkill?.slug ?? skills[0]?.slug ?? "agent-memory-kit";

  const dependsOn = graph.bySkill[selectedSlug]?.dependsOn ?? [];
  const usedBy = graph.bySkill[selectedSlug]?.usedBy ?? [];
  const chain = await getSkillDependencyChain(selectedSlug);

  const foundations = skills
    .filter((s) => (graph.bySkill[s.slug]?.dependsOn ?? []).length === 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen">
      <main className="max-w-6xl mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Dependencies", href: "/dependencies" },
          ]}
        />

        <div className="mt-6">
          <h1 className="text-3xl font-bold text-[#F8FAFC]">Skill Dependency Graph</h1>
          <p className="mt-2 text-foreground/70 max-w-3xl">
            A lightweight graph of how skills relate to each other. Click any skill to explore its
            dependencies, dependents, and full dependency chain.
          </p>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Legend:</span>
            <EdgeBadge verified />
            <EdgeBadge verified={false} />
          </div>
        </div>

        <Separator className="opacity-10 my-10" />

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-[#F8FAFC] mb-3">Skills</h2>
            <div className="flex flex-col gap-1">
              {skills
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((s) => {
                  const active = s.slug === selectedSlug;
                  return (
                    <Link
                      key={s.slug}
                      href={`/dependencies?skill=${encodeURIComponent(s.slug)}#skill-details`}
                      className={`flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-cyan/10 text-cyan"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span className="truncate">{s.name}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {(graph.bySkill[s.slug]?.dependsOn ?? []).length}↓ / {(graph.bySkill[s.slug]?.usedBy ?? []).length}↑
                      </span>
                    </Link>
                  );
                })}
            </div>
          </div>

          <div id="skill-details" className="lg:col-span-8 rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-semibold text-[#F8FAFC]">{skillNameBySlug.get(selectedSlug) ?? selectedSlug}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-mono">{selectedSlug}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/skills/${selectedSlug}`}
                  className="text-sm text-cyan hover:underline"
                >
                  Open skill page →
                </Link>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-[#F8FAFC] mb-2">Depends on</h3>
                {dependsOn.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No declared dependencies.</p>
                ) : (
                  <ul className="space-y-2">
                    {dependsOn.map((d) => (
                      <li key={d.slug} className="flex items-center gap-2">
                        <SkillLink slug={d.slug} label={skillNameBySlug.get(d.slug) ?? d.slug} />
                        <EdgeBadge verified={d.verified} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F8FAFC] mb-2">Used by</h3>
                {usedBy.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No skills depend on this yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {usedBy.map((u) => (
                      <li key={u.slug} className="flex items-center gap-2">
                        <SkillLink slug={u.slug} label={skillNameBySlug.get(u.slug) ?? u.slug} />
                        <EdgeBadge verified={u.verified} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <Separator className="opacity-10 my-8" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-[#F8FAFC]">Full dependency chain</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Direct + transitive dependencies (cycle-safe).
                </p>
                {chain.length === 0 ? (
                  <p className="text-sm text-muted-foreground mt-3">None.</p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {chain.map((c) => (
                      <Link
                        key={c}
                        href={`/dependencies?skill=${encodeURIComponent(c)}#skill-details`}
                        className="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10"
                      >
                        {skillNameBySlug.get(c) ?? c}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#F8FAFC]">Dependency tree</h3>
                <p className="text-xs text-muted-foreground mt-1">Nested view of dependencies.</p>
                <div className="mt-3">{renderDependencyTree({ graph, slug: selectedSlug, skillNameBySlug })}</div>
              </div>
            </div>

            <Separator className="opacity-10 my-8" />

            <div>
              <h3 className="text-sm font-semibold text-[#F8FAFC]">Reverse tree (dependents)</h3>
              <p className="text-xs text-muted-foreground mt-1">Which skills build on this one.</p>
              <div className="mt-3">
                {usedBy.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No dependents.</p>
                ) : (
                  renderDependentsTree({ graph, slug: selectedSlug, skillNameBySlug })
                )}
              </div>
            </div>
          </div>
        </section>

        <Separator className="opacity-10 my-10" />

        <section>
          <h2 className="text-lg font-semibold text-[#F8FAFC]">Foundations</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Skills with no declared dependencies. Expand from these to see what they enable.
          </p>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            {foundations.map((root) => (
              <div key={root.slug} className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between gap-3">
                  <Link
                    href={`/dependencies?skill=${encodeURIComponent(root.slug)}#skill-details`}
                    className="text-sm font-semibold text-cyan hover:underline"
                  >
                    {root.name}
                  </Link>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {(graph.bySkill[root.slug]?.usedBy ?? []).length} dependents
                  </span>
                </div>
                <div className="mt-3">
                  {renderDependentsTree({ graph, slug: root.slug, skillNameBySlug }) ?? (
                    <p className="text-sm text-muted-foreground">No dependents yet.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator className="opacity-10 my-10" />

        <section>
          <h2 className="text-lg font-semibold text-[#F8FAFC]">Matrix view</h2>
          <p className="text-sm text-muted-foreground mt-1">
            A compact summary of declared dependencies and dependents.
          </p>

          <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left font-semibold p-3 text-slate-200">Skill</th>
                  <th className="text-left font-semibold p-3 text-slate-200">Depends on</th>
                  <th className="text-left font-semibold p-3 text-slate-200">Used by</th>
                </tr>
              </thead>
              <tbody>
                {skills
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((s) => {
                    const deps = graph.bySkill[s.slug]?.dependsOn ?? [];
                    const ups = graph.bySkill[s.slug]?.usedBy ?? [];
                    return (
                      <tr key={s.slug} className="border-t border-white/5 align-top">
                        <td className="p-3">
                          <Link
                            href={`/dependencies?skill=${encodeURIComponent(s.slug)}#skill-details`}
                            className="text-cyan hover:underline font-medium"
                          >
                            {s.name}
                          </Link>
                          <div className="text-xs text-muted-foreground font-mono mt-1">{s.slug}</div>
                        </td>
                        <td className="p-3">
                          {deps.length === 0 ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {deps.map((d) => (
                                <Link
                                  key={`${s.slug}__dep__${d.slug}`}
                                  href={`/dependencies?skill=${encodeURIComponent(d.slug)}#skill-details`}
                                  className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/10"
                                >
                                  <span className="text-xs text-slate-200">
                                    {skillNameBySlug.get(d.slug) ?? d.slug}
                                  </span>
                                  <EdgeBadge verified={d.verified} />
                                </Link>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          {ups.length === 0 ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {ups.map((u) => (
                                <Link
                                  key={`${s.slug}__up__${u.slug}`}
                                  href={`/dependencies?skill=${encodeURIComponent(u.slug)}#skill-details`}
                                  className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/10"
                                >
                                  <span className="text-xs text-slate-200">
                                    {skillNameBySlug.get(u.slug) ?? u.slug}
                                  </span>
                                  <EdgeBadge verified={u.verified} />
                                </Link>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
