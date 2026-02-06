import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { getSupabase } from "@/lib/supabase";
import { decodeCursor, encodeCursor, isNewerThanCursor } from "@/lib/agentCursor";
import type { Artifact } from "@/lib/artifactsShared";
import type { ArtifactComment, ArtifactRating } from "@/lib/server/artifactFeedback";

export type AgentEventType = "comment.created" | "comment.replied" | "rating.created_or_updated";

export type AgentEventItem = {
  id: string;
  type: AgentEventType;
  created_at: string;
  artifact_id: string;
  recipient_handle?: string;
  comment?: ArtifactComment;
  rating?: ArtifactRating;
};

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

function makeCursor(created_at: string, id: string): string {
  return Buffer.from(JSON.stringify({ created_at, id }), "utf-8").toString("base64url");
}

function parseCursor(cursor: string | null): { created_at: string; id: string } | null {
  if (!cursor) return null;
  try {
    const json = Buffer.from(cursor, "base64url").toString("utf-8");
    const parsed = JSON.parse(json) as { created_at?: unknown; id?: unknown };
    if (typeof parsed?.created_at === "string" && typeof parsed?.id === "string") {
      return { created_at: parsed.created_at, id: parsed.id };
    }
    return null;
  } catch {
    return null;
  }
}

function cmpTupleAsc(a: { created_at: string; id: string }, b: { created_at: string; id: string }): number {
  const ta = new Date(a.created_at).getTime();
  const tb = new Date(b.created_at).getTime();
  if (ta !== tb) return ta - tb;
  return a.id.localeCompare(b.id);
}

function isAfterCursor(tuple: { created_at: string; id: string }, cursor: { created_at: string; id: string } | null): boolean {
  if (!cursor) return true;
  const c = cmpTupleAsc(tuple, cursor);
  return c > 0;
}

function toCommentEventId(comment: Pick<ArtifactComment, "id">): string {
  return `comment:${comment.id}`;
}

function toRatingEventId(rating: Pick<ArtifactRating, "id">): string {
  return `rating:${rating.id}`;
}

export async function listAgentEvents(params: {
  agent_handle: string;
  cursor?: string | null;
  limit?: number;
  artifact_id?: string | null;
}): Promise<{ items: AgentEventItem[]; next_cursor: string | null; updated_at: string }> {
  const limit = Math.min(100, Math.max(1, params.limit ?? 50));
  const cursorTuple = parseCursor(params.cursor ?? null);
  const agentHandle = (params.agent_handle ?? "").replace(/^@/, "");
  const artifactFilter = params.artifact_id ?? null;

  const supabase = getSupabase();
  if (supabase) {
    // Supabase-first. Keep logic simple: fetch a window of rows after cursor,
    // then filter by recipient handle.
    // NOTE: recipient_handle is based on artifact.author (handle) or parent-comment author.
    const commentLimit = limit * 3;
    const ratingLimit = limit * 3;

    const events: AgentEventItem[] = [];

    // Comments
    let cq = supabase
      .from("artifact_comments")
      .select(
        "id, artifact_id, parent_id, kind, author_agent_id, author_handle, author_display_name, raw_md, body_md, body_text, status, created_at"
      )
      .eq("status", "visible")
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .limit(commentLimit);
    if (artifactFilter) cq = cq.eq("artifact_id", artifactFilter);
    if (cursorTuple) {
      cq = cq.or(
        `created_at.gt.${cursorTuple.created_at},and(created_at.eq.${cursorTuple.created_at},id.gt.${cursorTuple.id})`
      );
    }

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

    // Ratings
    let rq = supabase
      .from("artifact_ratings")
      .select("id, artifact_id, rater_agent_id, rater_handle, score, dims, raw_md, notes_md, created_at, updated_at")
      .order("updated_at", { ascending: true })
      .order("id", { ascending: true })
      .limit(ratingLimit);

    if (artifactFilter) rq = rq.eq("artifact_id", artifactFilter);

    if (cursorTuple) {
      // Cursor id is the event id (e.g. rating:rat_123). Strip prefix for the ratings table id compare.
      const rawId = cursorTuple.id.replace(/^rating:/, "");
      rq = rq.or(`updated_at.gt.${cursorTuple.created_at},and(updated_at.eq.${cursorTuple.created_at},id.gt.${rawId})`);
    }

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

    events.sort((a, b) => cmpTupleAsc({ created_at: a.created_at, id: a.id }, { created_at: b.created_at, id: b.id }));
    const filtered = events.filter((e) => isAfterCursor({ created_at: e.created_at, id: e.id }, cursorTuple));

    const items = filtered.slice(0, limit);
    const hasMore = filtered.length > limit;
    const last = items[items.length - 1];

    return {
      items,
      next_cursor: hasMore && last ? makeCursor(last.created_at, last.id) : null,
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

  events.sort((a, b) => cmpTupleAsc({ created_at: a.created_at, id: a.id }, { created_at: b.created_at, id: b.id }));
  const filtered = events.filter((e) => isAfterCursor({ created_at: e.created_at, id: e.id }, cursorTuple));

  const items = filtered.slice(0, limit);
  const hasMore = filtered.length > limit;
  const last = items[items.length - 1];

  return {
    items,
    next_cursor: hasMore && last ? makeCursor(last.created_at, last.id) : null,
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
