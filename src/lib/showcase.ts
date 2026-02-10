import { promises as fs } from "fs";
import path from "path";

export const SHOWCASE_PATH = path.join(process.cwd(), "data", "showcase.json");

export type ShowcaseCategory =
  | "tools"
  | "integrations"
  | "automations"
  | "experiments"
  | "production";

export const SHOWCASE_CATEGORIES: ShowcaseCategory[] = [
  "tools",
  "integrations",
  "automations",
  "experiments",
  "production",
];

export type ShowcaseProject = {
  id: string;
  title: string;
  description: string;
  url: string;
  author: string;
  category: ShowcaseCategory;
  tags: string[];
  featured: boolean;
  updatedAt: string;
  voteCount: number;
  createdAt: string;
  voters: string[];
};

export type ShowcaseSubmission = {
  title?: unknown;
  description?: unknown;
  url?: unknown;
  author?: unknown;
  category?: unknown;
  tags?: unknown;
};

export function isShowcaseCategory(value: unknown): value is ShowcaseCategory {
  return typeof value === "string" && SHOWCASE_CATEGORIES.includes(value as ShowcaseCategory);
}

export function isShowcaseProject(item: unknown): item is ShowcaseProject {
  if (!item || typeof item !== "object") return false;
  const project = item as Partial<ShowcaseProject>;

  return (
    typeof project.id === "string" &&
    typeof project.title === "string" &&
    typeof project.description === "string" &&
    typeof project.url === "string" &&
    typeof project.author === "string" &&
    isShowcaseCategory(project.category) &&
    Array.isArray(project.tags) &&
    typeof project.featured === "boolean" &&
    typeof project.updatedAt === "string" &&
    typeof project.voteCount === "number" &&
    typeof project.createdAt === "string" &&
    Array.isArray(project.voters)
  );
}

export async function readShowcaseProjects(): Promise<ShowcaseProject[]> {
  try {
    const raw = await fs.readFile(SHOWCASE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isShowcaseProject);
  } catch {
    return [];
  }
}

export async function writeShowcaseProjects(projects: ShowcaseProject[]): Promise<void> {
  await fs.mkdir(path.dirname(SHOWCASE_PATH), { recursive: true });
  await fs.writeFile(SHOWCASE_PATH, JSON.stringify(projects, null, 2));
}

export function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return Array.from(
    new Set(
      tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

export function validateShowcaseSubmission(body: ShowcaseSubmission): string[] {
  const errors: string[] = [];

  if (typeof body.title !== "string" || body.title.trim().length === 0) {
    errors.push("title is required");
  }

  if (typeof body.description !== "string" || body.description.trim().length === 0) {
    errors.push("description is required");
  }

  if (typeof body.author !== "string" || body.author.trim().length === 0) {
    errors.push("author is required");
  }

  if (typeof body.url !== "string" || body.url.trim().length === 0) {
    errors.push("url is required");
  } else {
    try {
      const parsed = new URL(body.url.trim());
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        errors.push("url must use http or https");
      }
    } catch {
      errors.push("url must be a valid URL");
    }
  }

  if (!isShowcaseCategory(body.category)) {
    errors.push(`category must be one of: ${SHOWCASE_CATEGORIES.join(", ")}`);
  }

  const tags = normalizeTags(body.tags);
  if (tags.length === 0) {
    errors.push("tags must contain at least one tag");
  }

  return errors;
}

export function filterShowcaseProjects(
  projects: ShowcaseProject[],
  options: { category?: string; search?: string }
): ShowcaseProject[] {
  const normalizedCategory = (options.category || "all").trim().toLowerCase();
  const normalizedSearch = (options.search || "").trim().toLowerCase();

  return projects.filter((project) => {
    if (normalizedCategory !== "all" && project.category !== normalizedCategory) {
      return false;
    }

    if (!normalizedSearch) return true;

    const haystack = [
      project.title,
      project.description,
      project.author,
      project.category,
      ...project.tags,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });
}
