import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type Skill = {
  id: string;
  name: string;
  description: string;
  author: string;
  install_cmd: string;
  tags: string[];
};

type SandboxRunStatus = "success" | "error" | "running";

type SandboxRun = {
  id: string;
  skillId: string;
  skillName: string;
  timestamp: string;
  status: SandboxRunStatus;
  model: string;
  temperature: number;
  timeout: number;
  output: string;
};

type CreateRunPayload = {
  skillId?: unknown;
  model?: unknown;
  temperature?: unknown;
  timeout?: unknown;
};

const SKILLS_PATH = path.join(process.cwd(), "data", "skills.json");
const RUNS_PATH = path.join(process.cwd(), "data", "playground-sandbox-runs.json");
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

function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function generateMockOutput(skill: Skill, model: string, temperature: number, timeout: number): string {
  const outputs: Record<string, string> = {
    "1": `Initializing ${skill.name}...\n\nSetting up memory layers:\n✓ Episodic memory (daily logs)\n✓ Semantic memory (knowledge base)\n✓ Procedural memory (how-to guides)\n\nCreating directory structure...\n✓ memory/\n✓ memory/daily/\n✓ memory/procedures/\n\nCopying templates...\n✓ MEMORY.md\n✓ memory/${new Date().toISOString().split("T")[0]}.md\n\n✅ Memory system initialized successfully!\n\nAgent can now:\n- Store daily experiences\n- Build long-term knowledge\n- Learn procedures from outcomes`,
    "8": `Connecting to Google Workspace...\n\n📧 Gmail API: Authenticating...\n✓ Connected (scope: gmail.readonly)\n✓ Unread messages: ${Math.floor(Math.random() * 50)}\n\n📅 Calendar API: Authenticating...\n✓ Connected (scope: calendar.readonly)\n✓ Today's events: ${Math.floor(Math.random() * 8)}\n\n📁 Drive API: Authenticating...\n✓ Connected (scope: drive.file)\n✓ Storage used: ${(Math.random() * 10).toFixed(1)} GB / 15 GB\n\n✅ All Google Workspace services operational!\n\nSkill is ready to:\n- Read and send emails\n- Manage calendar events\n- Access and organize files`,
    "9": `Launching coding agent subprocess...\n\n🔧 Environment check:\n✓ Node.js v25.5.0\n✓ TypeScript 5.6.3\n✓ Git 2.47.1\n\n🤖 Spawning coding agent:\n✓ Agent model: ${model}\n✓ Temperature: ${temperature}\n✓ Max timeout: ${timeout}s\n\n📝 Agent capabilities:\n- Code generation\n- Bug fixing\n- Refactoring\n- Test writing\n\n✅ Coding agent ready!\n\nType your coding task to begin...`,
    "10": `Fetching weather data...\n\n🌍 Location: Auto-detected (San Francisco, CA)\n\n⛅ Current Conditions:\n   Temperature: ${Math.floor(Math.random() * 30 + 50)}°F\n   Conditions: ${["Sunny", "Partly Cloudy", "Cloudy", "Light Rain"][Math.floor(Math.random() * 4)]}\n   Humidity: ${Math.floor(Math.random() * 40 + 40)}%\n   Wind: ${Math.floor(Math.random() * 15 + 5)} mph\n\n📅 5-Day Forecast:\n   Mon: ⛅ 62°F / 52°F\n   Tue: 🌧️  59°F / 50°F\n   Wed: ☁️  61°F / 51°F\n   Thu: ☀️  65°F / 53°F\n   Fri: ☀️  67°F / 54°F\n\n✅ Weather data retrieved successfully!`,
  };

  return (
    outputs[skill.id] ||
    `Executing ${skill.name}...\n\n✓ Skill loaded\n✓ Dependencies verified\n✓ Configuration applied\n\nRunning skill with:\n- Model: ${model}\n- Temperature: ${temperature}\n- Timeout: ${timeout}s\n\n${skill.description}\n\n✅ Skill execution completed successfully!\n\nInstall command:\n${skill.install_cmd}`
  );
}

export async function GET() {
  const [skills, runs] = await Promise.all([
    readJsonFile<Skill[]>(SKILLS_PATH, []),
    readJsonFile<SandboxRun[]>(RUNS_PATH, []),
  ]);

  const orderedRuns = [...runs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return NextResponse.json(
    {
      skills,
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

  const skillId = typeof payload.skillId === "string" ? payload.skillId.trim() : "";
  const model = typeof payload.model === "string" && payload.model.trim().length > 0
    ? payload.model.trim()
    : "claude-sonnet-4-5";
  const temperature = clampNumber(payload.temperature, 0.7, 0, 1);
  const timeout = clampNumber(payload.timeout, 30, 15, 120);

  if (!skillId) {
    return NextResponse.json({ error: "skillId is required" }, { status: 400 });
  }

  const [skills, existingRuns] = await Promise.all([
    readJsonFile<Skill[]>(SKILLS_PATH, []),
    readJsonFile<SandboxRun[]>(RUNS_PATH, []),
  ]);

  const skill = skills.find((item) => item.id === skillId);
  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  const status: SandboxRunStatus = Math.random() > 0.1 ? "success" : "error";
  const output = generateMockOutput(skill, model, temperature, timeout);

  const run: SandboxRun = {
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    skillId: skill.id,
    skillName: skill.name,
    timestamp: new Date().toISOString(),
    status,
    model,
    temperature,
    timeout,
    output,
  };

  const nextRuns = [run, ...existingRuns].slice(0, MAX_RUNS);
  await writeJsonFile(RUNS_PATH, nextRuns);

  return NextResponse.json(
    { run },
    {
      status: 201,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
