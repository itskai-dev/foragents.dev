import { NextResponse } from "next/server";
import { getMcpServerBySlug } from "@/lib/data";
import { getMcpHealthServerBySlug } from "@/lib/mcpHealth";
import { getMcpInstalls } from "@/lib/server/mcpInstalls";

type Context = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: Context) {
  const { slug } = await context.params;
  const server = getMcpServerBySlug(slug);

  if (!server) {
    return NextResponse.json({ error: "MCP server not found" }, { status: 404 });
  }

  const installs = await getMcpInstalls(slug);
  const healthData = getMcpHealthServerBySlug(slug);

  return NextResponse.json(
    {
      server,
      installs,
      health: {
        status: healthData?.status ?? "unknown",
        lastCheck: healthData?.lastChecked ?? null,
        uptime: healthData?.uptimePercent ?? null,
      },
    },
    {
      headers: { "Cache-Control": "public, max-age=60" },
    }
  );
}
