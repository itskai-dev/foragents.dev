import { promises as fs } from "node:fs";
import path from "node:path";
import {
  benchmarkCategories,
  type BenchmarkCategory,
  type BenchmarkEntry,
  type BenchmarkQuery,
  type BenchmarkSortOrder,
} from "@/types/benchmarks";

const BENCHMARKS_PATH = path.join(process.cwd(), "data", "benchmarks.json");
const SRC_BENCHMARKS_PATH = path.join(process.cwd(), "src", "data", "benchmarks.json");

function isBenchmarkCategory(value: unknown): value is BenchmarkCategory {
  return typeof value === "string" && benchmarkCategories.includes(value as BenchmarkCategory);
}

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function coerceMetrics(value: unknown): Record<string, number | string | boolean | null> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const record = value as Record<string, unknown>;
  const metrics: Record<string, number | string | boolean | null> = {};

  for (const [key, metric] of Object.entries(record)) {
    if (
      metric === null ||
      typeof metric === "string" ||
      typeof metric === "number" ||
      typeof metric === "boolean"
    ) {
      metrics[key] = metric;
    }
  }

  return metrics;
}

function sanitizeEntry(input: unknown): BenchmarkEntry | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return null;
  }

  const row = input as Record<string, unknown>;

  if (
    typeof row.id !== "string" ||
    typeof row.skillSlug !== "string" ||
    typeof row.skillName !== "string" ||
    !isBenchmarkCategory(row.category) ||
    typeof row.score !== "number" ||
    row.score < 0 ||
    row.score > 100 ||
    !isValidDate(row.runDate) ||
    typeof row.version !== "string"
  ) {
    return null;
  }

  return {
    id: row.id,
    skillSlug: row.skillSlug,
    skillName: row.skillName,
    category: row.category,
    score: Number(row.score.toFixed(1)),
    metrics: coerceMetrics(row.metrics),
    runDate: row.runDate,
    version: row.version,
  };
}

function normalizeRawData(raw: unknown): BenchmarkEntry[] {
  if (Array.isArray(raw)) {
    return raw.map((row) => sanitizeEntry(row)).filter((row): row is BenchmarkEntry => row !== null);
  }

  // Legacy fallback: { skills: [...] } shape
  if (raw && typeof raw === "object" && Array.isArray((raw as { skills?: unknown[] }).skills)) {
    const skills = (raw as { skills: unknown[] }).skills;
    return skills
      .map((skill, index) => {
        if (!skill || typeof skill !== "object" || Array.isArray(skill)) {
          return null;
        }

        const row = skill as Record<string, unknown>;
        const latency = row.latency as Record<string, unknown> | undefined;
        const reliability = row.reliability as Record<string, unknown> | undefined;
        const resources = row.resources as Record<string, unknown> | undefined;

        const score =
          typeof reliability?.successRate === "number"
            ? Math.max(0, Math.min(100, reliability.successRate))
            : 50;

        return sanitizeEntry({
          id: `legacy-${String(row.id ?? index)}`,
          skillSlug: String(row.id ?? `legacy-${index}`),
          skillName: String(row.name ?? `Legacy Skill ${index + 1}`),
          category: "reliability",
          score,
          metrics: {
            latencyP50: typeof latency?.p50 === "number" ? latency.p50 : null,
            successRate: typeof reliability?.successRate === "number" ? reliability.successRate : null,
            avgMemoryMb: typeof resources?.avgMemoryMB === "number" ? resources.avgMemoryMB : null,
          },
          runDate: new Date().toISOString(),
          version: "legacy-import",
        });
      })
      .filter((row): row is BenchmarkEntry => row !== null);
  }

  return [];
}

async function writeBothPaths(entries: BenchmarkEntry[]) {
  const payload = `${JSON.stringify(entries, null, 2)}\n`;
  await fs.mkdir(path.dirname(BENCHMARKS_PATH), { recursive: true });
  await fs.mkdir(path.dirname(SRC_BENCHMARKS_PATH), { recursive: true });
  await Promise.all([
    fs.writeFile(BENCHMARKS_PATH, payload, "utf-8"),
    fs.writeFile(SRC_BENCHMARKS_PATH, payload, "utf-8"),
  ]);
}

export async function readBenchmarks(): Promise<BenchmarkEntry[]> {
  try {
    const raw = await fs.readFile(BENCHMARKS_PATH, "utf-8");
    return normalizeRawData(JSON.parse(raw));
  } catch {
    return [];
  }
}

export async function createBenchmark(input: Omit<BenchmarkEntry, "id"> & { id?: string }) {
  const entries = await readBenchmarks();

  const created = sanitizeEntry({
    ...input,
    id:
      input.id && input.id.trim().length > 0
        ? input.id
        : `${input.skillSlug}-${input.category}-${Date.now()}`,
  });

  if (!created) {
    throw new Error("Invalid benchmark payload");
  }

  entries.push(created);
  await writeBothPaths(entries);

  return created;
}

function sortEntries(
  entries: BenchmarkEntry[],
  sort: BenchmarkQuery["sort"],
  order: BenchmarkSortOrder
) {
  const direction = order === "asc" ? 1 : -1;

  return [...entries].sort((a, b) => {
    if (sort === "date") {
      return (Date.parse(a.runDate) - Date.parse(b.runDate)) * direction;
    }

    return (a.score - b.score) * direction;
  });
}

export async function queryBenchmarks(query: BenchmarkQuery) {
  const rows = await readBenchmarks();

  const filtered = rows.filter((row) => {
    if (query.category && row.category !== query.category) {
      return false;
    }

    if (query.skill) {
      const skillNeedle = query.skill.toLowerCase();
      return (
        row.skillSlug.toLowerCase().includes(skillNeedle) ||
        row.skillName.toLowerCase().includes(skillNeedle)
      );
    }

    return true;
  });

  return sortEntries(filtered, query.sort ?? "score", query.order ?? "desc");
}

export { isBenchmarkCategory };
