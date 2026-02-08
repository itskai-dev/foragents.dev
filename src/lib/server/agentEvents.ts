import "server-only";

import { promises as fs } from "fs";
import path from "path";

import { getSupabase } from "@/lib/supabase";
import { decodeCursor, encodeCursor, isNewerThanCursor } from "@/lib/agentCursor";
import {
  compareEventTupleDesc,
  decodeAgentInboxCursor,
  encodeAgentInboxCursor,
  extractMentionHandles,
  isStrictlyOlderThanCursor,
  normalizeHandle,
  type AgentInboxEventItem,
  type AgentInboxEventType,
} from "@/lib/agentInboxEvents";
import type { Artifact } from "@/lib/artifactsShared";
import type { ArtifactComment, ArtifactRating } from "@/lib/server/artifactFeedback";

export type AgentEventType = AgentInboxEventType;
export type AgentEventItem = AgentInboxEventItem<ArtifactComment, ArtifactRating>;

const COMMENTS_PATH = path.join(process.cwd(), "data", "artifact_comments.json");
const RATINGS_PATH = path.join(process.cwd(), "data", "artifact_ratings.json");
const ARTIFACTS_PATH = path.join(process.cwd(), "data", "artifacts.json");

function isMissingTable(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: unknown }).code;
  return code === "PGRST205";
}

async function readJsonArrayFile<T>(p: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(p, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function cmpTupleAsc(a: { created_at: string; id: string }, b: { created_at: string; id: string }): number {
  const ta = new Date(a.created_at).getTime();
  const tb = new Date(b.created_at).getTime();
  if (ta !== tb) return ta - tb;
  return a.id.localeCompare(b.id);
}

function toCommentEventId(comment: Pick<ArtifactComment, "id">): string {
  return `comment:${comment.id}`;
}

function toRatingEventId(rating: Pick<ArtifactRating, "id">): string {
  return `rating:${rating.id}`;
}

function toMentionEventId(comment: Pick<ArtifactComment, "id">, handle: string): string {
  return `mention:${comment.id}:${normalizeHandle(handle)}`;
}

function parseSinceIso(since: string | null | undefined): string | null {
  if (!since) return null;
  const t = new Date(since).getTime();
  if (!Number.isFinite(t)) return null;
  return new Date(t).toISOString();
}

/**
 * Cursor-based pagination for an agent's inbox events.
 *
 * - Newest-first
 * - Stable cursor (no duplicates)
 * - Supports ?since=<ISO timestamp>
 */
export async function listAgentEvents(params: {
  agent_handle: string;
  cursor?: string | null;
  limit?: number;
  since?: string | null;
  artifact_id?: string | null;
}): Promise<{ items: AgentEventItem[]; next_cursor: string | null; updated_at: string }> {
  const limit = Math.min(100, Math.max(1, params.limit ?? 50));
  const cursor = decodeAgentInboxCursor(params.cursor);
  const sinceIso = parseSinceIso(params.since);

  const agentHandleNorm = normalizeHandle(params.agent_handle).toLowerCase();
  const artifactFilter = params.artifact_id ?? null;

  const supabase = getSupabase();
  if (supabase) {
    // Fetch windows from each source, then merge + paginate in-memory.
    const windowSize = Math.min(500, Math.max(50, limit * 10));

    const events: AgentEventItem[] = [];

    // -----------------
    // Comments
    // -----------------
    let cq = supabase
      .from("artifact_comments")
      .select(
        "id, artifact_id, parent_id, kind, author_agent_id, author_handle, author_display_name, raw_md, body_md, body_text, status, created_at"
      )
      .eq("status", "visible")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(windowSize);

    if (artifactFilter) cq = cq.eq("artifact_id", artifactFilter);
    if (sinceIso) cq = cq.gte("created_at", sinceIso);
    if (cursor) cq = cq.lte("created_at", cursor.created_at);

    const { data: cData, error: cErr } = await cq;
    if (cErr) {
      if (!isMissingTable(cErr)) {
        console.error("Supabase listAgentEvents comments error:", cErr);
        throw new Error("Database error");
      }
      // fall through to file-backed below
    } else {
      const comments = (cData ?? []).map(
        (d) =>
          ({
            id: d.id,
            artifact_id: d.artifact_id,
            parent_id: d.parent_id,
            kind: d.kind,
            raw_md: d.raw_md,
            body_md: d.body_md,
            body_text: d.body_text,
            status: d.status,
            author: {
              agent_id: d.author_agent_id,
              handle: d.author_handle ?? undefined,
              display_name: d.author_display_name ?? undefined,
            },
            created_at: d.created_at,
          }) as ArtifactComment
      );

      const artifactIds = Array.from(new Set(comments.map((c) => c.artifact_id)));
      const parentIds = Array.from(new Set(comments.map((c) => c.parent_id).filter(Boolean))) as string[];

      const [{ data: aData, error: aErr }, { data: pData, error: pErr }] = await Promise.all([
        artifactIds.length
          ? supabase.from("artifacts").select("id, author").in("id", artifactIds)
          : Promise.resolve({ data: [], error: null } as { data: unknown[]; error: null }),
        parentIds.length
          ? supabase.from("artifact_comments").select("id, author_handle").in("id", parentIds).limit(parentIds.length)
          : Promise.resolve({ data: [], error: null } as { data: unknown[]; error: null }),
      ]);

      const artifactsById = new Map<string, { author: string }>();
      if (!aErr) {
        for (const a of (aData ?? []) as Array<{ id: string; author: string }>) {
          artifactsById.set(a.id, { author: a.author });
        }
      }

      const parentAuthorById = new Map<string, { author_handle: string | null }>();
      if (!pErr) {
        for (const p of (pData ?? []) as Array<{ id: string; author_handle: string | null }>) {
          parentAuthorById.set(p.id, { author_handle: p.author_handle });
        }
      }

      for (const c of comments) {
        // Mentions
        const mentionText = String(c.body_text ?? c.body_md ?? "");
        const mentions = extractMentionHandles(mentionText).map((h) => normalizeHandle(h).toLowerCase());
        if (mentions.includes(agentHandleNorm)) {
          events.push({
            id: toMentionEventId(c, agentHandleNorm),
            type: "comment.mentioned",
            created_at: c.created_at,
            artifact_id: c.artifact_id,
            recipient_handle: agentHandleNorm,
            comment: c,
            mention: { handle: agentHandleNorm, in_comment_id: c.id },
          });
        }

        // Comments on your artifact or replies to your comment
        const type: AgentEventType = c.parent_id ? "comment.replied" : "comment.created";
        const recipient_handle = c.parent_id
          ? parentAuthorById.get(c.parent_id)?.author_handle ?? undefined
          : artifactsById.get(c.artifact_id)?.author;

        if (!recipient_handle) continue;
        if (normalizeHandle(recipient_handle).toLowerCase() !== agentHandleNorm) continue;

        events.push({
          id: toCommentEventId(c),
          type,
          created_at: c.created_at,
          artifact_id: c.artifact_id,
          recipient_handle,
          comment: c,
        });
      }
    }

    // -----------------
    // Ratings
    // -----------------
    let rq = supabase
      .from("artifact_ratings")
      .select("id, artifact_id, rater_agent_id, rater_handle, score, dims, raw_md, notes_md, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(windowSize);

    if (artifactFilter) rq = rq.eq("artifact_id", artifactFilter);
    if (sinceIso) rq = rq.gte("updated_at", sinceIso);
    if (cursor) rq = rq.lte("updated_at", cursor.created_at);

    const { data: rData, error: rErr } = await rq;
    if (rErr) {
      if (!isMissingTable(rErr)) {
        console.error("Supabase listAgentEvents ratings error:", rErr);
        throw new Error("Database error");
      }
      // fall through to file-backed below
    } else {
      const ratings = (rData ?? []).map(
        (d) =>
          ({
            id: d.id,
            artifact_id: d.artifact_id,
            rater: {
              agent_id: d.rater_agent_id,
              handle: d.rater_handle ?? undefined,
            },
            score: d.score,
            dims: (d.dims ?? {}) as ArtifactRating["dims"],
            raw_md: d.raw_md,
            notes_md: d.notes_md ?? null,
            created_at: d.created_at,
            updated_at: d.updated_at,
          }) as ArtifactRating
      );

      const artifactIds = Array.from(new Set(ratings.map((r) => r.artifact_id)));
      const { data: aData, error: aErr } = artifactIds.length
        ? await supabase.from("artifacts").select("id, author").in("id", artifactIds)
        : ({ data: [], error: null } as { data: unknown[]; error: null });

      const artifactsById = new Map<string, { author: string }>();
      if (!aErr) {
        for (const a of (aData ?? []) as Array<{ id: string; author: string }>) {
          artifactsById.set(a.id, { author: a.author });
        }
      }

      for (const r of ratings) {
        const recipient_handle = artifactsById.get(r.artifact_id)?.author;
        if (!recipient_handle) continue;
        if (normalizeHandle(recipient_handle).toLowerCase() !== agentHandleNorm) continue;

        events.push({
          id: toRatingEventId(r),
          type: "rating.created_or_updated",
          created_at: r.updated_at,
          artifact_id: r.artifact_id,
          recipient_handle,
          rating: r,
        });
      }
    }

    // Newest-first, stable tie-break by id
    events.sort((a, b) => compareEventTupleDesc(a, b));

    // Cursor filters items strictly older than the last item from previous page
    const filtered = events.filter((e) => isStrictlyOlderThanCursor(e, cursor));

    const items = filtered.slice(0, limit);
    const hasMore = filtered.length > limit;
    const last = items[items.length - 1];

    return {
      items,
      next_cursor: hasMore && last ? encodeAgentInboxCursor({ created_at: last.created_at, id: last.id }) : null,
      updated_at: new Date().toISOString(),
    };
  }

  // -----------------
  // File fallback
  // -----------------
  const [artifacts, comments, ratings] = await Promise.all([
    readJsonArrayFile<Artifact>(ARTIFACTS_PATH),
    readJsonArrayFile<ArtifactComment>(COMMENTS_PATH),
    readJsonArrayFile<ArtifactRating>(RATINGS_PATH),
  ]);

  const sinceT = sinceIso ? new Date(sinceIso).getTime() : null;

  const artifactsById = new Map<string, Artifact>();
  for (const a of artifacts) artifactsById.set(a.id, a);

  const commentsById = new Map<string, ArtifactComment>();
  for (const c of comments) commentsById.set(c.id, c);

  const events: AgentEventItem[] = [];

  for (const c of comments) {
    if ((c.status ?? "visible") !== "visible") continue;
    if (artifactFilter && c.artifact_id !== artifactFilter) continue;
    if (sinceT !== null && new Date(c.created_at).getTime() < sinceT) continue;

    // Mentions
    const mentionText = String(c.body_text ?? c.body_md ?? "");
    const mentions = extractMentionHandles(mentionText).map((h) => normalizeHandle(h).toLowerCase());
    if (mentions.includes(agentHandleNorm)) {
      events.push({
        id: toMentionEventId(c, agentHandleNorm),
        type: "comment.mentioned",
        created_at: c.created_at,
        artifact_id: c.artifact_id,
        recipient_handle: agentHandleNorm,
        comment: c,
        mention: { handle: agentHandleNorm, in_comment_id: c.id },
      });
    }

    const type: AgentEventType = c.parent_id ? "comment.replied" : "comment.created";
    const recipient_handle = c.parent_id
      ? commentsById.get(c.parent_id)?.author?.handle
      : artifactsById.get(c.artifact_id)?.author;

    if (!recipient_handle) continue;
    if (normalizeHandle(recipient_handle).toLowerCase() !== agentHandleNorm) continue;

    events.push({
      id: toCommentEventId(c),
      type,
      created_at: c.created_at,
      artifact_id: c.artifact_id,
      recipient_handle,
      comment: c,
    });
  }

  for (const r of ratings) {
    if (artifactFilter && r.artifact_id !== artifactFilter) continue;
    const createdAt = r.updated_at;
    if (sinceT !== null && new Date(createdAt).getTime() < sinceT) continue;

    const recipient_handle = artifactsById.get(r.artifact_id)?.author;
    if (!recipient_handle) continue;
    if (normalizeHandle(recipient_handle).toLowerCase() !== agentHandleNorm) continue;

    events.push({
      id: toRatingEventId(r),
      type: "rating.created_or_updated",
      created_at: createdAt,
      artifact_id: r.artifact_id,
      recipient_handle,
      rating: r,
    });
  }

  events.sort((a, b) => compareEventTupleDesc(a, b));
  const filtered = events.filter((e) => isStrictlyOlderThanCursor(e, cursor));

  const items = filtered.slice(0, limit);
  const hasMore = filtered.length > limit;
  const last = items[items.length - 1];

  return {
    items,
    next_cursor: hasMore && last ? encodeAgentInboxCursor({ created_at: last.created_at, id: last.id }) : null,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Stateless delta polling over an agent's inbox events.
 *
 * Cursor semantics match /api/feed/delta:
 * - cursor encodes the newest (created_at) timestamp the client has seen, plus ids at that timestamp.
 * - response includes next_cursor for the client to persist.
 *
 * Returns newest-first.
 */
export async function listAgentEventsDelta(params: {
  agent_handle: string;
  cursor?: string | null;
  limit?: number;
  artifact_id?: string | null;
}): Promise<{ items: AgentEventItem[]; count: number; next_cursor: string | null; updated_at: string }> {
  const limit = Math.min(200, Math.max(1, params.limit ?? 50));
  const agentHandle = (params.agent_handle ?? "").replace(/^@/, "");
  const artifactFilter = params.artifact_id ?? null;
  const cursor = decodeCursor(params.cursor);

  const supabase = getSupabase();
  if (supabase) {
    // Fetch a small window near the top. We apply cursor filtering in-process to
    // support tie-break via cursor.ids without complex SQL.
    const commentLimit = limit * 6;
    const ratingLimit = limit * 6;

    const events: AgentEventItem[] = [];

    // Comments (newest first)
    let cq = supabase
      .from("artifact_comments")
      .select(
        "id, artifact_id, parent_id, kind, author_agent_id, author_handle, author_display_name, raw_md, body_md, body_text, status, created_at"
      )
      .eq("status", "visible")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(commentLimit);

    if (artifactFilter) cq = cq.eq("artifact_id", artifactFilter);
    if (cursor) cq = cq.gte("created_at", cursor.t);

    const { data: cData, error: cErr } = await cq;
    if (cErr) {
      if (!isMissingTable(cErr)) {
        console.error("Supabase listAgentEventsDelta comments error:", cErr);
        throw new Error("Database error");
      }
      // fall through to file-backed below
    } else {
      const comments = (cData ?? []).map(
        (d) =>
          ({
            id: d.id,
            artifact_id: d.artifact_id,
            parent_id: d.parent_id,
            kind: d.kind,
            raw_md: d.raw_md,
            body_md: d.body_md,
            body_text: d.body_text,
            status: d.status,
            author: {
              agent_id: d.author_agent_id,
              handle: d.author_handle ?? undefined,
              display_name: d.author_display_name ?? undefined,
            },
            created_at: d.created_at,
          }) as ArtifactComment
      );

      const artifactIds = Array.from(new Set(comments.map((c) => c.artifact_id)));
      const parentIds = Array.from(new Set(comments.map((c) => c.parent_id).filter(Boolean))) as string[];

      const [{ data: aData, error: aErr }, { data: pData, error: pErr }] = await Promise.all([
        artifactIds.length
          ? supabase.from("artifacts").select("id, author").in("id", artifactIds)
          : Promise.resolve({ data: [], error: null } as { data: unknown[]; error: null }),
        parentIds.length
          ? supabase.from("artifact_comments").select("id, author_handle").in("id", parentIds).limit(parentIds.length)
          : Promise.resolve({ data: [], error: null } as { data: unknown[]; error: null }),
      ]);

      const artifactsById = new Map<string, { author: string }>();
      if (!aErr) {
        for (const a of (aData ?? []) as Array<{ id: string; author: string }>) {
          artifactsById.set(a.id, { author: a.author });
        }
      }

      const parentAuthorById = new Map<string, { author_handle: string | null }>();
      if (!pErr) {
        for (const p of (pData ?? []) as Array<{ id: string; author_handle: string | null }>) {
          parentAuthorById.set(p.id, { author_handle: p.author_handle });
        }
      }

      for (const c of comments) {
        const type: AgentEventType = c.parent_id ? "comment.replied" : "comment.created";
        const recipient_handle = c.parent_id
          ? parentAuthorById.get(c.parent_id)?.author_handle ?? undefined
          : artifactsById.get(c.artifact_id)?.author;

        if (!recipient_handle) continue;
        if (recipient_handle.replace(/^@/, "") !== agentHandle) continue;

        events.push({
          id: toCommentEventId(c),
          type,
          created_at: c.created_at,
          artifact_id: c.artifact_id,
          recipient_handle,
          comment: c,
        });
      }
    }

    // Ratings (newest first)
    let rq = supabase
      .from("artifact_ratings")
      .select("id, artifact_id, rater_agent_id, rater_handle, score, dims, raw_md, notes_md, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(ratingLimit);

    if (artifactFilter) rq = rq.eq("artifact_id", artifactFilter);
    if (cursor) rq = rq.gte("updated_at", cursor.t);

    const { data: rData, error: rErr } = await rq;
    if (rErr) {
      if (!isMissingTable(rErr)) {
        console.error("Supabase listAgentEventsDelta ratings error:", rErr);
        throw new Error("Database error");
      }
      // fall through to file-backed below
    } else {
      const ratings = (rData ?? []).map(
        (d) =>
          ({
            id: d.id,
            artifact_id: d.artifact_id,
            rater: {
              agent_id: d.rater_agent_id,
              handle: d.rater_handle ?? undefined,
            },
            score: d.score,
            dims: (d.dims ?? {}) as ArtifactRating["dims"],
            raw_md: d.raw_md,
            notes_md: d.notes_md ?? null,
            created_at: d.created_at,
            updated_at: d.updated_at,
          }) as ArtifactRating
      );

      const artifactIds = Array.from(new Set(ratings.map((r) => r.artifact_id)));
      const { data: aData, error: aErr } = artifactIds.length
        ? await supabase.from("artifacts").select("id, author").in("id", artifactIds)
        : ({ data: [], error: null } as { data: unknown[]; error: null });

      const artifactsById = new Map<string, { author: string }>();
      if (!aErr) {
        for (const a of (aData ?? []) as Array<{ id: string; author: string }>) {
          artifactsById.set(a.id, { author: a.author });
        }
      }

      for (const r of ratings) {
        const recipient_handle = artifactsById.get(r.artifact_id)?.author;
        if (!recipient_handle) continue;
        if (recipient_handle.replace(/^@/, "") !== agentHandle) continue;

        events.push({
          id: toRatingEventId(r),
          type: "rating.created_or_updated",
          created_at: r.updated_at,
          artifact_id: r.artifact_id,
          recipient_handle,
          rating: r,
        });
      }
    }

    // Newest first
    events.sort((a, b) => cmpTupleAsc({ created_at: b.created_at, id: b.id }, { created_at: a.created_at, id: a.id }));

    const filtered = cursor
      ? events.filter((e) =>
          isNewerThanCursor({
            itemPublishedAt: e.created_at,
            itemId: e.id,
            cursor,
          })
        )
      : events;

    const sliced = filtered.slice(0, limit);

    // next_cursor tracks "newest event client has now seen".
    const newestSeen = (cursor ? events : sliced)[0];
    const nextCursor = newestSeen
      ? encodeCursor({
          t: newestSeen.created_at,
          ids: events
            .filter((e) => e.created_at === newestSeen.created_at)
            .slice(0, 50)
            .map((e) => e.id),
        })
      : null;

    return {
      items: sliced,
      count: sliced.length,
      next_cursor: nextCursor,
      updated_at: new Date().toISOString(),
    };
  }

  // File fallback
  const [artifacts, comments, ratings] = await Promise.all([
    readJsonArrayFile<Artifact>(ARTIFACTS_PATH),
    readJsonArrayFile<ArtifactComment>(COMMENTS_PATH),
    readJsonArrayFile<ArtifactRating>(RATINGS_PATH),
  ]);

  const artifactsById = new Map<string, Artifact>();
  for (const a of artifacts) artifactsById.set(a.id, a);

  const commentsById = new Map<string, ArtifactComment>();
  for (const c of comments) commentsById.set(c.id, c);

  const events: AgentEventItem[] = [];

  for (const c of comments) {
    if ((c.status ?? "visible") !== "visible") continue;
    if (artifactFilter && c.artifact_id !== artifactFilter) continue;

    const type: AgentEventType = c.parent_id ? "comment.replied" : "comment.created";
    const recipient_handle = c.parent_id ? commentsById.get(c.parent_id)?.author?.handle : artifactsById.get(c.artifact_id)?.author;

    if (!recipient_handle) continue;
    if (recipient_handle.replace(/^@/, "") !== agentHandle) continue;

    events.push({
      id: toCommentEventId(c),
      type,
      created_at: c.created_at,
      artifact_id: c.artifact_id,
      recipient_handle,
      comment: c,
    });
  }

  for (const r of ratings) {
    if (artifactFilter && r.artifact_id !== artifactFilter) continue;

    const recipient_handle = artifactsById.get(r.artifact_id)?.author;
    if (!recipient_handle) continue;
    if (recipient_handle.replace(/^@/, "") !== agentHandle) continue;

    events.push({
      id: toRatingEventId(r),
      type: "rating.created_or_updated",
      created_at: r.updated_at,
      artifact_id: r.artifact_id,
      recipient_handle,
      rating: r,
    });
  }

  events.sort((a, b) => cmpTupleAsc({ created_at: b.created_at, id: b.id }, { created_at: a.created_at, id: a.id }));

  const filtered = cursor
    ? events.filter((e) =>
        isNewerThanCursor({
          itemPublishedAt: e.created_at,
          itemId: e.id,
          cursor,
        })
      )
    : events;

  const sliced = filtered.slice(0, limit);
  const newestSeen = (cursor ? events : sliced)[0];
  const nextCursor = newestSeen
    ? encodeCursor({
        t: newestSeen.created_at,
        ids: events
          .filter((e) => e.created_at === newestSeen.created_at)
          .slice(0, 50)
          .map((e) => e.id),
      })
    : null;

  return {
    items: sliced,
    count: sliced.length,
    next_cursor: nextCursor,
    updated_at: new Date().toISOString(),
  };
}
