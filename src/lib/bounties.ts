import { promises as fs } from "fs";
import path from "path";
import seedBounties from "@/data/bounties.json";

export type BountyStatus = "open" | "claimed" | "submitted" | "completed";
export type BountyAction = "claim" | "submit" | "complete";

export type BountyHistoryEvent = {
  action: BountyAction;
  agentHandle: string;
  at: string;
  notes?: string;
};

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
  latestSubmission?: {
    agentHandle: string;
    notes: string;
    submittedAt: string;
  };
  completedAt?: string;
  completedBy?: string;
  history: BountyHistoryEvent[];
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

export type TransitionBountyInput = {
  bountyId: string;
  action: BountyAction;
  agentHandle: string;
  notes?: string;
};

export type TransitionBountyResult =
  | { ok: true; bounty: Bounty }
  | { ok: false; status: number; error: string };

const BOUNTIES_PATH = path.join(process.cwd(), "data", "bounties.json");

function toIsoDate(isoOrDate: string): string {
  if (!isoOrDate) return new Date().toISOString();
  const parsed = new Date(isoOrDate);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function isBountyStatus(value: unknown): value is BountyStatus {
  return value === "open" || value === "claimed" || value === "submitted" || value === "completed";
}

function normalizeHistory(raw: unknown): BountyHistoryEvent[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((event) => {
      if (!event || typeof event !== "object") return null;
      const action = (event as { action?: unknown }).action;
      if (action !== "claim" && action !== "submit" && action !== "complete") return null;

      const agentHandle =
        typeof (event as { agentHandle?: unknown }).agentHandle === "string"
          ? (event as { agentHandle: string }).agentHandle.trim()
          : "";
      const at =
        typeof (event as { at?: unknown }).at === "string" ? toIsoDate((event as { at: string }).at) : new Date().toISOString();
      const notes =
        typeof (event as { notes?: unknown }).notes === "string"
          ? (event as { notes: string }).notes.trim()
          : undefined;

      if (!agentHandle) return null;

      return {
        action,
        agentHandle,
        at,
        ...(notes ? { notes } : {}),
      } as BountyHistoryEvent;
    })
    .filter((event): event is BountyHistoryEvent => Boolean(event));
}

function normalizeBounty(raw: Partial<Bounty> & Record<string, unknown>): Bounty {
  const title = typeof raw.title === "string" ? raw.title.trim() : "Untitled bounty";
  const description = typeof raw.description === "string" ? raw.description.trim() : "";

  const history = normalizeHistory(raw.history);

  const fallbackClaim =
    raw.claim && typeof raw.claim === "object"
      ? {
          claimant:
            typeof (raw.claim as { claimant?: unknown }).claimant === "string"
              ? (raw.claim as { claimant: string }).claimant.trim()
              : "",
          message:
            typeof (raw.claim as { message?: unknown }).message === "string"
              ? (raw.claim as { message: string }).message.trim()
              : "",
          claimedAt:
            typeof (raw.claim as { claimedAt?: unknown }).claimedAt === "string"
              ? toIsoDate((raw.claim as { claimedAt: string }).claimedAt)
              : "",
        }
      : undefined;

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
    status: isBountyStatus(raw.status) ? raw.status : "open",
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
      typeof raw.createdAt === "string" && raw.createdAt.trim().length > 0 ? toIsoDate(raw.createdAt) : new Date().toISOString(),
    deadline:
      typeof raw.deadline === "string" && raw.deadline.trim().length > 0
        ? raw.deadline
        : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
    claim: fallbackClaim && fallbackClaim.claimant ? fallbackClaim : undefined,
    latestSubmission:
      raw.latestSubmission && typeof raw.latestSubmission === "object"
        ? {
            agentHandle:
              typeof (raw.latestSubmission as { agentHandle?: unknown }).agentHandle === "string"
                ? (raw.latestSubmission as { agentHandle: string }).agentHandle.trim()
                : "",
            notes:
              typeof (raw.latestSubmission as { notes?: unknown }).notes === "string"
                ? (raw.latestSubmission as { notes: string }).notes.trim()
                : "",
            submittedAt:
              typeof (raw.latestSubmission as { submittedAt?: unknown }).submittedAt === "string"
                ? toIsoDate((raw.latestSubmission as { submittedAt: string }).submittedAt)
                : new Date().toISOString(),
          }
        : undefined,
    completedAt: typeof raw.completedAt === "string" && raw.completedAt.trim() ? toIsoDate(raw.completedAt) : undefined,
    completedBy: typeof raw.completedBy === "string" && raw.completedBy.trim() ? raw.completedBy.trim() : undefined,
    history,
  };
}

function canTransition(current: BountyStatus, action: BountyAction): boolean {
  if (current === "open" && action === "claim") return true;
  if (current === "claimed" && action === "submit") return true;
  if (current === "submitted" && action === "complete") return true;
  return false;
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
    history: [],
  };

  await writeBountiesFile([...bounties, bounty]);
  return bounty;
}

export async function claimBounty(id: string, input: ClaimBountyInput): Promise<Bounty | null> {
  const result = await transitionBounty({
    bountyId: id,
    action: "claim",
    agentHandle: input.claimant,
    notes: input.message,
  });

  if (!result.ok) return null;
  return result.bounty;
}

export async function transitionBounty(input: TransitionBountyInput): Promise<TransitionBountyResult> {
  const bounties = await readBountiesFile();
  const index = bounties.findIndex((bounty) => bounty.id === input.bountyId);

  if (index < 0) {
    return { ok: false, status: 404, error: "Bounty not found" };
  }

  const existing = bounties[index];

  if (!canTransition(existing.status, input.action)) {
    return {
      ok: false,
      status: 409,
      error: `Invalid transition: cannot ${input.action} when bounty is ${existing.status}`,
    };
  }

  const now = new Date().toISOString();
  const nextStatus: BountyStatus =
    input.action === "claim" ? "claimed" : input.action === "submit" ? "submitted" : "completed";

  const updated: Bounty = {
    ...existing,
    status: nextStatus,
    history: [
      ...(existing.history ?? []),
      {
        action: input.action,
        agentHandle: input.agentHandle,
        at: now,
        ...(input.notes ? { notes: input.notes } : {}),
      },
    ],
    ...(input.action === "submit" ? { submissions: existing.submissions + 1 } : {}),
    ...(input.action === "claim"
      ? {
          claim: {
            claimant: input.agentHandle,
            message: input.notes ?? "Claimed",
            claimedAt: now,
          },
        }
      : {}),
    ...(input.action === "submit"
      ? {
          latestSubmission: {
            agentHandle: input.agentHandle,
            notes: input.notes ?? "Submission provided",
            submittedAt: now,
          },
        }
      : {}),
    ...(input.action === "complete"
      ? {
          completedAt: now,
          completedBy: input.agentHandle,
        }
      : {}),
  };

  const next = bounties.slice();
  next[index] = updated;
  await writeBountiesFile(next);

  return { ok: true, bounty: updated };
}
