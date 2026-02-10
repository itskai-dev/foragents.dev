import { promises as fs } from "fs";
import path from "path";

export type ConnectorType = "oauth" | "api-key" | "webhook" | "mcp";
export type ConnectorStatus = "active" | "beta" | "deprecated";

export interface Connector {
  name: string;
  slug: string;
  type: ConnectorType;
  status: ConnectorStatus;
  description: string;
  authMethod: string;
  configFields: string[];
  installCount: number;
}

const CONNECTORS_PATH = path.join(process.cwd(), "data", "connectors.json");

export async function readConnectors(): Promise<Connector[]> {
  const raw = await fs.readFile(CONNECTORS_PATH, "utf-8");
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) return [];

  return parsed.filter((item): item is Connector => {
    if (!item || typeof item !== "object") return false;

    const record = item as Record<string, unknown>;
    return (
      typeof record.name === "string" &&
      typeof record.slug === "string" &&
      typeof record.type === "string" &&
      typeof record.status === "string" &&
      typeof record.description === "string" &&
      typeof record.authMethod === "string" &&
      Array.isArray(record.configFields) &&
      typeof record.installCount === "number"
    );
  });
}

export async function writeConnectors(connectors: Connector[]): Promise<void> {
  await fs.writeFile(CONNECTORS_PATH, `${JSON.stringify(connectors, null, 2)}\n`, "utf-8");
}

export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
