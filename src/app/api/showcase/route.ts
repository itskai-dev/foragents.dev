import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from "@/lib/requestLimits";
import {
  filterShowcaseProjects,
  normalizeTags,
  readShowcaseProjects,
  type ShowcaseProject,
  type ShowcaseSubmission,
  validateShowcaseSubmission,
  writeShowcaseProjects,
} from "@/lib/showcase";

const MAX_JSON_BYTES = 24_000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = (searchParams.get("category") || "all").trim().toLowerCase();
  const search = (searchParams.get("search") || "").trim();
  const sort = searchParams.get("sort") === "popular" ? "popular" : "newest";

  const allProjects = await readShowcaseProjects();
  const filtered = filterShowcaseProjects(allProjects, { category, search });

  const projects = [...filtered].sort((a, b) => {
    if (sort === "popular") {
      const voteDiff = b.voteCount - a.voteCount;
      if (voteDiff !== 0) return voteDiff;
    }

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
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

    const errors = validateShowcaseSubmission(body);
    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const projects = await readShowcaseProjects();
    const now = new Date().toISOString();

    const project: ShowcaseProject = {
      id: `showcase_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: (body.title as string).trim(),
      description: (body.description as string).trim(),
      url: (body.url as string).trim(),
      author: (body.author as string).trim(),
      category: body.category as ShowcaseProject["category"],
      tags: normalizeTags(body.tags),
      featured: false,
      updatedAt: now,
      voteCount: 0,
      createdAt: now,
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
