import { NextRequest, NextResponse } from "next/server";
import { claimBounty, getBountyById } from "@/lib/bounties";

type ClaimBody = {
  claimant?: unknown;
  message?: unknown;
};

function validateClaimBody(body: ClaimBody):
  | { ok: true; value: { claimant: string; message: string } }
  | { ok: false; errors: string[] } {
  const errors: string[] = [];

  const claimant = typeof body.claimant === "string" ? body.claimant.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!claimant) errors.push("claimant is required");
  if (!message) errors.push("message is required");

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      claimant,
      message,
    },
  };
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: ClaimBody;
  try {
    body = (await request.json()) as ClaimBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateClaimBody(body);
  if (!validation.ok) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: validation.errors,
      },
      { status: 400 }
    );
  }

  const existing = await getBountyById(id);
  if (!existing) {
    return NextResponse.json({ error: "Bounty not found" }, { status: 404 });
  }

  if (existing.status === "completed") {
    return NextResponse.json({ error: "Completed bounties cannot be claimed" }, { status: 409 });
  }

  const bounty = await claimBounty(id, validation.value);
  if (!bounty) {
    return NextResponse.json({ error: "Bounty not found" }, { status: 404 });
  }

  return NextResponse.json(bounty);
}
