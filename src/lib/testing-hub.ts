import { promises as fs } from "node:fs";
import path from "node:path";

export const TESTING_HUB_CATEGORIES = ["cases", "benchmarks", "ci-cd"] as const;
export type TestingHubCategory = (typeof TESTING_HUB_CATEGORIES)[number];

export const TESTING_HUB_STATUSES = ["draft", "active", "stable", "archived"] as const;
export type TestingHubStatus = (typeof TESTING_HUB_STATUSES)[number];

export type TestingHubEntry = {
  id: string;
  title: string;
  description: string;
  category: TestingHubCategory;
  status: TestingHubStatus;
  framework: string;
  tags: string[];
  updatedAt: string;
};

export type TestingHubFilters = {
  category?: string | null;
  status?: string | null;
  search?: string | null;
};

const TESTING_HUB_PATH = path.join(process.cwd(), "data", "testing-hub.json");

function isCategory(value: unknown): value is TestingHubCategory {
  return typeof value === "string" && TESTING_HUB_CATEGORIES.includes(value as TestingHubCategory);
}

function isStatus(value: unknown): value is TestingHubStatus {
  return typeof value === "string" && TESTING_HUB_STATUSES.includes(value as TestingHubStatus);
}

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function sanitizeEntry(value: unknown): TestingHubEntry | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const entry = value as Record<string, unknown>;

  if (
    typeof entry.id !== "string" ||
    typeof entry.title !== "string" ||
    typeof entry.description !== "string" ||
    !isCategory(entry.category) ||
    !isStatus(entry.status) ||
    typeof entry.framework !== "string" ||
    !Array.isArray(entry.tags) ||
    !entry.tags.every((tag) => typeof tag === "string") ||
    !isValidDate(entry.updatedAt)
  ) {
    return null;
  }

  return {
    id: entry.id,
    title: entry.title,
    description: entry.description,
    category: entry.category,
    status: entry.status,
    framework: entry.framework,
    tags: entry.tags,
    updatedAt: entry.updatedAt,
  };
}

export async function readTestingHubEntries(): Promise<TestingHubEntry[]> {
  try {
    const raw = await fs.readFile(TESTING_HUB_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry) => sanitizeEntry(entry))
      .filter((entry): entry is TestingHubEntry => entry !== null)
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  } catch {
    return [];
  }
}

export async function writeTestingHubEntries(entries: TestingHubEntry[]): Promise<void> {
  await fs.mkdir(path.dirname(TESTING_HUB_PATH), { recursive: true });
  await fs.writeFile(TESTING_HUB_PATH, `${JSON.stringify(entries, null, 2)}\n`, "utf-8");
}

export function filterTestingHubEntries(
  entries: TestingHubEntry[],
  filters: TestingHubFilters
): TestingHubEntry[] {
  const category = filters.category?.trim().toLowerCase() ?? "";
  const status = filters.status?.trim().toLowerCase() ?? "";
  const search = filters.search?.trim().toLowerCase() ?? "";

  return entries.filter((entry) => {
    const categoryMatch = !category || category === "all" || entry.category === category;
    const statusMatch = !status || status === "all" || entry.status === status;

    if (!categoryMatch || !statusMatch) {
      return false;
    }

    if (!search) {
      return true;
    }

    const haystack = [entry.title, entry.description, entry.framework, entry.tags.join(" ")]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}

export async function createTestingHubEntry(
  input: Partial<TestingHubEntry>
): Promise<{ entry?: TestingHubEntry; errors: string[] }> {
  const errors: string[] = [];

  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const framework = typeof input.framework === "string" ? input.framework.trim() : "";
  const category = typeof input.category === "string" ? input.category.trim().toLowerCase() : "";
  const status = typeof input.status === "string" ? input.status.trim().toLowerCase() : "";

  const tags = Array.isArray(input.tags)
    ? input.tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  if (!title) errors.push("title is required");
  if (!description) errors.push("description is required");
  if (!framework) errors.push("framework is required");
  if (!isCategory(category)) errors.push(`category must be one of: ${TESTING_HUB_CATEGORIES.join(", ")}`);
  if (!isStatus(status)) errors.push(`status must be one of: ${TESTING_HUB_STATUSES.join(", ")}`);
  if (tags.length === 0) errors.push("tags must include at least one value");

  if (errors.length > 0) {
    return { errors };
  }

  const entries = await readTestingHubEntries();
  const entry: TestingHubEntry = {
    id:
      typeof input.id === "string" && input.id.trim().length > 0
        ? input.id.trim()
        : `th-${Date.now()}`,
    title,
    description,
    framework,
    category: category as TestingHubCategory,
    status: status as TestingHubStatus,
    tags,
    updatedAt: new Date().toISOString(),
  };

  await writeTestingHubEntries([entry, ...entries]);

  return { entry, errors: [] };
}
