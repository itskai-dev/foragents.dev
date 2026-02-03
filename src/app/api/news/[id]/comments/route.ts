import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSupabase } from "@/lib/supabase";
import { Comment } from "@/lib/types";

const COMMENTS_PATH = path.join(process.cwd(), "data", "comments.json");

// ---------- JSON file helpers ----------

async function readComments(): Promise<Comment[]> {
  try {
    const raw = await fs.readFile(COMMENTS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// ---------- Build threaded structure ----------

function buildThreads(comments: Comment[]): Comment[] {
  const map = new Map<string, Comment>();
  const roots: Comment[] = [];
  
  // Clone comments and add replies array
  comments.forEach(c => {
    map.set(c.id, { ...c, replies: [] });
  });
  
  // Build tree
  map.forEach(comment => {
    if (comment.parentId && map.has(comment.parentId)) {
      const parent = map.get(comment.parentId)!;
      parent.replies!.push(comment);
    } else {
      roots.push(comment);
    }
  });
  
  // Sort replies by upvotes, then date
  const sortReplies = (comments: Comment[]) => {
    comments.sort((a, b) => b.upvotes - a.upvotes || 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    comments.forEach(c => {
      if (c.replies && c.replies.length > 0) {
        sortReplies(c.replies);
      }
    });
  };
  
  sortReplies(roots);
  return roots;
}

// ---------- Supabase fetch ----------

async function fetchFromSupabase(newsItemId: string, sort: string): Promise<Comment[]> {
  const supabase = getSupabase()!;
  
  const orderBy = sort === "oldest" ? { column: "created_at", ascending: true } :
                  sort === "top" ? { column: "upvotes", ascending: false } :
                  { column: "created_at", ascending: false };
  
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("news_item_id", newsItemId)
    .eq("status", "visible")
    .order(orderBy.column, { ascending: orderBy.ascending });
  
  if (error) {
    console.error("Supabase fetch error:", error);
    return [];
  }
  
  // Transform to camelCase
  return (data || []).map(row => ({
    id: row.id,
    newsItemId: row.news_item_id,
    parentId: row.parent_id,
    agentHandle: row.agent_handle,
    agentName: row.agent_name,
    agentAvatar: row.agent_avatar,
    trustTier: row.trust_tier,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    upvotes: row.upvotes,
    flags: row.flags,
    status: row.status,
    moderationNote: row.moderation_note,
  }));
}

// ---------- File fetch ----------

async function fetchFromFile(newsItemId: string, sort: string): Promise<Comment[]> {
  const all = await readComments();
  let comments = all.filter(c => c.newsItemId === newsItemId && c.status === "visible");
  
  if (sort === "oldest") {
    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (sort === "top") {
    comments.sort((a, b) => b.upvotes - a.upvotes);
  } else {
    // newest (default)
    comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  return comments;
}

// ---------- Route handler ----------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: newsItemId } = await params;
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") || "newest";
  const flat = searchParams.get("flat") === "true";
  
  const useSupabase = !!getSupabase();
  const comments = useSupabase 
    ? await fetchFromSupabase(newsItemId, sort)
    : await fetchFromFile(newsItemId, sort);
  
  // Return flat or threaded
  const result = flat ? comments : buildThreads(comments);
  
  return NextResponse.json({
    newsItemId,
    count: comments.length,
    comments: result,
  }, {
    headers: {
      "Cache-Control": "public, max-age=60",
    },
  });
}
