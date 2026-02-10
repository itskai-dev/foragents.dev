import { promises as fs } from "fs";
import path from "path";

export type DeveloperPortalCategory = "api" | "sdk" | "tools" | "examples";
export type DeveloperPortalDifficulty = "beginner" | "intermediate" | "advanced";

export type DeveloperPortalEntry = {
  id: string;
  title: string;
  description: string;
  category: DeveloperPortalCategory;
  difficulty: DeveloperPortalDifficulty;
  tags: string[];
  updatedAt: string;
};

type DeveloperPortalSubmission = {
  title?: unknown;
  description?: unknown;
  category?: unknown;
  difficulty?: unknown;
  tags?: unknown;
};

const DEVELOPER_PORTAL_PATH = path.join(process.cwd(), "data", "developer-portal.json");

export const DEVELOPER_PORTAL_CATEGORIES: DeveloperPortalCategory[] = [
  "api",
  "sdk",
  "tools",
  "examples",
];

export const DEVELOPER_PORTAL_DIFFICULTIES: DeveloperPortalDifficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function isDeveloperPortalEntry(value: unknown): value is DeveloperPortalEntry {
  if (!value || typeof value !== "object") return false;

  const entry = value as Partial<DeveloperPortalEntry>;

  return (
    typeof entry.id === "string" &&
    typeof entry.title === "string" &&
    typeof entry.description === "string" &&
    typeof entry.category === "string" &&
    DEVELOPER_PORTAL_CATEGORIES.includes(entry.category as DeveloperPortalCategory) &&
    typeof entry.difficulty === "string" &&
    DEVELOPER_PORTAL_DIFFICULTIES.includes(entry.difficulty as DeveloperPortalDifficulty) &&
    Array.isArray(entry.tags) &&
    entry.tags.every((tag) => typeof tag === "string") &&
    typeof entry.updatedAt === "string"
  );
}

export async function readDeveloperPortalEntries(): Promise<DeveloperPortalEntry[]> {
  try {
    const raw = await fs.readFile(DEVELOPER_PORTAL_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((entry): entry is DeveloperPortalEntry => isDeveloperPortalEntry(entry))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch {
    return [];
  }
}

export async function writeDeveloperPortalEntries(entries: DeveloperPortalEntry[]): Promise<void> {
  await fs.mkdir(path.dirname(DEVELOPER_PORTAL_PATH), { recursive: true });
  await fs.writeFile(DEVELOPER_PORTAL_PATH, JSON.stringify(entries, null, 2));
}

export function filterDeveloperPortalEntries(
  entries: DeveloperPortalEntry[],
  filters: {
    category?: string | null;
    search?: string | null;
  }
): DeveloperPortalEntry[] {
  const normalizedCategory = filters.category?.trim().toLowerCase() || "";
  const normalizedSearch = filters.search?.trim().toLowerCase() || "";

  return entries.filter((entry) => {
    const categoryMatch =
      !normalizedCategory ||
      normalizedCategory === "all" ||
      entry.category.toLowerCase() === normalizedCategory;

    if (!categoryMatch) return false;

    if (!normalizedSearch) return true;

    const haystack = [
      entry.title,
      entry.description,
      entry.category,
      entry.difficulty,
      entry.tags.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });
}

export function validateDeveloperPortalSubmission(input: DeveloperPortalSubmission): {
  errors: string[];
  payload?: {
    title: string;
    description: string;
    category: DeveloperPortalCategory;
    difficulty: DeveloperPortalDifficulty;
    tags: string[];
  };
} {
  const errors: string[] = [];

  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const category = typeof input.category === "string" ? input.category.trim().toLowerCase() : "";
  const difficulty =
    typeof input.difficulty === "string" ? input.difficulty.trim().toLowerCase() : "";
  const tags = normalizeStringArray(input.tags);

  if (!title) errors.push("title is required");
  if (!description) errors.push("description is required");

  if (!category || !DEVELOPER_PORTAL_CATEGORIES.includes(category as DeveloperPortalCategory)) {
    errors.push(`category must be one of: ${DEVELOPER_PORTAL_CATEGORIES.join(", ")}`);
  }

  if (
    !difficulty ||
    !DEVELOPER_PORTAL_DIFFICULTIES.includes(difficulty as DeveloperPortalDifficulty)
  ) {
    errors.push(`difficulty must be one of: ${DEVELOPER_PORTAL_DIFFICULTIES.join(", ")}`);
  }

  if (tags.length === 0) {
    errors.push("tags must include at least one tag");
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    errors,
    payload: {
      title,
      description,
      category: category as DeveloperPortalCategory,
      difficulty: difficulty as DeveloperPortalDifficulty,
      tags,
    },
  };
}

export async function createDeveloperPortalEntry(input: DeveloperPortalSubmission): Promise<{
  errors: string[];
  entry?: DeveloperPortalEntry;
}> {
  const validation = validateDeveloperPortalSubmission(input);
  if (validation.errors.length > 0 || !validation.payload) {
    return { errors: validation.errors };
  }

  const entries = await readDeveloperPortalEntries();

  const entry: DeveloperPortalEntry = {
    id: `devportal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...validation.payload,
    updatedAt: new Date().toISOString(),
  };

  await writeDeveloperPortalEntries([entry, ...entries]);

  return {
    errors: [],
    entry,
  };
}
