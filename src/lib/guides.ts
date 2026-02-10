import { promises as fs } from "fs";
import path from "path";

export type GuideDifficulty = "beginner" | "intermediate" | "advanced";
export type GuideCategory =
  | "getting-started"
  | "best-practices"
  | "deployment"
  | "security"
  | "performance";

export interface Guide {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: GuideDifficulty;
  category: GuideCategory;
  content: string;
  tags: string[];
  updatedAt: string;
  readCount: number;
  estimatedMinutes: number;
  author: string;
}

export type GuideSummary = Omit<Guide, "content">;

interface GuideFilters {
  difficulty?: string | null;
  category?: string | null;
  search?: string | null;
}

const GUIDES_PATH = path.join(process.cwd(), "data", "guides.json");

const guideCategories: GuideCategory[] = [
  "getting-started",
  "best-practices",
  "deployment",
  "security",
  "performance",
];

const guideDifficulties: GuideDifficulty[] = ["beginner", "intermediate", "advanced"];

function isGuideCategory(value: string): value is GuideCategory {
  return guideCategories.includes(value as GuideCategory);
}

function isGuideDifficulty(value: string): value is GuideDifficulty {
  return guideDifficulties.includes(value as GuideDifficulty);
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function createFallbackId(slug: string): string {
  return `guide-${slug || Date.now().toString()}`;
}

function toGuide(candidate: unknown): Guide | null {
  if (!candidate || typeof candidate !== "object") return null;

  const entry = candidate as Record<string, unknown>;

  const title = typeof entry.title === "string" ? entry.title.trim() : "";
  const slugValue = typeof entry.slug === "string" ? entry.slug.trim() : slugify(title);
  const description = typeof entry.description === "string" ? entry.description.trim() : "";
  const content = typeof entry.content === "string" ? entry.content : "";
  const difficultyValue = typeof entry.difficulty === "string" ? entry.difficulty.trim().toLowerCase() : "";
  const categoryValue = typeof entry.category === "string" ? entry.category.trim().toLowerCase() : "";
  const author = typeof entry.author === "string" ? entry.author.trim() : "forAgents Team";

  if (!title || !slugValue || !description || !content) return null;
  if (!isGuideDifficulty(difficultyValue) || !isGuideCategory(categoryValue)) return null;

  const tags = Array.isArray(entry.tags)
    ? entry.tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
    : [];

  const id = typeof entry.id === "string" && entry.id.trim().length > 0 ? entry.id.trim() : createFallbackId(slugValue);
  const updatedAt =
    typeof entry.updatedAt === "string" && entry.updatedAt.trim().length > 0
      ? entry.updatedAt.trim()
      : new Date().toISOString();
  const readCount = typeof entry.readCount === "number" && Number.isFinite(entry.readCount) ? entry.readCount : 0;
  const estimatedMinutes =
    typeof entry.estimatedMinutes === "number" && Number.isFinite(entry.estimatedMinutes) ? entry.estimatedMinutes : 10;

  return {
    id,
    title,
    slug: slugValue,
    description,
    difficulty: difficultyValue,
    category: categoryValue,
    content,
    tags,
    updatedAt,
    readCount,
    estimatedMinutes,
    author,
  };
}

export async function readGuides(): Promise<Guide[]> {
  try {
    const raw = await fs.readFile(GUIDES_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) return [];
    return parsed.map(toGuide).filter((guide): guide is Guide => guide !== null);
  } catch {
    return [];
  }
}

export async function writeGuides(guides: Guide[]): Promise<void> {
  await fs.mkdir(path.dirname(GUIDES_PATH), { recursive: true });
  await fs.writeFile(GUIDES_PATH, `${JSON.stringify(guides, null, 2)}\n`, "utf-8");
}

export function filterGuides(guides: Guide[], options: GuideFilters): Guide[] {
  const difficulty = options.difficulty?.trim().toLowerCase();
  const category = options.category?.trim().toLowerCase();
  const search = options.search?.trim().toLowerCase();

  return guides.filter((guide) => {
    if (difficulty && isGuideDifficulty(difficulty) && guide.difficulty !== difficulty) return false;
    if (category && isGuideCategory(category) && guide.category !== category) return false;

    if (!search) return true;

    return [guide.title, guide.description, guide.content, guide.author, ...guide.tags]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });
}

export function normalizeGuideCategory(value: string): GuideCategory | null {
  const normalized = value.trim().toLowerCase();
  return isGuideCategory(normalized) ? normalized : null;
}

export function normalizeGuideDifficulty(value: string): GuideDifficulty | null {
  const normalized = value.trim().toLowerCase();
  return isGuideDifficulty(normalized) ? normalized : null;
}

export function toGuideSummary(guide: Guide): GuideSummary {
  return {
    id: guide.id,
    title: guide.title,
    slug: guide.slug,
    description: guide.description,
    difficulty: guide.difficulty,
    category: guide.category,
    tags: guide.tags,
    updatedAt: guide.updatedAt,
    readCount: guide.readCount,
    estimatedMinutes: guide.estimatedMinutes,
    author: guide.author,
  };
}

export function createGuideId(): string {
  const suffix = Math.random().toString(36).slice(2, 10);
  return `guide-${Date.now()}-${suffix}`;
}

export function createGuideSlug(title: string): string {
  return slugify(title);
}
