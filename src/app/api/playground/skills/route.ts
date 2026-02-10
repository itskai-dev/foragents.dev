import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type PlaygroundTemplate = {
  id: string;
  name: string;
  description?: string;
  skillSlug: string;
  model: string;
  parameters: Record<string, string>;
  env: Record<string, string>;
};

type RunConfig = {
  skillSlug: string;
  model: string;
  parameters: Record<string, string>;
  env: Record<string, string>;
};

type ExecutionHistoryItem = {
  id: string;
  startedAtIso: string;
  finishedAtIso?: string;
  status: "success" | "error" | "running" | "cancelled";
  config: RunConfig;
  terminal: string;
  result: string;
};

type CreateRunPayload = {
  run?: unknown;
};

const TEMPLATES_PATH = path.join(process.cwd(), "data", "playground-skill-templates.json");
const RUNS_PATH = path.join(process.cwd(), "data", "playground-skill-runs.json");
const MAX_RUNS = 100;

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf-8");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeRun(input: unknown): ExecutionHistoryItem | null {
  if (!isRecord(input)) return null;

  const id = typeof input.id === "string" ? input.id.trim() : "";
  const startedAtIso = typeof input.startedAtIso === "string" ? input.startedAtIso : "";
  const finishedAtIso = typeof input.finishedAtIso === "string" ? input.finishedAtIso : undefined;
  const status = typeof input.status === "string" ? input.status : "running";
  const terminal = typeof input.terminal === "string" ? input.terminal : "";
  const result = typeof input.result === "string" ? input.result : "";

  const config = isRecord(input.config) ? input.config : null;
  const skillSlug = typeof config?.skillSlug === "string" ? config.skillSlug : "";
  const model = typeof config?.model === "string" ? config.model : "";

  const parameters = isRecord(config?.parameters)
    ? Object.fromEntries(
        Object.entries(config.parameters)
          .filter(([, value]) => typeof value === "string")
          .map(([key, value]) => [key, value as string])
      )
    : {};

  const env = isRecord(config?.env)
    ? Object.fromEntries(
        Object.entries(config.env)
          .filter(([, value]) => typeof value === "string")
          .map(([key, value]) => [key, value as string])
      )
    : {};

  const validStatuses = new Set(["success", "error", "running", "cancelled"]);

  if (!id || !startedAtIso || !skillSlug || !model || !validStatuses.has(status)) {
    return null;
  }

  return {
    id,
    startedAtIso,
    finishedAtIso,
    status: status as ExecutionHistoryItem["status"],
    config: {
      skillSlug,
      model,
      parameters,
      env,
    },
    terminal,
    result,
  };
}

export async function GET() {
  const [templates, runs] = await Promise.all([
    readJsonFile<PlaygroundTemplate[]>(TEMPLATES_PATH, []),
    readJsonFile<ExecutionHistoryItem[]>(RUNS_PATH, []),
  ]);

  const orderedRuns = [...runs].sort(
    (a, b) => new Date(b.startedAtIso).getTime() - new Date(a.startedAtIso).getTime()
  );

  return NextResponse.json(
    {
      templates,
      runs: orderedRuns,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  let payload: CreateRunPayload;

  try {
    payload = (await request.json()) as CreateRunPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const run = sanitizeRun(payload.run);
  if (!run) {
    return NextResponse.json({ error: "Invalid run payload" }, { status: 400 });
  }

  const existingRuns = await readJsonFile<ExecutionHistoryItem[]>(RUNS_PATH, []);
  const deduped = existingRuns.filter((item) => item.id !== run.id);
  const nextRuns = [run, ...deduped].slice(0, MAX_RUNS);

  await writeJsonFile(RUNS_PATH, nextRuns);

  return NextResponse.json(
    {
      run,
      runs: nextRuns,
    },
    {
      status: 201,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function DELETE() {
  await writeJsonFile(RUNS_PATH, []);

  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
