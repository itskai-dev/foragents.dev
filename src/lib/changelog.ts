import { promises as fs } from "fs";
import path from "path";

export type ChangelogCategory = "feature" | "improvement" | "fix" | "docs" | "refactor" | "test";

export type ChangelogEntry = {
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  category: ChangelogCategory;
  link: string;
  /** Optional GitHub PR (or commit) URL for the change. */
  pr?: string;
};

export type GeneratedChangelogEntry = {
  date: string;
  title: string;
  prNumber: number;
  prUrl: string;
  category: Exclude<ChangelogCategory, "improvement">;
  author: string;
};

const CHANGELOG_PATH = path.join(process.cwd(), "data", "changelog.json");
const GENERATED_CHANGELOG_PATH = path.join(process.cwd(), "src", "data", "changelog-generated.json");

/**
 * Convert generated entry to standard changelog entry
 */
function convertGeneratedEntry(entry: GeneratedChangelogEntry): ChangelogEntry {
  return {
    date: entry.date,
    title: entry.title,
    description: `By @${entry.author}`,
    category: entry.category,
    link: entry.prUrl,
    pr: entry.prUrl,
  };
}

export async function getChangelogEntries(): Promise<ChangelogEntry[]> {
  const manualEntries = await getManualChangelogEntries();
  const generatedEntries = await getGeneratedChangelogEntries();

  // Merge and sort by date
  const allEntries = [...manualEntries, ...generatedEntries];
  return allEntries.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

async function getManualChangelogEntries(): Promise<ChangelogEntry[]> {
  try {
    const raw = await fs.readFile(CHANGELOG_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    // Minimal shape filter to avoid runtime crashes if the file is edited.
    const entries = parsed
      .filter((e) => e && typeof e === "object")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((e: any) => ({
        date: typeof e.date === "string" ? e.date : "",
        title: typeof e.title === "string" ? e.title : "",
        description: typeof e.description === "string" ? e.description : "",
        category: (typeof e.category === "string" ? e.category : "feature") as ChangelogCategory,
        link: typeof e.link === "string" ? e.link : "/",
        pr: typeof e.pr === "string" ? e.pr : undefined,
      }))
      .filter((e) => !!e.date && !!e.title && !!e.description && !!e.category && !!e.link);

    return entries;
  } catch {
    return [];
  }
}

async function getGeneratedChangelogEntries(): Promise<ChangelogEntry[]> {
  try {
    const raw = await fs.readFile(GENERATED_CHANGELOG_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((e) => e && typeof e === "object")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((e: any) => convertGeneratedEntry(e as GeneratedChangelogEntry))
      .filter((e) => !!e.date && !!e.title);
  } catch {
    return [];
  }
}

export function isChangelogCategory(value: string | null): value is ChangelogCategory {
  return value === "feature" || value === "improvement" || value === "fix" || value === "docs" || value === "refactor" || value === "test";
}
