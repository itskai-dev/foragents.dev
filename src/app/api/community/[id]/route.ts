import { NextRequest, NextResponse } from "next/server";
import { CommunityReply } from "@/lib/communityThreads";
import {
  makeReplyId,
  readCommunityThreadsFile,
  writeCommunityThreadsFile,
} from "@/lib/server/communityThreadsStore";

type RouteParams = {
  params: Promise<{ id: string }>;
};

function validateReplyPayload(body: Record<string, unknown>): {
  ok: true;
  value: { body: string; author: string };
} | { ok: false; errors: string[] } {
  const errors: string[] = [];

  const replyBody = typeof body.body === "string" ? body.body.trim() : "";
  const author = typeof body.author === "string" ? body.author.trim() : "";

  if (!replyBody) errors.push("body is required");
  if (replyBody.length > 10_000) errors.push("body must be under 10,000 characters");

  if (!author) errors.push("author is required");
  if (author.length > 80) errors.push("author must be under 80 characters");

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      body: replyBody,
      author,
    },
  };
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const threads = await readCommunityThreadsFile();
  const thread = threads.find((item) => item.id === id);

  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  return NextResponse.json(
    { thread },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const validation = validateReplyPayload(body);

    if (!validation.ok) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const threads = await readCommunityThreadsFile();
    const threadIndex = threads.findIndex((item) => item.id === id);

    if (threadIndex === -1) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const newReply: CommunityReply = {
      id: makeReplyId(),
      body: validation.value.body,
      author: validation.value.author,
      createdAt: now,
    };

    const thread = threads[threadIndex];
    const updatedThread = {
      ...thread,
      replies: [...thread.replies, newReply],
      replyCount: thread.replyCount + 1,
      lastActivity: now,
    };

    const updatedThreads = [...threads];
    updatedThreads[threadIndex] = updatedThread;

    await writeCommunityThreadsFile(updatedThreads);

    return NextResponse.json(
      {
        thread: updatedThread,
        reply: newReply,
        message: "Reply posted",
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
