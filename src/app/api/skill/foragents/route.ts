import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Agent-facing "skill" endpoint.
 *
 * GET /api/skill/foragents
 * Returns markdown instructions for using forAgents.dev as a polling/watch source.
 */
export async function GET() {
  const filePath = join(process.cwd(), "public", "skill.md");
  const content = readFileSync(filePath, "utf-8");

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
