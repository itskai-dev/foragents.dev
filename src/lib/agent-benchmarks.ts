import benchmarks from "@/data/benchmarks.json";

/**
 * Legacy compatibility layer.
 *
 * New benchmark pages use /api/benchmarks and src/lib/benchmarks-store.ts.
 * This file remains to avoid import breakage in older references.
 */

export const agentBenchmarksData = benchmarks;

export function getCompositeScore(): number {
  return 0;
}

export function getCategoryById(): undefined {
  return undefined;
}

export function getTopAgentsByCategory() {
  return [] as Array<Record<string, never>>;
}

export function getOverallLeaderboard() {
  return [] as Array<Record<string, never>>;
}
