import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from "@/lib/requestLimits";
import { readShowcaseProjects, writeShowcaseProjects } from "@/lib/showcase";

const MAX_JSON_BYTES = 10_000;

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

    const updatedProject = {
      ...project,
      voteCount: project.voteCount + 1,
      voters: [...project.voters, agentHandle],
      updatedAt: new Date().toISOString(),
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
