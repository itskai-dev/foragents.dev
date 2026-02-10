import { NextRequest, NextResponse } from "next/server";
import { readConnectors } from "@/lib/connectors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const connectorSlug = slug.trim().toLowerCase();

    const connectors = await readConnectors();
    const connector = connectors.find((item) => item.slug === connectorSlug);

    if (!connector) {
      return NextResponse.json({ error: "Connector not found" }, { status: 404 });
    }

    return NextResponse.json({ connector }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to load connector", error);
    return NextResponse.json({ error: "Failed to load connector" }, { status: 500 });
  }
}
