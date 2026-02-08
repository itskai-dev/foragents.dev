import { promises as fs } from "fs";
import path from "path";

export type CanaryScorecardTrend = "improving" | "stable" | "declining";

export type CanaryScorecard = {
  agentId: string;
  date: string; // YYYY-MM-DD
  passRate: number; // 0..1
  avgLatencyMs: number;
  testsRun: number;
  testsPassed: number;
  regressions: string[];
  trend: CanaryScorecardTrend;
};

const SCORECARDS_PATH = path.join(process.cwd(), "data", "canary-scorecards.json");

type ScorecardsFile = { scorecards: unknown };

function normalizeTrend(v: unknown): CanaryScorecardTrend | null {
  return v === "improving" || v === "stable" || v === "declining" ? v : null;
}

function normalizeScorecard(raw: unknown): CanaryScorecard | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const agentId = typeof obj.agentId === "string" ? obj.agentId : "";
  const date = typeof obj.date === "string" ? obj.date : "";
  const passRate = typeof obj.passRate === "number" ? obj.passRate : NaN;
  const avgLatencyMs = typeof obj.avgLatencyMs === "number" ? obj.avgLatencyMs : NaN;
  const testsRun = typeof obj.testsRun === "number" ? obj.testsRun : NaN;
  const testsPassed = typeof obj.testsPassed === "number" ? obj.testsPassed : NaN;
  const regressions = Array.isArray(obj.regressions) ? obj.regressions.filter((r) => typeof r === "string") : [];
  const trend = normalizeTrend(obj.trend);

  if (!agentId || !date || !trend) return null;
  if (!Number.isFinite(passRate) || passRate < 0 || passRate > 1) return null;
  if (!Number.isFinite(avgLatencyMs) || avgLatencyMs < 0) return null;
  if (!Number.isFinite(testsRun) || testsRun < 0) return null;
  if (!Number.isFinite(testsPassed) || testsPassed < 0 || testsPassed > testsRun) return null;

  return {
    agentId,
    date,
    passRate,
    avgLatencyMs,
    testsRun,
    testsPassed,
    regressions,
    trend,
  };
}

export async function readCanaryScorecards(): Promise<CanaryScorecard[]> {
  try {
    const raw = await fs.readFile(SCORECARDS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    const scorecardsValue =
      parsed && typeof parsed === "object" && Array.isArray((parsed as ScorecardsFile).scorecards)
        ? (parsed as ScorecardsFile).scorecards
        : Array.isArray(parsed)
          ? parsed
          : [];

    const scorecards = (scorecardsValue as unknown[])
      .map(normalizeScorecard)
      .filter(Boolean) as CanaryScorecard[];

    // Sort newest first (date desc, then agentId)
    scorecards.sort((a, b) => (b.date === a.date ? a.agentId.localeCompare(b.agentId) : b.date.localeCompare(a.date)));

    return scorecards;
  } catch {
    return [];
  }
}

export function getLatestDate(scorecards: CanaryScorecard[]): string | null {
  if (!scorecards.length) return null;
  // scorecards are sorted desc in readCanaryScorecards, but caller might not rely on it
  return scorecards.reduce((max, s) => (s.date > max ? s.date : max), scorecards[0]!.date);
}

export function isWithinInclusive(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

export function addDaysISO(date: string, days: number): string {
  const [y, m, d] = date.split("-").map((v) => Number(v));
  const base = new Date(Date.UTC(y!, (m! - 1), d!));
  base.setUTCDate(base.getUTCDate() + days);
  const yyyy = base.getUTCFullYear();
  const mm = String(base.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(base.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export type AggregatedScorecard = {
  agentId: string;
  startDate: string;
  endDate: string;
  passRate: number;
  avgLatencyMs: number;
  testsRun: number;
  testsPassed: number;
  regressions: string[];
  trend: CanaryScorecardTrend;
};

export function aggregateScorecards(
  agentId: string,
  scorecards: CanaryScorecard[],
  startDate: string,
  endDate: string
): AggregatedScorecard | null {
  const inRange = scorecards
    .filter((s) => s.agentId === agentId && isWithinInclusive(s.date, startDate, endDate))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (inRange.length === 0) return null;

  const testsRun = inRange.reduce((sum, s) => sum + s.testsRun, 0);
  const testsPassed = inRange.reduce((sum, s) => sum + s.testsPassed, 0);

  const latencyWeighted = inRange.reduce((sum, s) => sum + s.avgLatencyMs * (s.testsRun || 0), 0);
  const avgLatencyMs = testsRun > 0 ? latencyWeighted / testsRun : inRange[inRange.length - 1]!.avgLatencyMs;

  // Use the latest day's trend/regressions for the range summary.
  const latest = inRange[inRange.length - 1]!;

  return {
    agentId,
    startDate,
    endDate,
    passRate: testsRun > 0 ? testsPassed / testsRun : latest.passRate,
    avgLatencyMs,
    testsRun,
    testsPassed,
    regressions: latest.regressions,
    trend: latest.trend,
  };
}
