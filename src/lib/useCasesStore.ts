import { promises as fs } from "fs";
import path from "path";

export type UseCaseIndustry =
  | "devops"
  | "customer-support"
  | "data-analysis"
  | "content-creation"
  | "security"
  | "automation";

export type UseCaseResult = {
  label: string;
  value: string;
};

export type UseCaseEntry = {
  id: string;
  title: string;
  description: string;
  industry: UseCaseIndustry;
  agentStack: string[];
  results: UseCaseResult[];
  author: string;
  likes: number;
  createdAt: string;
};

type UseCaseSubmission = {
  title?: unknown;
  description?: unknown;
  industry?: unknown;
  agentStack?: unknown;
  results?: unknown;
  author?: unknown;
};

const USE_CASES_PATH = path.join(process.cwd(), "data", "use-cases.json");

export const USE_CASE_INDUSTRIES: UseCaseIndustry[] = [
  "devops",
  "customer-support",
  "data-analysis",
  "content-creation",
  "security",
  "automation",
];

function isUseCaseResult(value: unknown): value is UseCaseResult {
  if (!value || typeof value !== "object") return false;
  const metric = value as Partial<UseCaseResult>;
  return typeof metric.label === "string" && typeof metric.value === "string";
}

function isUseCaseEntry(value: unknown): value is UseCaseEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<UseCaseEntry>;

  return (
    typeof entry.id === "string" &&
    typeof entry.title === "string" &&
    typeof entry.description === "string" &&
    typeof entry.industry === "string" &&
    USE_CASE_INDUSTRIES.includes(entry.industry as UseCaseIndustry) &&
    Array.isArray(entry.agentStack) &&
    entry.agentStack.every((tool) => typeof tool === "string") &&
    Array.isArray(entry.results) &&
    entry.results.every((metric) => isUseCaseResult(metric)) &&
    typeof entry.author === "string" &&
    typeof entry.likes === "number" &&
    typeof entry.createdAt === "string"
  );
}

function normalizeAgentStack(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeResults(value: unknown): UseCaseResult[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((metric): UseCaseResult | null => {
      if (!metric || typeof metric !== "object") return null;
      const item = metric as Partial<UseCaseResult>;
      if (typeof item.label !== "string" || typeof item.value !== "string") return null;

      const label = item.label.trim();
      const metricValue = item.value.trim();

      if (!label || !metricValue) return null;
      return { label, value: metricValue };
    })
    .filter((metric): metric is UseCaseResult => metric !== null);
}

export async function readUseCases(): Promise<UseCaseEntry[]> {
  try {
    const raw = await fs.readFile(USE_CASES_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((entry): entry is UseCaseEntry => isUseCaseEntry(entry))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export async function writeUseCases(useCases: UseCaseEntry[]): Promise<void> {
  await fs.mkdir(path.dirname(USE_CASES_PATH), { recursive: true });
  await fs.writeFile(USE_CASES_PATH, JSON.stringify(useCases, null, 2));
}

export function filterUseCases(
  useCases: UseCaseEntry[],
  filters: {
    industry?: string | null;
    search?: string | null;
  }
): UseCaseEntry[] {
  const normalizedIndustry = filters.industry?.trim().toLowerCase() || "";
  const normalizedSearch = filters.search?.trim().toLowerCase() || "";

  return useCases.filter((entry) => {
    const industryMatch =
      !normalizedIndustry ||
      normalizedIndustry === "all" ||
      entry.industry.toLowerCase() === normalizedIndustry;

    if (!industryMatch) return false;

    if (!normalizedSearch) return true;

    const haystack = [
      entry.title,
      entry.description,
      entry.author,
      entry.industry,
      entry.agentStack.join(" "),
      entry.results.map((metric) => `${metric.label} ${metric.value}`).join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });
}

export function validateUseCaseSubmission(input: UseCaseSubmission): {
  errors: string[];
  payload?: {
    title: string;
    description: string;
    industry: UseCaseIndustry;
    agentStack: string[];
    results: UseCaseResult[];
    author: string;
  };
} {
  const errors: string[] = [];

  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const industry = typeof input.industry === "string" ? input.industry.trim().toLowerCase() : "";
  const author = typeof input.author === "string" ? input.author.trim() : "";
  const agentStack = normalizeAgentStack(input.agentStack);
  const results = normalizeResults(input.results);

  if (!title) errors.push("title is required");
  if (!description) errors.push("description is required");
  if (!author) errors.push("author is required");

  if (!industry || !USE_CASE_INDUSTRIES.includes(industry as UseCaseIndustry)) {
    errors.push(`industry must be one of: ${USE_CASE_INDUSTRIES.join(", ")}`);
  }

  if (agentStack.length === 0) {
    errors.push("agentStack must include at least one tool");
  }

  if (results.length === 0) {
    errors.push("results must include at least one metric");
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    errors,
    payload: {
      title,
      description,
      industry: industry as UseCaseIndustry,
      agentStack,
      results,
      author,
    },
  };
}

export async function createUseCase(input: UseCaseSubmission): Promise<{
  errors: string[];
  useCase?: UseCaseEntry;
}> {
  const validation = validateUseCaseSubmission(input);
  if (validation.errors.length > 0 || !validation.payload) {
    return { errors: validation.errors };
  }

  const useCases = await readUseCases();

  const useCase: UseCaseEntry = {
    id: `usecase_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...validation.payload,
    likes: 0,
    createdAt: new Date().toISOString(),
  };

  await writeUseCases([useCase, ...useCases]);

  return {
    errors: [],
    useCase,
  };
}

export async function likeUseCase(id: string): Promise<UseCaseEntry | null> {
  const useCases = await readUseCases();
  const index = useCases.findIndex((entry) => entry.id === id);

  if (index === -1) {
    return null;
  }

  const updated: UseCaseEntry = {
    ...useCases[index]!,
    likes: (useCases[index]!.likes || 0) + 1,
  };

  const next = [...useCases];
  next[index] = updated;

  await writeUseCases(next);
  return updated;
}
