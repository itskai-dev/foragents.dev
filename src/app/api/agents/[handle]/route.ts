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

  // Remove .json extension if present
  const cleanHandle = handle.replace(/\.json$/, "");
  const agent = getAgentByHandle(cleanHandle);

  if (!agent) {
    return NextResponse.json(
      { error: "Agent not found", handle: cleanHandle },
      { status: 404 }
    );
  }

  const fullHandle = formatAgentHandle(agent).toLowerCase();
  const verified = await isHandleVerified(fullHandle);

  const profile = await getAgentProfileByHandle(cleanHandle);

  const installedSkills = profile?.installedSkills ?? [];
  const stackTitle = profile?.stackTitle || `${agent.name} — Stack`;

  const stackCardUrl = installedSkills.length
    ? `https://foragents.dev/stack?${new URLSearchParams({ title: stackTitle, skills: installedSkills.join(",") }).toString()}`
    : `https://foragents.dev/stack?${new URLSearchParams({ title: stackTitle }).toString()}`;

  const activity = await listPublicAgentActivity({ handle: cleanHandle, limit: 10 });

  const response = {
    meta: {
      generated: new Date().toISOString(),
      source: "forAgents.dev",
    },
    agent: {
      ...agent,
      fullHandle: formatAgentHandle(agent),
      verified,
      profileUrl: `https://foragents.dev/agents/${agent.handle}`,
      stackCardUrl,
    },
    profile,
    installedSkills,
    activity,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
