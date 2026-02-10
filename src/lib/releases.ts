import { promises as fs } from "fs";
import path from "path";

export type ReleaseType = "major" | "minor" | "patch" | "security";

export type Release = {
  id: string;
  version: string;
  title: string;
  description: string;
  type: ReleaseType;
  date: string;
  highlights: string[];
  tags: string[];
  updatedAt: string;
};

export type ReleaseFilters = {
  type?: ReleaseType;
  search?: string;
};

export const RELEASES_PATH = path.join(process.cwd(), "data", "releases.json");

export function isReleaseType(value: unknown): value is ReleaseType {
  return value === "major" || value === "minor" || value === "patch" || value === "security";
}

export function isSemver(value: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(value);
}

function isDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

export function normalizeRelease(raw: unknown): Release | null {
  if (!raw || typeof raw !== "object") return null;

  const obj = raw as Partial<Release>;

  if (
    typeof obj.id !== "string" ||
    typeof obj.version !== "string" ||
    typeof obj.title !== "string" ||
    typeof obj.description !== "string" ||
    !isReleaseType(obj.type) ||
    typeof obj.date !== "string" ||
    typeof obj.updatedAt !== "string"
  ) {
    return null;
  }

  if (!isSemver(obj.version) || !isDateString(obj.date)) {
    return null;
  }

  const highlights = normalizeStringArray(obj.highlights);
  const tags = normalizeStringArray(obj.tags).map((tag) => tag.toLowerCase());

  if (highlights.length === 0) {
    return null;
  }

  return {
    id: obj.id,
    version: obj.version,
    title: obj.title,
    description: obj.description,
    type: obj.type,
    date: obj.date,
    highlights,
    tags,
    updatedAt: obj.updatedAt,
  };
}

export async function readReleases(): Promise<Release[]> {
  try {
    const raw = await fs.readFile(RELEASES_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => normalizeRelease(item))
      .filter((item): item is Release => Boolean(item));
  } catch {
    return [];
  }
}

export async function writeReleases(releases: Release[]): Promise<void> {
  const dir = path.dirname(RELEASES_PATH);
  await fs.mkdir(dir, { recursive: true });

  const tmp = `${RELEASES_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(releases, null, 2), "utf-8");
  await fs.rename(tmp, RELEASES_PATH);
}

export function sortReleasesDesc(releases: Release[]): Release[] {
  return [...releases].sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDiff !== 0) return dateDiff;

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export function filterReleases(releases: Release[], filters: ReleaseFilters): Release[] {
  const search = filters.search?.trim().toLowerCase() || "";

  return releases.filter((release) => {
    const typeMatch = filters.type ? release.type === filters.type : true;
    if (!typeMatch) return false;

    if (!search) return true;

    const haystack = [
      release.version,
      release.title,
      release.description,
      release.type,
      release.date,
      ...release.highlights,
      ...release.tags,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}

export function createReleaseId(): string {
  return `rel_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
