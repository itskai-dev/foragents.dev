import { NextResponse } from "next/server";
import { getMacroTools } from "@/lib/macroTools";

export async function GET() {
  const macros = getMacroTools();

  return NextResponse.json(
    {
      macros,
      count: macros.length,
      updated_at: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    }
  );
}
