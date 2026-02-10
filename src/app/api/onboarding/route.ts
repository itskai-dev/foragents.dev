import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ONBOARDING_PROGRESS_PATH = path.join(process.cwd(), "data", "onboarding-progress.json");

type OnboardingProgressRecord = {
  agentHandle: string;
  currentStep: number;
  completedSteps: number[];
  formData: Record<string, unknown>;
  updatedAt: string;
};

function normalizeHandle(input: string): string {
  return input.trim().toLowerCase();
}

async function readProgress(): Promise<OnboardingProgressRecord[]> {
  try {
    const raw = await fs.readFile(ONBOARDING_PROGRESS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((row) => row as Partial<OnboardingProgressRecord>)
      .filter((row) => typeof row.agentHandle === "string" && row.agentHandle.trim().length > 0)
      .map((row) => ({
        agentHandle: normalizeHandle(String(row.agentHandle)),
        currentStep:
          typeof row.currentStep === "number" && Number.isFinite(row.currentStep)
            ? Math.max(1, Math.floor(row.currentStep))
            : 1,
        completedSteps: Array.isArray(row.completedSteps)
          ? Array.from(
              new Set(
                row.completedSteps
                  .filter((step): step is number => typeof step === "number" && Number.isFinite(step))
                  .map((step) => Math.max(1, Math.floor(step))),
              ),
            ).sort((a, b) => a - b)
          : [],
        formData: row.formData && typeof row.formData === "object" && !Array.isArray(row.formData)
          ? (row.formData as Record<string, unknown>)
          : {},
        updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : new Date(0).toISOString(),
      }));
  } catch {
    return [];
  }
}

async function writeProgress(records: OnboardingProgressRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(ONBOARDING_PROGRESS_PATH), { recursive: true });
  await fs.writeFile(ONBOARDING_PROGRESS_PATH, `${JSON.stringify(records, null, 2)}\n`, "utf-8");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentHandle = searchParams.get("agentHandle");

  if (!agentHandle || !agentHandle.trim()) {
    return NextResponse.json({ error: "agentHandle query param is required" }, { status: 400 });
  }

  const handle = normalizeHandle(agentHandle);
  const records = await readProgress();
  const progress = records.find((record) => record.agentHandle === handle) ?? null;

  return NextResponse.json({ progress }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      agentHandle?: unknown;
      currentStep?: unknown;
      completedSteps?: unknown;
      formData?: unknown;
    };

    const agentHandle = typeof body.agentHandle === "string" ? normalizeHandle(body.agentHandle) : "";

    if (!agentHandle) {
      return NextResponse.json({ error: "agentHandle is required" }, { status: 400 });
    }

    const currentStepRaw = typeof body.currentStep === "number" ? body.currentStep : Number(body.currentStep);
    const currentStep = Number.isFinite(currentStepRaw) ? Math.max(1, Math.floor(currentStepRaw)) : 1;

    const completedSteps = Array.isArray(body.completedSteps)
      ? Array.from(
          new Set(
            body.completedSteps
              .filter((step): step is number => typeof step === "number" && Number.isFinite(step))
              .map((step) => Math.max(1, Math.floor(step))),
          ),
        ).sort((a, b) => a - b)
      : [];

    const formData = body.formData && typeof body.formData === "object" && !Array.isArray(body.formData)
      ? (body.formData as Record<string, unknown>)
      : {};

    const nextRecord: OnboardingProgressRecord = {
      agentHandle,
      currentStep,
      completedSteps,
      formData,
      updatedAt: new Date().toISOString(),
    };

    const records = await readProgress();
    const index = records.findIndex((record) => record.agentHandle === agentHandle);

    if (index === -1) {
      records.push(nextRecord);
    } else {
      records[index] = nextRecord;
    }

    await writeProgress(records);

    return NextResponse.json({ success: true, progress: nextRecord }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
