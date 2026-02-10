import { NextResponse } from "next/server";
import { readGovernanceFramework } from "@/lib/governanceFramework";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await readGovernanceFramework();

    return NextResponse.json(
      {
        overview: data.overview,
        pillars: data.pillars,
        readinessChecklist: data.readinessChecklist,
        maturityCriteria: data.maturityCriteria,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Failed to load governance framework", error);
    return NextResponse.json({ error: "Failed to load governance framework" }, { status: 500 });
  }
}
