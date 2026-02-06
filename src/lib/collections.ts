export type CollectionVisibility = "private" | "public";

// NOTE: This module is imported from Client Components.
// Avoid importing server-only code (e.g., agent verification utilities that use node:dns).
const HANDLE_RE = /^@([a-z0-9_\-\.]{1,64})@([a-z0-9\-\.]{1,253})$/i;

export function normalizeOwnerHandle(input: string): string | null {
  const trimmed = input.trim();
  const m = HANDLE_RE.exec(trimmed);
  if (!m) return null;
  const name = m[1];
  const domain = m[2];
  return `@${name}@${domain}`.toLowerCase();
}

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function randomSlugSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

export async function ensureUniqueSlug(opts: {
  desired: string;
  exists: (slug: string) => Promise<boolean>;
}): Promise<string> {
  const base = slugify(opts.desired) || "collection";
  if (!(await opts.exists(base))) return base;

  for (let i = 0; i < 10; i++) {
    const candidate = `${base}-${randomSlugSuffix()}`;
    if (!(await opts.exists(candidate))) return candidate;
  }

  // Very unlikely; fall back to timestamp
  return `${base}-${Date.now().toString(36)}`;
}
