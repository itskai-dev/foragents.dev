import { NextRequest, NextResponse } from "next/server";

/**
 * Markdown variant of search endpoint
 * GET /api/search.md?q=query
 * Always returns markdown format
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return new NextResponse("Missing required query parameter: q", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // Make an internal request to the main search API with markdown accept header
  const baseUrl = request.nextUrl.origin;
  const searchUrl = new URL("/api/search", baseUrl);
  searchUrl.searchParams.set("q", q);

  const response = await fetch(searchUrl.toString(), {
    headers: {
      Accept: "text/markdown",
    },
  });

  if (!response.ok) {
    return new NextResponse(`Search failed: ${response.statusText}`, {
      status: response.status,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const markdown = await response.text();

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}
