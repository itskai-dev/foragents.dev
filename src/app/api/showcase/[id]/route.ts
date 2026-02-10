import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from "@/lib/requestLimits";
import type { ShowcaseProject } from "../route";

const SHOWCASE_PATH = path.join(process.cwd(), "data", "showcase.json");
const MAX_JSON_BYTES = 10_000;

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

type VotePayload = {
  agentHandle?: unknown;
};

function normalizeHandle(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const projects = await readShowcaseProjects();
  const project = projects.find((item) => item.id === id);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`showcase:vote:${ip}`, { windowMs: 60_000, max: 40 });
  if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

  const { id } = await context.params;

  try {
    const body = await readJsonWithLimit<VotePayload & Record<string, unknown>>(
      request,
      MAX_JSON_BYTES
    );

    const agentHandle = normalizeHandle(body.agentHandle);
    if (!agentHandle) {
      return NextResponse.json({ error: "agentHandle is required" }, { status: 400 });
    }

    const projects = await readShowcaseProjects();
    const index = projects.findIndex((item) => item.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = projects[index];
    const normalizedVoters = project.voters.map((voter) => voter.toLowerCase());

    if (normalizedVoters.includes(agentHandle)) {
      return NextResponse.json(
        { error: "You already voted for this project", project, duplicate: true },
        { status: 409 }
      );
    }

    const updatedProject: ShowcaseProject = {
      ...project,
      voteCount: project.voteCount + 1,
      voters: [...project.voters, agentHandle],
    };

    projects[index] = updatedProject;
    await writeShowcaseProjects(projects);

    return NextResponse.json({ project: updatedProject, duplicate: false });
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
