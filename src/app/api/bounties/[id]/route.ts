import { NextRequest, NextResponse } from "next/server";
import { getBountyById, transitionBounty, type BountyAction } from "@/lib/bounties";

type TransitionBody = {
  action?: unknown;
  agentHandle?: unknown;
  notes?: unknown;
};

function parseAction(value: unknown): BountyAction | null {
  if (value === "claim" || value === "submit" || value === "complete") return value;
  return null;
}

function validateTransitionBody(
  body: TransitionBody
):
  | {
      ok: true;
      value: {
        action: BountyAction;
        agentHandle: string;
        notes?: string;
      };
    }
  | { ok: false; errors: string[] } {
  const errors: string[] = [];

  const action = parseAction(body.action);
  const agentHandle = typeof body.agentHandle === "string" ? body.agentHandle.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";

  if (!action) errors.push("action must be one of: claim, submit, complete");
  if (!agentHandle) errors.push("agentHandle is required");
  if (action === "submit" && notes.length < 3) errors.push("notes must be at least 3 characters when action is submit");

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      action: action as BountyAction,
      agentHandle,
      ...(notes ? { notes } : {}),
    },
  };
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bounty = await getBountyById(id);

  if (!bounty) {
    return NextResponse.json({ error: "Bounty not found" }, { status: 404 });
  }

  return NextResponse.json(bounty, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: TransitionBody;

  try {
    body = (await request.json()) as TransitionBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateTransitionBody(body);
  if (!validation.ok) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: validation.errors,
      },
      { status: 400 }
    );
  }

  const result = await transitionBounty({
    bountyId: id,
    action: validation.value.action,
    agentHandle: validation.value.agentHandle,
    ...(validation.value.notes ? { notes: validation.value.notes } : {}),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.bounty);
}
