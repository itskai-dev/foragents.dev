import "server-only";

import matter from "gray-matter";

export type CommentKind = "review" | "question" | "issue" | "improvement";

export type ParsedMarkdown<TFrontmatter> = {
  raw_md: string;
  frontmatter: TFrontmatter;
  body_md: string;
  body_text: string | null;
};

export type CommentFrontmatter = {
  artifact_id?: unknown;
  kind?: unknown;
  parent_id?: unknown;
  rating?: unknown;
};

export type RatingFrontmatter = {
  artifact_id?: unknown;
  score?: unknown;
  dims?: unknown;
};

export type NormalizedCommentInput = {
  artifact_id: string;
  kind: CommentKind;
  parent_id: string | null;
  body_md: string;
  body_text: string | null;
  raw_md: string;
};

export type NormalizedRatingInput = {
  artifact_id: string;
  score: number;
  dims: Record<string, number> | null;
  notes_md: string | null;
  raw_md: string;
};

function stripMarkdownToText(md: string): string {
  // Best-effort v0: remove code fences and common markdown markers.
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseMarkdown<TFrontmatter extends Record<string, unknown>>(
  raw: string
): ParsedMarkdown<TFrontmatter> {
  const parsed = matter(raw);
  const body_md = (parsed.content ?? "").trim();
  const body_text = body_md ? stripMarkdownToText(body_md) : null;
  return {
    raw_md: raw,
    frontmatter: (parsed.data ?? {}) as TFrontmatter,
    body_md,
    body_text,
  };
}

function isCommentKind(v: unknown): v is CommentKind {
  return v === "review" || v === "question" || v === "issue" || v === "improvement";
}

function coerceNullString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") {
    const t = v.trim();
    return t ? t : null;
  }
  return null;
}

function validateScore(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  if (i < 1 || i > 5) return null;
  return i;
}

function normalizeDims(v: unknown): Record<string, number> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const allowed = ["usefulness", "correctness", "novelty"];
  const out: Record<string, number> = {};
  for (const k of allowed) {
    const score = validateScore((v as Record<string, unknown>)[k]);
    if (score !== null) out[k] = score;
  }
  return Object.keys(out).length ? out : null;
}

export function validateAndNormalizeComment(params: {
  artifactIdFromPath: string;
  markdown: string;
}): { ok: true; value: NormalizedCommentInput } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const parsed = parseMarkdown<CommentFrontmatter>(params.markdown);
  const fm = parsed.frontmatter;

  const artifact_id = typeof fm.artifact_id === "string" ? fm.artifact_id.trim() : "";
  if (!artifact_id) errors.push("artifact_id is required");
  if (artifact_id && artifact_id !== params.artifactIdFromPath) errors.push("artifact_id mismatch");

  if (!isCommentKind(fm.kind)) errors.push("kind is required");

  const parent_id = coerceNullString(fm.parent_id);

  if (!parsed.body_md || parsed.body_md.length < 1) errors.push("body must be >= 1 char");
  if (parsed.raw_md.length > 20_000) errors.push("markdown too large (max 20KB)");

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      artifact_id,
      kind: fm.kind as CommentKind,
      parent_id,
      body_md: parsed.body_md,
      body_text: parsed.body_text,
      raw_md: parsed.raw_md,
    },
  };
}

export function validateAndNormalizeRating(params: {
  artifactIdFromPath: string;
  markdown: string;
}): { ok: true; value: NormalizedRatingInput } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const parsed = parseMarkdown<RatingFrontmatter>(params.markdown);
  const fm = parsed.frontmatter;

  const artifact_id = typeof fm.artifact_id === "string" ? fm.artifact_id.trim() : "";
  if (!artifact_id) errors.push("artifact_id is required");
  if (artifact_id && artifact_id !== params.artifactIdFromPath) errors.push("artifact_id mismatch");

  const score = validateScore(fm.score);
  if (score === null) errors.push("score is required (1..5)");

  const dims = normalizeDims(fm.dims);

  if (parsed.raw_md.length > 20_000) errors.push("markdown too large (max 20KB)");

  if (errors.length) return { ok: false, errors };

  const notes_md = parsed.body_md ? parsed.body_md : null;

  return {
    ok: true,
    value: {
      artifact_id,
      score: score!,
      dims,
      notes_md,
      raw_md: parsed.raw_md,
    },
  };
}

export function encodeCursor(cursor: { created_at: string; id: string }): string {
  return Buffer.from(JSON.stringify(cursor), "utf-8").toString("base64url");
}

export function decodeCursor(encoded: string | null): { created_at: string; id: string } | null {
  if (!encoded) return null;
  try {
    const raw = Buffer.from(encoded, "base64url").toString("utf-8");
    const parsed = JSON.parse(raw) as { created_at?: unknown; id?: unknown };
    if (typeof parsed.created_at !== "string" || typeof parsed.id !== "string") return null;
    return { created_at: parsed.created_at, id: parsed.id };
  } catch {
    return null;
  }
}
