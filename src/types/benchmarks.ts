export const benchmarkCategories = ["speed", "accuracy", "reliability", "memory"] as const;

export type BenchmarkCategory = (typeof benchmarkCategories)[number];

export type BenchmarkSortKey = "score" | "date";
export type BenchmarkSortOrder = "asc" | "desc";

export interface BenchmarkEntry {
  id: string;
  skillSlug: string;
  skillName: string;
  category: BenchmarkCategory;
  score: number;
  metrics: Record<string, number | string | boolean | null>;
  runDate: string;
  version: string;
}

export interface BenchmarkQuery {
  category?: BenchmarkCategory;
  skill?: string;
  sort?: BenchmarkSortKey;
  order?: BenchmarkSortOrder;
}
