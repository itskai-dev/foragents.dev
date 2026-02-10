import { promises as fs } from "fs";
import path from "path";

export const governanceCategories = ["data-handling", "access-control", "monitoring", "ethics"] as const;
export const governanceStatuses = ["active", "draft", "review"] as const;

export type GovernanceCategory = (typeof governanceCategories)[number];
export type GovernanceStatus = (typeof governanceStatuses)[number];

export interface GovernancePolicy {
  id: string;
  title: string;
  description: string;
  category: GovernanceCategory;
  status: GovernanceStatus;
  version: string;
  approvedBy: string;
  effectiveDate: string;
  reviewDate: string;
}

const GOVERNANCE_PATH = path.join(process.cwd(), "data", "governance-policies.json");

export function isGovernanceCategory(value: string): value is GovernanceCategory {
  return governanceCategories.includes(value as GovernanceCategory);
}

export function isGovernanceStatus(value: string): value is GovernanceStatus {
  return governanceStatuses.includes(value as GovernanceStatus);
}

export async function readGovernancePolicies(): Promise<GovernancePolicy[]> {
  const raw = await fs.readFile(GOVERNANCE_PATH, "utf-8");
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter((item): item is GovernancePolicy => {
    if (!item || typeof item !== "object") return false;

    const record = item as Record<string, unknown>;

    return (
      typeof record.id === "string" &&
      typeof record.title === "string" &&
      typeof record.description === "string" &&
      typeof record.category === "string" &&
      isGovernanceCategory(record.category) &&
      typeof record.status === "string" &&
      isGovernanceStatus(record.status) &&
      typeof record.version === "string" &&
      typeof record.approvedBy === "string" &&
      typeof record.effectiveDate === "string" &&
      typeof record.reviewDate === "string"
    );
  });
}

export async function writeGovernancePolicies(policies: GovernancePolicy[]): Promise<void> {
  await fs.writeFile(GOVERNANCE_PATH, `${JSON.stringify(policies, null, 2)}\n`, "utf-8");
}

export function slugifyPolicyId(input: string): string {
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return normalized || `policy-${Date.now()}`;
}
