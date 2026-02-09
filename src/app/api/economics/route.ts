import { modelEconomics } from "@/lib/economics";

export function GET() {
  return Response.json({
    generatedAt: new Date().toISOString(),
    count: modelEconomics.length,
    models: modelEconomics,
  });
}
