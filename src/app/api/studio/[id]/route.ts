import { NextRequest, NextResponse } from "next/server";
import {
  isStudioSessionStatus,
  readStudioSessions,
  sanitizeOutputs,
  StudioSession,
  writeStudioSessions,
} from "@/lib/studioStore";

type UpdateStudioSessionRequest = {
  status?: unknown;
  outputs?: unknown;
  logMessage?: unknown;
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const sessions = await readStudioSessions();
  const session = sessions.find((item) => item.id === id);

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      session,
      updatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  let payload: UpdateStudioSessionRequest;
  try {
    payload = (await request.json()) as UpdateStudioSessionRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sessions = await readStudioSessions();
  const targetIndex = sessions.findIndex((session) => session.id === id);

  if (targetIndex === -1) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const current = sessions[targetIndex] as StudioSession;
  const now = new Date().toISOString();

  const nextStatus = payload.status;
  if (typeof nextStatus !== "undefined" && !isStudioSessionStatus(nextStatus)) {
    return NextResponse.json({ error: "status must be active, completed, or error" }, { status: 400 });
  }

  const logMessage = typeof payload.logMessage === "string" ? payload.logMessage.trim() : "";

  const updatedSession: StudioSession = {
    ...current,
    status: isStudioSessionStatus(nextStatus) ? nextStatus : current.status,
    outputs:
      typeof payload.outputs === "undefined"
        ? current.outputs
        : {
            ...current.outputs,
            ...sanitizeOutputs(payload.outputs),
          },
    logs: logMessage
      ? [
          ...current.logs,
          {
            timestamp: now,
            message: logMessage,
          },
        ]
      : current.logs,
    completedAt:
      isStudioSessionStatus(nextStatus) && nextStatus !== "active"
        ? now
        : isStudioSessionStatus(nextStatus) && nextStatus === "active"
          ? null
          : current.completedAt,
  };

  const nextSessions = [...sessions];
  nextSessions[targetIndex] = updatedSession;
  await writeStudioSessions(nextSessions);

  return NextResponse.json({ session: updatedSession });
}
