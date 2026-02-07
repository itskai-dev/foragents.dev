import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSupabase } from "@/lib/supabase";
import { Comment } from "@/lib/types";
import { checkRateLimit, getClientIp, rateLimitResponse, readTextWithLimit } from "@/lib/requestLimits";

const COMMENTS_PATH = path.join(process.cwd(), "data", "comments.json");

// Even though this endpoint doesn't require a JSON body, we still cap request body size
// so clients can't send arbitrarily large payloads.
const MAX_BODY_BYTES = 1_000;

// ---------- JSON file helpers ----------

async function readComments(): Promise<Comment[]> {
  try {
    const raw = await fs.readFile(COMMENTS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeComments(comments: Comment[]): Promise<void> {
  const dir = path.dirname(COMMENTS_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(COMMENTS_PATH, JSON.stringify(comments, null, 2));
}

// ---------- Supabase flag ----------

async function flagSupabase(commentId: string) {
  const supabase = getSupabase()!;

  // First check if comment exists
  const { data: existing } = await supabase.from("comments").select("id, flags").eq("id", commentId).single();

  if (!existing) {
    return { error: "Comment not found", status: 404 };
  }

  // Increment flags
  const { data, error } = await supabase
    .from("comments")
    .update({ flags: existing.flags + 1 })
    .eq("id", commentId)
    .select("id, flags")
    .single();

  if (error) {
    console.error("Supabase flag error:", error);
    return { error: "Database error", status: 500 };
  }

  return {
    success: true,
    commentId: data.id,
    flags: data.flags,
    status: 200,
  };
}

// ---------- File flag ----------

async function flagFile(commentId: string) {
  const comments = await readComments();
  const index = comments.findIndex((c) => c.id === commentId);

  if (index === -1) {
    return { error: "Comment not found", status: 404 };
  }

  comments[index].flags++;
  await writeComments(comments);

  return {
    success: true,
    commentId: comments[index].id,
    flags: comments[index].flags,
    status: 200,
  };
}

// ---------- Route handler ----------

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`comments:flag:${ip}`, { windowMs: 60_000, max: 20 });
  if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

  try {
    // Drain/cap body even though we don't use it.
    await readTextWithLimit(request, MAX_BODY_BYTES);
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = typeof (err as any)?.status === "number" ? (err as any).status : 400;
    if (status === 413) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { id: commentId } = await params;

  // Validate UUID format for Supabase, or our custom format for file
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(commentId);
  const isCustomId = /^cmt_\d+_[a-z0-9]+$/i.test(commentId);

  if (!isUuid && !isCustomId) {
    return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 });
  }

  const useSupabase = !!getSupabase();
  const result = useSupabase ? await flagSupabase(commentId) : await flagFile(commentId);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    success: true,
    message: "Comment flagged for review",
    commentId: result.commentId,
    flags: result.flags,
  });
}
