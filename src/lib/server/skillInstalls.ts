import "server-only";

import { promises as fs } from "fs";
import path from "path";

const SKILL_INSTALLS_PATH = path.join(process.cwd(), "data", "skill-installs.json");

export type SkillInstallCounts = Record<string, number>;

export async function readSkillInstallCounts(): Promise<SkillInstallCounts> {
  try {
    const raw = await fs.readFile(SKILL_INSTALLS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const normalized: SkillInstallCounts = {};
    for (const [slug, count] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof slug !== "string") continue;
      if (typeof count !== "number" || !Number.isFinite(count) || count < 0) continue;
      normalized[slug] = Math.floor(count);
    }

    return normalized;
  } catch {
    return {};
  }
}

async function writeSkillInstallCounts(counts: SkillInstallCounts): Promise<void> {
  await fs.mkdir(path.dirname(SKILL_INSTALLS_PATH), { recursive: true });
  await fs.writeFile(SKILL_INSTALLS_PATH, JSON.stringify(counts, null, 2), "utf-8");
}

export async function getSkillInstalls(slug: string): Promise<number> {
  const counts = await readSkillInstallCounts();
  return counts[slug] ?? 0;
}

export async function incrementSkillInstalls(slug: string): Promise<number> {
  const counts = await readSkillInstallCounts();
  counts[slug] = (counts[slug] ?? 0) + 1;
  await writeSkillInstallCounts(counts);
  return counts[slug];
}
