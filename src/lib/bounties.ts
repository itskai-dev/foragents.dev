import { promises as fs } from "fs";
import path from "path";
import seedBounties from "@/data/bounties.json";

export type BountyStatus = "open" | "claimed" | "completed";

export type Bounty = {
  id: string;
  title: string;
  description: string;
  requester: string;
  budget: number;
  currency: string;
  status: BountyStatus;
  tags: string[];
  acceptanceCriteria: string[];
  submissions: number;
  createdAt: string; // ISO
  deadline: string; // ISO date
  claim?: {
    claimant: string;
    message: string;
    claimedAt: string;
  };
};

export type CreateBountyInput = {
  title: string;
  description: string;
  budget: number;
  tags: string[];
  requirements: string[];
};

export type ClaimBountyInput = {
  claimant: string;
  message: string;
};

const BOUNTIES_PATH = path.join(process.cwd(), "data", "bounties.json");

function toIsoDate(isoOrDate: string): string {
  if (!isoOrDate) return new Date().toISOString();
  const parsed = new Date(isoOrDate);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function normalizeBounty(raw: Partial<Bounty> & Record<string, unknown>): Bounty {
  const title = typeof raw.title === "string" ? raw.title.trim() : "Untitled bounty";
  const description = typeof raw.description === "string" ? raw.description.trim() : "";

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : `bounty_${Date.now()}`,
    title,
    description,
    requester: typeof raw.requester === "string" && raw.requester.trim() ? raw.requester.trim() : "anonymous",
    budget:
      typeof raw.budget === "number" && Number.isFinite(raw.budget)
        ? raw.budget
        : typeof raw.budget === "string"
          ? Number(raw.budget) || 0
          : 0,
    currency: typeof raw.currency === "string" && raw.currency.trim() ? raw.currency.trim() : "USD",
    status: raw.status === "claimed" || raw.status === "completed" ? raw.status : "open",
    tags: Array.isArray(raw.tags)
      ? raw.tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0).map((tag) => tag.trim())
      : [],
    acceptanceCriteria: Array.isArray(raw.acceptanceCriteria)
      ? raw.acceptanceCriteria
          .filter((criterion): criterion is string => typeof criterion === "string" && criterion.trim().length > 0)
          .map((criterion) => criterion.trim())
      : [],
    submissions: typeof raw.submissions === "number" && Number.isFinite(raw.submissions) ? Math.max(0, Math.floor(raw.submissions)) : 0,
    createdAt:
      typeof raw.createdAt === "string" && raw.createdAt.trim().length > 0
        ? toIsoDate(raw.createdAt)
        : new Date().toISOString(),
    deadline:
      typeof raw.deadline === "string" && raw.deadline.trim().length > 0
        ? raw.deadline
        : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
    claim:
      raw.claim && typeof raw.claim === "object"
        ? {
            claimant:
              typeof (raw.claim as { claimant?: unknown }).claimant === "string"
                ? (raw.claim as { claimant: string }).claimant
                : "",
            message:
              typeof (raw.claim as { message?: unknown }).message === "string"
                ? (raw.claim as { message: string }).message
                : "",
            claimedAt:
              typeof (raw.claim as { claimedAt?: unknown }).claimedAt === "string"
                ? (raw.claim as { claimedAt: string }).claimedAt
                : "",
          }
        : undefined,
  };
}

export async function readBountiesFile(): Promise<Bounty[]> {
  try {
    const raw = await fs.readFile(BOUNTIES_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return (seedBounties as Bounty[]).map((item) => normalizeBounty(item));
    }
    return parsed.map((item) => normalizeBounty(item as Partial<Bounty> & Record<string, unknown>));
  } catch {
    return (seedBounties as Bounty[]).map((item) => normalizeBounty(item));
  }
}

export async function writeBountiesFile(bounties: Bounty[]): Promise<void> {
  const dir = path.dirname(BOUNTIES_PATH);
  await fs.mkdir(dir, { recursive: true });

  const tmp = `${BOUNTIES_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(bounties, null, 2), "utf-8");
  await fs.rename(tmp, BOUNTIES_PATH);
}

export async function getBounties(): Promise<Bounty[]> {
  return readBountiesFile();
}

export async function getBountyById(id: string): Promise<Bounty | undefined> {
  const bounties = await getBounties();
  return bounties.find((bounty) => bounty.id === id);
}

export async function getBountiesByTag(tag: string): Promise<Bounty[]> {
  const q = tag.trim().toLowerCase();
  if (!q) return [];
  const bounties = await getBounties();
  return bounties.filter((bounty) => bounty.tags.some((t) => t.toLowerCase() === q));
}

export async function createBounty(input: CreateBountyInput): Promise<Bounty> {
  const now = new Date();
  const bounties = await readBountiesFile();

  const bounty: Bounty = {
    id: `bounty_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: input.title,
    description: input.description,
    requester: "community",
    budget: input.budget,
    currency: "USD",
    status: "open",
    tags: input.tags,
    acceptanceCriteria: input.requirements,
    submissions: 0,
    createdAt: now.toISOString(),
    deadline: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
  };

  await writeBountiesFile([...bounties, bounty]);
  return bounty;
}

export async function claimBounty(id: string, input: ClaimBountyInput): Promise<Bounty | null> {
  const bounties = await readBountiesFile();
  const index = bounties.findIndex((bounty) => bounty.id === id);

  if (index < 0) return null;

  const existing = bounties[index];
  const updated: Bounty = {
    ...existing,
    status: "claimed",
    claim: {
      claimant: input.claimant,
      message: input.message,
      claimedAt: new Date().toISOString(),
    },
  };

  const next = bounties.slice();
  next[index] = updated;
  await writeBountiesFile(next);

  return updated;
}
