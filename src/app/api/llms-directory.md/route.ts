import { NextResponse } from "next/server";
import { getLlmsTxtEntries, llmsTxtToMarkdown } from "@/lib/data";

export async function GET() {
  const entries = getLlmsTxtEntries();
  const markdown = llmsTxtToMarkdown(entries);

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
