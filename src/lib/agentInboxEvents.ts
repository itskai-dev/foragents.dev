export type AgentInboxEventType =
  | "comment.created"
  | "comment.replied"
  | "comment.mentioned"
  | "rating.created_or_updated";

/**
 * Stable cursor for newest-first pagination.
 *
 * The cursor points at the *last item returned* (the oldest in the page).
 * Next page should return items strictly older than this tuple.
 */
export type AgentInboxCursor = {
  v?: 1;
  created_at: string;
  id: string;
};

export function encodeAgentInboxCursor(payload: AgentInboxCursor): string {
  const json = JSON.stringify({ v: 1, ...payload });
  return Buffer.from(json, "utf8").toString("base64url");
}

export function decodeAgentInboxCursor(cursor: string | null | undefined): AgentInboxCursor | null {
  if (!cursor) return null;
  try {
    const json = Buffer.from(cursor, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const p = parsed as { created_at?: unknown; id?: unknown };
    if (typeof p.created_at !== "string" || typeof p.id !== "string") return null;
    return { created_at: p.created_at, id: p.id, v: 1 };
  } catch {
    return null;
  }
}

export function normalizeHandle(handle: string): string {
  return (handle ?? "").replace(/^@/, "").trim();
}

export function compareEventTupleDesc(
  a: { created_at: string; id: string },
  b: { created_at: string; id: string }
): number {
  const ta = new Date(a.created_at).getTime();
  const tb = new Date(b.created_at).getTime();
  if (ta !== tb) return tb - ta;
  // tie-break: stable deterministic order by id
  return b.id.localeCompare(a.id);
}

export function isStrictlyOlderThanCursor(
  item: { created_at: string; id: string },
  cursor: AgentInboxCursor | null
): boolean {
  if (!cursor) return true;
  const ti = new Date(item.created_at).getTime();
  const tc = new Date(cursor.created_at).getTime();
  if (!Number.isFinite(ti) || !Number.isFinite(tc)) return false;

  if (ti < tc) return true;
  if (ti > tc) return false;

  // Same timestamp: only return ids *less than* the cursor id.
  return item.id.localeCompare(cursor.id) < 0;
}

export function extractMentionHandles(text: string): string[] {
  const s = (text ?? "").trim();
  if (!s) return [];

  // Allow common handle characters: letters, digits, underscore, hyphen.
  // Avoid matching emails by requiring a non-word char boundary before '@'.
  const re = /(^|[^A-Za-z0-9_])@([A-Za-z0-9_-]{1,32})/g;

  const out = new Set<string>();
  let m: RegExpExecArray | null = null;
  while ((m = re.exec(s))) {
    const h = (m[2] ?? "").trim();
    if (h) out.add(h);
  }

  return Array.from(out);
}

export type AgentInboxEventItem<TComment = unknown, TRating = unknown> = {
  /** Globally unique within the event stream; include a prefix. */
  id: string;
  type: AgentInboxEventType;
  /** Event timestamp (ISO); used for sorting/pagination. */
  created_at: string;

  artifact_id: string;

  /** Who this event is for (handle without @ when possible). */
  recipient_handle?: string;

  /** Embedded payload (optional, depending on type). */
  comment?: TComment;
  rating?: TRating;

  /** Extra info for mention events. */
  mention?: { handle: string; in_comment_id: string };
};
