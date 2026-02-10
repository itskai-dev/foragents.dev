import { NextRequest, NextResponse } from "next/server";
import { getClientIp, checkRateLimit } from "@/lib/requestLimits";
import { getMcpServerBySlug } from "@/lib/data";
import { getMcpInstalls, incrementMcpInstalls } from "@/lib/server/mcpInstalls";

type Context = {
  params: Promise<{ slug: string }>;
};

const ONE_HOUR_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest, context: Context) {
  const { slug } = await context.params;
  const server = getMcpServerBySlug(slug);

  if (!server) {
    return NextResponse.json({ error: "MCP server not found" }, { status: 404 });
  }

  const ip = getClientIp(request);
  const rateKey = `mcp-install:${slug}:${ip}`;
  const limited = checkRateLimit(rateKey, { windowMs: ONE_HOUR_MS, max: 1 });

  if (!limited.ok) {
    const installs = await getMcpInstalls(slug);

    return NextResponse.json(
      { error: "Install already tracked recently", slug, installs },
      {
        status: 429,
        headers: {
          "Retry-After": String(limited.retryAfterSec),
        },
      }
    );
  }

  const installs = await incrementMcpInstalls(slug);
  return NextResponse.json({ slug, installs }, { status: 200 });
}
