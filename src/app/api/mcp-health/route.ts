import { NextResponse } from "next/server";
import { getMcpHealthServers, getMcpHealthSummary } from "@/lib/mcpHealth";

export async function GET() {
  const servers = getMcpHealthServers();
  const summary = getMcpHealthSummary(servers);

  return NextResponse.json(
    {
      summary,
      servers,
    },
    {
      headers: { "Cache-Control": "public, max-age=120" },
    }
  );
}
