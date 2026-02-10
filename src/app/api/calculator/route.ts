import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

type CalculatorInputs = {
  agents: number;
  hoursSavedPerAgentPerDay: number;
  hourlyRate: number;
  monthlyToolCosts: number;
};

type CalculatorResults = {
  monthlySavings: number;
  annualRoi: number;
  paybackPeriodMonths: number | null;
  efficiencyGainPercent: number;
};

type SavedCalculation = {
  id: string;
  name: string;
  inputs: CalculatorInputs;
  results: CalculatorResults;
  createdAt: string;
};

type SaveCalculationBody = {
  name?: unknown;
  inputs?: unknown;
  results?: unknown;
};

const PRESETS_PATH = path.join(process.cwd(), "data", "calculator-presets.json");
const RESULTS_PATH = path.join(process.cwd(), "data", "calculator-results.json");

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isInputs(value: unknown): value is CalculatorInputs {
  if (!value || typeof value !== "object") {
    return false;
  }

  const inputs = value as Partial<CalculatorInputs>;

  return (
    isFiniteNumber(inputs.agents) &&
    isFiniteNumber(inputs.hoursSavedPerAgentPerDay) &&
    isFiniteNumber(inputs.hourlyRate) &&
    isFiniteNumber(inputs.monthlyToolCosts)
  );
}

function isResults(value: unknown): value is CalculatorResults {
  if (!value || typeof value !== "object") {
    return false;
  }

  const results = value as Partial<CalculatorResults>;

  const paybackValid =
    results.paybackPeriodMonths === null || isFiniteNumber(results.paybackPeriodMonths);

  return (
    isFiniteNumber(results.monthlySavings) &&
    isFiniteNumber(results.annualRoi) &&
    paybackValid &&
    isFiniteNumber(results.efficiencyGainPercent)
  );
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeResults(results: SavedCalculation[]): Promise<void> {
  const dir = path.dirname(RESULTS_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(RESULTS_PATH, JSON.stringify(results, null, 2), "utf8");
}

export async function GET() {
  try {
    const presets = await readJsonFile(PRESETS_PATH, []);

    if (!Array.isArray(presets)) {
      return NextResponse.json({ error: "Invalid presets format" }, { status: 500 });
    }

    return NextResponse.json({ presets });
  } catch (error) {
    console.error("Failed to load calculator presets", error);
    return NextResponse.json({ error: "Failed to load calculator presets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SaveCalculationBody;

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const inputs = body.inputs;
    const results = body.results;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    if (!isInputs(inputs)) {
      return NextResponse.json(
        { error: "inputs must include agents, hoursSavedPerAgentPerDay, hourlyRate, and monthlyToolCosts" },
        { status: 400 }
      );
    }

    if (!isResults(results)) {
      return NextResponse.json(
        {
          error:
            "results must include monthlySavings, annualRoi, paybackPeriodMonths, and efficiencyGainPercent",
        },
        { status: 400 }
      );
    }

    const existingResults = await readJsonFile<SavedCalculation[]>(RESULTS_PATH, []);
    const safeResults = Array.isArray(existingResults) ? existingResults : [];

    const record: SavedCalculation = {
      id: `calc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      inputs,
      results,
      createdAt: new Date().toISOString(),
    };

    safeResults.unshift(record);
    await writeResults(safeResults);

    return NextResponse.json({ calculation: record }, { status: 201 });
  } catch (error) {
    console.error("Failed to save calculator result", error);
    return NextResponse.json({ error: "Failed to save calculator result" }, { status: 500 });
  }
}
