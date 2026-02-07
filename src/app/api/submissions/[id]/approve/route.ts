import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from "@/lib/requestLimits";
import { promises as fs } from "fs";
import path from "path";
import { getSupabase } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/admin-auth";

const SUBMISSIONS_PATH = path.join(process.cwd(), "data", "submissions.json");
const MAX_JSON_BYTES = 2_000;

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

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`submissions:approve:${ip}`, { windowMs: 60_000, max: 30 });
  if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

  // Check authorization
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  const { id } = await params;

  // Optional body for directory_slug
  let body: { directory_slug?: string } = {};
  try {
    body = (await readJsonWithLimit(request, MAX_JSON_BYTES)) as typeof body;
  } catch (err) {
    // Body is optional. Treat missing/invalid JSON as empty body.
    // But still enforce the size limit.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = typeof (err as any)?.status === "number" ? (err as any).status : 0;
    if (status === 413) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }
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
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (existing.status !== "pending") {
      return NextResponse.json({ error: `Submission already ${existing.status}` }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      status: "approved",
      approved_at: new Date().toISOString(),
    };

    if (body.directory_slug) {
      updateData.directory_slug = body.directory_slug;
    }

    const { error: updateError } = await supabase.from("submissions").update(updateData).eq("id", id);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
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
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const submission = submissions[index];

  if (submission.status !== "pending") {
    return NextResponse.json({ error: `Submission already ${submission.status}` }, { status: 400 });
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
