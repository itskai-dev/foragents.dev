import { promises as fs } from "fs";
import path from "path";

export const SPONSORS_PATH = path.join(process.cwd(), "data", "sponsors.json");

export type SponsorTier = {
  name: string;
  price: number;
  perks: string[];
};

export type SponsorRecord = {
  id: string;
  name: string;
  tier: string;
  url: string;
  logo: string;
  description: string;
  amount: number;
  since: string;
  updatedAt: string;
};

export type SponsorTierSummary = SponsorTier & {
  sponsorCount: number;
};

export type SponsorsFile = {
  tiers: SponsorTier[];
  sponsors: SponsorRecord[];
};

export type SponsorFilters = {
  tier?: string;
  search?: string;
};

export type CreateSponsorInput = {
  name?: string;
  tier?: string;
  url?: string;
  logo?: string;
  description?: string;
  amount?: number;
  since?: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function normalizeTier(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function safeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function safeNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : Number(value);
}

function parseSponsor(value: unknown): SponsorRecord | null {
  if (!isObject(value)) {
    return null;
  }

  const id = safeString(value.id);
  const name = safeString(value.name);
  const tier = normalizeTier(safeString(value.tier));
  const url = safeString(value.url);
  const logo = safeString(value.logo);
  const description = safeString(value.description);
  const amount = safeNumber(value.amount);
  const since = safeString(value.since);
  const updatedAt = safeString(value.updatedAt);

  if (!id || !name || !tier || !url || !logo || !description || !Number.isFinite(amount) || amount <= 0 || !since || !updatedAt) {
    return null;
  }

  return {
    id,
    name,
    tier,
    url,
    logo,
    description,
    amount,
    since,
    updatedAt,
  };
}

function parseTier(value: unknown): SponsorTier | null {
  if (!isObject(value)) {
    return null;
  }

  const name = normalizeTier(safeString(value.name));
  const price = safeNumber(value.price);
  const perks = Array.isArray(value.perks) ? value.perks.filter((perk): perk is string => typeof perk === "string") : [];

  if (!name || !Number.isFinite(price) || price <= 0 || perks.length === 0) {
    return null;
  }

  return { name, price, perks };
}

export async function readSponsorsData(): Promise<SponsorsFile> {
  try {
    const raw = await fs.readFile(SPONSORS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!isObject(parsed)) {
      return { tiers: [], sponsors: [] };
    }

    const tiers = Array.isArray(parsed.tiers) ? parsed.tiers.map(parseTier).filter((item): item is SponsorTier => item !== null) : [];
    const sponsors = Array.isArray(parsed.sponsors)
      ? parsed.sponsors.map(parseSponsor).filter((item): item is SponsorRecord => item !== null)
      : [];

    return { tiers, sponsors };
  } catch {
    return { tiers: [], sponsors: [] };
  }
}

export async function writeSponsorsData(data: SponsorsFile): Promise<void> {
  await fs.writeFile(SPONSORS_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

export function filterSponsors(sponsors: SponsorRecord[], filters: SponsorFilters): SponsorRecord[] {
  const tier = normalizeTier(filters.tier);
  const search = (filters.search ?? "").trim().toLowerCase();

  return sponsors
    .filter((sponsor) => {
      if (tier && tier !== "all" && sponsor.tier !== tier) {
        return false;
      }

      if (!search) {
        return true;
      }

      return [sponsor.name, sponsor.description, sponsor.url, sponsor.tier].some((field) => field.toLowerCase().includes(search));
    })
    .sort((a, b) => {
      if (b.amount !== a.amount) {
        return b.amount - a.amount;
      }

      return a.name.localeCompare(b.name);
    });
}

export function buildTierSummaries(tiers: SponsorTier[], sponsors: SponsorRecord[]): SponsorTierSummary[] {
  return tiers.map((tier) => ({
    ...tier,
    sponsorCount: sponsors.filter((sponsor) => sponsor.tier === tier.name).length,
  }));
}

export function validateCreateSponsor(input: CreateSponsorInput, tiers: SponsorTier[]): string[] {
  const errors: string[] = [];

  const name = safeString(input.name);
  const tier = normalizeTier(input.tier);
  const url = safeString(input.url);
  const logo = safeString(input.logo);
  const description = safeString(input.description);
  const amount = safeNumber(input.amount);
  const since = safeString(input.since);

  if (!name) {
    errors.push("name is required");
  }

  const tierExists = tiers.some((item) => item.name === tier);
  if (!tierExists) {
    errors.push("tier must be one of the available sponsor tiers");
  }

  if (!url) {
    errors.push("url is required");
  }

  if (!logo) {
    errors.push("logo is required");
  }

  if (!description) {
    errors.push("description is required");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.push("amount must be a positive number");
  }

  if (!since || Number.isNaN(Date.parse(since))) {
    errors.push("since must be a valid date string");
  }

  return errors;
}

export function createSponsorRecord(input: CreateSponsorInput): SponsorRecord {
  const now = new Date().toISOString();

  return {
    id: `spn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: safeString(input.name),
    tier: normalizeTier(input.tier),
    url: safeString(input.url),
    logo: safeString(input.logo),
    description: safeString(input.description),
    amount: safeNumber(input.amount),
    since: safeString(input.since),
    updatedAt: now,
  };
}
