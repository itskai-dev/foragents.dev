import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type PlanFeature = {
  name: string;
  included: boolean;
  limit?: string;
};

type PlanPricing = {
  monthly: number | null;
  yearly: number | null;
};

type PricingPlan = {
  name: string;
  slug: string;
  description: string;
  price: PlanPricing;
  features: PlanFeature[];
  limits: Record<string, string>;
  highlighted: boolean;
  interestCount: number;
  ctaLabel: string;
  ctaHref: string;
};

type PricingFile = {
  plans: PricingPlan[];
};

const PRICING_PATH = path.join(process.cwd(), "data", "pricing.json");

async function readPricingFile(): Promise<PricingFile> {
  const raw = await fs.readFile(PRICING_PATH, "utf-8");
  const parsed = JSON.parse(raw) as PricingFile;

  if (!Array.isArray(parsed?.plans)) {
    throw new Error("Invalid pricing data format");
  }

  return parsed;
}

async function writePricingFile(file: PricingFile): Promise<void> {
  await fs.writeFile(PRICING_PATH, JSON.stringify(file, null, 2));
}

export async function GET() {
  try {
    const file = await readPricingFile();

    return NextResponse.json(
      {
        plans: file.plans,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Failed to read pricing data:", error);
    return NextResponse.json(
      { error: "Failed to load pricing data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { slug?: string };
    const slug = body?.slug?.trim().toLowerCase();

    if (!slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    const file = await readPricingFile();
    const index = file.plans.findIndex((plan) => plan.slug === slug);

    if (index === -1) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const current = file.plans[index];
    const updatedPlan: PricingPlan = {
      ...current,
      interestCount: current.interestCount + 1,
    };

    file.plans[index] = updatedPlan;
    await writePricingFile(file);

    return NextResponse.json({
      success: true,
      plan: updatedPlan,
    });
  } catch (error) {
    console.error("Failed to track pricing interest:", error);
    return NextResponse.json(
      { error: "Failed to track pricing interest" },
      { status: 500 }
    );
  }
}
