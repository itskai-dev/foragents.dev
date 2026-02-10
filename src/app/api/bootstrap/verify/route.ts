import { NextRequest, NextResponse } from "next/server";
import { verifyBootstrapSetup } from "@/lib/bootstrap";

/**
 * GET /api/bootstrap/verify?host=openclaw|claude|cursor|custom&skills=memory-kit,autonomy-kit
 */
export async function GET(request: NextRequest) {
  const hostRaw = request.nextUrl.searchParams.get("host");
  const skillsRaw = request.nextUrl.searchParams.get("skills");

  const result = verifyBootstrapSetup({ hostRaw, skillsRaw });
  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
