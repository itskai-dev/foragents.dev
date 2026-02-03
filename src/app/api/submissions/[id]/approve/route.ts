import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSupabase } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/admin-auth";

const SUBMISSIONS_PATH = path.join(process.cwd(), "data", "submissions.json");

type Submission = {
  id: string;
  type: "skill" | "mcp" | "agent" | "llms-txt";
  name: string;
  description: string;
  url: string;
  author: string;
  tags: string[];
  install_cmd?: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  approved_at?: string;
  directory_slug?: string;
};

// ---------- JSON file helpers ----------

async function readSubmissions(): Promise<Submission[]> {
  try {
    const raw = await fs.readFile(SUBMISSIONS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeSubmissions(submissions: Submission[]): Promise<void> {
  await fs.writeFile(SUBMISSIONS_PATH, JSON.stringify(submissions, null, 2));
}

// ---------- Route handler ----------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check authorization
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  const { id } = await params;
  
  // Optional body for directory_slug
  let body: { directory_slug?: string } = {};
  try {
    body = await request.json();
  } catch {
    // Body is optional
  }

  const supabase = getSupabase();

  if (supabase) {
    // Supabase path
    const { data: existing, error: fetchError } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    if (existing.status !== "pending") {
      return NextResponse.json(
        { error: `Submission already ${existing.status}` },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      status: "approved",
      approved_at: new Date().toISOString(),
    };
    
    if (body.directory_slug) {
      updateData.directory_slug = body.directory_slug;
    }

    const { error: updateError } = await supabase
      .from("submissions")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update submission" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Submission "${existing.name}" approved`,
      submission: {
        id: existing.id,
        name: existing.name,
        type: existing.type,
        status: "approved",
      },
    });
  }

  // JSON fallback
  const submissions = await readSubmissions();
  const index = submissions.findIndex((s) => s.id === id);

  if (index === -1) {
    return NextResponse.json(
      { error: "Submission not found" },
      { status: 404 }
    );
  }

  const submission = submissions[index];

  if (submission.status !== "pending") {
    return NextResponse.json(
      { error: `Submission already ${submission.status}` },
      { status: 400 }
    );
  }

  submission.status = "approved";
  submission.approved_at = new Date().toISOString();
  
  if (body.directory_slug) {
    submission.directory_slug = body.directory_slug;
  }

  await writeSubmissions(submissions);

  return NextResponse.json({
    success: true,
    message: `Submission "${submission.name}" approved`,
    submission: {
      id: submission.id,
      name: submission.name,
      type: submission.type,
      status: "approved",
    },
  });
}
