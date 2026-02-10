import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

type ContributorRole = "maintainer" | "reviewer" | "contributor" | "tester" | "documentation";

type Contributor = {
  id: string;
  name: string;
  handle: string;
  role: ContributorRole;
  avatar: string;
  contributions: number;
  skills: string[];
  joinedAt: string;
  bio: string;
};

type ContributorApplication = {
  id: string;
  name: string;
  handle: string;
  roleInterest: ContributorRole;
  skills: string[];
  bio: string;
  submittedAt: string;
};

const CONTRIBUTORS_PATH = path.join(process.cwd(), "data", "contributors.json");
const APPLICATIONS_PATH = path.join(process.cwd(), "data", "contributor-applications.json");
const VALID_ROLES: ContributorRole[] = ["maintainer", "reviewer", "contributor", "tester", "documentation"];

async function readContributors(): Promise<Contributor[]> {
  const raw = await fs.readFile(CONTRIBUTORS_PATH, "utf-8");
  const parsed = JSON.parse(raw) as unknown;

  return Array.isArray(parsed) ? (parsed as Contributor[]) : [];
}

async function readApplications(): Promise<ContributorApplication[]> {
  try {
    const raw = await fs.readFile(APPLICATIONS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ContributorApplication[]) : [];
  } catch {
    return [];
  }
}

async function writeApplications(applications: ContributorApplication[]) {
  await fs.mkdir(path.dirname(APPLICATIONS_PATH), { recursive: true });
  const tmpPath = `${APPLICATIONS_PATH}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(applications, null, 2), "utf-8");
  await fs.rename(tmpPath, APPLICATIONS_PATH);
}

function normalizeSkills(skills: unknown): string[] {
  if (!Array.isArray(skills)) return [];

  return skills
    .map((skill) => (typeof skill === "string" ? skill.trim() : ""))
    .filter(Boolean)
    .slice(0, 20);
}

function isRole(role: string): role is ContributorRole {
  return VALID_ROLES.includes(role as ContributorRole);
}

export async function GET(request: NextRequest) {
  try {
    const roleParam = request.nextUrl.searchParams.get("role")?.trim().toLowerCase() ?? "";
    const searchParam = request.nextUrl.searchParams.get("search")?.trim().toLowerCase() ?? "";

    const contributors = await readContributors();

    const filtered = contributors.filter((contributor) => {
      const roleMatches = roleParam ? contributor.role === roleParam : true;

      if (!roleMatches) return false;
      if (!searchParam) return true;

      const haystack = [
        contributor.name,
        contributor.handle,
        contributor.role,
        contributor.bio,
        ...contributor.skills,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(searchParam);
    });

    return NextResponse.json(
      {
        contributors: filtered,
        total: filtered.length,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Failed to load contributors." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const handle = typeof body.handle === "string" ? body.handle.trim() : "";
    const roleInterestRaw = typeof body.roleInterest === "string" ? body.roleInterest.trim().toLowerCase() : "";
    const bio = typeof body.bio === "string" ? body.bio.trim() : "";
    const skills = normalizeSkills(body.skills);

    if (!name || !handle || !roleInterestRaw || !bio || skills.length === 0) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: "name, handle, roleInterest, skills, and bio are required.",
        },
        { status: 400 }
      );
    }

    if (!isRole(roleInterestRaw)) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: `roleInterest must be one of: ${VALID_ROLES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const application: ContributorApplication = {
      id: `app_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      handle,
      roleInterest: roleInterestRaw,
      skills,
      bio,
      submittedAt: new Date().toISOString(),
    };

    const existing = await readApplications();
    await writeApplications([...existing, application]);

    return NextResponse.json(
      {
        message: "Application submitted successfully.",
        application,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}
