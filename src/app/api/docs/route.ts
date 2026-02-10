import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

import seedDocs from "../../../../data/api-docs.json";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

type ApiParameter = {
  name: string;
  type: string;
  required: boolean;
};

type ApiEndpoint = {
  id: string;
  method: HttpMethod;
  path: string;
  description: string;
  parameters: ApiParameter[];
  exampleResponse: unknown;
};

type ApiCategory = {
  id: string;
  name: string;
  description: string;
  endpoints: ApiEndpoint[];
};

type ApiDocsSeed = {
  baseUrl: string;
  version: string;
  categories: ApiCategory[];
};

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
const METHOD_REGEX = /export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/g;

const HIDDEN_ROUTE_PREFIXES = ["/api/admin", "/api/cron", "/api/webhooks", "/api/stripe"];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function normalizePath(value: string): string {
  return value.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
}

function toApiPath(filePath: string): string | null {
  const normalized = filePath.split(path.sep).join("/");
  const marker = "/src/app";
  const markerIndex = normalized.lastIndexOf(marker);

  if (markerIndex === -1) return null;

  const appRelative = normalized.slice(markerIndex + marker.length);
  const withoutRoute = appRelative.replace(/\/route\.tsx?$/, "");
  const routePath = normalizePath(withoutRoute);

  return routePath.startsWith("/api/") ? routePath : null;
}

function toTitleCase(value: string): string {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function inferCategory(pathname: string): { id: string; name: string } {
  const segments = pathname.split("/").filter(Boolean);
  const segment = segments[1] || "misc";

  if (segment === "health" || segment === "status") {
    return { id: "health", name: "Health" };
  }

  if (segment === "mcp") {
    return { id: "mcp", name: "MCP" };
  }

  if (segment === "skills" || segment === "skill") {
    return { id: "skills", name: "Skills" };
  }

  if (segment === "agents" || segment === "agent-card") {
    return { id: "agents", name: "Agents" };
  }

  if (segment === "bounties") {
    return { id: "bounties", name: "Bounties" };
  }

  if (segment === "community" || segment === "events" || segment === "requests") {
    return { id: "community-events", name: "Community & Events" };
  }

  return {
    id: slugify(segment || "misc"),
    name: toTitleCase(segment || "Misc"),
  };
}

async function listRouteFiles(dirPath: string): Promise<string[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listRouteFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && /^route\.tsx?$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function parseMethods(fileContent: string): HttpMethod[] {
  const methods = new Set<HttpMethod>();

  for (const match of fileContent.matchAll(METHOD_REGEX)) {
    const method = match[1] as HttpMethod;
    if (HTTP_METHODS.includes(method)) {
      methods.add(method);
    }
  }

  return Array.from(methods);
}

function isPublicRoute(routePath: string): boolean {
  if (!routePath.startsWith("/api/")) return false;
  if (routePath === "/api/docs") return false;

  return !HIDDEN_ROUTE_PREFIXES.some((prefix) => routePath.startsWith(prefix));
}

async function discoverEndpoints(projectRoot: string): Promise<Array<{ method: HttpMethod; path: string }>> {
  const apiRoot = path.join(projectRoot, "src", "app", "api");
  const routeFiles = await listRouteFiles(apiRoot);
  const discovered = new Map<string, { method: HttpMethod; path: string }>();

  for (const filePath of routeFiles) {
    const routePath = toApiPath(filePath);
    if (!routePath || !isPublicRoute(routePath)) continue;

    const content = await fs.readFile(filePath, "utf8");
    const methods = parseMethods(content);

    for (const method of methods) {
      const key = `${method} ${routePath}`;
      discovered.set(key, { method, path: routePath });
    }
  }

  return Array.from(discovered.values()).sort((a, b) => {
    if (a.path === b.path) return a.method.localeCompare(b.method);
    return a.path.localeCompare(b.path);
  });
}

function createEndpointId(method: HttpMethod, routePath: string): string {
  return slugify(`${method}-${routePath.replace(/^\/api\//, "").replace(/\//g, "-")}`);
}

function mergeSeedWithDiscovered(seed: ApiDocsSeed, discovered: Array<{ method: HttpMethod; path: string }>): ApiCategory[] {
  const categories = new Map<string, ApiCategory>();
  const seededKeys = new Set<string>();

  for (const category of seed.categories) {
    categories.set(category.id, {
      ...category,
      endpoints: category.endpoints.map((endpoint) => {
        seededKeys.add(`${endpoint.method} ${endpoint.path}`);
        return endpoint;
      }),
    });
  }

  for (const endpoint of discovered) {
    const key = `${endpoint.method} ${endpoint.path}`;
    if (seededKeys.has(key)) continue;

    const inferred = inferCategory(endpoint.path);
    const category = categories.get(inferred.id) || {
      id: inferred.id,
      name: inferred.name,
      description: "Auto-discovered endpoints.",
      endpoints: [],
    };

    category.endpoints.push({
      id: createEndpointId(endpoint.method, endpoint.path),
      method: endpoint.method,
      path: endpoint.path,
      description: "Auto-discovered route. Add details to data/api-docs.json for richer docs.",
      parameters: [],
      exampleResponse: {
        message: "Example response not yet documented.",
      },
    });

    categories.set(inferred.id, category);
  }

  return Array.from(categories.values()).map((category) => ({
    ...category,
    endpoints: category.endpoints.sort((a, b) => {
      if (a.path === b.path) return a.method.localeCompare(b.method);
      return a.path.localeCompare(b.path);
    }),
  }));
}

export const runtime = "nodejs";

export async function GET() {
  const seed = seedDocs as ApiDocsSeed;
  const projectRoot = process.cwd();
  const discovered = await discoverEndpoints(projectRoot);
  const categories = mergeSeedWithDiscovered(seed, discovered);

  const totalEndpoints = categories.reduce((count, category) => count + category.endpoints.length, 0);

  return NextResponse.json(
    {
      baseUrl: seed.baseUrl,
      version: seed.version,
      generatedAt: new Date().toISOString(),
      totalEndpoints,
      discoveredRoutes: discovered.length,
      categories,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
