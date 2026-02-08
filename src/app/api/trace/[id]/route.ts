import { NextResponse } from "next/server";
import { getTraceById } from "@/lib/server/tracesStore";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const trace = await getTraceById(id);
  if (!trace) {
    return NextResponse.json(
      { error: "Trace not found", id },
      {
        status: 404,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  return NextResponse.json(
    { trace },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
