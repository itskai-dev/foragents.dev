import { promises as fs } from "node:fs";
import path from "node:path";

export type BuilderStatus = "draft" | "published";

export type BuilderFile = {
  name: string;
  content: string;
};

export type BuilderDraft = {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  author: string;
  tags: string[];
  files: BuilderFile[];
  createdAt: string;
  updatedAt: string;
  status: BuilderStatus;
};

const BUILDER_DRAFTS_PATH = path.join(process.cwd(), "data", "builder-drafts.json");

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toTagList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

function toFileList(value: unknown): BuilderFile[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((file) => {
      if (!file || typeof file !== "object") return null;

      const fileName = normalizeString((file as { name?: unknown }).name);
      const fileContent = typeof (file as { content?: unknown }).content === "string"
        ? (file as { content: string }).content
        : "";

      if (!fileName) return null;
      return {
        name: fileName,
        content: fileContent,
      };
    })
    .filter((file): file is BuilderFile => file !== null);
}

function isStatus(value: unknown): value is BuilderStatus {
  return value === "draft" || value === "published";
}

function normalizeDraft(value: unknown): BuilderDraft | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Partial<BuilderDraft>;

  const id = normalizeString(candidate.id);
  const name = normalizeString(candidate.name);
  const slug = normalizeString(candidate.slug);

  if (!id || !name || !slug) return null;

  return {
    id,
    name,
    slug,
    description: normalizeString(candidate.description),
    version: normalizeString(candidate.version) || "0.1.0",
    author: normalizeString(candidate.author) || "Unknown",
    tags: toTagList(candidate.tags),
    files: toFileList(candidate.files),
    createdAt: normalizeString(candidate.createdAt) || new Date().toISOString(),
    updatedAt: normalizeString(candidate.updatedAt) || new Date().toISOString(),
    status: isStatus(candidate.status) ? candidate.status : "draft",
  };
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function readBuilderDrafts(): Promise<BuilderDraft[]> {
  try {
    const raw = await fs.readFile(BUILDER_DRAFTS_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((draft) => normalizeDraft(draft))
      .filter((draft): draft is BuilderDraft => draft !== null);
  } catch {
    return [];
  }
}

export async function writeBuilderDrafts(drafts: BuilderDraft[]): Promise<void> {
  await fs.writeFile(BUILDER_DRAFTS_PATH, JSON.stringify(drafts, null, 2));
}
