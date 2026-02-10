import { NextRequest, NextResponse } from "next/server";
import { createUseCase, filterUseCases, readUseCases } from "@/lib/useCasesStore";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const industry = searchParams.get("industry");
  const search = searchParams.get("search");

  const useCases = await readUseCases();
  const filtered = filterUseCases(useCases, { industry, search });

  return NextResponse.json({ useCases: filtered, total: filtered.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await createUseCase(body);

    if (result.errors.length > 0 || !result.useCase) {
      return NextResponse.json(
        { error: "Validation failed", details: result.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ useCase: result.useCase }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }
}
