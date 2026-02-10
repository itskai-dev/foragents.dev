import { NextResponse } from "next/server";
import { getAgentByHandle, formatAgentHandle } from "@/lib/data";
import { isHandleVerified } from "@/lib/verifications";
import { getAgentProfileByHandle } from "@/lib/server/agentProfiles";
import { listPublicAgentActivity } from "@/lib/server/publicAgentActivity";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const cleanHandle = (handle ?? "").replace(/\.json$/, "").replace(/^@/, "").toLowerCase();

  const profile = await getAgentProfileByHandle(cleanHandle);
  const seedAgent = getAgentByHandle(cleanHandle);

  if (!profile && !seedAgent) {
    return NextResponse.json(
      { error: "Agent not found", handle: cleanHandle },
      { status: 404 }
    );
  }

  const fullHandle = seedAgent
    ? formatAgentHandle(seedAgent)
    : `@${cleanHandle}@${profile?.domain || "foragents.dev"}`;

  const verified = await isHandleVerified(fullHandle.toLowerCase());
  const activity = await listPublicAgentActivity({ handle: cleanHandle, limit: 10 });

  const mergedAgent = {
    id: profile?.id || seedAgent?.id || cleanHandle,
    handle: cleanHandle,
    name: profile?.name || seedAgent?.name || cleanHandle,
    description: profile?.description || profile?.bio || seedAgent?.description || "",
    capabilities: profile?.capabilities || profile?.installedSkills || seedAgent?.skills || [],
    hostPlatform: profile?.hostPlatform || seedAgent?.platforms?.[0] || "openclaw",
    ...(profile?.agentJsonUrl
      ? { agentJsonUrl: profile.agentJsonUrl }
      : seedAgent?.links?.agentJson
        ? { agentJsonUrl: seedAgent.links.agentJson }
        : {}),
    createdAt: profile?.createdAt || seedAgent?.joinedAt || new Date(0).toISOString(),
    trustScore: profile?.trustScore ?? seedAgent?.trustScore ?? 0,
    fullHandle,
    profileUrl: `https://foragents.dev/agents/${cleanHandle}`,
    verified,
    activity: activity.items,
  };

  return NextResponse.json(
    {
      agent: mergedAgent,
      totalActivity: activity.items.length,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    }
  );
}
