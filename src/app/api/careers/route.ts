import { NextRequest, NextResponse } from "next/server";
import {
  createCareer,
  getCareers,
  readCareersFile,
  writeCareersFile,
  type CareerDepartment,
  type CareerLocation,
  type CareerStatus,
  type CareerType,
} from "@/lib/careers";

export const runtime = "nodejs";

type CreateCareerBody = {
  title?: unknown;
  department?: unknown;
  location?: unknown;
  type?: unknown;
  description?: unknown;
  requirements?: unknown;
  salary?: unknown;
  status?: unknown;
};

type SubmitApplicationBody = {
  roleId: string;
  name: string;
  email: string;
  message?: string;
};

type CareerApplication = {
  id: string;
  roleId: string;
  roleTitle: string;
  name: string;
  email: string;
  message: string;
  submittedAt: string;
};

function asDepartment(value: unknown): CareerDepartment | null {
  if (
    value === "engineering" ||
    value === "design" ||
    value === "community" ||
    value === "operations" ||
    value === "product" ||
    value === "growth"
  ) {
    return value;
  }

  return null;
}

function asLocation(value: unknown): CareerLocation | null {
  if (value === "remote" || value === "hybrid" || value === "onsite") return value;
  return null;
}

function asType(value: unknown): CareerType | null {
  if (value === "full-time" || value === "part-time" || value === "contract" || value === "bounty") return value;
  return null;
}

function asStatus(value: unknown): CareerStatus | null {
  if (value === "open" || value === "closed") return value;
  return null;
}

function parseRequirements(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function validateCreateCareer(
  body: CreateCareerBody,
):
  | {
      ok: true;
      value: {
        title: string;
        department: CareerDepartment;
        location: CareerLocation;
        type: CareerType;
        description: string;
        requirements: string[];
        salary: string;
        status: CareerStatus;
      };
    }
  | { ok: false; errors: string[] } {
  const errors: string[] = [];

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const salary = typeof body.salary === "string" ? body.salary.trim() : "";

  const department = asDepartment(body.department);
  const location = asLocation(body.location);
  const type = asType(body.type);
  const status = asStatus(body.status ?? "open");
  const requirements = parseRequirements(body.requirements);

  if (title.length < 3) errors.push("title must be at least 3 characters");
  if (!department) errors.push("department must be one of: engineering, design, community, operations, product, growth");
  if (!location) errors.push("location must be one of: remote, hybrid, onsite");
  if (!type) errors.push("type must be one of: full-time, part-time, contract, bounty");
  if (description.length < 10) errors.push("description must be at least 10 characters");
  if (!salary) errors.push("salary is required");
  if (requirements.length === 0) errors.push("requirements must include at least one item");
  if (!status) errors.push("status must be one of: open, closed");

  if (errors.length > 0 || !department || !location || !type || !status) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      title,
      department,
      location,
      type,
      description,
      requirements,
      salary,
      status,
    },
  };
}

function isApplicationPayload(body: Record<string, unknown>): body is SubmitApplicationBody {
  return typeof body.roleId === "string" && typeof body.name === "string" && typeof body.email === "string";
}

export async function GET(request: NextRequest) {
  const department = request.nextUrl.searchParams.get("department");
  const type = request.nextUrl.searchParams.get("type");
  const search = request.nextUrl.searchParams.get("search");
  const status = request.nextUrl.searchParams.get("status");

  const positions = await getCareers({ department, type, search, status });

  return NextResponse.json(
    {
      positions,
      total: positions.length,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (isApplicationPayload(body)) {
    const roleId = body.roleId.trim();
    const name = body.name.trim();
    const email = body.email.trim();
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!roleId || !name || !email || !message) {
      return NextResponse.json(
        { error: "roleId, name, email, and message are required" },
        { status: 400 },
      );
    }

    const data = await readCareersFile();
    const matchedRole = data.positions.find((role) => role.id === roleId);

    if (!matchedRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const existingApplications = Array.isArray((data as { applications?: unknown }).applications)
      ? ((data as { applications: unknown[] }).applications as CareerApplication[])
      : [];

    const application: CareerApplication = {
      id: `app_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`,
      roleId,
      roleTitle: matchedRole.title,
      name,
      email,
      message,
      submittedAt: new Date().toISOString(),
    };

    const updated = {
      ...data,
      applications: [...existingApplications, application],
    };

    await writeCareersFile(updated);

    return NextResponse.json({
      message: "Application submitted successfully",
      application,
    });
  }

  const validation = validateCreateCareer(body as CreateCareerBody);

  if (!validation.ok) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: validation.errors,
      },
      { status: 400 },
    );
  }

  const created = await createCareer(validation.value);
  return NextResponse.json(created, { status: 201 });
}
