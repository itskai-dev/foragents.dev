import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import type { Certification, CertificationLevel } from "@/lib/certifications";

export const runtime = "nodejs";

const CERTIFICATIONS_PATH = path.join(process.cwd(), "data", "certifications.json");

async function readCertifications(): Promise<Certification[]> {
  try {
    const raw = await fs.readFile(CERTIFICATIONS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Certification[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const certifications = await readCertifications();

  const levelParam = request.nextUrl.searchParams.get("level")?.toLowerCase();
  const searchParam = request.nextUrl.searchParams.get("search")?.trim().toLowerCase();

  const validLevels: CertificationLevel[] = ["beginner", "intermediate", "advanced", "expert"];
  const levelFilter = validLevels.includes(levelParam as CertificationLevel)
    ? (levelParam as CertificationLevel)
    : null;

  const filtered = certifications.filter((cert) => {
    const levelMatches = levelFilter ? cert.level === levelFilter : true;
    const searchMatches = searchParam
      ? cert.title.toLowerCase().includes(searchParam) ||
        cert.description.toLowerCase().includes(searchParam) ||
        cert.modules.some((module) => module.name.toLowerCase().includes(searchParam))
      : true;

    return levelMatches && searchMatches;
  });

  return NextResponse.json(
    {
      certifications: filtered,
      total: filtered.length,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
