import { NextResponse } from "next/server";
import { likeUseCase } from "@/lib/useCasesStore";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const updated = await likeUseCase(id);

  if (!updated) {
    return NextResponse.json({ error: "Use case not found" }, { status: 404 });
  }

  return NextResponse.json({ useCase: updated });
}
