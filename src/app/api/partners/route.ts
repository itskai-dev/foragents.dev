import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

export type PartnerType = "partner" | "sponsor";
export type PartnerTier = "Gold" | "Silver" | "Bronze" | "Community";
export type IntegrationType = "API" | "SDK" | "Plugin" | "Service";

export type Partner = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  tier: PartnerTier;
  integrationType: IntegrationType;
  type: PartnerType;
  website: string;
};

const PARTNERS_PATH = path.join(process.cwd(), "data", "partners.json");

async function readPartners(): Promise<Partner[]> {
  try {
    const raw = await fs.readFile(PARTNERS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partner[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET() {
  const partners = await readPartners();

  return NextResponse.json(
    {
      partners,
      total: partners.length,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
