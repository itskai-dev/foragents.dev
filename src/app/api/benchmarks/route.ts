import { NextRequest, NextResponse } from "next/server";
import { createBenchmark, isBenchmarkCategory, queryBenchmarks } from "@/lib/benchmarks-store";
import type { BenchmarkSortKey, BenchmarkSortOrder } from "@/types/benchmarks";

function parseSort(value: string | null): BenchmarkSortKey {
  return value === "date" ? "date" : "score";
}

function parseOrder(value: string | null): BenchmarkSortOrder {
  return value === "asc" ? "asc" : "desc";
}

export async function GET(request: NextRequest) {
  const categoryParam = request.nextUrl.searchParams.get("category");
  const skill = request.nextUrl.searchParams.get("skill") ?? undefined;
  const sort = parseSort(request.nextUrl.searchParams.get("sort"));
  const order = parseOrder(request.nextUrl.searchParams.get("order"));

  if (categoryParam && !isBenchmarkCategory(categoryParam)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const category = categoryParam && isBenchmarkCategory(categoryParam) ? categoryParam : undefined;

  const benchmarks = await queryBenchmarks({
    category,
    skill,
    sort,
    order,
  });

  return NextResponse.json({
    benchmarks,
    count: benchmarks.length,
    filters: {
      category: categoryParam,
      skill: skill ?? null,
      sort,
      order,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const created = await createBenchmark({
      id: typeof body.id === "string" ? body.id : undefined,
      skillSlug: String(body.skillSlug ?? ""),
      skillName: String(body.skillName ?? ""),
      category: body.category as "speed" | "accuracy" | "reliability" | "memory",
      score: Number(body.score),
      metrics: body.metrics as Record<string, number | string | boolean | null>,
      runDate: String(body.runDate ?? new Date().toISOString()),
      version: String(body.version ?? "v1"),
    });

    return NextResponse.json({ success: true, benchmark: created }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create benchmark";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
