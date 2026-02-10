import { promises as fs } from "fs";
import path from "path";

export type StudioSessionStatus = "active" | "completed" | "error";

export type StudioLogEntry = {
  timestamp: string;
  message: string;
};

export type StudioSession = {
  id: string;
  skillSlug: string;
  skillName: string;
  status: StudioSessionStatus;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  logs: StudioLogEntry[];
  startedAt: string;
  completedAt: string | null;
};

const STUDIO_SESSIONS_PATH = path.join(process.cwd(), "data", "studio-sessions.json");
const VALID_STATUSES: StudioSessionStatus[] = ["active", "completed", "error"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isStudioLogEntry(value: unknown): value is StudioLogEntry {
  if (!isRecord(value)) return false;

  return typeof value.timestamp === "string" && typeof value.message === "string";
}

function isStudioSession(value: unknown): value is StudioSession {
  if (!isRecord(value)) return false;

  const completedAtValid = value.completedAt === null || typeof value.completedAt === "string";

  return (
    typeof value.id === "string" &&
    typeof value.skillSlug === "string" &&
    typeof value.skillName === "string" &&
    typeof value.status === "string" &&
    VALID_STATUSES.includes(value.status as StudioSessionStatus) &&
    isRecord(value.inputs) &&
    isRecord(value.outputs) &&
    Array.isArray(value.logs) &&
    value.logs.every((entry) => isStudioLogEntry(entry)) &&
    typeof value.startedAt === "string" &&
    completedAtValid
  );
}

export function isStudioSessionStatus(value: unknown): value is StudioSessionStatus {
  return typeof value === "string" && VALID_STATUSES.includes(value as StudioSessionStatus);
}

export function sanitizeInputs(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) return {};
  return value;
}

export function sanitizeOutputs(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) return {};
  return value;
}

export async function readStudioSessions(): Promise<StudioSession[]> {
  try {
    const raw = await fs.readFile(STUDIO_SESSIONS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is StudioSession => isStudioSession(item))
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  } catch {
    return [];
  }
}

export async function writeStudioSessions(sessions: StudioSession[]): Promise<void> {
  await fs.mkdir(path.dirname(STUDIO_SESSIONS_PATH), { recursive: true });
  await fs.writeFile(STUDIO_SESSIONS_PATH, `${JSON.stringify(sessions, null, 2)}\n`, "utf-8");
}

export function formatSkillNameFromSlug(skillSlug: string): string {
  return skillSlug
    .split("-")
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}
