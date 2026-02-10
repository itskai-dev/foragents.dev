import { promises as fs } from "fs";
import path from "path";

export type KitRequest = {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
};

type LegacyKitRequest = {
  id?: unknown;
  title?: unknown;
  kitName?: unknown;
  description?: unknown;
  category?: unknown;
  createdAt?: unknown;
  votes?: unknown;
};

export type KitRequestsFile = {
  requests: KitRequest[];
  votes: Record<string, number>;
};

const REQUESTS_PATH = path.join(process.cwd(), "data", "kit-requests.json");

export function getRequestsPath() {
  return REQUESTS_PATH;
}

function normalizeRequest(raw: LegacyKitRequest): KitRequest | null {
  const id = typeof raw.id === "string" ? raw.id : "";
  if (!id) return null;

  const title =
    typeof raw.title === "string" && raw.title.trim()
      ? raw.title.trim()
      : typeof raw.kitName === "string" && raw.kitName.trim()
        ? raw.kitName.trim()
        : "Untitled request";

  const description =
    typeof raw.description === "string" && raw.description.trim()
      ? raw.description.trim()
      : "No description provided";

  const category =
    typeof raw.category === "string" && raw.category.trim()
      ? raw.category.trim().toLowerCase()
      : "general";

  const createdAt =
    typeof raw.createdAt === "string" && raw.createdAt.trim()
      ? raw.createdAt
      : new Date(0).toISOString();

  return {
    id,
    title,
    description,
    category,
    createdAt,
  };
}

export async function readKitRequestsFile(): Promise<KitRequestsFile> {
  try {
    const raw = await fs.readFile(REQUESTS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!parsed || typeof parsed !== "object") return { requests: [], votes: {} };
    const obj = parsed as Partial<KitRequestsFile> & { requests?: LegacyKitRequest[] };

    const requests = Array.isArray(obj.requests)
      ? obj.requests
          .map((request) => normalizeRequest(request))
          .filter((request): request is KitRequest => Boolean(request))
      : [];

    return {
      requests,
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

export function sortRequests(
  requests: Array<KitRequest & { votes: number }>,
  sort: "votes" | "recent" = "votes"
): Array<KitRequest & { votes: number }> {
  return [...requests].sort((a, b) => {
    if (sort === "recent") {
      return b.createdAt.localeCompare(a.createdAt);
    }

    if (b.votes !== a.votes) return b.votes - a.votes;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function makeRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
