export type Difficulty = "easy" | "medium" | "hard";

export interface BenchmarkTestCase {
  id: string;
  name: string;
  difficulty: Difficulty;
  passRate: number;
}

export interface BenchmarkCategory {
  id: CategoryId;
  name: string;
  description: string;
  difficultyDistribution: Record<Difficulty, number>;
  methodology: string;
  exampleTestCase: {
    name: string;
    input: string;
    expectedOutput: string;
  };
  testCases: BenchmarkTestCase[];
}

export type CategoryId =
  | "reasoning"
  | "tool-use"
  | "code-generation"
  | "memory-context"
  | "multi-agent-collaboration";

export type AgentBenchmarkScores = Record<CategoryId, number>;

export interface AgentBenchmarkAgent {
  id: string;
  name: string;
  framework: string;
  provider: string;
  model: string;
  scores: AgentBenchmarkScores;
}

export interface AgentBenchmarksData {
  updatedAt: string;
  version: string;
  categories: BenchmarkCategory[];
  agents: AgentBenchmarkAgent[];
}
