export type ChangelogCategory = "feature" | "bugfix" | "docs";

export type ChangelogEntry = {
  id: string;
  title: string;
  category: ChangelogCategory;
  date: string; // YYYY-MM-DD
  prNumber: number;
  prUrl: string;
  description: string;
};

export type ChangelogApiResponse = {
  entries: ChangelogEntry[];
  total: number;
};

export function isChangelogCategory(value: string | null): value is ChangelogCategory {
  return value === "feature" || value === "bugfix" || value === "docs";
}
