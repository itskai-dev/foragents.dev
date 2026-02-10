import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { getSkills, type Skill } from "@/lib/data";
import { readSkillMetricStore } from "@/lib/server/skillMetrics";

export type SkillCollection = {
  slug: string;
  name: string;
  description: string;
  skills: string[]; // skill slugs
};

export type SkillCollectionSummary = SkillCollection & {
  skillCount: number;
  totalInstalls: number;
};

export type SkillCollectionDetail = SkillCollectionSummary & {
  resolvedSkills: Array<Skill & { installs: number }>;
};

const COLLECTIONS_PATH = path.join(process.cwd(), "data", "collections.json");
const COLLECTIONS_PATH_SRC = path.join(process.cwd(), "src", "data", "collections.json");

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveCollectionsPathForRead(): Promise<string> {
  if (await pathExists(COLLECTIONS_PATH)) return COLLECTIONS_PATH;
  if (await pathExists(COLLECTIONS_PATH_SRC)) return COLLECTIONS_PATH_SRC;
  return COLLECTIONS_PATH;
}

async function resolveCollectionsPathForWrite(): Promise<string> {
  if (await pathExists(COLLECTIONS_PATH)) return COLLECTIONS_PATH;
  if (await pathExists(COLLECTIONS_PATH_SRC)) return COLLECTIONS_PATH_SRC;
  return COLLECTIONS_PATH;
}

export async function readCollectionsFile(): Promise<SkillCollection[]> {
  const filePath = await resolveCollectionsPathForRead();
  const raw = await fs.readFile(filePath, "utf-8");
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((c) => {
      const rec = c as Record<string, unknown>;
      const slug = typeof rec.slug === "string" ? rec.slug : "";
      const name = typeof rec.name === "string" ? rec.name : "";
      const description = typeof rec.description === "string" ? rec.description : "";
      const skills = Array.isArray(rec.skills)
        ? rec.skills.filter((s): s is string => typeof s === "string")
        : [];

      return { slug, name, description, skills } satisfies SkillCollection;
    })
    .filter((c) => c.slug && c.name);
}

export async function writeCollectionsFile(collections: SkillCollection[]): Promise<void> {
  const filePath = await resolveCollectionsPathForWrite();
  const next = JSON.stringify(collections, null, 2) + "\n";
  await fs.writeFile(filePath, next, "utf-8");
}

export async function getSkillCollections(): Promise<SkillCollectionSummary[]> {
  const collections = await readCollectionsFile().catch(() => []);
  const store = await readSkillMetricStore();

  return collections.map((c) => {
    const totalInstalls = c.skills.reduce((sum, slug) => sum + (store.installs_total[slug] ?? 0), 0);
    return {
      ...c,
      skillCount: c.skills.length,
      totalInstalls,
    };
  });
}

export async function searchSkillCollections(query: string): Promise<SkillCollectionSummary[]> {
  const all = await getSkillCollections();
  const q = query.trim().toLowerCase();
  if (!q) return all;

  return all.filter((c) => {
    return (
      c.slug.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.skills.some((s) => s.toLowerCase().includes(q))
    );
  });
}

export async function getSkillCollectionBySlug(slug: string): Promise<SkillCollectionDetail | null> {
  const collections = await readCollectionsFile().catch(() => []);
  const col = collections.find((c) => c.slug === slug);
  if (!col) return null;

  const store = await readSkillMetricStore();
  const skills = getSkills();
  const bySlug = new Map(skills.map((s) => [s.slug, s]));

  const resolvedSkills = col.skills
    .map((s) => {
      const skill = bySlug.get(s);
      if (!skill) return null;
      return {
        ...skill,
        installs: store.installs_total[s] ?? 0,
      };
    })
    .filter((x): x is Skill & { installs: number } => !!x);

  const totalInstalls = resolvedSkills.reduce((sum, s) => sum + (s.installs ?? 0), 0);

  return {
    ...col,
    skillCount: col.skills.length,
    totalInstalls,
    resolvedSkills,
  };
}

export async function getCollectionsForSkill(skillSlug: string): Promise<SkillCollectionSummary[]> {
  const cols = await getSkillCollections();
  return cols.filter((c) => c.skills.includes(skillSlug));
}
