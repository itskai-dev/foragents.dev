import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import mcpServers from "@/data/mcp-servers.json";

type CompatibilityStatus = "works" | "partial" | "broken" | "untested";

type CompatibilityClient = {
  id: string;
  name: string;
  versionRange: string;
};

type CompatibilitySeedRow = {
  slug: string;
  statuses: Record<string, CompatibilityStatus>;
  notes?: string;
};

type CompatibilityKnownIssue = {
  id: string;
  title: string;
  severity: "low" | "medium" | "high";
  details: string;
  affected: string[];
};

type CompatibilitySeedData = {
  updatedAt: string;
  clients: CompatibilityClient[];
  servers: CompatibilitySeedRow[];
  knownIssues: CompatibilityKnownIssue[];
};

type McpServer = {
  slug: string;
  name: string;
  category: string;
  repo_url: string;
};

const COMPATIBILITY_PATH = path.join(process.cwd(), "data", "compatibility.json");
const VALID_STATUSES: CompatibilityStatus[] = ["works", "partial", "broken", "untested"];

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function readCompatibilitySeed(): Promise<CompatibilitySeedData> {
  const raw = await fs.readFile(COMPATIBILITY_PATH, "utf-8");
  return JSON.parse(raw) as CompatibilitySeedData;
}

export async function GET(request: NextRequest) {
  const clientFilter = request.nextUrl.searchParams.get("client")?.trim();
  const statusFilterRaw = request.nextUrl.searchParams.get("status")?.trim() as CompatibilityStatus | undefined;
  const statusFilter = statusFilterRaw && VALID_STATUSES.includes(statusFilterRaw) ? statusFilterRaw : undefined;

  const seed = await readCompatibilitySeed();
  const mcpBySlug = new Map((mcpServers as McpServer[]).map((server) => [server.slug, server]));

  const rows = seed.servers
    .map((row) => {
      const server = mcpBySlug.get(row.slug);

      return {
        slug: row.slug,
        name: server?.name ?? titleFromSlug(row.slug),
        category: server?.category ?? "unknown",
        repoUrl: server?.repo_url ?? null,
        notes: row.notes ?? null,
        statuses: row.statuses,
      };
    })
    .filter((row) => {
      if (!statusFilter) return true;

      if (clientFilter) {
        return row.statuses[clientFilter] === statusFilter;
      }

      return Object.values(row.statuses).some((status) => status === statusFilter);
    });

  return NextResponse.json(
    {
      updatedAt: seed.updatedAt,
      clients: seed.clients,
      rows,
      knownIssues: seed.knownIssues,
      totalRows: rows.length,
      filters: {
        client: clientFilter ?? null,
        status: statusFilter ?? null,
      },
    },
    {
      headers: { "Cache-Control": "public, max-age=300" },
    }
  );
}
