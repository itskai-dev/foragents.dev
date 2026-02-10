import { NextRequest, NextResponse } from "next/server";

import {
  normalizeSteps,
  readWorkflows,
  writeWorkflows,
  type WorkflowRecord,
} from "@/lib/server/workflowStore";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase() || "";

  const workflows = await readWorkflows();
  const filtered = !search
    ? workflows
    : workflows.filter((workflow) => {
        return (
          workflow.name.toLowerCase().includes(search)
          || workflow.description.toLowerCase().includes(search)
          || workflow.steps.some((step) => step.name.toLowerCase().includes(search))
        );
      });

  return NextResponse.json({ workflows: filtered });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      name?: unknown;
      description?: unknown;
      steps?: unknown;
    };

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const steps = normalizeSteps(body.steps);

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    if (steps.length === 0) {
      return NextResponse.json({ error: "steps must be a non-empty array" }, { status: 400 });
    }

    const workflows = await readWorkflows();
    const now = new Date().toISOString();

    const workflow: WorkflowRecord = {
      id: `wf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      description,
      steps,
      enabled: true,
      createdAt: now,
      updatedAt: now,
    };

    workflows.unshift(workflow);
    await writeWorkflows(workflows);

    return NextResponse.json({ workflow }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}
