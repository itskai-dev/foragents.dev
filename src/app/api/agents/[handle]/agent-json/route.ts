import { NextResponse } from "next/server";

import { getAgentByHandle, formatAgentHandle } from "@/lib/data";
import { fetchAgentJson } from "@/lib/agent-verify";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const cleanHandle = (handle ?? "").replace(/\.json$/, "").replace(/^@/, "");

  const agent = getAgentByHandle(cleanHandle);
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const agentJson = await fetchAgentJson(agent.domain);

  return NextResponse.json(
    {
      handle: formatAgentHandle(agent),
      domain: agent.domain,
      agentJson,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    }
  );
}
