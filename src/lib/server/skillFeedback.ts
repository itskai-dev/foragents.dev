import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { getSupabase } from "@/lib/supabase";

export type SkillComment = {
  id: string;
  artifact_slug: string;
  agent_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
};

export type SkillCommentNode = SkillComment & { replies: SkillCommentNode[] };

export type SkillRating = {
  id: string;
  artifact_slug: string;
  agent_id: string;
  rating: number;
  created_at: string;
};

const COMMENTS_PATH = path.join(process.cwd(), "data", "skill_comments.json");
const RATINGS_PATH = path.join(process.cwd(), "data", "skill_ratings.json");

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

export async function createSkillComment(input: {
  artifact_slug: string;
  agent_id: string;
  content: string;
  parent_id: string | null;
}): Promise<SkillComment> {
  const supabase = getSupabase();

  if (supabase) {
    const row = {
      artifact_slug: input.artifact_slug,
      agent_id: input.agent_id,
      content: input.content,
      parent_id: input.parent_id,
    };

    const { data, error } = await supabase
      .from("artifact_comments")
      .insert(row)
      .select("id, artifact_slug, agent_id, content, parent_id, created_at")
      .single();

    if (error) {
      if (!isMissingTable(error)) {
        console.error("Supabase createSkillComment error:", error);
        throw new Error("Database error");
      }
    } else {
      return {
        id: data.id,
        artifact_slug: data.artifact_slug,
        agent_id: data.agent_id,
        content: data.content,
        parent_id: data.parent_id,
        created_at: data.created_at,
      };
    }
  }

  const all = await readJsonArrayFile<SkillComment>(COMMENTS_PATH);
  const comment: SkillComment = {
    id: `sc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    artifact_slug: input.artifact_slug,
    agent_id: input.agent_id,
    content: input.content,
    parent_id: input.parent_id,
    created_at: new Date().toISOString(),
  };
  all.push(comment);
  await writeJsonArrayFile(COMMENTS_PATH, all);
  return comment;
}

export async function skillCommentExists(input: {
  artifact_slug: string;
  comment_id: string;
}): Promise<boolean> {
  const supabase = getSupabase();

  if (supabase) {
    const { data, error } = await supabase
      .from("artifact_comments")
      .select("id")
      .eq("artifact_slug", input.artifact_slug)
      .eq("id", input.comment_id)
      .limit(1)
      .maybeSingle();

    if (error) {
      if (!isMissingTable(error)) {
        console.error("Supabase skillCommentExists error:", error);
        throw new Error("Database error");
      }
    } else {
      return !!data;
    }
  }

  const all = await readJsonArrayFile<SkillComment>(COMMENTS_PATH);
  return all.some((c) => c.artifact_slug === input.artifact_slug && c.id === input.comment_id);
}

export async function listSkillCommentsThreaded(input: {
  artifact_slug: string;
}): Promise<{ items: SkillCommentNode[]; count: number; updated_at: string }> {
  const updated_at = new Date().toISOString();
  const supabase = getSupabase();

  let rows: SkillComment[] = [];

  if (supabase) {
    const { data, error } = await supabase
      .from("artifact_comments")
      .select("id, artifact_slug, agent_id, content, parent_id, created_at")
      .eq("artifact_slug", input.artifact_slug)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      if (!isMissingTable(error)) {
        console.error("Supabase listSkillCommentsThreaded error:", error);
        throw new Error("Database error");
      }
    } else {
      rows = (data ?? []) as SkillComment[];
    }
  }

  if (!supabase) {
    const all = await readJsonArrayFile<SkillComment>(COMMENTS_PATH);
    rows = all
      .filter((c) => c.artifact_slug === input.artifact_slug)
      .slice()
      .sort((a, b) => {
        const ta = new Date(a.created_at).getTime();
        const tb = new Date(b.created_at).getTime();
        if (ta !== tb) return ta - tb;
        return a.id.localeCompare(b.id);
      });
  }

  const byId = new Map<string, SkillCommentNode>();
  for (const r of rows) {
    byId.set(r.id, { ...r, replies: [] });
  }

  const roots: SkillCommentNode[] = [];
  for (const r of rows) {
    const node = byId.get(r.id)!;
    if (r.parent_id && byId.has(r.parent_id)) {
      byId.get(r.parent_id)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return { items: roots, count: rows.length, updated_at };
}

export async function upsertSkillRating(input: {
  artifact_slug: string;
  agent_id: string;
  rating: number;
}): Promise<SkillRating> {
  const supabase = getSupabase();

  if (supabase) {
    const row = {
      artifact_slug: input.artifact_slug,
      agent_id: input.agent_id,
      rating: input.rating,
    };

    const { data, error } = await supabase
      .from("artifact_ratings")
      .upsert(row, { onConflict: "artifact_slug,agent_id" })
      .select("id, artifact_slug, agent_id, rating, created_at")
      .single();

    if (error) {
      if (!isMissingTable(error)) {
        console.error("Supabase upsertSkillRating error:", error);
        throw new Error("Database error");
      }
    } else {
      return {
        id: data.id,
        artifact_slug: data.artifact_slug,
        agent_id: data.agent_id,
        rating: data.rating,
        created_at: data.created_at,
      };
    }
  }

  const all = await readJsonArrayFile<SkillRating>(RATINGS_PATH);
  const nowIso = new Date().toISOString();

  const idx = all.findIndex((r) => r.artifact_slug === input.artifact_slug && r.agent_id === input.agent_id);
  if (idx >= 0) {
    const updated: SkillRating = { ...all[idx], rating: input.rating };
    all[idx] = updated;
    await writeJsonArrayFile(RATINGS_PATH, all);
    return updated;
  }

  const rating: SkillRating = {
    id: `sr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    artifact_slug: input.artifact_slug,
    agent_id: input.agent_id,
    rating: input.rating,
    created_at: nowIso,
  };

  all.push(rating);
  await writeJsonArrayFile(RATINGS_PATH, all);
  return rating;
}

export async function getSkillRatingsSummary(input: {
  artifact_slug: string;
}): Promise<{ artifact_slug: string; count: number; avg: number | null; updated_at: string }> {
  const updated_at = new Date().toISOString();
  const supabase = getSupabase();

  if (supabase) {
    const { data, error } = await supabase
      .from("artifact_ratings")
      .select("rating")
      .eq("artifact_slug", input.artifact_slug);

    if (error) {
      if (!isMissingTable(error)) {
        console.error("Supabase getSkillRatingsSummary error:", error);
        throw new Error("Database error");
      }
    } else {
      const vals = (data ?? [])
        .map((d) => (d as { rating?: unknown }).rating)
        .filter((n): n is number => typeof n === "number");
      const count = vals.length;
      const avg = count ? vals.reduce((a, b) => a + b, 0) / count : null;
      return { artifact_slug: input.artifact_slug, count, avg, updated_at };
    }
  }

  const all = await readJsonArrayFile<SkillRating>(RATINGS_PATH);
  const vals = all
    .filter((r) => r.artifact_slug === input.artifact_slug)
    .map((r) => r.rating);
  const count = vals.length;
  const avg = count ? vals.reduce((a, b) => a + b, 0) / count : null;
  return { artifact_slug: input.artifact_slug, count, avg, updated_at };
}
