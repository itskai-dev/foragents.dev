import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { getSupabase } from "@/lib/supabase";
import type { Artifact, ArtifactLineageItem } from "@/lib/artifactsShared";

const ARTIFACTS_PATH = path.join(process.cwd(), "data", "artifacts.json");

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return (tags as unknown[])
    .filter((t) => typeof t === "string")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
}

export function validateArtifactInput(body: Record<string, unknown>): string[] {
  const errors: string[] = [];

  if (!body.title || typeof body.title !== "string" || body.title.trim().length < 2) {
    errors.push("title is required (min 2 chars)");
  }

  if (!body.body || typeof body.body !== "string" || body.body.trim().length < 10) {
    errors.push("body is required (min 10 chars)");
  }

  if (body.author && (typeof body.author !== "string" || (body.author as string).trim().length === 0)) {
    errors.push("author must be a non-empty string when provided");
  }

  if (body.tags && !Array.isArray(body.tags)) {
    errors.push("tags must be an array of strings when provided");
  }

  if (
    body.parent_artifact_id !== undefined &&
    body.parent_artifact_id !== null &&
    typeof body.parent_artifact_id !== "string"
  ) {
    errors.push("parent_artifact_id must be a string when provided");
  }

  return errors;
}

async function readArtifactsFile(): Promise<Artifact[]> {
  try {
    const raw = await fs.readFile(ARTIFACTS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Artifact[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeArtifactsFile(artifacts: Artifact[]): Promise<void> {
  await fs.writeFile(ARTIFACTS_PATH, JSON.stringify(artifacts, null, 2));
}

function isMissingArtifactsTable(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: unknown }).code;
  return code === "PGRST205";
}

export async function createArtifact(input: {
  title: string;
  body: string;
  author?: string;
  tags?: string[];
  parent_artifact_id?: string | null;
}): Promise<Artifact> {
  const supabase = getSupabase();

  const row = {
    title: input.title.trim(),
    body: input.body.trim(),
    author: (input.author ?? "anonymous").trim() || "anonymous",
    tags: normalizeTags(input.tags ?? []),
    parent_artifact_id: input.parent_artifact_id ?? null,
  };

  if (supabase) {
    const { data, error } = await supabase
      .from("artifacts")
      .insert(row)
      .select("id, title, body, author, tags, created_at, parent_artifact_id")
      .single();

    if (error) {
      if (!isMissingArtifactsTable(error)) {
        console.error("Supabase createArtifact error:", error);
        throw new Error("Database error");
      }
      // else: fall back to file-backed create
    } else {
      return {
        id: data.id,
        title: data.title,
        body: data.body,
        author: data.author,
        tags: data.tags ?? [],
        created_at: data.created_at,
        parent_artifact_id: data.parent_artifact_id ?? null,
      };
    }
  }

  const artifacts = await readArtifactsFile();
  const artifact: Artifact = {
    id: `art_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...row,
    created_at: new Date().toISOString(),
  };
  artifacts.unshift(artifact);
  await writeArtifactsFile(artifacts);
  return artifact;
}

export async function getArtifacts(params?: { limit?: number; before?: string | null }): Promise<Artifact[]> {
  const limit = Math.min(100, Math.max(1, params?.limit ?? 30));
  const before = params?.before ?? null;

  const supabase = getSupabase();
  if (supabase) {
    let q = supabase
      .from("artifacts")
      .select("id, title, body, author, tags, created_at, parent_artifact_id")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (before) {
      q = q.lt("created_at", before);
    }

    const { data, error } = await q;
    if (error) {
      if (!isMissingArtifactsTable(error)) {
        console.error("Supabase getArtifacts error:", error);
        throw new Error("Database error");
      }
      // else: fall back to file-backed artifacts
    } else {
      return (data ?? []).map((d) => ({
        id: d.id,
        title: d.title,
        body: d.body,
        author: d.author,
        tags: d.tags ?? [],
        created_at: d.created_at,
        parent_artifact_id: (d as { parent_artifact_id?: string | null }).parent_artifact_id ?? null,
      }));
    }
  }

  const artifacts = await readArtifactsFile();
  const sorted = artifacts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const filtered = before
    ? sorted.filter((a) => new Date(a.created_at).getTime() < new Date(before).getTime())
    : sorted;

  return filtered.slice(0, limit);
}

export async function getArtifactById(id: string): Promise<Artifact | null> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("artifacts")
      .select("id, title, body, author, tags, created_at, parent_artifact_id")
      .eq("id", id)
      .limit(1)
      .maybeSingle();

    if (error) {
      if (!isMissingArtifactsTable(error)) {
        console.error("Supabase getArtifactById error:", error);
        throw new Error("Database error");
      }
      // else: fall back to file-backed artifacts
    } else {
      if (!data) return null;
      return {
        id: data.id,
        title: data.title,
        body: data.body,
        author: data.author,
        tags: data.tags ?? [],
        created_at: data.created_at,
        parent_artifact_id: data.parent_artifact_id ?? null,
      };
    }
  }

  const artifacts = await readArtifactsFile();
  return artifacts.find((a) => a.id === id) ?? null;
}

export async function getArtifactLineage(id: string, opts?: { maxDepth?: number }): Promise<ArtifactLineageItem[]> {
  const maxDepth = Math.min(25, Math.max(1, opts?.maxDepth ?? 10));

  const supabase = getSupabase();
  if (supabase) {
    const lineage: ArtifactLineageItem[] = [];
    const seen = new Set<string>();

    // Start from the artifact's parent.
    const base = await getArtifactById(id);
    let cur = base?.parent_artifact_id ?? null;

    while (cur && lineage.length < maxDepth) {
      if (seen.has(cur)) break;
      seen.add(cur);

      const { data, error } = await supabase
        .from("artifacts")
        .select("id, title, parent_artifact_id")
        .eq("id", cur)
        .limit(1)
        .maybeSingle();

      if (error) {
        if (!isMissingArtifactsTable(error)) {
          console.error("Supabase getArtifactLineage error:", error);
          throw new Error("Database error");
        }
        break; // fallback path handled below
      }
      if (!data) break;

      lineage.push({ id: data.id, title: data.title });
      cur = (data as { parent_artifact_id?: string | null }).parent_artifact_id ?? null;
    }

    if (lineage.length > 0 || !cur) return lineage;
    // if table missing, continue to file fallback below
  }

  const artifacts = await readArtifactsFile();
  const byId = new Map(artifacts.map((a) => [a.id, a] as const));
  const lineage: ArtifactLineageItem[] = [];
  const seen = new Set<string>();

  const base = byId.get(id);
  let cur = base?.parent_artifact_id ?? null;
  while (cur && lineage.length < maxDepth) {
    if (seen.has(cur)) break;
    seen.add(cur);

    const parent = byId.get(cur);
    if (!parent) break;
    lineage.push({ id: parent.id, title: parent.title });
    cur = parent.parent_artifact_id ?? null;
  }

  return lineage;
}

// (snippets + url helpers moved to artifactsShared.ts)
