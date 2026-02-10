import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import type { TrustCenterData } from "@/lib/trustCenter";

export const runtime = "nodejs";

const TRUST_CENTER_PATH = path.join(process.cwd(), "data", "trust-center.json");

async function readTrustCenterData(): Promise<TrustCenterData | null> {
  try {
    const raw = await fs.readFile(TRUST_CENTER_PATH, "utf-8");
    const parsed = JSON.parse(raw) as TrustCenterData;

    if (
      typeof parsed?.overallTrustScore !== "number" ||
      !Array.isArray(parsed.securityCategories) ||
      !Array.isArray(parsed.certifications) ||
      !Array.isArray(parsed.incidentHistory)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function GET() {
  const data = await readTrustCenterData();

  if (!data) {
    return NextResponse.json(
      {
        error: "Trust center data unavailable",
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json(
    {
      overallTrustScore: data.overallTrustScore,
      auditResults: data.auditResults,
      securityCategories: data.securityCategories,
      certifications: data.certifications,
      incidentHistory: data.incidentHistory,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
