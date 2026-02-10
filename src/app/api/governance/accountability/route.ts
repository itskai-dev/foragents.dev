import { NextResponse } from "next/server";
import { readGovernanceFramework } from "@/lib/governanceFramework";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await readGovernanceFramework();

    return NextResponse.json(
      {
        accountability: data.accountability,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Failed to load governance accountability data", error);
    return NextResponse.json(
      { error: "Failed to load governance accountability data" },
      { status: 500 }
    );
  }
}
