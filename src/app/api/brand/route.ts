import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const BRAND_ASSETS_PATH = path.join(process.cwd(), "data", "brand-assets.json");
const BRAND_REQUESTS_PATH = path.join(process.cwd(), "data", "brand-requests.json");

const CATEGORIES = ["logos", "colors", "typography", "icons", "screenshots"] as const;
type BrandCategory = (typeof CATEGORIES)[number];

type BrandAsset = {
  id: string;
  name: string;
  description: string;
  category: BrandCategory;
  format: "svg" | "png" | "pdf";
  downloadUrl: string;
  usageGuidelines: string;
};

type BrandColor = {
  name: string;
  hex: string;
  usage: string;
};

type BrandTypography = {
  name: string;
  role: string;
  sample: string;
  weights: number[];
};

type BrandData = {
  updatedAt: string;
  pressContact: {
    name: string;
    email: string;
  };
  colorPalette: BrandColor[];
  typography: BrandTypography[];
  usageGuidelines: string[];
  assets: BrandAsset[];
};

type BrandRequestRecord = {
  id: string;
  name: string;
  email: string;
  description: string;
  createdAt: string;
};

async function readBrandData(): Promise<BrandData> {
  const raw = await fs.readFile(BRAND_ASSETS_PATH, "utf8");
  return JSON.parse(raw) as BrandData;
}

async function readBrandRequests(): Promise<BrandRequestRecord[]> {
  try {
    const raw = await fs.readFile(BRAND_REQUESTS_PATH, "utf8");
    return JSON.parse(raw) as BrandRequestRecord[];
  } catch {
    return [];
  }
}

async function writeBrandRequests(requests: BrandRequestRecord[]) {
  await fs.writeFile(BRAND_REQUESTS_PATH, `${JSON.stringify(requests, null, 2)}\n`, "utf8");
}

export async function GET(request: NextRequest) {
  try {
    const data = await readBrandData();
    const category = request.nextUrl.searchParams.get("category");

    if (category && !CATEGORIES.includes(category as BrandCategory)) {
      return NextResponse.json(
        { error: `Invalid category. Use one of: ${CATEGORIES.join(", ")}` },
        { status: 400 }
      );
    }

    const assets = category
      ? data.assets.filter((asset) => asset.category === category)
      : data.assets;

    return NextResponse.json({
      ...data,
      assets,
      filters: {
        category: category ?? null,
        availableCategories: CATEGORIES,
      },
    });
  } catch (error) {
    console.error("Failed to load brand assets", error);
    return NextResponse.json({ error: "Failed to load brand assets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<{
      name: string;
      email: string;
      description: string;
    }>;

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const description = body.description?.trim();

    if (!name || !email || !description) {
      return NextResponse.json(
        { error: "name, email, and description are required" },
        { status: 400 }
      );
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const requests = await readBrandRequests();
    const newRequest: BrandRequestRecord = {
      id: `req_${Date.now()}`,
      name,
      email,
      description,
      createdAt: new Date().toISOString(),
    };

    await writeBrandRequests([newRequest, ...requests]);

    return NextResponse.json(
      {
        ok: true,
        message: "Request received. The press team will follow up shortly.",
        request: newRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to save press request", error);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}
