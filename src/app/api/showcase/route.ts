import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from "@/lib/requestLimits";

const SHOWCASE_PATH = path.join(process.cwd(), "data", "showcase.json");
const MAX_JSON_BYTES = 24_000;

export type ShowcaseCategory =
  | "tools"
  | "integrations"
  | "automations"
  | "experiments"
  | "production";

const CATEGORIES: ShowcaseCategory[] = [
  "tools",
  "integrations",
  "automations",
  "experiments",
  "production",
];

export type ShowcaseProject = {
  id: string;
  title: string;
  description: string;
  url: string;
  author: string;
  category: ShowcaseCategory;
  tags: string[];
  voteCount: number;
  createdAt: string;
  voters: string[];
};

type ShowcaseSubmission = {
  title?: unknown;
  description?: unknown;
  url?: unknown;
  author?: unknown;
  category?: unknown;
  tags?: unknown;
};

function isShowcaseProject(item: unknown): item is ShowcaseProject {
  if (!item || typeof item !== "object") return false;
  const project = item as Partial<ShowcaseProject>;

  return (
    typeof project.id === "string" &&
    typeof project.title === "string" &&
    typeof project.description === "string" &&
    typeof project.url === "string" &&
    typeof project.author === "string" &&
    typeof project.category === "string" &&
    CATEGORIES.includes(project.category as ShowcaseCategory) &&
    Array.isArray(project.tags) &&
    typeof project.voteCount === "number" &&
    typeof project.createdAt === "string" &&
    Array.isArray(project.voters)
  );
}

async function readShowcaseProjects(): Promise<ShowcaseProject[]> {
  try {
    const raw = await fs.readFile(SHOWCASE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isShowcaseProject);
  } catch {
    return [];
  }
}

async function writeShowcaseProjects(projects: ShowcaseProject[]): Promise<void> {
  await fs.mkdir(path.dirname(SHOWCASE_PATH), { recursive: true });
  await fs.writeFile(SHOWCASE_PATH, JSON.stringify(projects, null, 2));
}

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return Array.from(
    new Set(
      tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

function validateSubmission(body: ShowcaseSubmission): string[] {
  const errors: string[] = [];

  if (typeof body.title !== "string" || body.title.trim().length === 0) {
    errors.push("title is required");
  }

  if (typeof body.description !== "string" || body.description.trim().length === 0) {
    errors.push("description is required");
  }

  if (typeof body.author !== "string" || body.author.trim().length === 0) {
    errors.push("author is required");
  }

  if (typeof body.url !== "string" || body.url.trim().length === 0) {
    errors.push("url is required");
  } else {
    try {
      const parsed = new URL(body.url.trim());
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        errors.push("url must use http or https");
      }
    } catch {
      errors.push("url must be a valid URL");
    }
  }

  if (typeof body.category !== "string" || !CATEGORIES.includes(body.category as ShowcaseCategory)) {
    errors.push(`category must be one of: ${CATEGORIES.join(", ")}`);
  }

  const tags = normalizeTags(body.tags);
  if (tags.length === 0) {
    errors.push("tags must contain at least one tag");
  }

  return errors;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = (searchParams.get("category") || "all").trim().toLowerCase();
  const sort = searchParams.get("sort") === "popular" ? "popular" : "newest";

  const allProjects = await readShowcaseProjects();

  const filtered =
    category === "all"
      ? allProjects
      : allProjects.filter((project) => project.category === category);

  const projects = [...filtered].sort((a, b) => {
    if (sort === "popular") {
      const voteDiff = b.voteCount - a.voteCount;
      if (voteDiff !== 0) return voteDiff;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return NextResponse.json({ projects, total: projects.length });
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`showcase:submit:${ip}`, { windowMs: 60_000, max: 10 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

    const body = await readJsonWithLimit<ShowcaseSubmission & Record<string, unknown>>(
      request,
      MAX_JSON_BYTES
    );

    const errors = validateSubmission(body);
    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const projects = await readShowcaseProjects();

    const project: ShowcaseProject = {
      id: `showcase_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: (body.title as string).trim(),
      description: (body.description as string).trim(),
      url: (body.url as string).trim(),
      author: (body.author as string).trim(),
      category: body.category as ShowcaseCategory,
      tags: normalizeTags(body.tags),
      voteCount: 0,
      createdAt: new Date().toISOString(),
      voters: [],
    };

    projects.push(project);
    await writeShowcaseProjects(projects);

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    const status =
      typeof err === "object" && err && "status" in err
        ? Number((err as { status?: unknown }).status)
        : undefined;

    if (status === 413) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    console.error("Showcase submit error:", err);
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}
