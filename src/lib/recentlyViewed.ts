export type RecentlyViewedType = "agent" | "artifact";

export type RecentlyViewedItem = {
  type: RecentlyViewedType;
  /** Stable identifier within type (e.g. agent handle, artifact id). */
  key: string;
  title: string;
  href: string;
  visitedAt: number;
};

const STORAGE_KEY = "foragents.recentlyViewed.v1";
const MAX_ITEMS = 50;

function safeParse(json: string | null): RecentlyViewedItem[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => typeof x === "object" && x !== null)
      .map((x) => x as Partial<RecentlyViewedItem>)
      .filter(
        (x): x is RecentlyViewedItem =>
          (x.type === "agent" || x.type === "artifact") &&
          typeof x.key === "string" &&
          typeof x.title === "string" &&
          typeof x.href === "string" &&
          typeof x.visitedAt === "number",
      );
  } catch {
    return [];
  }
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

function write(items: RecentlyViewedItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  // In-tab updates
  window.dispatchEvent(new Event("recentlyViewedUpdated"));
}

export function addRecentlyViewed(input: Omit<RecentlyViewedItem, "visitedAt"> & { visitedAt?: number }) {
  if (typeof window === "undefined") return;

  const now = typeof input.visitedAt === "number" ? input.visitedAt : Date.now();
  const nextItem: RecentlyViewedItem = { ...input, visitedAt: now };

  const current = getRecentlyViewed();
  const deduped = current.filter((x) => !(x.type === nextItem.type && x.key === nextItem.key));
  write([nextItem, ...deduped]);
}

export function clearRecentlyViewed() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("recentlyViewedUpdated"));
}

export const __recentlyViewedStorageKey = STORAGE_KEY;
