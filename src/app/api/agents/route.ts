import { NextRequest, NextResponse } from "next/server";
import {
  createAgentProfile,
  listAgentProfiles,
  type HostPlatform,
} from "@/lib/server/agentProfiles";

export const runtime = "nodejs";

const VALID_PLATFORMS: HostPlatform[] = ["openclaw", "claude", "cursor"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get("search") ?? undefined;
  const platform = searchParams.get("platform") ?? undefined;
  const sortParam = searchParams.get("sort");
  const sort = sortParam === "trust" ? "trust" : "recent";

  if (platform && !VALID_PLATFORMS.includes(platform as HostPlatform)) {
    return NextResponse.json(
      { error: "platform must be one of: openclaw, claude, cursor" },
      { status: 400 }
    );
  }

  const agents = await listAgentProfiles({ search, platform, sort });
  return NextResponse.json({ agents, total: agents.length }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      handle?: unknown;
      name?: unknown;
      description?: unknown;
      capabilities?: unknown;
      hostPlatform?: unknown;
      agentJsonUrl?: unknown;
    };

    const handle = typeof body.handle === "string" ? body.handle : "";
    const name = typeof body.name === "string" ? body.name : "";
    const description = typeof body.description === "string" ? body.description : "";
    const capabilities = Array.isArray(body.capabilities) ? body.capabilities : [];
    const hostPlatform = typeof body.hostPlatform === "string" ? body.hostPlatform.toLowerCase() : "";
    const agentJsonUrl = typeof body.agentJsonUrl === "string" ? body.agentJsonUrl : undefined;

    if (!VALID_PLATFORMS.includes(hostPlatform as HostPlatform)) {
      return NextResponse.json(
        { error: "hostPlatform must be one of: openclaw, claude, cursor" },
        { status: 400 }
      );
    }

    const created = await createAgentProfile({
      handle,
      name,
      description,
      capabilities: capabilities.filter((value): value is string => typeof value === "string"),
      hostPlatform,
      ...(agentJsonUrl ? { agentJsonUrl } : {}),
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    const status =
      message.includes("required") ||
      message.includes("exists") ||
      message.includes("capabilities")
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
