import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { readJsonWithLimit } from "@/lib/requestLimits";

export const runtime = "nodejs";

export type PartnerTier = "founding" | "gold" | "silver" | "community";

export type Partner = {
  name: string;
  slug: string;
  website: string;
  description: string;
  logo: string;
  tier: PartnerTier;
  featured: boolean;
  joinedAt: string;
  fullDescription?: string;
  features?: string[];
  integrationGuide?: string;
  docsUrl?: string;
  contactEmail?: string;
};

type PartnerApplicationPayload = {
  name?: string;
  website?: string;
  description?: string;
  tierInterest?: string;
  contactEmail?: string;
};

type PartnerApplication = {
  id: string;
  name: string;
  website: string;
  description: string;
  tierInterest: PartnerTier;
  contactEmail: string;
  submittedAt: string;
};

const PARTNERS_PATH = path.join(process.cwd(), "data", "partners.json");
const APPLICATIONS_PATH = path.join(process.cwd(), "data", "partner-applications.json");
const MAX_BODY_BYTES = 16_000;
const TIERS: PartnerTier[] = ["founding", "gold", "silver", "community"];

async function readPartners(): Promise<Partner[]> {
  try {
    const raw = await fs.readFile(PARTNERS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as Partner[];
  } catch {
    return [];
  }
}

async function readApplications(): Promise<PartnerApplication[]> {
  try {
    const raw = await fs.readFile(APPLICATIONS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as PartnerApplication[]) : [];
  } catch {
    return [];
  }
}

async function writeApplications(applications: PartnerApplication[]) {
  await fs.writeFile(APPLICATIONS_PATH, `${JSON.stringify(applications, null, 2)}\n`, "utf-8");
}

function normalizeApplication(payload: PartnerApplicationPayload) {
  return {
    name: payload.name?.trim() ?? "",
    website: payload.website?.trim() ?? "",
    description: payload.description?.trim() ?? "",
    tierInterest: payload.tierInterest?.trim().toLowerCase() ?? "",
    contactEmail: payload.contactEmail?.trim().toLowerCase() ?? "",
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

function validateApplication(payload: ReturnType<typeof normalizeApplication>) {
  const errors: string[] = [];

  if (!payload.name) errors.push("name is required");

  if (!payload.website) {
    errors.push("website is required");
  } else if (!isValidUrl(payload.website)) {
    errors.push("website must be a valid http or https URL");
  }

  if (!payload.description) errors.push("description is required");

  if (!TIERS.includes(payload.tierInterest as PartnerTier)) {
    errors.push('tierInterest must be one of: founding, gold, silver, community');
  }

  if (!payload.contactEmail) {
    errors.push("contactEmail is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.contactEmail)) {
    errors.push("contactEmail must be valid");
  }

  return errors;
}

export async function GET(request: NextRequest) {
  const partners = await readPartners();
  const { searchParams } = new URL(request.url);

  const tierFilter = searchParams.get("tier")?.trim().toLowerCase() ?? "";
  const searchFilter = searchParams.get("search")?.trim().toLowerCase() ?? "";

  const filtered = partners.filter((partner) => {
    const matchesTier = !tierFilter || partner.tier === tierFilter;

    if (!matchesTier) {
      return false;
    }

    if (!searchFilter) {
      return true;
    }

    const haystack = `${partner.name} ${partner.description} ${partner.slug}`.toLowerCase();
    return haystack.includes(searchFilter);
  });

  return NextResponse.json(
    {
      partners: filtered,
      total: filtered.length,
      filters: {
        tier: tierFilter || null,
        search: searchFilter || null,
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
    const body = await readJsonWithLimit<PartnerApplicationPayload>(request, MAX_BODY_BYTES);
    const payload = normalizeApplication(body);
    const errors = validateApplication(payload);

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const applications = await readApplications();

    const application: PartnerApplication = {
      id: `pa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: payload.name,
      website: payload.website,
      description: payload.description,
      tierInterest: payload.tierInterest as PartnerTier,
      contactEmail: payload.contactEmail,
      submittedAt: new Date().toISOString(),
    };

    applications.push(application);
    await writeApplications(applications);

    return NextResponse.json(
      {
        success: true,
        message: "Application received. Our team will review and follow up soon.",
        application: {
          id: application.id,
          tierInterest: application.tierInterest,
          submittedAt: application.submittedAt,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    const status =
      typeof err === "object" && err && "status" in err
        ? Number((err as { status?: unknown }).status)
        : undefined;

    if (status === 413) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}
