import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

type CalculatorPreset = {
  id: string;
  name: string;
  description: string;
  agents: number;
  tokensPerDay: number;
  costPerToken: number;
  hoursPerDay: number;
  humanHourlyCost: number;
};

type ComputeRequestBody = {
  agentCount?: unknown;
  tokensPerDay?: unknown;
  costPerToken?: unknown;
  humanEquivalentHours?: unknown;
  hourlyRate?: unknown;
};

const PRESETS_PATH = path.join(process.cwd(), "data", "calculator-presets.json");
const DAYS_PER_MONTH = 30;
const WORK_DAYS_PER_MONTH = 22;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function clamp(value: number, min: number): number {
  return value < min ? min : value;
}

async function readPresets(): Promise<CalculatorPreset[]> {
  const raw = await fs.readFile(PRESETS_PATH, "utf8");
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter((item): item is CalculatorPreset => {
    if (!item || typeof item !== "object") {
      return false;
    }

    const preset = item as Partial<CalculatorPreset>;

    return (
      typeof preset.id === "string" &&
      typeof preset.name === "string" &&
      typeof preset.description === "string" &&
      isFiniteNumber(preset.agents) &&
      isFiniteNumber(preset.tokensPerDay) &&
      isFiniteNumber(preset.costPerToken) &&
      isFiniteNumber(preset.hoursPerDay) &&
      isFiniteNumber(preset.humanHourlyCost)
    );
  });
}

export async function GET() {
  try {
    const presets = await readPresets();
    return NextResponse.json({ presets });
  } catch (error) {
    console.error("Failed to load calculator presets", error);
    return NextResponse.json({ error: "Failed to load calculator presets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ComputeRequestBody;

    if (
      !isFiniteNumber(body.agentCount) ||
      !isFiniteNumber(body.tokensPerDay) ||
      !isFiniteNumber(body.costPerToken) ||
      !isFiniteNumber(body.humanEquivalentHours) ||
      !isFiniteNumber(body.hourlyRate)
    ) {
      return NextResponse.json(
        {
          error:
            "agentCount, tokensPerDay, costPerToken, humanEquivalentHours, and hourlyRate must be valid numbers",
        },
        { status: 400 }
      );
    }

    const agentCount = clamp(body.agentCount, 0);
    const tokensPerDay = clamp(body.tokensPerDay, 0);
    const costPerToken = clamp(body.costPerToken, 0);
    const humanEquivalentHours = clamp(body.humanEquivalentHours, 0);
    const hourlyRate = clamp(body.hourlyRate, 0);

    const monthlyCost = agentCount * tokensPerDay * costPerToken * DAYS_PER_MONTH;
    const monthlySavings = agentCount * humanEquivalentHours * hourlyRate * WORK_DAYS_PER_MONTH;

    const netMonthly = monthlySavings - monthlyCost;
    const roiPercentage =
      monthlyCost > 0 ? (netMonthly / monthlyCost) * 100 : monthlySavings > 0 ? 9999 : 0;

    const netDaily = netMonthly / DAYS_PER_MONTH;
    const breakevenDays = netDaily > 0 && monthlyCost > 0 ? monthlyCost / netDaily : null;

    return NextResponse.json({
      monthlyCost: Number(monthlyCost.toFixed(2)),
      monthlySavings: Number(monthlySavings.toFixed(2)),
      roiPercentage: Number(roiPercentage.toFixed(2)),
      breakevenDays: breakevenDays === null ? null : Number(breakevenDays.toFixed(2)),
    });
  } catch (error) {
    console.error("Failed to compute calculator ROI", error);
    return NextResponse.json({ error: "Failed to compute calculator ROI" }, { status: 500 });
  }
}
