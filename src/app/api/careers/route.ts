import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const CAREERS_FILE_PATH = path.join(process.cwd(), "data", "careers.json");
const VALID_TYPES = ["full-time", "part-time", "contract"] as const;

type JobType = (typeof VALID_TYPES)[number];

type JobListing = {
  id: string;
  title: string;
  department: string;
  type: JobType;
  location: "remote" | "hybrid";
  description: string;
  requirements: string[];
  postedAt: string;
  open: boolean;
};

type JobApplication = {
  id: string;
  name: string;
  email: string;
  role: string;
  coverLetter: string;
  portfolioUrl?: string;
  submittedAt: string;
};

type CareersData = {
  positions: JobListing[];
  applications: JobApplication[];
};

async function readCareersData(): Promise<CareersData> {
  const raw = await fs.readFile(CAREERS_FILE_PATH, "utf8");
  return JSON.parse(raw) as CareersData;
}

async function writeCareersData(data: CareersData) {
  await fs.writeFile(CAREERS_FILE_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function GET(request: NextRequest) {
  try {
    const data = await readCareersData();
    const { searchParams } = new URL(request.url);

    const department = searchParams.get("department")?.toLowerCase().trim();
    const type = searchParams.get("type")?.toLowerCase().trim();

    const filtered = data.positions.filter((job) => {
      const departmentMatches = department ? job.department.toLowerCase() === department : true;
      const typeMatches = type ? job.type === type : true;
      return departmentMatches && typeMatches;
    });

    return NextResponse.json({
      positions: filtered,
      total: filtered.length,
    });
  } catch (error) {
    console.error("Failed to read careers data", error);
    return NextResponse.json({ error: "Failed to load careers data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as {
      name?: string;
      email?: string;
      role?: string;
      coverLetter?: string;
      portfolioUrl?: string;
    };

    const name = payload.name?.trim();
    const email = payload.email?.trim();
    const role = payload.role?.trim();
    const coverLetter = payload.coverLetter?.trim();
    const portfolioUrl = payload.portfolioUrl?.trim();

    if (!name || !email || !role || !coverLetter) {
      return NextResponse.json(
        { error: "name, email, role, and coverLetter are required" },
        { status: 400 },
      );
    }

    const data = await readCareersData();

    const application: JobApplication = {
      id: `app_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`,
      name,
      email,
      role,
      coverLetter,
      portfolioUrl: portfolioUrl || undefined,
      submittedAt: new Date().toISOString(),
    };

    const updated: CareersData = {
      ...data,
      applications: [...(data.applications ?? []), application],
    };

    await writeCareersData(updated);

    return NextResponse.json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Failed to submit application", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
