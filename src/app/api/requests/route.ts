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
  sortRequests,
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

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim().toLowerCase() : "";

  if (!title) errors.push("title is required");
  if (title.length > 120) errors.push("title must be under 120 characters");

  if (!description) errors.push("description is required");
  if (description.length > 2_000) errors.push("description must be under 2,000 characters");

  if (!category) errors.push("category is required");
  if (category.length > 80) errors.push("category must be under 80 characters");

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      title,
      description,
      category,
    },
  };
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`requests:get:${ip}`, { windowMs: 60_000, max: 120 });
  if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

  const file = await readKitRequestsFile();
  const withVotes = file.requests.map((r) => ({ ...r, votes: getVotesForRequest(r.id, file) }));

  const sortParam = request.nextUrl.searchParams.get("sort");
  const sort = sortParam === "recent" ? "recent" : "votes";

  const categoryFilter = request.nextUrl.searchParams.get("category")?.trim().toLowerCase();
  const filtered = categoryFilter
    ? withVotes.filter((r) => r.category.toLowerCase() === categoryFilter)
    : withVotes;

  const sorted = sortRequests(filtered, sort);

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

    const newRequest: KitRequest & { votes: number } = {
      id,
      createdAt,
      ...validation.value,
      votes: 0,
    };

    const requestWithoutVotes: KitRequest = {
      id: newRequest.id,
      title: newRequest.title,
      description: newRequest.description,
      category: newRequest.category,
      createdAt: newRequest.createdAt,
    };

    const next = {
      requests: [...file.requests, requestWithoutVotes],
      votes: { ...file.votes, [id]: 0 },
    };

    await writeKitRequestsFile(next);

    return NextResponse.json(newRequest, { status: 201 });
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
