import { NextRequest, NextResponse } from "next/server";
import {
  formatSkillNameFromSlug,
  readStudioSessions,
  sanitizeInputs,
  StudioSession,
  writeStudioSessions,
} from "@/lib/studioStore";

type StartStudioSessionRequest = {
  skillSlug?: unknown;
  skillName?: unknown;
  inputs?: unknown;
};

export async function GET() {
  const sessions = await readStudioSessions();

  return NextResponse.json(
    {
      sessions,
      count: sessions.length,
      updatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  let payload: StartStudioSessionRequest;

  try {
    payload = (await request.json()) as StartStudioSessionRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const skillSlug = typeof payload.skillSlug === "string" ? payload.skillSlug.trim().toLowerCase() : "";

  if (!skillSlug) {
    return NextResponse.json({ error: "skillSlug is required" }, { status: 400 });
  }

  const skillName =
    typeof payload.skillName === "string" && payload.skillName.trim()
      ? payload.skillName.trim()
      : formatSkillNameFromSlug(skillSlug);

  const inputs = sanitizeInputs(payload.inputs);
  const sessions = await readStudioSessions();
  const now = new Date().toISOString();

  const nextSession: StudioSession = {
    id: `studio_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    skillSlug,
    skillName,
    status: "active",
    inputs,
    outputs: {},
    logs: [
      {
        timestamp: now,
        message: `Started ${skillName}`,
      },
    ],
    startedAt: now,
    completedAt: null,
  };

  await writeStudioSessions([nextSession, ...sessions]);

  return NextResponse.json(
    {
      session: nextSession,
    },
    { status: 201 }
  );
}
