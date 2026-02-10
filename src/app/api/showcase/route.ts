import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from "@/lib/requestLimits";

const SHOWCASE_PATH = path.join(process.cwd(), "data", "showcase.json");
const MAX_JSON_BYTES = 24_000;

type ShowcaseProject = {
  id: string;
  title: string;
  description: string;
  url: string;
  author: string;
  tags: string[];
  screenshot?: string;
  featured: boolean;
  createdAt: string;
};

async function readShowcaseProjects(): Promise<ShowcaseProject[]> {
  try {
    const raw = await fs.readFile(SHOWCASE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is ShowcaseProject => {
      return !!item && typeof item === "object" && typeof (item as ShowcaseProject).id === "string";
    });
  } catch {
    return [];
  }
}

async function writeShowcaseProjects(projects: ShowcaseProject[]): Promise<void> {
  const dir = path.dirname(SHOWCASE_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(SHOWCASE_PATH, JSON.stringify(projects, null, 2));
}

type ShowcaseSubmission = {
  title?: unknown;
  description?: unknown;
  url?: unknown;
  author?: unknown;
  tags?: unknown;
  screenshot?: unknown;
};

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

  if (!Array.isArray(body.tags)) {
    errors.push("tags must be an array of strings");
  } else {
    const normalizedTags = body.tags
      .filter((tag): tag is string => typeof tag === "string")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    if (normalizedTags.length === 0) {
      errors.push("tags must contain at least one tag");
    }
  }

  if (body.screenshot !== undefined && body.screenshot !== null) {
    if (typeof body.screenshot !== "string" || body.screenshot.trim().length === 0) {
      errors.push("screenshot must be a non-empty string when provided");
    } else {
      try {
        const parsed = new URL(body.screenshot.trim());
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          errors.push("screenshot must use http or https");
        }
      } catch {
        errors.push("screenshot must be a valid URL");
      }
    }
  }

  return errors;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  const tag = (searchParams.get("tag") || "").trim().toLowerCase();
  const sort = searchParams.get("sort") === "recent" ? "recent" : "featured";

  const allProjects = await readShowcaseProjects();

  let projects = allProjects.filter((project) => {
    if (search) {
      const haystack = [
        project.title,
        project.description,
        project.author,
        project.url,
        ...project.tags,
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(search)) {
        return false;
      }
    }

    if (tag && !project.tags.map((t) => t.toLowerCase()).includes(tag)) {
      return false;
    }

    return true;
  });

  projects = projects.sort((a, b) => {
    const timeDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    if (sort === "recent") {
      return timeDiff;
    }

    if (a.featured === b.featured) {
      return timeDiff;
    }

    return a.featured ? -1 : 1;
  });

  return NextResponse.json({
    projects,
    total: projects.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`showcase:post:${ip}`, { windowMs: 60_000, max: 10 });
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

    const tags = (body.tags as string[])
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    const project: ShowcaseProject = {
      id: `showcase_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: (body.title as string).trim(),
      description: (body.description as string).trim(),
      url: (body.url as string).trim(),
      author: (body.author as string).trim(),
      tags: Array.from(new Set(tags)),
      ...(body.screenshot ? { screenshot: (body.screenshot as string).trim() } : {}),
      featured: false,
      createdAt: new Date().toISOString(),
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
