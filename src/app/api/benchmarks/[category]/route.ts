import { NextRequest, NextResponse } from "next/server";
import { isBenchmarkCategory, queryBenchmarks } from "@/lib/benchmarks-store";
import type { BenchmarkSortKey, BenchmarkSortOrder } from "@/types/benchmarks";

function parseSort(value: string | null): BenchmarkSortKey {
  return value === "date" ? "date" : "score";
}

function parseOrder(value: string | null): BenchmarkSortOrder {
  return value === "asc" ? "asc" : "desc";
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ category: string }> }
) {
  const { category } = await context.params;

  if (!isBenchmarkCategory(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const skill = request.nextUrl.searchParams.get("skill") ?? undefined;
  const sort = parseSort(request.nextUrl.searchParams.get("sort"));
  const order = parseOrder(request.nextUrl.searchParams.get("order"));

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
      category,
      skill: skill ?? null,
      sort,
      order,
    },
  });
}
