import { NextRequest, NextResponse } from "next/server";
import { buildBootstrapPackage } from "@/lib/bootstrap";

/**
 * GET /api/bootstrap?host=openclaw|claude|cursor|custom
 */
export async function GET(request: NextRequest) {
  const host = request.nextUrl.searchParams.get("host");
  const payload = buildBootstrapPackage(host);

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, max-age=120, stale-while-revalidate=300",
    },
  });
}
