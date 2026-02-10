import { NextRequest, NextResponse } from "next/server";
import { COMMUNITY_CATEGORIES, CommunityCategory, CommunityThread } from "@/lib/communityThreads";
import {
  makeThreadId,
  readCommunityThreadsFile,
  sortThreadsByActivity,
  writeCommunityThreadsFile,
} from "@/lib/server/communityThreadsStore";

function isCategory(value: string | null): value is CommunityCategory {
  return value !== null && COMMUNITY_CATEGORIES.includes(value as CommunityCategory);
}

function filterThreads(threads: CommunityThread[], request: NextRequest): CommunityThread[] {
  const category = request.nextUrl.searchParams.get("category");
  const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase();

  let filtered = threads;

  if (isCategory(category)) {
    filtered = filtered.filter((thread) => thread.category === category);
  }

  if (search) {
    filtered = filtered.filter((thread) => {
      const haystack = `${thread.title} ${thread.body} ${thread.author}`.toLowerCase();
      return haystack.includes(search);
    });
  }

  return sortThreadsByActivity(filtered);
}

function validateThreadPayload(body: Record<string, unknown>): {
  ok: true;
  value: { title: string; body: string; author: string; category: CommunityCategory };
} | { ok: false; errors: string[] } {
  const errors: string[] = [];

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const threadBody = typeof body.body === "string" ? body.body.trim() : "";
  const author = typeof body.author === "string" ? body.author.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim().toLowerCase() : "";

  if (!title) errors.push("title is required");
  if (title.length > 180) errors.push("title must be under 180 characters");

  if (!threadBody) errors.push("body is required");
  if (threadBody.length > 10_000) errors.push("body must be under 10,000 characters");

  if (!author) errors.push("author is required");
  if (author.length > 80) errors.push("author must be under 80 characters");

  if (!category) {
    errors.push("category is required");
  } else if (!COMMUNITY_CATEGORIES.includes(category as CommunityCategory)) {
    errors.push(`category must be one of: ${COMMUNITY_CATEGORIES.join(", ")}`);
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      title,
      body: threadBody,
      author,
      category: category as CommunityCategory,
    },
  };
}

export async function GET(request: NextRequest) {
  const threads = await readCommunityThreadsFile();
  const filtered = filterThreads(threads, request);

  return NextResponse.json(
    {
      threads: filtered,
      total: filtered.length,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const validation = validateThreadPayload(body);

    if (!validation.ok) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newThread: CommunityThread = {
      id: makeThreadId(),
      title: validation.value.title,
      body: validation.value.body,
      author: validation.value.author,
      category: validation.value.category,
      createdAt: now,
      replyCount: 0,
      lastActivity: now,
      replies: [],
    };

    const threads = await readCommunityThreadsFile();
    const updated = [newThread, ...threads];
    await writeCommunityThreadsFile(updated);

    return NextResponse.json(
      {
        thread: newThread,
        message: "Thread created",
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Expected JSON." },
      { status: 400 }
    );
  }
}
