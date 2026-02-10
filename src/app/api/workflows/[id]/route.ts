import { NextRequest, NextResponse } from "next/server";

import { normalizeSteps, readWorkflows, writeWorkflows } from "@/lib/server/workflowStore";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const workflows = await readWorkflows();
  const workflow = workflows.find((item) => item.id === id);

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  return NextResponse.json({ workflow });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await request.json() as {
      name?: unknown;
      description?: unknown;
      steps?: unknown;
      enabled?: unknown;
    };

    const workflows = await readWorkflows();
    const index = workflows.findIndex((item) => item.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const current = workflows[index];
    const now = new Date().toISOString();

    const next = {
      ...current,
      updatedAt: now,
    };

    if (typeof body.name === "string") {
      const trimmed = body.name.trim();
      if (!trimmed) {
        return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
      }
      next.name = trimmed;
    }

    if (typeof body.description === "string") {
      next.description = body.description.trim();
    }

    if (body.steps !== undefined) {
      const steps = normalizeSteps(body.steps);
      if (steps.length === 0) {
        return NextResponse.json({ error: "steps must be a non-empty array" }, { status: 400 });
      }
      next.steps = steps;
    }

    if (typeof body.enabled === "boolean") {
      next.enabled = body.enabled;
    }

    workflows[index] = next;
    await writeWorkflows(workflows);

    return NextResponse.json({ workflow: next });
  } catch {
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const workflows = await readWorkflows();
  const nextWorkflows = workflows.filter((item) => item.id !== id);

  if (nextWorkflows.length === workflows.length) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  await writeWorkflows(nextWorkflows);

  return new NextResponse(null, { status: 204 });
}
