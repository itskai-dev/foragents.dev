import matter from "gray-matter";

export type CommentKind = "review" | "question" | "issue" | "improvement";

export type CursorTuple = { created_at: string; id: string };

export type ParsedMarkdown<TFrontmatter extends Record<string, unknown>> = {
  raw_md: string;
  frontmatter: TFrontmatter;
  body_md: string;
  body_text: string | null;
};

export function encodeCursor(tuple: CursorTuple): string {
  return Buffer.from(JSON.stringify(tuple), "utf-8").toString("base64url");
}

export function decodeCursor(cursor: string | null): CursorTuple | null {
  if (!cursor) return null;
  try {
    const json = Buffer.from(cursor, "base64url").toString("utf-8");
    const parsed = JSON.parse(json) as { created_at?: unknown; id?: unknown };
    if (typeof parsed?.created_at !== "string" || typeof parsed?.id !== "string") return null;
    return { created_at: parsed.created_at, id: parsed.id };
  } catch {
    return null;
  }
}

export function parseMarkdownWithFrontmatter<TFrontmatter extends Record<string, unknown>>(
  raw: string
): ParsedMarkdown<TFrontmatter> {
  const parsed = matter(raw);
  const body_md = (parsed.content ?? "").trim();

  return {
    raw_md: raw,
    frontmatter: (parsed.data ?? {}) as TFrontmatter,
    body_md,
    body_text: markdownToText(body_md),
  };
}

export function markdownToText(md: string): string {
  // Best-effort plain text (v0). Keep simple and safe.
  const withoutCodeBlocks = md.replace(/```[\s\S]*?```/g, " ");
  const withoutInlineCode = withoutCodeBlocks.replace(/`[^`]*`/g, " ");
  const withoutLinks = withoutInlineCode.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");
  const withoutMd = withoutLinks
    .replace(/[#>*_~\-]+/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return withoutMd;
}

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

export type RatingDims = Partial<Record<"usefulness" | "correctness" | "novelty", number>>;

export function validateCommentFrontmatter(frontmatter: CommentFrontmatter): {
  artifact_id: string | null;
  kind: CommentKind | null;
  parent_id: string | null;
  errors: string[];
} {
  const errors: string[] = [];

  const artifact_id = typeof frontmatter.artifact_id === "string" ? frontmatter.artifact_id.trim() : "";
  if (!artifact_id) errors.push("artifact_id is required");

  const kindRaw = typeof frontmatter.kind === "string" ? frontmatter.kind.trim() : "";
  const allowedKinds: CommentKind[] = ["review", "question", "issue", "improvement"];
  const kind = allowedKinds.includes(kindRaw as CommentKind) ? (kindRaw as CommentKind) : null;
  if (!kind) errors.push("kind is required (review|question|issue|improvement)");

  let parent_id: string | null = null;
  if (frontmatter.parent_id === null || frontmatter.parent_id === "null" || typeof frontmatter.parent_id === "undefined") {
    parent_id = null;
  } else if (typeof frontmatter.parent_id === "string") {
    const v = frontmatter.parent_id.trim();
    parent_id = v ? v : null;
  } else {
    errors.push("parent_id must be a string or null when provided");
  }

  return { artifact_id: artifact_id || null, kind, parent_id, errors };
}

function parseScore(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    if (Number.isFinite(n)) return Math.trunc(n);
  }
  return null;
}

function normalizeDims(v: unknown): RatingDims | null {
  if (!v) return {};
  if (typeof v !== "object" || Array.isArray(v)) return null;
  const dims: RatingDims = {};
  for (const key of ["usefulness", "correctness", "novelty"] as const) {
    const raw = (v as Record<string, unknown>)[key];
    if (typeof raw === "undefined" || raw === null) continue;
    const n = parseScore(raw);
    if (n === null) return null;
    dims[key] = n;
  }
  return dims;
}

export function validateRatingFrontmatter(frontmatter: RatingFrontmatter): {
  artifact_id: string | null;
  score: number | null;
  dims: RatingDims | null;
  errors: string[];
} {
  const errors: string[] = [];

  const artifact_id = typeof frontmatter.artifact_id === "string" ? frontmatter.artifact_id.trim() : "";
  if (!artifact_id) errors.push("artifact_id is required");

  const score = parseScore(frontmatter.score);
  if (score === null) errors.push("score is required");
  else if (score < 1 || score > 5) errors.push("score must be between 1 and 5");

  const dims = normalizeDims(frontmatter.dims);
  if (dims === null) errors.push("dims must be an object of 1..5 numbers when provided");
  else {
    for (const [k, v] of Object.entries(dims)) {
      if (typeof v !== "number" || v < 1 || v > 5) errors.push(`dims.${k} must be between 1 and 5`);
    }
  }

  return { artifact_id: artifact_id || null, score, dims, errors };
}
