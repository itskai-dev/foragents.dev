import { promises as fs } from "fs";
import path from "path";

export type GuideDifficulty = "beginner" | "intermediate" | "advanced";
export type GuideCategory =
  | "getting-started"
  | "best-practices"
  | "deployment"
  | "security"
  | "performance";

export type Guide = {
  title: string;
  slug: string;
  description: string;
  difficulty: GuideDifficulty;
  category: GuideCategory;
  content: string;
  readCount: number;
  estimatedMinutes: number;
  author: string;
};

export type GuideSummary = Omit<Guide, "content">;

const GUIDES_PATH = path.join(process.cwd(), "data", "guides.json");

export async function readGuides(): Promise<Guide[]> {
  try {
    const raw = await fs.readFile(GUIDES_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Guide[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeGuides(guides: Guide[]): Promise<void> {
  await fs.mkdir(path.dirname(GUIDES_PATH), { recursive: true });
  await fs.writeFile(GUIDES_PATH, JSON.stringify(guides, null, 2));
}

export function filterGuides(
  guides: Guide[],
  options: { difficulty?: string; category?: string; search?: string }
): Guide[] {
  const difficulty = options.difficulty?.trim().toLowerCase();
  const category = options.category?.trim().toLowerCase();
  const search = options.search?.trim().toLowerCase();

  return guides.filter((guide) => {
    const matchesDifficulty = !difficulty || guide.difficulty === difficulty;
    const matchesCategory = !category || guide.category === category;
    const matchesSearch =
      !search ||
      [guide.title, guide.description, guide.content, guide.author].some((value) =>
        value.toLowerCase().includes(search)
      );

    return matchesDifficulty && matchesCategory && matchesSearch;
  });
}

export function toGuideSummary(guide: Guide): GuideSummary {
  return {
    title: guide.title,
    slug: guide.slug,
    description: guide.description,
    difficulty: guide.difficulty,
    category: guide.category,
    readCount: guide.readCount,
    estimatedMinutes: guide.estimatedMinutes,
    author: guide.author,
  };
}
