import { promises as fs } from "fs";
import path from "path";

export type ContributionType = "skills" | "docs" | "testing" | "design" | "translations" | "community";
export type ContributionStatus = "pending" | "approved" | "merged";
export type GuideDifficulty = "beginner" | "intermediate" | "advanced";

export type ContributionGuide = {
  id: string;
  title: string;
  description: string;
  category: ContributionType;
  difficulty: GuideDifficulty;
  estimatedTime: string;
  steps: string[];
};

export type Contribution = {
  id: string;
  title: string;
  type: ContributionType;
  description: string;
  author: string;
  status: ContributionStatus;
  url: string;
  createdAt: string;
  submitterEmail?: string;
};

type ContributionInput = {
  title?: string;
  type: string;
  description: string;
  author: string;
  email: string;
  url?: string;
};

type ContributionFilters = {
  type?: string;
  status?: string;
  author?: string;
  search?: string;
  limit?: number;
};

const GUIDES_PATH = path.join(process.cwd(), "data", "contribution-guides.json");
const CONTRIBUTIONS_PATH = path.join(process.cwd(), "data", "contributions.json");

export const CONTRIBUTION_TYPES: ContributionType[] = ["skills", "docs", "testing", "design", "translations", "community"];
export const CONTRIBUTION_STATUSES: ContributionStatus[] = ["pending", "approved", "merged"];

function isContributionType(value: string): value is ContributionType {
  return CONTRIBUTION_TYPES.includes(value as ContributionType);
}

function isContributionStatus(value: string): value is ContributionStatus {
  return CONTRIBUTION_STATUSES.includes(value as ContributionStatus);
}

export async function readContributionGuides(): Promise<ContributionGuide[]> {
  const raw = await fs.readFile(GUIDES_PATH, "utf-8");
  const parsed = JSON.parse(raw) as unknown;
  return Array.isArray(parsed) ? (parsed as ContributionGuide[]) : [];
}

export async function readContributions(): Promise<Contribution[]> {
  try {
    const raw = await fs.readFile(CONTRIBUTIONS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Contribution[]) : [];
  } catch {
    return [];
  }
}

export async function writeContributions(contributions: Contribution[]) {
  await fs.mkdir(path.dirname(CONTRIBUTIONS_PATH), { recursive: true });
  const tmpPath = `${CONTRIBUTIONS_PATH}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(contributions, null, 2), "utf-8");
  await fs.rename(tmpPath, CONTRIBUTIONS_PATH);
}

function normalizeTitle(title: string | undefined, description: string) {
  if (title && title.trim()) {
    return title.trim().slice(0, 120);
  }

  const fallback = description.trim().slice(0, 80);
  return fallback.length > 0 ? fallback : "New contribution";
}

export function filterContributions(contributions: Contribution[], filters: ContributionFilters): Contribution[] {
  const type = filters.type?.trim().toLowerCase() ?? "";
  const status = filters.status?.trim().toLowerCase() ?? "";
  const author = filters.author?.trim().toLowerCase() ?? "";
  const search = filters.search?.trim().toLowerCase() ?? "";
  const limit = typeof filters.limit === "number" && Number.isFinite(filters.limit)
    ? Math.max(1, Math.min(Math.floor(filters.limit), 50))
    : 12;

  return [...contributions]
    .filter((contribution) => {
      if (type && contribution.type !== type) return false;
      if (status && contribution.status !== status) return false;
      if (author && !contribution.author.toLowerCase().includes(author)) return false;

      if (!search) return true;
      const haystack = [
        contribution.title,
        contribution.description,
        contribution.author,
        contribution.type,
        contribution.status,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function createContribution(input: ContributionInput): Contribution {
  const typeRaw = input.type.trim().toLowerCase();
  if (!isContributionType(typeRaw)) {
    throw new Error(`type must be one of: ${CONTRIBUTION_TYPES.join(", ")}`);
  }

  if (!/^\S+@\S+\.\S+$/.test(input.email.trim())) {
    throw new Error("email must be a valid email address.");
  }

  const author = input.author.trim();
  const description = input.description.trim();

  if (!author || !description) {
    throw new Error("author and description are required.");
  }

  const url = (input.url ?? "").trim();
  const safeUrl = url && /^https?:\/\//.test(url) ? url : "";

  return {
    id: `contrib_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: normalizeTitle(input.title, description),
    type: typeRaw,
    description,
    author,
    status: "pending",
    url: safeUrl,
    createdAt: new Date().toISOString(),
    submitterEmail: input.email.trim(),
  };
}

export function getValidFilters(filters: ContributionFilters) {
  const type = filters.type?.trim().toLowerCase();
  const status = filters.status?.trim().toLowerCase();

  if (type && !isContributionType(type)) {
    throw new Error(`type must be one of: ${CONTRIBUTION_TYPES.join(", ")}`);
  }

  if (status && !isContributionStatus(status)) {
    throw new Error(`status must be one of: ${CONTRIBUTION_STATUSES.join(", ")}`);
  }

  return {
    type,
    status,
    author: filters.author,
    search: filters.search,
    limit: filters.limit,
  };
}
