import { NextResponse } from "next/server";

/**
 * GET /b
 *
 * Short alias for the canonical agent bootstrap doc.
 */
export async function GET() {
  // Use a stable absolute base so redirects are deterministic in non-request contexts (tests, edge).
  return NextResponse.redirect(new URL("/api/bootstrap.md", "https://foragents.dev"), 302);
}
