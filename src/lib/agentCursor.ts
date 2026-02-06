export type FeedCursorPayload = {
  /** ISO timestamp of newest item the client has seen */
  t: string;
  /** Item ids seen at exactly timestamp t (tie-break) */
  ids?: string[];
  /** Cursor schema version */
  v?: 1;
};

export function encodeCursor(payload: FeedCursorPayload): string {
  const json = JSON.stringify({ v: 1, ...payload });
  return Buffer.from(json, "utf8").toString("base64url");
}

export function decodeCursor(cursor: string | null | undefined): FeedCursorPayload | null {
  if (!cursor) return null;
  try {
    const json = Buffer.from(cursor, "base64url").toString("utf8");
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.t !== "string") return null;
    if (parsed.ids && !Array.isArray(parsed.ids)) return null;
    return parsed as FeedCursorPayload;
  } catch {
    return null;
  }
}

export function isNewerThanCursor(opts: {
  itemPublishedAt: string;
  itemId: string;
  cursor: FeedCursorPayload;
}): boolean {
  const { itemPublishedAt, itemId, cursor } = opts;
  const itemTime = new Date(itemPublishedAt).getTime();
  const cursorTime = new Date(cursor.t).getTime();

  if (!Number.isFinite(itemTime) || !Number.isFinite(cursorTime)) return false;

  if (itemTime > cursorTime) return true;
  if (itemTime < cursorTime) return false;

  // Same timestamp: treat as new if we haven't seen this id at that timestamp.
  const seenIds = new Set(cursor.ids || []);
  return !seenIds.has(itemId);
}
