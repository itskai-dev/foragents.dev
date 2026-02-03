import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

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

async function readSubmissions(): Promise<Submission[]> {
  try {
    const raw = await fs.readFile(SUBMISSIONS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";
  const format = searchParams.get("format");

  const submissions = await readSubmissions();
  const filtered = status === "all"
    ? submissions
    : submissions.filter((s) => s.status === status);

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
