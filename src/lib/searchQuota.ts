import crypto from "crypto";

export type SearchQuotaUserState = "anonymous" | "free" | "premium";

export type SearchQuotaStatus = {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
  resetAt: string; // ISO
  id: string; // identifier used for quota
};

type StoreEntry = {
  dateKey: string;
  used: number;
};

function getUtcDateKey(now = new Date()): string {
  // Daily quota: reset at UTC day boundary to keep it deterministic across regions.
  return now.toISOString().slice(0, 10);
}

function getResetAtIso(now = new Date()): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  return d.toISOString();
}

function getStore(): Map<string, StoreEntry> {
  const g = globalThis as unknown as { __faSearchQuotaStore?: Map<string, StoreEntry> };
  if (!g.__faSearchQuotaStore) g.__faSearchQuotaStore = new Map();
  return g.__faSearchQuotaStore;
}

export function newAnonymousSearchId(): string {
  return crypto.randomUUID();
}

export function checkAndConsumeSearchQuota({
  id,
  limit,
  now,
}: {
  id: string;
  limit: number;
  now?: Date;
}): SearchQuotaStatus {
  const store = getStore();
  const dateKey = getUtcDateKey(now);
  const key = `${dateKey}:${id}`;

  const existing = store.get(key);
  const used = existing?.used ?? 0;

  const allowed = used < limit;
  const nextUsed = allowed ? used + 1 : used;
  store.set(key, { dateKey, used: nextUsed });

  const remaining = Math.max(0, limit - nextUsed);

  return {
    allowed,
    remaining,
    limit,
    used: nextUsed,
    resetAt: getResetAtIso(now),
    id,
  };
}

export function getQuotaLimitForUserState(state: SearchQuotaUserState): number {
  if (state === "premium") return 1000000;
  if (state === "free") return 10;
  return 3;
}
