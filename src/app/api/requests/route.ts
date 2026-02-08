import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
  readJsonWithLimit,
} from "@/lib/requestLimits";
import {
  makeRequestId,
  readKitRequestsFile,
  sortRequestsByVotes,
  writeKitRequestsFile,
  getVotesForRequest,
  KitRequest,
} from "@/lib/kitRequestsStore";

const MAX_BODY_BYTES = 24_000;

function validateNewRequest(body: Record<string, unknown>): {
  ok: true;
  value: Omit<KitRequest, "id" | "createdAt">;
} | { ok: false; errors: string[] } {
  const errors: string[] = [];

  const kitName = typeof body.kitName === "string" ? body.kitName.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const useCase = typeof body.useCase === "string" ? body.useCase.trim() : "";
  const requesterAgentIdRaw = typeof body.requesterAgentId === "string" ? body.requesterAgentId.trim() : "";

  if (!kitName) errors.push("kitName is required");
  if (kitName.length > 120) errors.push("kitName must be under 120 characters");

  if (!description) errors.push("description is required");
  if (description.length > 2000) errors.push("description must be under 2,000 characters");

  if (!useCase) errors.push("useCase is required");
  if (useCase.length > 2000) errors.push("useCase must be under 2,000 characters");

  if (requesterAgentIdRaw.length > 200) errors.push("requesterAgentId must be under 200 characters");

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      kitName,
      description,
      useCase,
      requesterAgentId: requesterAgentIdRaw ? requesterAgentIdRaw : null,
    },
  };
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`requests:get:${ip}`, { windowMs: 60_000, max: 120 });
  if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

  const file = await readKitRequestsFile();
  const withVotes = file.requests.map((r) => ({ ...r, votes: getVotesForRequest(r.id, file) }));
  const sorted = sortRequestsByVotes(withVotes);

  return NextResponse.json(
    {
      requests: sorted,
      total: sorted.length,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`requests:post:${ip}`, { windowMs: 60_000, max: 20 });
  if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

  try {
    const body = await readJsonWithLimit(request, MAX_BODY_BYTES);

    const validation = validateNewRequest(body);
    if (!validation.ok) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    const file = await readKitRequestsFile();

    const id = makeRequestId();
    const createdAt = new Date().toISOString();

    const newRequest: KitRequest = {
      id,
      createdAt,
      ...validation.value,
    };

    const next = {
      requests: [...file.requests, newRequest],
      votes: { ...file.votes, [id]: 0 },
    };

    await writeKitRequestsFile(next);

    return NextResponse.json(
      {
        success: true,
        request: { ...newRequest, votes: 0 },
      },
      { status: 201 }
    );
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = typeof (err as any)?.status === "number" ? (err as any).status : 400;
    if (status === 413) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    return NextResponse.json(
      { error: "Invalid request body. Expected JSON." },
      { status: 400 }
    );
  }
}
