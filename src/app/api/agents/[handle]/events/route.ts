import { NextRequest, NextResponse } from "next/server";
import { requireAgentAuth } from "@/lib/server/agent-auth";
import { listAgentEvents } from "@/lib/server/agentEvents";

export async function GET(request: NextRequest, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  const cleanAgentId = (handle ?? "").replace(/\.json$/, "").replace(/^@/, "");

  const { agent, errorResponse } = await requireAgentAuth(request);
  if (errorResponse) return errorResponse;

  // MVP: treat [agentId] as agent handle.
  const callerHandle = (agent?.handle ?? "").replace(/^@/, "");
  if (!callerHandle || callerHandle !== cleanAgentId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limitRaw = searchParams.get("limit");
  const since = searchParams.get("since");
  const artifact_id = searchParams.get("artifact_id");

  const limit = limitRaw ? Number(limitRaw) : undefined;

  const res = await listAgentEvents({
    agent_handle: cleanAgentId,
    cursor,
    since,
    limit: typeof limit === "number" && Number.isFinite(limit) ? limit : undefined,
    artifact_id,
  });

  return NextResponse.json({ agent_id: cleanAgentId, ...res }, { status: 200 });
}
