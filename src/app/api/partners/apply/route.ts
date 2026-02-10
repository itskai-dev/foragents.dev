import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { readJsonWithLimit } from "@/lib/requestLimits";

export const runtime = "nodejs";

const APPLICATIONS_PATH = path.join(process.cwd(), "data", "partner-applications.json");
const MAX_BODY_BYTES = 16_000;

type ApplicationType = "partner" | "sponsor";

type PartnerApplication = {
  id: string;
  name: string;
  company: string;
  email: string;
  type: ApplicationType;
  message: string;
  submittedAt: string;
};

type PartnerApplicationPayload = {
  name?: string;
  company?: string;
  email?: string;
  type?: string;
  message?: string;
};

function normalize(payload: PartnerApplicationPayload) {
  return {
    name: payload.name?.trim() ?? "",
    company: payload.company?.trim() ?? "",
    email: payload.email?.trim().toLowerCase() ?? "",
    type: payload.type?.trim().toLowerCase() ?? "",
    message: payload.message?.trim() ?? "",
  };
}

function validate(payload: ReturnType<typeof normalize>): string[] {
  const errors: string[] = [];

  if (!payload.name) errors.push("name is required");
  if (!payload.company) errors.push("company is required");
  if (!payload.email) {
    errors.push("email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.push("email must be valid");
  }

  if (payload.type !== "partner" && payload.type !== "sponsor") {
    errors.push('type must be either "partner" or "sponsor"');
  }

  if (!payload.message) errors.push("message is required");

  return errors;
}

async function readApplications(): Promise<PartnerApplication[]> {
  try {
    const raw = await fs.readFile(APPLICATIONS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as PartnerApplication[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeApplications(applications: PartnerApplication[]) {
  await fs.writeFile(APPLICATIONS_PATH, `${JSON.stringify(applications, null, 2)}\n`, "utf-8");
}

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonWithLimit<PartnerApplicationPayload>(request, MAX_BODY_BYTES);
    const payload = normalize(body);
    const errors = validate(payload);

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const applications = await readApplications();

    const application: PartnerApplication = {
      id: `pa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: payload.name,
      company: payload.company,
      email: payload.email,
      type: payload.type as ApplicationType,
      message: payload.message,
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
          type: application.type,
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
