import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

type GuideCategory = "skills" | "docs" | "testing" | "design" | "translations" | "community";
type GuideDifficulty = "beginner" | "intermediate" | "advanced";
type ContributionStatus = "pending" | "approved" | "merged";

type ContributionGuide = {
  id: string;
  title: string;
  description: string;
  category: GuideCategory;
  difficulty: GuideDifficulty;
  estimatedTime: string;
  steps: string[];
};

type Contribution = {
  id: string;
  contributorName: string;
  type: string;
  title: string;
  status: ContributionStatus;
  submittedAt: string;
};

const GUIDES_PATH = path.join(process.cwd(), "data", "contribution-guides.json");
const CONTRIBUTIONS_PATH = path.join(process.cwd(), "data", "contributions.json");
const VALID_TYPES: GuideCategory[] = ["skills", "docs", "testing", "design", "translations", "community"];

async function readGuides(): Promise<ContributionGuide[]> {
  const raw = await fs.readFile(GUIDES_PATH, "utf-8");
  const parsed = JSON.parse(raw) as unknown;
  return Array.isArray(parsed) ? (parsed as ContributionGuide[]) : [];
}

async function readContributions(): Promise<Contribution[]> {
  try {
    const raw = await fs.readFile(CONTRIBUTIONS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Contribution[]) : [];
  } catch {
    return [];
  }
}

async function writeContributions(contributions: Contribution[]) {
  await fs.mkdir(path.dirname(CONTRIBUTIONS_PATH), { recursive: true });
  const tmpPath = `${CONTRIBUTIONS_PATH}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(contributions, null, 2), "utf-8");
  await fs.rename(tmpPath, CONTRIBUTIONS_PATH);
}

function isValidType(type: string): type is GuideCategory {
  return VALID_TYPES.includes(type as GuideCategory);
}

function normalizeTitle(title: string, description: string) {
  if (title.trim()) {
    return title.trim().slice(0, 120);
  }

  const fallback = description.trim().slice(0, 80);
  return fallback.length > 0 ? fallback : "New contribution";
}

export async function GET() {
  try {
    const [guides, contributions] = await Promise.all([readGuides(), readContributions()]);

    const recentContributions = [...contributions]
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 12);

    return NextResponse.json(
      {
        guides,
        recentContributions,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Failed to load contribution data." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const typeRaw = typeof body.type === "string" ? body.type.trim().toLowerCase() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const title = typeof body.title === "string" ? body.title : "";

    if (!name || !email || !typeRaw || !description) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: "name, email, type, and description are required.",
        },
        { status: 400 }
      );
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: "email must be a valid email address.",
        },
        { status: 400 }
      );
    }

    if (!isValidType(typeRaw)) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: `type must be one of: ${VALID_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const contribution: Contribution = {
      id: `contrib_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      contributorName: name,
      type: typeRaw,
      title: normalizeTitle(title, description),
      status: "pending",
      submittedAt: new Date().toISOString(),
    };

    const existing = await readContributions();
    await writeContributions([contribution, ...existing]);

    return NextResponse.json(
      {
        message: "Contribution submitted successfully.",
        contribution,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}
