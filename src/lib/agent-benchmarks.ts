import rawData from "@/data/agent-benchmarks.json";
import type {
  AgentBenchmarkAgent,
  AgentBenchmarksData,
  BenchmarkCategory,
  CategoryId,
} from "@/types/agent-benchmarks";

export const agentBenchmarksData = rawData as AgentBenchmarksData;

export function getCompositeScore(agent: AgentBenchmarkAgent): number {
  const values = Object.values(agent.scores);
  const total = values.reduce((sum, score) => sum + score, 0);
  return Number((total / values.length).toFixed(1));
}

export function getCategoryById(categoryId: string): BenchmarkCategory | undefined {
  return agentBenchmarksData.categories.find((category) => category.id === categoryId);
}

export function getTopAgentsByCategory(categoryId: CategoryId, limit = 5) {
  return [...agentBenchmarksData.agents]
    .sort((a, b) => b.scores[categoryId] - a.scores[categoryId])
    .slice(0, limit)
    .map((agent) => ({
      ...agent,
      score: agent.scores[categoryId],
    }));
}

export function getOverallLeaderboard() {
  return [...agentBenchmarksData.agents]
    .map((agent) => ({
      ...agent,
      compositeScore: getCompositeScore(agent),
    }))
    .sort((a, b) => b.compositeScore - a.compositeScore);
}
