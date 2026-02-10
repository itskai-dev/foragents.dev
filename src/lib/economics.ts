import { promises as fs } from "fs";
import path from "path";

export type EconomicsCategory = "pricing" | "costs" | "revenue" | "roi";

export interface EconomicsEntry {
  id: string;
  title: string;
  content: string;
  category: EconomicsCategory;
  tags: string[];
  updatedAt: string;
}

interface EconomicsFilters {
  category?: string | null;
  search?: string | null;
}

const ECONOMICS_PATH = path.join(process.cwd(), "data", "economics.json");

const economicsCategories: EconomicsCategory[] = ["pricing", "costs", "revenue", "roi"];

function isEconomicsCategory(value: string): value is EconomicsCategory {
  return economicsCategories.includes(value as EconomicsCategory);
}

function isEconomicsEntry(item: unknown): item is EconomicsEntry {
  if (!item || typeof item !== "object") return false;

  const candidate = item as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.content === "string" &&
    typeof candidate.category === "string" &&
    isEconomicsCategory(candidate.category) &&
    Array.isArray(candidate.tags) &&
    candidate.tags.every((tag) => typeof tag === "string") &&
    typeof candidate.updatedAt === "string"
  );
}

export async function readEconomicsEntries(): Promise<EconomicsEntry[]> {
  try {
    const raw = await fs.readFile(ECONOMICS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isEconomicsEntry)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  } catch {
    return [];
  }
}

export async function writeEconomicsEntries(entries: EconomicsEntry[]): Promise<void> {
  const dir = path.dirname(ECONOMICS_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(ECONOMICS_PATH, `${JSON.stringify(entries, null, 2)}\n`, "utf-8");
}

export function filterEconomicsEntries(
  entries: EconomicsEntry[],
  filters: EconomicsFilters
): EconomicsEntry[] {
  const category = filters.category?.trim().toLowerCase();
  const search = filters.search?.trim().toLowerCase();

  return entries.filter((entry) => {
    if (category && isEconomicsCategory(category) && entry.category !== category) {
      return false;
    }

    if (!search) return true;

    return [entry.title, entry.content, entry.category, ...entry.tags]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });
}

export function normalizeEconomicsCategory(value: string): EconomicsCategory | null {
  const normalized = value.trim().toLowerCase();
  return isEconomicsCategory(normalized) ? normalized : null;
}

export function createEconomicsEntryId(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);

  return `${slug || "economics-entry"}-${Date.now().toString(36)}`;
}
