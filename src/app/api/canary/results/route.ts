import { NextResponse } from "next/server";
import { readCanaryResults } from "@/lib/server/canaryStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const limitRaw = searchParams.get("limit");
  const status = searchParams.get("status");

  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 50;
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(500, limit)) : 50;

  const all = await readCanaryResults();

  const filtered =
    status === "fail" || status === "pass" ? all.filter((r) => r.status === status) : all;

  const results = filtered.slice(0, safeLimit);

  return NextResponse.json(
    {
      results,
      count: results.length,
      totalStored: all.length,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
