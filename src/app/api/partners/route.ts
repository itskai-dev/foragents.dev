import { NextRequest, NextResponse } from "next/server";
import { readJsonWithLimit } from "@/lib/requestLimits";
import { createPartner, getPartners, type PartnerCategory, type PartnerTier } from "@/lib/partners";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 16_000;
const TIERS: PartnerTier[] = ["founding", "gold", "silver", "community"];
const CATEGORIES: PartnerCategory[] = [
  "runtime",
  "model",
  "backend",
  "hosting",
  "infrastructure",
  "framework",
];

type CreatePartnerPayload = {
  id?: string;
  name?: string;
  description?: string;
  url?: string;
  logo?: string;
  tier?: string;
  category?: string;
  tags?: string[];
};

function normalizeCreatePayload(payload: CreatePartnerPayload) {
  return {
    id: payload.id?.trim() ?? "",
    name: payload.name?.trim() ?? "",
    description: payload.description?.trim() ?? "",
    url: payload.url?.trim() ?? "",
    logo: payload.logo?.trim() ?? "",
    tier: payload.tier?.trim().toLowerCase() ?? "",
    category: payload.category?.trim().toLowerCase() ?? "",
    tags: Array.isArray(payload.tags)
      ? payload.tags.map((tag) => String(tag).trim()).filter(Boolean)
      : [],
  };
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateCreatePayload(payload: ReturnType<typeof normalizeCreatePayload>) {
  const errors: string[] = [];

  if (!payload.name) errors.push("name is required");
  if (!payload.description) errors.push("description is required");

  if (!payload.url) {
    errors.push("url is required");
  } else if (!isValidUrl(payload.url)) {
    errors.push("url must be a valid http or https URL");
  }

  if (!payload.logo) errors.push("logo is required");

  if (!TIERS.includes(payload.tier as PartnerTier)) {
    errors.push(`tier must be one of: ${TIERS.join(", ")}`);
  }

  if (!CATEGORIES.includes(payload.category as PartnerCategory)) {
    errors.push(`category must be one of: ${CATEGORIES.join(", ")}`);
  }

  return errors;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const tier = searchParams.get("tier") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  const partners = await getPartners({ tier, category, search });

  return NextResponse.json(
    {
      partners,
      total: partners.length,
      filters: {
        tier: tier?.trim() || null,
        category: category?.trim() || null,
        search: search?.trim() || null,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonWithLimit<CreatePartnerPayload>(request, MAX_BODY_BYTES);
    const payload = normalizeCreatePayload(body);
    const errors = validateCreatePayload(payload);

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const created = await createPartner({
      ...(payload.id ? { id: payload.id } : {}),
      name: payload.name,
      description: payload.description,
      url: payload.url,
      logo: payload.logo,
      tier: payload.tier as PartnerTier,
      category: payload.category as PartnerCategory,
      tags: payload.tags,
    });

    return NextResponse.json({ success: true, partner: created }, { status: 201 });
  } catch (err) {
    const status =
      typeof err === "object" && err && "status" in err
        ? Number((err as { status?: unknown }).status)
        : undefined;

    if (status === 413) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const message = err instanceof Error ? err.message : "Invalid request body. Expected JSON.";
    const responseStatus = message.includes("already exists") || message.includes("Invalid partner payload") ? 400 : 500;

    return NextResponse.json({ error: message }, { status: responseStatus });
  }
}
