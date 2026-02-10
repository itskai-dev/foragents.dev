import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type AnalyticsPeriod = "7d" | "30d" | "60d" | "90d";

export type AnalyticsMetricEntry = {
  id: string;
  metric: string;
  value: number;
  category: string;
  period: AnalyticsPeriod;
  source: string;
  tags: string[];
  updatedAt: string;
};

export type AnalyticsFilters = {
  category?: string;
  period?: AnalyticsPeriod;
  search?: string;
};

const ANALYTICS_FILE_PATH = path.join(process.cwd(), "data", "analytics-metrics.json");

function normalizeEntry(entry: AnalyticsMetricEntry): AnalyticsMetricEntry {
  const updatedAt = new Date(entry.updatedAt);

  return {
    id: String(entry.id),
    metric: String(entry.metric),
    value: Number.isFinite(entry.value) ? Number(entry.value) : 0,
    category: String(entry.category),
    period: entry.period,
    source: String(entry.source),
    tags: Array.isArray(entry.tags) ? entry.tags.map((tag) => String(tag)) : [],
    updatedAt: Number.isNaN(updatedAt.getTime()) ? new Date().toISOString() : updatedAt.toISOString(),
  };
}

export async function readAnalyticsMetrics(): Promise<AnalyticsMetricEntry[]> {
  try {
    const raw = await fs.readFile(ANALYTICS_FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((entry) => normalizeEntry(entry as AnalyticsMetricEntry))
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  } catch {
    return [];
  }
}

export async function writeAnalyticsMetrics(entries: AnalyticsMetricEntry[]): Promise<void> {
  await fs.writeFile(ANALYTICS_FILE_PATH, JSON.stringify(entries, null, 2) + "\n", "utf8");
}

export function filterAnalyticsMetrics(
  entries: AnalyticsMetricEntry[],
  filters: AnalyticsFilters
): AnalyticsMetricEntry[] {
  const category = filters.category?.trim().toLowerCase();
  const period = filters.period;
  const search = filters.search?.trim().toLowerCase();

  return entries.filter((entry) => {
    if (category && entry.category.toLowerCase() !== category) return false;
    if (period && entry.period !== period) return false;

    if (search) {
      const haystack = [entry.metric, entry.category, entry.source, ...entry.tags].join(" ").toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}

export async function createAnalyticsMetric(
  payload: Partial<AnalyticsMetricEntry>
): Promise<AnalyticsMetricEntry> {
  const metric = payload.metric?.trim();
  const category = payload.category?.trim();
  const source = payload.source?.trim();
  const period = payload.period;

  if (!metric) throw new Error("metric is required");
  if (!category) throw new Error("category is required");
  if (!source) throw new Error("source is required");
  if (!period || !["7d", "30d", "60d", "90d"].includes(period)) {
    throw new Error("period must be one of: 7d, 30d, 60d, 90d");
  }

  const value = Number(payload.value);
  if (!Number.isFinite(value)) {
    throw new Error("value must be a finite number");
  }

  const parsedUpdatedAt = payload.updatedAt ? new Date(payload.updatedAt) : new Date();

  const entry: AnalyticsMetricEntry = {
    id: payload.id?.trim() || `anl_${randomUUID()}`,
    metric,
    value,
    category,
    period,
    source,
    tags: Array.isArray(payload.tags) ? payload.tags.map((tag) => String(tag).trim()).filter(Boolean) : [],
    updatedAt: Number.isNaN(parsedUpdatedAt.getTime())
      ? new Date().toISOString()
      : parsedUpdatedAt.toISOString(),
  };

  const existing = await readAnalyticsMetrics();
  const next = [entry, ...existing];
  await writeAnalyticsMetrics(next);

  return entry;
}
