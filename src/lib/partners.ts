import { promises as fs } from "fs";
import path from "path";

export type PartnerTier = "founding" | "gold" | "silver" | "community";

export type PartnerCategory =
  | "runtime"
  | "model"
  | "backend"
  | "hosting"
  | "infrastructure"
  | "framework";

export type Partner = {
  id: string;
  name: string;
  description: string;
  url: string;
  logo: string;
  tier: PartnerTier;
  category: PartnerCategory;
  tags: string[];
  updatedAt: string;
  slug: string;
  featured?: boolean;
  fullDescription?: string;
  features?: string[];
  integrationGuide?: string;
  docsUrl?: string;
  contactEmail?: string;
};

export type PartnerFilters = {
  tier?: string;
  category?: string;
  search?: string;
};

const PARTNERS_PATH = path.join(process.cwd(), "data", "partners.json");

const ALLOWED_TIERS: PartnerTier[] = ["founding", "gold", "silver", "community"];
const ALLOWED_CATEGORIES: PartnerCategory[] = [
  "runtime",
  "model",
  "backend",
  "hosting",
  "infrastructure",
  "framework",
];

function isPartnerTier(value: string): value is PartnerTier {
  return ALLOWED_TIERS.includes(value as PartnerTier);
}

function isPartnerCategory(value: string): value is PartnerCategory {
  return ALLOWED_CATEGORIES.includes(value as PartnerCategory);
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizePartner(input: Partial<Partner>): Partner | null {
  const name = input.name?.trim() ?? "";
  const description = input.description?.trim() ?? "";
  const url = input.url?.trim() ?? "";
  const logo = input.logo?.trim() ?? "";
  const tier = input.tier?.trim().toLowerCase() ?? "";
  const category = input.category?.trim().toLowerCase() ?? "";

  if (!name || !description || !isValidUrl(url) || !logo) {
    return null;
  }

  if (!isPartnerTier(tier) || !isPartnerCategory(category)) {
    return null;
  }

  const tags = Array.isArray(input.tags)
    ? input.tags
        .map((tag) => String(tag).trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 12)
    : [];

  const slug = input.slug?.trim() || toSlug(name);

  return {
    id: input.id?.trim() || `partner_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    description,
    url,
    logo,
    tier,
    category,
    tags,
    updatedAt: input.updatedAt?.trim() || new Date().toISOString(),
    slug,
    ...(typeof input.featured === "boolean" ? { featured: input.featured } : {}),
    ...(input.fullDescription ? { fullDescription: input.fullDescription } : {}),
    ...(Array.isArray(input.features) ? { features: input.features } : {}),
    ...(input.integrationGuide ? { integrationGuide: input.integrationGuide } : {}),
    ...(input.docsUrl ? { docsUrl: input.docsUrl } : {}),
    ...(input.contactEmail ? { contactEmail: input.contactEmail } : {}),
  };
}

export async function readPartners(): Promise<Partner[]> {
  try {
    const raw = await fs.readFile(PARTNERS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry) => normalizePartner(entry as Partial<Partner>))
      .filter((entry): entry is Partner => Boolean(entry));
  } catch {
    return [];
  }
}

export async function writePartners(partners: Partner[]) {
  await fs.writeFile(PARTNERS_PATH, `${JSON.stringify(partners, null, 2)}\n`, "utf-8");
}

export async function getPartners(filters: PartnerFilters = {}): Promise<Partner[]> {
  const partners = await readPartners();

  const tierFilter = filters.tier?.trim().toLowerCase();
  const categoryFilter = filters.category?.trim().toLowerCase();
  const searchFilter = filters.search?.trim().toLowerCase();

  return partners.filter((partner) => {
    if (tierFilter && partner.tier !== tierFilter) {
      return false;
    }

    if (categoryFilter && partner.category !== categoryFilter) {
      return false;
    }

    if (!searchFilter) {
      return true;
    }

    const haystack = `${partner.name} ${partner.description} ${partner.slug} ${partner.category} ${partner.tags.join(" ")}`.toLowerCase();
    return haystack.includes(searchFilter);
  });
}

export async function getPartnerBySlug(slug: string): Promise<Partner | undefined> {
  const partners = await readPartners();
  return partners.find((partner) => partner.slug === slug);
}

export async function createPartner(payload: Partial<Partner>): Promise<Partner> {
  const normalized = normalizePartner(payload);

  if (!normalized) {
    throw new Error("Invalid partner payload");
  }

  const partners = await readPartners();

  const slugExists = partners.some((partner) => partner.slug === normalized.slug);
  if (slugExists) {
    throw new Error("Partner slug already exists");
  }

  const idExists = partners.some((partner) => partner.id === normalized.id);
  if (idExists) {
    normalized.id = `partner_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  const created = {
    ...normalized,
    updatedAt: new Date().toISOString(),
  };

  partners.push(created);
  await writePartners(partners);

  return created;
}
