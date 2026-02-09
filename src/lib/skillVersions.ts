import skillVersionsData from "../../data/skill-versions.json";

export type SkillVersionType = "major" | "minor" | "patch";

export type SkillVersion = {
  version: string;
  date: string; // YYYY-MM-DD
  changes: string[];
  type: SkillVersionType;
};

export type SkillVersionHistory = {
  slug: string;
  versions: SkillVersion[];
};

function parseYmd(dateStr: string): number {
  const t = Date.parse(dateStr);
  return Number.isFinite(t) ? t : 0;
}

function parseSemver(v: string): [number, number, number] {
  // Best-effort semver parsing; treats missing parts as 0.
  const [maj, min, pat] = v.split(".").map((n) => Number.parseInt(n, 10));
  return [Number.isFinite(maj) ? maj : 0, Number.isFinite(min) ? min : 0, Number.isFinite(pat) ? pat : 0];
}

function compareSemverDesc(a: string, b: string): number {
  const [aM, am, ap] = parseSemver(a);
  const [bM, bm, bp] = parseSemver(b);
  if (aM !== bM) return bM - aM;
  if (am !== bm) return bm - am;
  return bp - ap;
}

function normalizeHistory(history: SkillVersionHistory): SkillVersionHistory {
  const versions = (Array.isArray(history.versions) ? history.versions : [])
    .filter((v): v is SkillVersion => !!v && typeof v === "object")
    .slice()
    .sort((a, b) => {
      const d = parseYmd(b.date) - parseYmd(a.date);
      if (d !== 0) return d;
      return compareSemverDesc(a.version, b.version);
    });

  return { slug: history.slug, versions };
}

export function getSkillVersions(slug: string): SkillVersion[] {
  if (!slug) return [];

  const all = Array.isArray(skillVersionsData)
    ? (skillVersionsData as SkillVersionHistory[])
    : [];

  const found = all.find((h) => h.slug === slug);
  if (!found) return [];

  return normalizeHistory(found).versions;
}

export function getLatestVersion(slug: string): SkillVersion | null {
  const versions = getSkillVersions(slug);
  return versions[0] ?? null;
}
