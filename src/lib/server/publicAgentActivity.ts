import "server-only";

import { promises as fs } from "fs";
import path from "path";

import type { ArtifactComment, ArtifactRating } from "@/lib/server/artifactFeedback";
import { normalizeHandle } from "@/lib/agentInboxEvents";

export type PublicAgentActivityItem =
  | {
      type: "comment";
      id: string;
      created_at: string;
      artifact_id: string;
      body_text: string;
    }
  | {
      type: "rating";
      id: string;
      created_at: string;
      artifact_id: string;
      score: number;
    };

const COMMENTS_PATH = path.join(process.cwd(), "data", "artifact_comments.json");
const RATINGS_PATH = path.join(process.cwd(), "data", "artifact_ratings.json");

async function readJsonArrayFile<T>(p: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(p, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function matchesHandle(handleParam: string, candidate: string | undefined): boolean {
  const h = normalizeHandle(handleParam).toLowerCase();
  const c = normalizeHandle(candidate ?? "").toLowerCase();
  if (!h || !c) return false;
  if (c === h) return true;
  // Support full handles like kai@reflectt.ai
  if (c.startsWith(`${h}@`)) return true;
  return false;
}

export async function listPublicAgentActivity(params: {
  handle: string;
  limit?: number;
}): Promise<{ items: PublicAgentActivityItem[]; updated_at: string }> {
  const limit = Math.min(50, Math.max(1, params.limit ?? 10));

  const [comments, ratings] = await Promise.all([
    readJsonArrayFile<ArtifactComment>(COMMENTS_PATH),
    readJsonArrayFile<ArtifactRating>(RATINGS_PATH),
  ]);

  const items: PublicAgentActivityItem[] = [];

  for (const c of comments) {
    if ((c.status ?? "visible") !== "visible") continue;
    if (!matchesHandle(params.handle, c.author?.handle)) continue;
    items.push({
      type: "comment",
      id: c.id,
      created_at: c.created_at,
      artifact_id: c.artifact_id,
      body_text: String(c.body_text ?? "").slice(0, 240),
    });
  }

  for (const r of ratings) {
    if (!matchesHandle(params.handle, r.rater?.handle)) continue;
    items.push({
      type: "rating",
      id: r.id,
      created_at: r.updated_at,
      artifact_id: r.artifact_id,
      score: r.score,
    });
  }

  items.sort((a, b) => {
    const ta = new Date(a.created_at).getTime();
    const tb = new Date(b.created_at).getTime();
    if (ta !== tb) return tb - ta;
    return b.id.localeCompare(a.id);
  });

  return { items: items.slice(0, limit), updated_at: new Date().toISOString() };
}

export async function getPublicAgentActivityBadge(handle: string): Promise<{
  count7d: number;
  lastActiveAt: string | null;
}> {
  const sinceT = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const { items } = await listPublicAgentActivity({ handle, limit: 50 });

  const recent = items.filter((i) => new Date(i.created_at).getTime() >= sinceT);
  return {
    count7d: recent.length,
    lastActiveAt: items[0]?.created_at ?? null,
  };
}

export async function getPublicAgentActivityBadges(handles: string[]): Promise<
  Record<string, { count7d: number; lastActiveAt: string | null }>
> {
  const uniq = Array.from(new Set((handles ?? []).map((h) => normalizeHandle(h).toLowerCase()).filter(Boolean)));
  const out: Record<string, { count7d: number; lastActiveAt: string | null }> = {};
  if (uniq.length === 0) return out;

  const sinceT = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const [comments, ratings] = await Promise.all([
    readJsonArrayFile<ArtifactComment>(COMMENTS_PATH),
    readJsonArrayFile<ArtifactRating>(RATINGS_PATH),
  ]);

  // Build authored activity items per handle (newest first after sort)
  const itemsByHandle = new Map<string, PublicAgentActivityItem[]>();
  for (const h of uniq) itemsByHandle.set(h, []);

  for (const c of comments) {
    if ((c.status ?? "visible") !== "visible") continue;
    for (const h of uniq) {
      if (!matchesHandle(h, c.author?.handle)) continue;
      itemsByHandle.get(h)!.push({
        type: "comment",
        id: c.id,
        created_at: c.created_at,
        artifact_id: c.artifact_id,
        body_text: String(c.body_text ?? "").slice(0, 240),
      });
    }
  }

  for (const r of ratings) {
    for (const h of uniq) {
      if (!matchesHandle(h, r.rater?.handle)) continue;
      itemsByHandle.get(h)!.push({
        type: "rating",
        id: r.id,
        created_at: r.updated_at,
        artifact_id: r.artifact_id,
        score: r.score,
      });
    }
  }

  for (const h of uniq) {
    const items = itemsByHandle.get(h) ?? [];
    items.sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      if (ta !== tb) return tb - ta;
      return b.id.localeCompare(a.id);
    });

    const recent = items.filter((i) => new Date(i.created_at).getTime() >= sinceT);
    out[h] = { count7d: recent.length, lastActiveAt: items[0]?.created_at ?? null };
  }

  return out;
}
