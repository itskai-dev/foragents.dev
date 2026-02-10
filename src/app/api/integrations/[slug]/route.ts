import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INTEGRATIONS_PATH = path.join(process.cwd(), "data", "integrations.json");

interface IntegrationRating {
  average: number;
  count: number;
}

interface IntegrationConfigHints {
  required: string[];
  optional: string[];
  sample: Record<string, string>;
  notes: string;
}

interface IntegrationConfigExample {
  title: string;
  format: "json" | "env" | "yaml";
  content: string;
}

interface Integration {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  type: "API" | "CLI" | "Plugin" | "Webhook";
  category: "monitoring" | "storage" | "communication" | "deployment" | "security";
  learnMoreUrl: string;
  setupInstructions: string;
  steps: string[];
  codeSnippet: string;
  requiredEnvVars: string[];
  documentation: string;
  featured?: boolean;
  installCount: number;
  rating: IntegrationRating;
  configSchemaHints: IntegrationConfigHints;
  configExamples: IntegrationConfigExample[];
}

interface Params {
  params: Promise<{ slug: string }>;
}

async function readIntegrations(): Promise<Integration[]> {
  const raw = await fs.readFile(INTEGRATIONS_PATH, "utf-8");
  const parsed = JSON.parse(raw) as unknown;
  return Array.isArray(parsed) ? (parsed as Integration[]) : [];
}

async function writeIntegrations(integrations: Integration[]): Promise<void> {
  await fs.writeFile(INTEGRATIONS_PATH, `${JSON.stringify(integrations, null, 2)}\n`, "utf-8");
}

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const integrations = await readIntegrations();
    const integration = integrations.find((item) => item.slug === slug);

    if (!integration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    return NextResponse.json({ integration }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to fetch integration", error);
    return NextResponse.json({ error: "Failed to fetch integration" }, { status: 500 });
  }
}

export async function POST(_: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const integrations = await readIntegrations();
    const index = integrations.findIndex((item) => item.slug === slug);

    if (index < 0) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    const current = integrations[index];
    const nextInstallCount = Number.isFinite(current.installCount) ? current.installCount + 1 : 1;

    integrations[index] = {
      ...current,
      installCount: nextInstallCount,
    };

    await writeIntegrations(integrations);

    return NextResponse.json({
      success: true,
      installCount: nextInstallCount,
      integration: integrations[index],
    });
  } catch (error) {
    console.error("Failed to track install", error);
    return NextResponse.json({ error: "Failed to track install" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const body = (await request.json()) as { rating?: unknown };
    const rating = typeof body.rating === "number" ? body.rating : Number.NaN;

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "rating must be a number between 1 and 5" }, { status: 400 });
    }

    const { slug } = await params;
    const integrations = await readIntegrations();
    const index = integrations.findIndex((item) => item.slug === slug);

    if (index < 0) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    const current = integrations[index];
    const currentCount = Number.isFinite(current.rating.count) ? current.rating.count : 0;
    const currentAverage = Number.isFinite(current.rating.average) ? current.rating.average : 0;

    const nextCount = currentCount + 1;
    const nextAverage = Number(((currentAverage * currentCount + rating) / nextCount).toFixed(2));

    integrations[index] = {
      ...current,
      rating: {
        average: nextAverage,
        count: nextCount,
      },
    };

    await writeIntegrations(integrations);

    return NextResponse.json({
      success: true,
      rating: integrations[index].rating,
      integration: integrations[index],
    });
  } catch (error) {
    console.error("Failed to update rating", error);
    return NextResponse.json({ error: "Failed to update rating" }, { status: 500 });
  }
}
