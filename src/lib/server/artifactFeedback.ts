import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { getSupabase } from "@/lib/supabase";
import type { AgentIdentity } from "@/lib/server/agent-auth";
import type { CommentKind, RatingDims } from "@/lib/socialFeedback";

export type ArtifactComment = {
  id: string;
  artifact_id: string;
  parent_id: string | null;
  kind: CommentKind;
  body_md: string;
  body_text: string | null;
  raw_md: string;
  author: AgentIdentity;
  status?: "visible" | "removed";
  created_at: string;
};

export type ArtifactRating = {
  id: string;
  artifact_id: string;
  rater: Pick<AgentIdentity, "agent_id" | "handle" | "display_name">;
  score: number;
  dims: RatingDims;
  notes_md: string | null;
  raw_md: string;
  created_at: string;
  updated_at: string;
};

export type RatingsSummary = {
  artifact_id: string;
  count: number;
  avg: number | null;
  dims_avg: Partial<Record<keyof RatingDims, number>>;
  updated_at: string;
};

const COMMENTS_PATH = path.join(process.cwd(), "data", "artifact_comments.json");
const RATINGS_PATH = path.join(process.cwd(), "data", "artifact_ratings.json");

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

async function writeJsonArrayFile<T>(p: string, items: T[]): Promise<void> {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(items, null, 2));
}

function makeCursor(created_at: string, id: string): string {
  return Buffer.from(JSON.stringify({ created_at, id }), "utf-8").toString("base64url");
}

function parseCursor(cursor: string | null): { created_at: string; id: string } | null {
  if (!cursor) return null;
  try {
    const json = Buffer.from(cursor, "base64url").toString("utf-8");
    const parsed = JSON.parse(json) as { created_at?: unknown; id?: unknown };
    if (typeof parsed?.created_at === "string" && typeof parsed?.id === "string") return { created_at: parsed.created_at, id: parsed.id };
    return null;
  } catch {
    return null;
  }
}

export async function createArtifactComment(input: {
  artifact_id: string;
  parent_id: string | null;
  kind: CommentKind;
  raw_md: string;
  body_md: string;
  body_text: string | null;
  author: AgentIdentity;
}): Promise<ArtifactComment> {
  const supabase = getSupabase();
  const row = {
    artifact_id: input.artifact_id,
    parent_id: input.parent_id,
    kind: input.kind,
    author_agent_id: input.author.agent_id,
    author_handle: input.author.handle ?? null,
    author_display_name: input.author.display_name ?? null,
    raw_md: input.raw_md,
    body_md: input.body_md,
    body_text: input.body_text,
  };

  if (supabase) {
    const { data, error } = await supabase
      .from("artifact_comments")
      .insert(row)
      .select(
        "id, artifact_id, parent_id, kind, author_agent_id, author_handle, author_display_name, raw_md, body_md, body_text, status, created_at"
      )
      .single();

    if (error) {
      if (!isMissingTable(error)) {
        console.error("Supabase createArtifactComment error:", error);
        throw new Error("Database error");
      }
    } else {
      return {
        id: data.id,
        artifact_id: data.artifact_id,
        parent_id: data.parent_id,
        kind: data.kind,
        raw_md: data.raw_md,
        body_md: data.body_md,
        body_text: data.body_text,
        status: data.status,
        author: {
          agent_id: data.author_agent_id,
          handle: data.author_handle ?? undefined,
          display_name: data.author_display_name ?? undefined,
        },
        created_at: data.created_at,
      };
    }
  }

  const comments = await readJsonArrayFile<ArtifactComment>(COMMENTS_PATH);
  const comment: ArtifactComment = {
    id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    artifact_id: input.artifact_id,
    parent_id: input.parent_id,
    kind: input.kind,
    raw_md: input.raw_md,
    body_md: input.body_md,
    body_text: input.body_text,
    author: {
      agent_id: input.author.agent_id,
      handle: input.author.handle,
      display_name: input.author.display_name,
    },
    status: "visible",
    created_at: new Date().toISOString(),
  };

  comments.unshift(comment);
  await writeJsonArrayFile(COMMENTS_PATH, comments);
  return comment;
}

export async function commentExistsOnArtifact(comment_id: string, artifact_id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("artifact_comments")
      .select("id")
      .eq("id", comment_id)
      .eq("artifact_id", artifact_id)
      .limit(1)
      .maybeSingle();

    if (error) {
      if (!isMissingTable(error)) {
        console.error("Supabase commentExistsOnArtifact error:", error);
        throw new Error("Database error");
      }
    } else {
      return !!data;
    }
  }

  const comments = await readJsonArrayFile<ArtifactComment>(COMMENTS_PATH);
  return comments.some((c) => c.id === comment_id && c.artifact_id === artifact_id);
}

export async function listArtifactComments(params: {
  artifact_id: string;
  limit?: number;
  cursor?: string | null;
  order?: "asc" | "desc";
  include?: "all" | "top";
}): Promise<{ items: ArtifactComment[]; next_cursor: string | null; updated_at: string }> {
  const limit = Math.min(100, Math.max(1, params.limit ?? 50));
  const order = params.order ?? "asc";
  const include = params.include ?? "all";
  const cursorTuple = parseCursor(params.cursor ?? null);

  const supabase = getSupabase();
  if (supabase) {
    let q = supabase
      .from("artifact_comments")
      .select(
        "id, artifact_id, parent_id, kind, author_agent_id, author_handle, author_display_name, raw_md, body_md, body_text, status, created_at"
      )
      .eq("artifact_id", params.artifact_id)
      .eq("status", "visible")
      .order("created_at", { ascending: order === "asc" })
      .order("id", { ascending: order === "asc" })
      .limit(limit + 1);

    if (include === "top") {
      q = q.is("parent_id", null);
    }

    if (cursorTuple) {
      const ts = cursorTuple.created_at;
      const id = cursorTuple.id;
      if (order === "asc") {
        q = q.or(`created_at.gt.${ts},and(created_at.eq.${ts},id.gt.${id})`);
      } else {
        q = q.or(`created_at.lt.${ts},and(created_at.eq.${ts},id.lt.${id})`);
      }
    }

    const { data, error } = await q;
    if (error) {
      if (!isMissingTable(error)) {
        console.error("Supabase listArtifactComments error:", error);
        throw new Error("Database error");
      }
    } else {
      const rows = (data ?? []).map((d) => ({
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
      })) as ArtifactComment[];

      const hasMore = rows.length > limit;
      const items = hasMore ? rows.slice(0, limit) : rows;
      const last = items[items.length - 1];
      return {
        items,
        next_cursor: hasMore && last ? makeCursor(last.created_at, last.id) : null,
        updated_at: new Date().toISOString(),
      };
    }
  }

  // File fallback
  const all = await readJsonArrayFile<ArtifactComment>(COMMENTS_PATH);
  let filtered = all.filter((c) => c.artifact_id === params.artifact_id && (c.status ?? "visible") === "visible");
  if (include === "top") filtered = filtered.filter((c) => c.parent_id === null);

  filtered.sort((a, b) => {
    const ta = new Date(a.created_at).getTime();
    const tb = new Date(b.created_at).getTime();
    if (ta !== tb) return order === "asc" ? ta - tb : tb - ta;
    return order === "asc" ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
  });

  if (cursorTuple) {
    const idx = filtered.findIndex((c) => c.created_at === cursorTuple.created_at && c.id === cursorTuple.id);
    if (idx >= 0) filtered = filtered.slice(idx + 1);
  }

  const items = filtered.slice(0, limit);
  const hasMore = filtered.length > limit;
  const last = items[items.length - 1];

  return {
    items,
    next_cursor: hasMore && last ? makeCursor(last.created_at, last.id) : null,
    updated_at: new Date().toISOString(),
  };
}

export async function upsertArtifactRating(input: {
  artifact_id: string;
  rater: AgentIdentity;
  score: number;
  dims: RatingDims;
  raw_md: string;
  notes_md: string | null;
}): Promise<{ rating: ArtifactRating; created: boolean }> {
  const supabase = getSupabase();

  const row = {
    artifact_id: input.artifact_id,
    rater_agent_id: input.rater.agent_id,
    rater_handle: input.rater.handle ?? null,
    score: input.score,
    dims: input.dims,
    raw_md: input.raw_md,
    notes_md: input.notes_md,
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    // Try insert, then fallback to update on unique violation.
    const { data: inserted, error: insertError } = await supabase
      .from("artifact_ratings")
      .insert({ ...row })
      .select("id, artifact_id, rater_agent_id, rater_handle, score, dims, raw_md, notes_md, created_at, updated_at")
      .single();

    if (insertError) {
      if (!isMissingTable(insertError)) {
        // update path
        const { data: updated, error: updateError } = await supabase
          .from("artifact_ratings")
          .update({
            score: row.score,
            dims: row.dims,
            raw_md: row.raw_md,
            notes_md: row.notes_md,
            updated_at: row.updated_at,
          })
          .eq("artifact_id", row.artifact_id)
          .eq("rater_agent_id", row.rater_agent_id)
          .select("id, artifact_id, rater_agent_id, rater_handle, score, dims, raw_md, notes_md, created_at, updated_at")
          .single();

        if (updateError) {
          console.error("Supabase upsertArtifactRating update error:", updateError);
          throw new Error("Database error");
        }

        return {
          created: false,
          rating: {
            id: updated.id,
            artifact_id: updated.artifact_id,
            rater: {
              agent_id: updated.rater_agent_id,
              handle: updated.rater_handle ?? undefined,
              display_name: input.rater.display_name,
            },
            score: updated.score,
            dims: (updated.dims ?? {}) as RatingDims,
            raw_md: updated.raw_md,
            notes_md: updated.notes_md ?? null,
            created_at: updated.created_at,
            updated_at: updated.updated_at,
          },
        };
      }
    } else {
      return {
        created: true,
        rating: {
          id: inserted.id,
          artifact_id: inserted.artifact_id,
          rater: {
            agent_id: inserted.rater_agent_id,
            handle: inserted.rater_handle ?? undefined,
            display_name: input.rater.display_name,
          },
          score: inserted.score,
          dims: (inserted.dims ?? {}) as RatingDims,
          raw_md: inserted.raw_md,
          notes_md: inserted.notes_md ?? null,
          created_at: inserted.created_at,
          updated_at: inserted.updated_at,
        },
      };
    }
  }

  // File fallback
  const ratings = await readJsonArrayFile<ArtifactRating>(RATINGS_PATH);
  const nowIso = new Date().toISOString();

  const idx = ratings.findIndex((r) => r.artifact_id === input.artifact_id && r.rater.agent_id === input.rater.agent_id);

  if (idx >= 0) {
    const existing = ratings[idx];
    const updated: ArtifactRating = {
      ...existing,
      score: input.score,
      dims: input.dims,
      raw_md: input.raw_md,
      notes_md: input.notes_md,
      updated_at: nowIso,
    };
    ratings[idx] = updated;
    await writeJsonArrayFile(RATINGS_PATH, ratings);
    return { rating: updated, created: false };
  }

  const rating: ArtifactRating = {
    id: `rat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    artifact_id: input.artifact_id,
    rater: {
      agent_id: input.rater.agent_id,
      handle: input.rater.handle,
      display_name: input.rater.display_name,
    },
    score: input.score,
    dims: input.dims,
    raw_md: input.raw_md,
    notes_md: input.notes_md,
    created_at: nowIso,
    updated_at: nowIso,
  };

  ratings.unshift(rating);
  await writeJsonArrayFile(RATINGS_PATH, ratings);
  return { rating, created: true };
}

export async function getArtifactRatingsSummary(artifact_id: string): Promise<RatingsSummary> {
  const supabase = getSupabase();
  const updated_at = new Date().toISOString();

  if (supabase) {
    const { data, error } = await supabase
      .from("artifact_ratings")
      .select("score, dims")
      .eq("artifact_id", artifact_id);

    if (error) {
      if (!isMissingTable(error)) {
        console.error("Supabase getArtifactRatingsSummary error:", error);
        throw new Error("Database error");
      }
    } else {
      const scores = (data ?? []).map((d) => d.score).filter((n) => typeof n === "number");
      const count = scores.length;
      const avg = count ? scores.reduce((a, b) => a + b, 0) / count : null;

      const dimsAgg: Record<string, number[]> = {};
      for (const row of data ?? []) {
        const dims = (row.dims ?? {}) as Record<string, unknown>;
        for (const k of ["usefulness", "correctness", "novelty"]) {
          const v = dims[k];
          if (typeof v === "number") {
            dimsAgg[k] = dimsAgg[k] ?? [];
            dimsAgg[k].push(v);
          }
        }
      }

      const dims_avg: Partial<Record<keyof RatingDims, number>> = {};
      for (const [k, arr] of Object.entries(dimsAgg)) {
        if (arr.length) dims_avg[k as keyof RatingDims] = arr.reduce((a, b) => a + b, 0) / arr.length;
      }

      return { artifact_id, count, avg, dims_avg, updated_at };
    }
  }

  const ratings = await readJsonArrayFile<ArtifactRating>(RATINGS_PATH);
  const filtered = ratings.filter((r) => r.artifact_id === artifact_id);
  const count = filtered.length;
  const avg = count ? filtered.reduce((a, b) => a + b.score, 0) / count : null;

  const dimsAgg: Record<string, number[]> = {};
  for (const r of filtered) {
    const dims = (r.dims ?? {}) as Record<string, unknown>;
    for (const k of ["usefulness", "correctness", "novelty"]) {
      const v = dims[k];
      if (typeof v === "number") {
        dimsAgg[k] = dimsAgg[k] ?? [];
        dimsAgg[k].push(v);
      }
    }
  }

  const dims_avg: Partial<Record<keyof RatingDims, number>> = {};
  for (const [k, arr] of Object.entries(dimsAgg)) {
    if (arr.length) dims_avg[k as keyof RatingDims] = arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  return { artifact_id, count, avg, dims_avg, updated_at };
}
