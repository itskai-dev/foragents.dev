import { promises as fs } from "fs";
import path from "path";

export type KitRequest = {
  id: string;
  kitName: string;
  description: string;
  useCase: string;
  requesterAgentId: string | null;
  createdAt: string;
};

export type KitRequestsFile = {
  requests: KitRequest[];
  votes: Record<string, number>;
};

const REQUESTS_PATH = path.join(process.cwd(), "data", "kit-requests.json");

export function getRequestsPath() {
  return REQUESTS_PATH;
}

export async function readKitRequestsFile(): Promise<KitRequestsFile> {
  try {
    const raw = await fs.readFile(REQUESTS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!parsed || typeof parsed !== "object") return { requests: [], votes: {} };
    const obj = parsed as Partial<KitRequestsFile>;

    return {
      requests: Array.isArray(obj.requests) ? (obj.requests as KitRequest[]) : [],
      votes: obj.votes && typeof obj.votes === "object" ? (obj.votes as Record<string, number>) : {},
    };
  } catch {
    return { requests: [], votes: {} };
  }
}

export async function writeKitRequestsFile(data: KitRequestsFile): Promise<void> {
  const dir = path.dirname(REQUESTS_PATH);
  await fs.mkdir(dir, { recursive: true });

  // Atomic-ish write: write to temp then rename.
  const tmp = `${REQUESTS_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tmp, REQUESTS_PATH);
}

export function getVotesForRequest(id: string, file: KitRequestsFile): number {
  const v = file.votes[id];
  return typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
}

export function sortRequestsByVotes(
  requests: Array<KitRequest & { votes: number }>
): Array<KitRequest & { votes: number }> {
  return [...requests].sort((a, b) => {
    if (b.votes !== a.votes) return b.votes - a.votes;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function makeRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
