import productivityData from "@/data/agent-productivity.json";

export const PERIODS = ["7d", "30d", "90d"] as const;

export type ProductivityPeriod = (typeof PERIODS)[number];

export type PeriodMetrics = {
  tasksCompleted: number;
  avgTimeSavedMinutes: number;
  totalCostSavings: number;
  modelApiCost: number;
  estimatedHumanCost: number;
  qualityScore: number;
  reworkRate: number;
  testPassRate: number;
  firstAttemptSuccess: number;
  costEfficiency: number;
};

export type DailyPerformance = {
  date: string;
  tasksCompleted: number;
  qualityScore: number;
};

export type TaskHistoryItem = {
  id: string;
  taskName: string;
  completedAt: string;
  completionMinutes: number;
  tokensUsed: number;
  qualityScore: number;
  apiCost: number;
  humanLaborCost: number;
  artifactUrl: string;
};

export type AgentProductivity = {
  slug: string;
  name: string;
  avatar: string;
  stack: string[];
  trustTier: string;
  uptime: number;
  periods: Record<ProductivityPeriod, PeriodMetrics>;
  dailyPerformance: DailyPerformance[];
  taskHistory: TaskHistoryItem[];
  comparisonBadge: "Top 10% efficiency" | "Above average quality";
};

export type ProductivityData = {
  generatedAt: string;
  currency: string;
  agents: AgentProductivity[];
};

export function getProductivityData(): ProductivityData {
  return productivityData as ProductivityData;
}

export function getAgentProductivity(slug: string): AgentProductivity | null {
  const data = getProductivityData();
  return data.agents.find((agent) => agent.slug === slug) ?? null;
}

export function getOverview(period: ProductivityPeriod): PeriodMetrics & {
  totalTasksCompleted: number;
  avgTimeSavedMinutes: number;
  totalCostSavings: number;
} {
  const data = getProductivityData();
  const totals = data.agents.reduce(
    (acc, agent) => {
      const metrics = agent.periods[period];
      acc.totalTasksCompleted += metrics.tasksCompleted;
      acc.totalCostSavings += metrics.totalCostSavings;
      acc.totalTimeSavedMinutes += metrics.avgTimeSavedMinutes * metrics.tasksCompleted;
      acc.weightedTaskCount += metrics.tasksCompleted;
      acc.modelApiCost += metrics.modelApiCost;
      acc.estimatedHumanCost += metrics.estimatedHumanCost;
      acc.reworkRate += metrics.reworkRate;
      acc.testPassRate += metrics.testPassRate;
      acc.firstAttemptSuccess += metrics.firstAttemptSuccess;
      acc.qualityScore += metrics.qualityScore;
      acc.costEfficiency += metrics.costEfficiency;
      return acc;
    },
    {
      totalTasksCompleted: 0,
      totalCostSavings: 0,
      totalTimeSavedMinutes: 0,
      weightedTaskCount: 0,
      modelApiCost: 0,
      estimatedHumanCost: 0,
      reworkRate: 0,
      testPassRate: 0,
      firstAttemptSuccess: 0,
      qualityScore: 0,
      costEfficiency: 0,
    }
  );

  const divisor = data.agents.length || 1;

  return {
    totalTasksCompleted: totals.totalTasksCompleted,
    avgTimeSavedMinutes:
      totals.weightedTaskCount > 0
        ? Number((totals.totalTimeSavedMinutes / totals.weightedTaskCount).toFixed(1))
        : 0,
    totalCostSavings: Number(totals.totalCostSavings.toFixed(2)),
    tasksCompleted: totals.totalTasksCompleted,
    modelApiCost: Number(totals.modelApiCost.toFixed(2)),
    estimatedHumanCost: Number(totals.estimatedHumanCost.toFixed(2)),
    qualityScore: Number((totals.qualityScore / divisor).toFixed(1)),
    reworkRate: Number((totals.reworkRate / divisor).toFixed(1)),
    testPassRate: Number((totals.testPassRate / divisor).toFixed(1)),
    firstAttemptSuccess: Number((totals.firstAttemptSuccess / divisor).toFixed(1)),
    costEfficiency: Number((totals.costEfficiency / divisor).toFixed(1)),
  };
}
