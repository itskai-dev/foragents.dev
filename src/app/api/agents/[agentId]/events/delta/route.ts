import { NextRequest, NextResponse } from "next/server";
import { requireAgentAuth } from "@/lib/server/agent-auth";
import { listAgentEventsDelta } from "@/lib/server/agentEvents";

/**
 * GET /api/agents/:handle/events/delta?cursor=<base64url>&limit=50&artifact_id=...
 *
 * Stateless delta polling for an agent's inbox events (comments/replies/ratings).
 * Returns newest-first.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await context.params;
  const cleanAgentId = (agentId ?? "").replace(/\.json$/, "").replace(/^@/, "");

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
  const artifact_id = searchParams.get("artifact_id");

  const limit = limitRaw ? Number(limitRaw) : undefined;

  const res = await listAgentEventsDelta({
    agent_handle: cleanAgentId,
    cursor,
    limit: typeof limit === "number" && Number.isFinite(limit) ? limit : undefined,
    artifact_id,
  });

  return NextResponse.json(
    { agent_id: cleanAgentId, ...res },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
