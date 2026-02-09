import modelEconomicsData from "@/data/model-economics.json";

export interface ModelEconomics {
  id: string;
  name: string;
  provider: string;
  family: string;
  inputPricePer1M: number;
  outputPricePer1M: number;
  contextWindow: number;
  speedRating: number;
  qualityRating: number;
  recommendedFor: string[];
}

export type TaskType =
  | "code-review"
  | "bug-fix"
  | "feature-build"
  | "docs"
  | "testing";

export const modelEconomics = modelEconomicsData as ModelEconomics[];

export const taskProfiles: Record<TaskType, { label: string; inputTokens: number; outputTokens: number }> = {
  "code-review": { label: "Code review", inputTokens: 4200, outputTokens: 1100 },
  "bug-fix": { label: "Bug fix", inputTokens: 6200, outputTokens: 1800 },
  "feature-build": { label: "Feature build", inputTokens: 12000, outputTokens: 4200 },
  docs: { label: "Documentation", inputTokens: 3500, outputTokens: 1700 },
  testing: { label: "Testing", inputTokens: 7000, outputTokens: 2300 },
};

export const complexityMultipliers = {
  low: 0.7,
  medium: 1,
  high: 1.5,
  extreme: 2.2,
} as const;

export type ComplexityKey = keyof typeof complexityMultipliers;

export function calculateTokenCostUSD(model: ModelEconomics, inputTokens: number, outputTokens: number) {
  const inputCost = (inputTokens / 1_000_000) * model.inputPricePer1M;
  const outputCost = (outputTokens / 1_000_000) * model.outputPricePer1M;
  return inputCost + outputCost;
}

export function blendedPricePer1M(model: ModelEconomics) {
  return (model.inputPricePer1M + model.outputPricePer1M) / 2;
}

export function costEfficiencyScore(model: ModelEconomics) {
  const efficiencyBase = model.qualityRating / Math.max(blendedPricePer1M(model), 0.1);
  return efficiencyBase * 10;
}
