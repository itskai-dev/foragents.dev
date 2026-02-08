import { promises as fs } from "fs";
import path from "path";
import type { CanaryResult, CanaryStatus } from "@/lib/canary";

const CANARY_PATH = path.join(process.cwd(), "data", "canary-runs.json");

type CanaryFile = { results: unknown };

function normalizeStatus(v: unknown): CanaryStatus | null {
  return v === "pass" || v === "fail" ? v : null;
}

function normalizeResult(raw: unknown): CanaryResult | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const id = typeof obj.id === "string" ? obj.id : "";
  const checkedAt = typeof obj.checkedAt === "string" ? obj.checkedAt : "";
  const endpoint = typeof obj.endpoint === "string" ? obj.endpoint : "";
  const method = obj.method === "GET" ? "GET" : null;
  const status = normalizeStatus(obj.status);

  const responseTimeMs = typeof obj.responseTimeMs === "number" ? obj.responseTimeMs : NaN;

  if (!id || !checkedAt || !endpoint || !method || !status) return null;
  if (!Number.isFinite(responseTimeMs) || responseTimeMs < 0) return null;

  const httpStatus = typeof obj.httpStatus === "number" ? obj.httpStatus : undefined;
  const errorMessage = typeof obj.errorMessage === "string" ? obj.errorMessage : undefined;
  const regression = typeof obj.regression === "boolean" ? obj.regression : undefined;

  return {
    id,
    checkedAt,
    endpoint,
    method,
    status,
    responseTimeMs,
    ...(typeof httpStatus === "number" ? { httpStatus } : {}),
    ...(errorMessage ? { errorMessage } : {}),
    ...(typeof regression === "boolean" ? { regression } : {}),
  };
}

export async function readCanaryResults(): Promise<CanaryResult[]> {
  try {
    const raw = await fs.readFile(CANARY_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    const resultsValue =
      parsed && typeof parsed === "object" && Array.isArray((parsed as CanaryFile).results)
        ? (parsed as CanaryFile).results
        : Array.isArray(parsed)
          ? parsed
          : [];

    const results = (resultsValue as unknown[]).map(normalizeResult).filter(Boolean) as CanaryResult[];

    // Sort newest first
    results.sort((a, b) => b.checkedAt.localeCompare(a.checkedAt));

    return results;
  } catch {
    return [];
  }
}

export async function writeCanaryResults(results: CanaryResult[]): Promise<void> {
  await fs.mkdir(path.dirname(CANARY_PATH), { recursive: true });
  const payload = JSON.stringify({ results }, null, 2) + "\n";
  await fs.writeFile(CANARY_PATH, payload, "utf-8");
}

export async function appendCanaryResults(
  newResults: Omit<CanaryResult, "regression">[]
): Promise<CanaryResult[]> {
  const existing = await readCanaryResults();

  // Regression detection is per-endpoint based on the most recent previous result.
  const withRegression: CanaryResult[] = newResults.map((r) => {
    const prev = existing.find((e) => e.endpoint === r.endpoint);
    const regression = prev?.status === "pass" && r.status === "fail";

    return {
      ...r,
      ...(regression ? { regression: true } : {}),
    };
  });

  const merged = [...withRegression, ...existing];

  // Cap stored history to keep the JSON file bounded.
  const MAX_RESULTS = 500;
  const capped = merged
    .sort((a, b) => b.checkedAt.localeCompare(a.checkedAt))
    .slice(0, MAX_RESULTS);

  await writeCanaryResults(capped);
  return capped;
}
