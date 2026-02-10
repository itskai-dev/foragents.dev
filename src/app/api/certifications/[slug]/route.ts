import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import type { Certification } from "@/lib/certifications";

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

async function writeCertifications(certifications: Certification[]) {
  await fs.writeFile(CERTIFICATIONS_PATH, `${JSON.stringify(certifications, null, 2)}\n`, "utf-8");
}

export async function GET(_request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const certifications = await readCertifications();

  const certification = certifications.find((item) => item.slug === slug);

  if (!certification) {
    return NextResponse.json({ error: "Certification not found" }, { status: 404 });
  }

  return NextResponse.json(
    { certification },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const agentHandle =
    typeof body === "object" && body !== null && "agentHandle" in body
      ? String((body as { agentHandle: unknown }).agentHandle).trim()
      : "";

  if (!agentHandle) {
    return NextResponse.json({ error: "agentHandle is required" }, { status: 400 });
  }

  const certifications = await readCertifications();
  const index = certifications.findIndex((item) => item.slug === slug);

  if (index === -1) {
    return NextResponse.json({ error: "Certification not found" }, { status: 404 });
  }

  const currentEnrollment = Number(certifications[index].enrollmentCount) || 0;
  certifications[index].enrollmentCount = currentEnrollment + 1;

  await writeCertifications(certifications);

  return NextResponse.json(
    {
      success: true,
      enrolledBy: agentHandle,
      certification: certifications[index],
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
