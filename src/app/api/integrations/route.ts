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

async function readIntegrations(): Promise<Integration[]> {
  const raw = await fs.readFile(INTEGRATIONS_PATH, "utf-8");
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) return [];
  return parsed as Integration[];
}

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get("category")?.trim().toLowerCase();
    const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase();

    const integrations = await readIntegrations();

    const filtered = integrations.filter((integration) => {
      const categoryMatch = category ? integration.category.toLowerCase() === category : true;
      if (!categoryMatch) return false;

      if (!search) return true;

      const haystack = [
        integration.name,
        integration.slug,
        integration.description,
        integration.category,
        integration.type,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
    });

    const categories = Array.from(new Set(integrations.map((integration) => integration.category)));

    return NextResponse.json(
      {
        integrations: filtered.map((integration) => ({
          id: integration.id,
          name: integration.name,
          slug: integration.slug,
          icon: integration.icon,
          description: integration.description,
          type: integration.type,
          category: integration.category,
          learnMoreUrl: integration.learnMoreUrl,
          featured: Boolean(integration.featured),
          installCount: integration.installCount,
          rating: integration.rating,
        })),
        total: filtered.length,
        categories,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Failed to load integrations", error);
    return NextResponse.json({ error: "Failed to load integrations" }, { status: 500 });
  }
}
