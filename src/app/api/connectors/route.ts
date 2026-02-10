import { NextRequest, NextResponse } from "next/server";
import {
  type Connector,
  type ConnectorStatus,
  type ConnectorType,
  normalizeSlug,
  readConnectors,
  writeConnectors,
} from "@/lib/connectors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const connectorTypes: ConnectorType[] = ["oauth", "api-key", "webhook", "mcp"];
const connectorStatuses: ConnectorStatus[] = ["active", "beta", "deprecated"];

function isConnectorType(value: string): value is ConnectorType {
  return connectorTypes.includes(value as ConnectorType);
}

function isConnectorStatus(value: string): value is ConnectorStatus {
  return connectorStatuses.includes(value as ConnectorStatus);
}

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get("type")?.trim().toLowerCase();
    const status = request.nextUrl.searchParams.get("status")?.trim().toLowerCase();
    const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase();

    const connectors = await readConnectors();

    const filtered = connectors.filter((connector) => {
      if (type && connector.type !== type) return false;
      if (status && connector.status !== status) return false;

      if (!search) return true;

      return [
        connector.name,
        connector.slug,
        connector.description,
        connector.authMethod,
        connector.type,
        connector.status,
        ...connector.configFields,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search);
    });

    const types = Array.from(new Set(connectors.map((connector) => connector.type)));
    const statuses = Array.from(new Set(connectors.map((connector) => connector.status)));

    return NextResponse.json(
      {
        connectors: filtered,
        total: filtered.length,
        types,
        statuses,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Failed to load connectors", error);
    return NextResponse.json({ error: "Failed to load connectors" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "register";

    const connectors = await readConnectors();

    if (action === "install") {
      const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";

      if (!slug) {
        return NextResponse.json({ error: "slug is required" }, { status: 400 });
      }

      const connectorIndex = connectors.findIndex((connector) => connector.slug === slug);
      if (connectorIndex === -1) {
        return NextResponse.json({ error: "Connector not found" }, { status: 404 });
      }

      const updated = connectors.map((connector, index) =>
        index === connectorIndex
          ? { ...connector, installCount: connector.installCount + 1 }
          : connector
      );

      await writeConnectors(updated);

      return NextResponse.json({ connector: updated[connectorIndex] }, { status: 200 });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const slugSource = typeof body.slug === "string" ? body.slug : name;
    const slug = normalizeSlug(slugSource);
    const type = typeof body.type === "string" ? body.type.trim().toLowerCase() : "";
    const status = typeof body.status === "string" ? body.status.trim().toLowerCase() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const authMethod = typeof body.authMethod === "string" ? body.authMethod.trim() : "";
    const configFields = Array.isArray(body.configFields)
      ? body.configFields.filter((field): field is string => typeof field === "string")
      : [];
    const installCount = typeof body.installCount === "number" && body.installCount >= 0 ? body.installCount : 0;

    if (!name || !slug || !description || !authMethod || configFields.length === 0) {
      return NextResponse.json(
        {
          error:
            "name, slug (or name), description, authMethod, and at least one configFields entry are required",
        },
        { status: 400 }
      );
    }

    if (!isConnectorType(type) || !isConnectorStatus(status)) {
      return NextResponse.json(
        { error: "type must be oauth/api-key/webhook/mcp and status must be active/beta/deprecated" },
        { status: 400 }
      );
    }

    if (connectors.some((connector) => connector.slug === slug)) {
      return NextResponse.json({ error: "Connector slug already exists" }, { status: 409 });
    }

    const connector: Connector = {
      name,
      slug,
      type,
      status,
      description,
      authMethod,
      configFields,
      installCount,
    };

    const updated = [...connectors, connector];
    await writeConnectors(updated);

    return NextResponse.json({ connector }, { status: 201 });
  } catch (error) {
    console.error("Failed to create connector", error);
    return NextResponse.json({ error: "Failed to create connector" }, { status: 500 });
  }
}
