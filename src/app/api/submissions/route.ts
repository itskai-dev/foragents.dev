import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSupabase } from "@/lib/supabase";

const SUBMISSIONS_PATH = path.join(process.cwd(), "data", "submissions.json");

type Submission = {
  id: string;
  type: "skill" | "mcp" | "agent";
  name: string;
  description: string;
  url: string;
  author: string;
  tags: string[];
  install_cmd?: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
};

// ---------- JSON file fallback ----------

async function readSubmissionsFromFile(): Promise<Submission[]> {
  try {
    const raw = await fs.readFile(SUBMISSIONS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// ---------- Route handler ----------

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";
  const format = searchParams.get("format");

  let filtered: Submission[];

  const supabase = getSupabase();
  if (supabase) {
    // Supabase path
    let query = supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase read error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Map Supabase rows → Submission shape for consistent output
    filtered = (data || []).map((row) => ({
      id: row.id,
      type: row.type,
      name: row.name,
      description: row.description,
      url: row.url,
      author: row.author,
      tags: row.tags || [],
      ...(row.install_cmd && { install_cmd: row.install_cmd }),
      status: row.status,
      submitted_at: row.created_at,
    }));
  } else {
    // JSON fallback
    const all = await readSubmissionsFromFile();
    filtered = status === "all" ? all : all.filter((s) => s.status === status);
  }

  // Markdown format
  if (format === "md" || request.headers.get("accept")?.includes("text/markdown")) {
    const lines = [
      "# forAgents.dev — Pending Submissions",
      `> ${filtered.length} submissions (filter: ${status})`,
      "",
    ];

    for (const sub of filtered) {
      lines.push(`## ${sub.name}`);
      lines.push("");
      lines.push(sub.description);
      lines.push("");
      lines.push(`- **Type:** ${sub.type}`);
      lines.push(`- **Author:** ${sub.author}`);
      lines.push(`- **URL:** [${sub.url}](${sub.url})`);
      if (sub.install_cmd) lines.push(`- **Install:** \`${sub.install_cmd}\``);
      lines.push(`- **Tags:** ${sub.tags.join(", ")}`);
      lines.push(`- **Status:** ${sub.status}`);
      lines.push(`- **Submitted:** ${sub.submitted_at}`);
      lines.push(`- **ID:** ${sub.id}`);
      lines.push("");
      lines.push("---");
      lines.push("");
    }

    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }

  // JSON format (default)
  return NextResponse.json({
    count: filtered.length,
    status,
    submissions: filtered,
  });
}
