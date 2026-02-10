import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BRAND_ASSETS_PATH = path.join(process.cwd(), "data", "brand-assets.json");

type BrandColor = {
  id: string;
  name: string;
  hex: string;
  role: string;
};

type BrandFont = {
  label: string;
  name: string;
  family: string;
  weights: number[];
  sample: string;
};

type BrandLogo = {
  id: string;
  name: string;
  description: string;
  url: string;
  width: number;
  height: number;
  fileType: string;
  background: string;
};

type BrandGuidelines = {
  dos: string[];
  donts: string[];
};

type BrandAssets = {
  updatedAt: string;
  colors: BrandColor[];
  typography: {
    primary: BrandFont;
    secondary: BrandFont;
    monospace: BrandFont;
  };
  logos: BrandLogo[];
  guidelines: BrandGuidelines;
};

async function readBrandAssets(): Promise<BrandAssets> {
  const raw = await fs.readFile(BRAND_ASSETS_PATH, "utf8");
  return JSON.parse(raw) as BrandAssets;
}

export async function GET() {
  try {
    const data = await readBrandAssets();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  } catch (error) {
    console.error("Failed to load brand assets", error);
    return NextResponse.json({ error: "Failed to load brand assets" }, { status: 500 });
  }
}
