import bountiesData from "@/data/bounties.json";

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
  createdAt: string; // YYYY-MM-DD
  deadline: string; // YYYY-MM-DD
};

function normalizeBounty(raw: Bounty): Bounty {
  return {
    ...raw,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    acceptanceCriteria: Array.isArray(raw.acceptanceCriteria) ? raw.acceptanceCriteria : [],
    submissions: typeof raw.submissions === "number" ? raw.submissions : 0,
  };
}

export function getBounties(): Bounty[] {
  const items = (bountiesData as unknown as Bounty[]).map(normalizeBounty);
  return items;
}

export function getBountyById(id: string): Bounty | undefined {
  return getBounties().find((b) => b.id === id);
}

export function getBountiesByTag(tag: string): Bounty[] {
  const q = tag.trim().toLowerCase();
  if (!q) return [];
  return getBounties().filter((b) => b.tags.some((t) => t.toLowerCase() === q));
}
