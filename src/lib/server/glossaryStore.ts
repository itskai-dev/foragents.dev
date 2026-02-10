import "server-only";

import { promises as fs } from "fs";
import path from "path";

export type GlossaryCategory =
  | "core-concepts"
  | "protocols"
  | "infrastructure"
  | "security"
  | "patterns";

export type GlossaryTermRecord = {
  id: string;
  term: string;
  definition: string;
  category: GlossaryCategory;
  relatedTerms: string[];
  tags: string[];
  updatedAt: string;
  slug: string;
};

export const VALID_GLOSSARY_CATEGORIES: GlossaryCategory[] = [
  "core-concepts",
  "protocols",
  "infrastructure",
  "security",
  "patterns",
];

const GLOSSARY_PATH = path.join(process.cwd(), "data", "glossary.json");

export function isGlossaryCategory(value: unknown): value is GlossaryCategory {
  return typeof value === "string" && VALID_GLOSSARY_CATEGORIES.includes(value as GlossaryCategory);
}

export function slugifyGlossaryTerm(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function normalizeGlossaryTerm(item: unknown, index: number): GlossaryTermRecord | null {
  if (!item || typeof item !== "object") return null;

  const maybeTerm = item as Record<string, unknown>;

  const term = typeof maybeTerm.term === "string" ? maybeTerm.term.trim() : "";
  const definition = typeof maybeTerm.definition === "string" ? maybeTerm.definition.trim() : "";
  const category = maybeTerm.category;

  if (!term || !definition || !isGlossaryCategory(category)) {
    return null;
  }

  const slug =
    typeof maybeTerm.slug === "string" && maybeTerm.slug.trim().length > 0
      ? maybeTerm.slug.trim()
      : slugifyGlossaryTerm(term);

  if (!slug) return null;

  const now = new Date().toISOString();

  const id =
    typeof maybeTerm.id === "string" && maybeTerm.id.trim().length > 0
      ? maybeTerm.id.trim()
      : `glossary-${slug}-${index + 1}`;

  const relatedTerms = normalizeStringArray(maybeTerm.relatedTerms);

  const tags = normalizeStringArray(maybeTerm.tags);

  return {
    id,
    term,
    definition,
    category,
    relatedTerms,
    tags,
    updatedAt: typeof maybeTerm.updatedAt === "string" ? maybeTerm.updatedAt : now,
    slug,
  };
}

export async function readGlossaryTerms(): Promise<GlossaryTermRecord[]> {
  try {
    const raw = await fs.readFile(GLOSSARY_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item, index) => normalizeGlossaryTerm(item, index))
      .filter((item): item is GlossaryTermRecord => item !== null);
  } catch {
    return [];
  }
}

export async function writeGlossaryTerms(terms: GlossaryTermRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(GLOSSARY_PATH), { recursive: true });
  await fs.writeFile(GLOSSARY_PATH, `${JSON.stringify(terms, null, 2)}\n`, "utf8");
}
