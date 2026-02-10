import { promises as fs } from "node:fs";
import path from "node:path";
import seedEntries from "@/data/brand-kit.json";

export const brandKitTypes = ["logo", "color", "font", "guideline"] as const;

export type BrandKitType = (typeof brandKitTypes)[number];

export type BrandKitEntry = {
  id: string;
  name: string;
  type: BrandKitType;
  description: string;
  url: string;
  format: string;
  updatedAt: string;
};

export type BrandKitQuery = {
  type?: BrandKitType;
  search?: string;
};

export type CreateBrandKitInput = {
  name: string;
  type: BrandKitType;
  description: string;
  url: string;
  format: string;
  id?: string;
};

const BRAND_KIT_PATH = path.join(process.cwd(), "data", "brand-kit.json");
const SRC_BRAND_KIT_PATH = path.join(process.cwd(), "src", "data", "brand-kit.json");

function isBrandKitType(value: unknown): value is BrandKitType {
  return typeof value === "string" && brandKitTypes.includes(value as BrandKitType);
}

function isValidIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function normalizeEntry(input: unknown): BrandKitEntry | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return null;
  }

  const row = input as Record<string, unknown>;

  if (
    typeof row.id !== "string" ||
    typeof row.name !== "string" ||
    !isBrandKitType(row.type) ||
    typeof row.description !== "string" ||
    typeof row.url !== "string" ||
    typeof row.format !== "string"
  ) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    type: row.type,
    description: row.description,
    url: row.url,
    format: row.format,
    updatedAt: isValidIsoDate(row.updatedAt) ? row.updatedAt : new Date().toISOString(),
  };
}

function normalizeData(raw: unknown): BrandKitEntry[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((entry) => normalizeEntry(entry))
    .filter((entry): entry is BrandKitEntry => entry !== null)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

async function writeBothPaths(entries: BrandKitEntry[]) {
  const payload = `${JSON.stringify(entries, null, 2)}\n`;

  await fs.mkdir(path.dirname(BRAND_KIT_PATH), { recursive: true });
  await fs.mkdir(path.dirname(SRC_BRAND_KIT_PATH), { recursive: true });

  await Promise.all([
    fs.writeFile(BRAND_KIT_PATH, payload, "utf-8"),
    fs.writeFile(SRC_BRAND_KIT_PATH, payload, "utf-8"),
  ]);
}

export async function readBrandKit(): Promise<BrandKitEntry[]> {
  try {
    const raw = await fs.readFile(BRAND_KIT_PATH, "utf-8");
    return normalizeData(JSON.parse(raw));
  } catch {
    return normalizeData(seedEntries as unknown[]);
  }
}

export async function queryBrandKit(query: BrandKitQuery = {}): Promise<BrandKitEntry[]> {
  const entries = await readBrandKit();

  return entries.filter((entry) => {
    if (query.type && entry.type !== query.type) {
      return false;
    }

    if (query.search) {
      const needle = query.search.toLowerCase();
      const haystack = `${entry.name} ${entry.description} ${entry.format} ${entry.url}`.toLowerCase();
      if (!haystack.includes(needle)) {
        return false;
      }
    }

    return true;
  });
}

export async function createBrandKitEntry(input: CreateBrandKitInput): Promise<BrandKitEntry> {
  if (!isBrandKitType(input.type)) {
    throw new Error("Invalid brand kit type");
  }

  const name = input.name.trim();
  const description = input.description.trim();
  const url = input.url.trim();
  const format = input.format.trim();

  if (!name || !description || !url || !format) {
    throw new Error("name, description, url, and format are required");
  }

  const entries = await readBrandKit();

  const created: BrandKitEntry = {
    id:
      input.id?.trim().length
        ? input.id.trim()
        : `brand_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    type: input.type,
    description,
    url,
    format,
    updatedAt: new Date().toISOString(),
  };

  await writeBothPaths([created, ...entries]);

  return created;
}

export { isBrandKitType };
