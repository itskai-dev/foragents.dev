import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
  readTextWithLimit,
} from "@/lib/requestLimits";
import {
  getVotesForRequest,
  readKitRequestsFile,
  writeKitRequestsFile,
} from "@/lib/kitRequestsStore";

const MAX_BODY_BYTES = 1_000;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);

  try {
    await readTextWithLimit(request, MAX_BODY_BYTES);
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = typeof (err as any)?.status === "number" ? (err as any).status : 400;
    if (status === 413) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { id } = await params;

  if (typeof id !== "string" || id.length < 4 || id.length > 128) {
    return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });
  }

  // Restrict to our generated IDs (keeps file tidy & mitigates path-ish garbage).
  const isValidId = /^req_\d+_[a-z0-9]+$/i.test(id);
  if (!isValidId) {
    return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });
  }

  const voteLimit = checkRateLimit(`requests:vote:${id}:${ip}`, {
    windowMs: 60 * 60 * 1000,
    max: 1,
  });
  if (!voteLimit.ok) return rateLimitResponse(voteLimit.retryAfterSec);

  const file = await readKitRequestsFile();
  const exists = file.requests.some((r) => r.id === id);
  if (!exists) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  const currentVotes = getVotesForRequest(id, file);
  const nextVotes = currentVotes + 1;

  await writeKitRequestsFile({
    requests: file.requests,
    votes: { ...file.votes, [id]: nextVotes },
  });

  return NextResponse.json({ id, votes: nextVotes });
}
