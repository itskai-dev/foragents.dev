import { promises as fs } from "fs";
import path from "path";

export type TrustCenterCategory = "security" | "privacy" | "compliance" | "transparency";

export type TrustCenterStatus = "active" | "monitoring" | "planned";

export type TrustCenterEntry = {
  id: string;
  title: string;
  description: string;
  category: TrustCenterCategory;
  status: TrustCenterStatus;
  evidence: string;
  updatedAt: string;
};

type TrustCenterSubmission = {
  title?: unknown;
  description?: unknown;
  category?: unknown;
  status?: unknown;
  evidence?: unknown;
};

const TRUST_CENTER_PATH = path.join(process.cwd(), "data", "trust-center-records.json");

export const TRUST_CENTER_CATEGORIES: TrustCenterCategory[] = [
  "security",
  "privacy",
  "compliance",
  "transparency",
];

export const TRUST_CENTER_STATUSES: TrustCenterStatus[] = ["active", "monitoring", "planned"];

function isTrustCenterEntry(value: unknown): value is TrustCenterEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as Partial<TrustCenterEntry>;

  return (
    typeof entry.id === "string" &&
    typeof entry.title === "string" &&
    typeof entry.description === "string" &&
    typeof entry.category === "string" &&
    TRUST_CENTER_CATEGORIES.includes(entry.category as TrustCenterCategory) &&
    typeof entry.status === "string" &&
    TRUST_CENTER_STATUSES.includes(entry.status as TrustCenterStatus) &&
    typeof entry.evidence === "string" &&
    typeof entry.updatedAt === "string"
  );
}

export async function readTrustCenterEntries(): Promise<TrustCenterEntry[]> {
  try {
    const raw = await fs.readFile(TRUST_CENTER_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((entry): entry is TrustCenterEntry => isTrustCenterEntry(entry))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch {
    return [];
  }
}

export async function writeTrustCenterEntries(entries: TrustCenterEntry[]): Promise<void> {
  await fs.mkdir(path.dirname(TRUST_CENTER_PATH), { recursive: true });
  await fs.writeFile(TRUST_CENTER_PATH, JSON.stringify(entries, null, 2));
}

export function filterTrustCenterEntries(
  entries: TrustCenterEntry[],
  filters: {
    category?: string | null;
    search?: string | null;
  }
): TrustCenterEntry[] {
  const normalizedCategory = filters.category?.trim().toLowerCase() ?? "";
  const normalizedSearch = filters.search?.trim().toLowerCase() ?? "";

  return entries.filter((entry) => {
    const categoryMatch =
      !normalizedCategory ||
      normalizedCategory === "all" ||
      entry.category.toLowerCase() === normalizedCategory;

    if (!categoryMatch) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const haystack = [
      entry.title,
      entry.description,
      entry.category,
      entry.status,
      entry.evidence,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });
}

export function validateTrustCenterSubmission(input: TrustCenterSubmission): {
  errors: string[];
  payload?: {
    title: string;
    description: string;
    category: TrustCenterCategory;
    status: TrustCenterStatus;
    evidence: string;
  };
} {
  const errors: string[] = [];

  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const category = typeof input.category === "string" ? input.category.trim().toLowerCase() : "";
  const status = typeof input.status === "string" ? input.status.trim().toLowerCase() : "";
  const evidence = typeof input.evidence === "string" ? input.evidence.trim() : "";

  if (!title) errors.push("title is required");
  if (!description) errors.push("description is required");
  if (!evidence) errors.push("evidence is required");

  if (!category || !TRUST_CENTER_CATEGORIES.includes(category as TrustCenterCategory)) {
    errors.push(`category must be one of: ${TRUST_CENTER_CATEGORIES.join(", ")}`);
  }

  if (!status || !TRUST_CENTER_STATUSES.includes(status as TrustCenterStatus)) {
    errors.push(`status must be one of: ${TRUST_CENTER_STATUSES.join(", ")}`);
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    errors,
    payload: {
      title,
      description,
      category: category as TrustCenterCategory,
      status: status as TrustCenterStatus,
      evidence,
    },
  };
}

export async function createTrustCenterEntry(input: TrustCenterSubmission): Promise<{
  errors: string[];
  entry?: TrustCenterEntry;
}> {
  const validation = validateTrustCenterSubmission(input);

  if (validation.errors.length > 0 || !validation.payload) {
    return { errors: validation.errors };
  }

  const existing = await readTrustCenterEntries();

  const entry: TrustCenterEntry = {
    id: `trust_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...validation.payload,
    updatedAt: new Date().toISOString(),
  };

  await writeTrustCenterEntries([entry, ...existing]);

  return { errors: [], entry };
}
