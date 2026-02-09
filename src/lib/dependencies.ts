import "server-only";

import { promises as fs } from "fs";
import path from "path";

export type SkillSlug = string;

export type SkillDependencyRow = {
  skill: SkillSlug;
  dependsOn: SkillSlug[];
  /**
   * Optional list of dependencies that are confirmed/verified relationships.
   * Any dependency not present here is treated as "unverified/assumed".
   */
  verifiedDependsOn?: SkillSlug[];
};

export type SkillDependency = {
  slug: SkillSlug;
  verified: boolean;
};

export type DependencyGraph = {
  rows: SkillDependencyRow[];
  skills: SkillSlug[];
  edges: Array<{ from: SkillSlug; to: SkillSlug; verified: boolean }>;
  bySkill: Record<
    SkillSlug,
    {
      dependsOn: SkillDependency[];
      usedBy: SkillDependency[];
    }
  >;
};

const DEPENDENCIES_PATH = path.join(process.cwd(), "data", "skill-dependencies.json");

let cached: { mtimeMs: number; graph: DependencyGraph } | null = null;

async function readRows(): Promise<SkillDependencyRow[]> {
  try {
    const raw = await fs.readFile(DEPENDENCIES_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        const r = row as Partial<SkillDependencyRow>;
        if (typeof r.skill !== "string") return null;
        const dependsOn = Array.isArray(r.dependsOn)
          ? (r.dependsOn as unknown[]).filter((s): s is string => typeof s === "string")
          : [];
        const verifiedDependsOn = Array.isArray(r.verifiedDependsOn)
          ? (r.verifiedDependsOn as unknown[]).filter((s): s is string => typeof s === "string")
          : undefined;

        const out: SkillDependencyRow = {
          skill: r.skill,
          dependsOn,
          ...(verifiedDependsOn ? { verifiedDependsOn } : {}),
        };

        return out;
      })
      .filter((r): r is SkillDependencyRow => !!r);
  } catch {
    return [];
  }
}

function buildGraph(rows: SkillDependencyRow[]): DependencyGraph {
  const skillsSet = new Set<SkillSlug>();
  const edges: DependencyGraph["edges"] = [];

  const dependsOnMap = new Map<SkillSlug, SkillDependency[]>();
  const usedByMap = new Map<SkillSlug, SkillDependency[]>();

  for (const row of rows) {
    skillsSet.add(row.skill);
    const verifiedSet = new Set(row.verifiedDependsOn ?? []);

    const deps: SkillDependency[] = (row.dependsOn ?? []).map((dep) => ({
      slug: dep,
      verified: verifiedSet.has(dep),
    }));

    dependsOnMap.set(row.skill, deps);

    for (const dep of row.dependsOn ?? []) {
      skillsSet.add(dep);
      const edgeVerified = verifiedSet.has(dep);
      edges.push({ from: row.skill, to: dep, verified: edgeVerified });

      const current = usedByMap.get(dep) ?? [];
      current.push({ slug: row.skill, verified: edgeVerified });
      usedByMap.set(dep, current);
    }
  }

  const skills = Array.from(skillsSet).sort();

  const bySkill: DependencyGraph["bySkill"] = {};
  for (const slug of skills) {
    bySkill[slug] = {
      dependsOn: (dependsOnMap.get(slug) ?? []).slice().sort((a, b) => a.slug.localeCompare(b.slug)),
      usedBy: (usedByMap.get(slug) ?? []).slice().sort((a, b) => a.slug.localeCompare(b.slug)),
    };
  }

  return { rows, skills, edges, bySkill };
}

export async function getDependencyGraph(): Promise<DependencyGraph> {
  try {
    const stat = await fs.stat(DEPENDENCIES_PATH);
    if (cached && cached.mtimeMs === stat.mtimeMs) return cached.graph;

    const rows = await readRows();
    const graph = buildGraph(rows);
    cached = { mtimeMs: stat.mtimeMs, graph };
    return graph;
  } catch {
    // If file doesn't exist or can't be read, return empty graph.
    const graph = buildGraph([]);
    cached = { mtimeMs: 0, graph };
    return graph;
  }
}

export async function getSkillDependencies(slug: SkillSlug): Promise<SkillDependency[]> {
  const graph = await getDependencyGraph();
  return graph.bySkill[slug]?.dependsOn ?? [];
}

export async function getSkillDependents(slug: SkillSlug): Promise<SkillDependency[]> {
  const graph = await getDependencyGraph();
  return graph.bySkill[slug]?.usedBy ?? [];
}

/**
 * Returns the full transitive dependency chain (downwards: dependencies) for a skill.
 * Includes direct + indirect dependencies, with cycle protection.
 */
export async function getSkillDependencyChain(slug: SkillSlug): Promise<SkillSlug[]> {
  const graph = await getDependencyGraph();
  const out: SkillSlug[] = [];
  const seen = new Set<SkillSlug>();

  function walk(current: SkillSlug) {
    for (const dep of graph.bySkill[current]?.dependsOn ?? []) {
      if (seen.has(dep.slug)) continue;
      seen.add(dep.slug);
      out.push(dep.slug);
      walk(dep.slug);
    }
  }

  walk(slug);
  return out;
}
