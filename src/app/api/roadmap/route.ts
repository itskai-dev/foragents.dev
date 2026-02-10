import { NextRequest, NextResponse } from "next/server";
import { getRoadmapItems, isRoadmapStatus } from "@/lib/server/roadmapStore";

export async function GET(request: NextRequest) {
  try {
    const items = await getRoadmapItems();
    const status = request.nextUrl.searchParams.get("status");

    if (status && !isRoadmapStatus(status)) {
      return NextResponse.json(
        { error: "Invalid status. Use planned, in-progress, or completed." },
        { status: 400 }
      );
    }

    const filteredItems = status ? items.filter((item) => item.status === status) : items;

    return NextResponse.json(
      { items: filteredItems, total: filteredItems.length },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Failed to load roadmap items", error);
    return NextResponse.json({ error: "Failed to load roadmap" }, { status: 500 });
  }
}
