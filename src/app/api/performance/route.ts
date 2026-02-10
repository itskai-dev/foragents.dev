import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type PerformanceCategory = "caching" | "scaling" | "tokens" | "general";

interface PerformanceBenchmark {
  id: string;
  metric: string;
  value: number;
  unit: string;
  category: PerformanceCategory;
  agentHandle: string;
  measuredAt: string;
  environment: string;
}

const DATA_PATH = path.join(process.cwd(), "data", "performance-benchmarks.json");
const CATEGORIES: PerformanceCategory[] = ["caching", "scaling", "tokens", "general"];

async function readBenchmarks(): Promise<PerformanceBenchmark[]> {
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw) as PerformanceBenchmark[];
}

async function writeBenchmarks(benchmarks: PerformanceBenchmark[]): Promise<void> {
  await fs.writeFile(DATA_PATH, `${JSON.stringify(benchmarks, null, 2)}\n`, "utf-8");
}

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get("category");
    const agent = request.nextUrl.searchParams.get("agent");
    const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase();

    if (category && !CATEGORIES.includes(category as PerformanceCategory)) {
      return NextResponse.json(
        { error: "Invalid category. Use caching, scaling, tokens, or general." },
        { status: 400 },
      );
    }

    const benchmarks = await readBenchmarks();

    const filtered = benchmarks.filter((item) => {
      if (category && item.category !== category) {
        return false;
      }

      if (agent && item.agentHandle.toLowerCase() !== agent.toLowerCase()) {
        return false;
      }

      if (search) {
        const target = `${item.metric} ${item.unit} ${item.environment} ${item.agentHandle}`.toLowerCase();
        if (!target.includes(search)) {
          return false;
        }
      }

      return true;
    });

    return NextResponse.json({
      benchmarks: filtered,
      count: filtered.length,
      filters: {
        category: category ?? null,
        agent: agent ?? null,
        search: search ?? null,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load performance benchmarks." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<PerformanceBenchmark>;

    if (!body.metric || typeof body.metric !== "string") {
      return NextResponse.json({ error: "metric is required." }, { status: 400 });
    }

    if (typeof body.value !== "number" || Number.isNaN(body.value)) {
      return NextResponse.json({ error: "value must be a valid number." }, { status: 400 });
    }

    if (!body.unit || typeof body.unit !== "string") {
      return NextResponse.json({ error: "unit is required." }, { status: 400 });
    }

    if (!body.category || !CATEGORIES.includes(body.category)) {
      return NextResponse.json(
        { error: "category must be one of: caching, scaling, tokens, general." },
        { status: 400 },
      );
    }

    if (!body.agentHandle || typeof body.agentHandle !== "string") {
      return NextResponse.json({ error: "agentHandle is required." }, { status: 400 });
    }

    if (!body.environment || typeof body.environment !== "string") {
      return NextResponse.json({ error: "environment is required." }, { status: 400 });
    }

    const measuredAt = body.measuredAt ?? new Date().toISOString();
    if (Number.isNaN(Date.parse(measuredAt))) {
      return NextResponse.json({ error: "measuredAt must be a valid ISO date." }, { status: 400 });
    }

    const benchmarks = await readBenchmarks();

    const benchmark: PerformanceBenchmark = {
      id: body.id && body.id.trim() ? body.id : `bench_${randomUUID()}`,
      metric: body.metric.trim(),
      value: body.value,
      unit: body.unit.trim(),
      category: body.category,
      agentHandle: body.agentHandle.trim(),
      measuredAt,
      environment: body.environment.trim(),
    };

    benchmarks.push(benchmark);
    await writeBenchmarks(benchmarks);

    return NextResponse.json({ success: true, benchmark }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create performance benchmark." }, { status: 500 });
  }
}
