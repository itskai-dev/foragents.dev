import { promises as fs } from "fs";
import path from "path";

export type ObservabilityGuideCategory = "logging" | "metrics" | "tracing" | "alerting";
export type ObservabilityGuideDifficulty = "beginner" | "intermediate" | "advanced";

export interface ObservabilityGuide {
  id: string;
  title: string;
  content: string;
  category: ObservabilityGuideCategory;
  difficulty: ObservabilityGuideDifficulty;
  tags: string[];
  updatedAt: string;
}

interface ObservabilityGuideFilters {
  category?: string | null;
  difficulty?: string | null;
  search?: string | null;
}

const OBSERVABILITY_GUIDES_PATH = path.join(process.cwd(), "data", "observability-guides.json");

const guideCategories: ObservabilityGuideCategory[] = ["logging", "metrics", "tracing", "alerting"];
const guideDifficulties: ObservabilityGuideDifficulty[] = ["beginner", "intermediate", "advanced"];

function isGuideCategory(value: string): value is ObservabilityGuideCategory {
  return guideCategories.includes(value as ObservabilityGuideCategory);
}

function isGuideDifficulty(value: string): value is ObservabilityGuideDifficulty {
  return guideDifficulties.includes(value as ObservabilityGuideDifficulty);
}

function isObservabilityGuide(item: unknown): item is ObservabilityGuide {
  if (!item || typeof item !== "object") return false;

  const candidate = item as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.content === "string" &&
    typeof candidate.category === "string" &&
    isGuideCategory(candidate.category) &&
    typeof candidate.difficulty === "string" &&
    isGuideDifficulty(candidate.difficulty) &&
    Array.isArray(candidate.tags) &&
    candidate.tags.every((tag) => typeof tag === "string") &&
    typeof candidate.updatedAt === "string"
  );
}

export async function readObservabilityGuides(): Promise<ObservabilityGuide[]> {
  try {
    const raw = await fs.readFile(OBSERVABILITY_GUIDES_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isObservabilityGuide);
  } catch {
    return [];
  }
}

export async function writeObservabilityGuides(guides: ObservabilityGuide[]): Promise<void> {
  const dir = path.dirname(OBSERVABILITY_GUIDES_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(OBSERVABILITY_GUIDES_PATH, `${JSON.stringify(guides, null, 2)}\n`, "utf-8");
}

export function filterObservabilityGuides(
  guides: ObservabilityGuide[],
  filters: ObservabilityGuideFilters
): ObservabilityGuide[] {
  const category = filters.category?.trim().toLowerCase();
  const difficulty = filters.difficulty?.trim().toLowerCase();
  const search = filters.search?.trim().toLowerCase();

  return guides.filter((guide) => {
    if (category && isGuideCategory(category) && guide.category !== category) return false;
    if (difficulty && isGuideDifficulty(difficulty) && guide.difficulty !== difficulty) return false;

    if (!search) return true;

    return [guide.title, guide.content, guide.category, guide.difficulty, ...guide.tags]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });
}

export function normalizeObservabilityGuideCategory(value: string): ObservabilityGuideCategory | null {
  const normalized = value.trim().toLowerCase();
  return isGuideCategory(normalized) ? normalized : null;
}

export function normalizeObservabilityGuideDifficulty(value: string): ObservabilityGuideDifficulty | null {
  const normalized = value.trim().toLowerCase();
  return isGuideDifficulty(normalized) ? normalized : null;
}
