import { promises as fs } from "fs";
import path from "path";

export type ChangelogCategory = "feature" | "improvement" | "fix";

export type ChangelogEntry = {
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  category: ChangelogCategory;
  link: string;
};

const CHANGELOG_PATH = path.join(process.cwd(), "data", "changelog.json");

export async function getChangelogEntries(): Promise<ChangelogEntry[]> {
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
      }))
      .filter((e) => !!e.date && !!e.title && !!e.description && !!e.category && !!e.link);

    // Sort newest first (stable within same date).
    return entries.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch {
    return [];
  }
}

export function isChangelogCategory(value: string | null): value is ChangelogCategory {
  return value === "feature" || value === "improvement" || value === "fix";
}
