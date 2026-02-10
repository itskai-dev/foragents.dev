"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

type ApiDocsResponse = {
  baseUrl: string;
  version: string;
  generatedAt: string;
  totalEndpoints: number;
  discoveredRoutes: number;
  categories: ApiCategory[];
};

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  POST: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  PUT: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  PATCH: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  DELETE: "bg-red-500/15 text-red-300 border-red-500/30",
  HEAD: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  OPTIONS: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
};

function normalizePath(pathname: string): string {
  return pathname.replace(/\[([^\]]+)\]/g, "{$1}");
}

function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <Badge variant="outline" className={`font-mono ${METHOD_COLORS[method]}`}>
      {method}
    </Badge>
  );
}

function ExampleBlock({ value }: { value: unknown }) {
  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);

  return (
    <pre className="rounded-lg border border-white/10 bg-black/40 p-3 text-xs overflow-x-auto">
      <code>{text}</code>
    </pre>
  );
}

function EndpointCard({
  endpoint,
  baseUrl,
  copiedId,
  onCopy,
}: {
  endpoint: ApiEndpoint;
  baseUrl: string;
  copiedId: string | null;
  onCopy: (id: string, fullUrl: string) => void;
}) {
  const fullUrl = `${baseUrl.replace(/\/$/, "")}${endpoint.path}`;

  return (
    <Card className="bg-card/40 border-white/10">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MethodBadge method={endpoint.method} />
              <code className="text-sm text-cyan-300">{endpoint.path}</code>
            </div>
            <p className="text-sm text-muted-foreground">{endpoint.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="secondary">
              <Link
                href={`/playground?endpoint=${encodeURIComponent(endpoint.id)}&path=${encodeURIComponent(normalizePath(endpoint.path))}&method=${endpoint.method}`}
              >
                Try It
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopy(endpoint.id, fullUrl)}
              type="button"
            >
              {copiedId === endpoint.id ? "Copied" : "Copy URL"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="mb-2 text-sm font-semibold">Parameters</h4>
          {endpoint.parameters.length === 0 ? (
            <p className="text-sm text-muted-foreground">No parameters.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {endpoint.parameters.map((param) => (
                <div key={`${endpoint.id}-${param.name}`} className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-cyan-200">{param.name}</span>
                    <span className="text-xs text-muted-foreground">{param.type}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {param.required ? "Required" : "Optional"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold">Example response</h4>
          <ExampleBlock value={endpoint.exampleResponse} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ApiDocsClient() {
  const [docs, setDocs] = useState<ApiDocsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadDocs() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/docs", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to load docs (${response.status})`);
        }

        const payload = (await response.json()) as ApiDocsResponse;
        if (!mounted) return;
        setDocs(payload);
      } catch (err) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : "Failed to load API docs";
        setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadDocs();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredCategories = useMemo(() => {
    if (!docs) return [];

    const term = query.trim().toLowerCase();
    if (!term) return docs.categories;

    return docs.categories
      .map((category) => ({
        ...category,
        endpoints: category.endpoints.filter((endpoint) => {
          const haystack = `${endpoint.path} ${endpoint.description}`.toLowerCase();
          return haystack.includes(term);
        }),
      }))
      .filter((category) => category.endpoints.length > 0);
  }, [docs, query]);

  async function handleCopy(id: string, fullUrl: string) {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1400);
    } catch {
      setCopiedId(null);
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold aurora-text">API Documentation</h1>
          <p className="max-w-3xl text-muted-foreground">
            Live endpoint documentation generated from real routes. Search by path or description,
            inspect schema details, and open endpoints in the interactive playground.
          </p>
        </header>

        <Card className="bg-card/40 border-white/10">
          <CardContent className="grid gap-3 p-4 sm:grid-cols-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Version</div>
              <div className="font-mono text-sm">{docs?.version ?? "-"}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Endpoints</div>
              <div className="font-mono text-sm">{docs?.totalEndpoints ?? "-"}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Discovered routes</div>
              <div className="font-mono text-sm">{docs?.discoveredRoutes ?? "-"}</div>
            </div>
          </CardContent>
        </Card>

        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search endpoints by path or description"
          className="max-w-2xl"
        />

        {loading ? (
          <Card className="bg-card/40 border-white/10">
            <CardContent className="p-6 text-sm text-muted-foreground">Loading API documentation...</CardContent>
          </Card>
        ) : null}

        {error ? (
          <Card className="border-red-500/20 bg-red-500/10">
            <CardContent className="space-y-3 p-6">
              <p className="text-sm text-red-300">{error}</p>
              <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {!loading && !error && docs ? (
          <Accordion
            type="multiple"
            defaultValue={filteredCategories.map((category) => category.id)}
            className="rounded-lg border border-white/10 bg-card/20 px-4"
          >
            {filteredCategories.map((category) => (
              <AccordionItem value={category.id} key={category.id}>
                <AccordionTrigger>
                  <div className="space-y-1 text-left">
                    <div className="font-semibold">{category.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {category.description} · {category.endpoints.length} endpoints
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-6">
                  {category.endpoints.map((endpoint) => (
                    <EndpointCard
                      key={endpoint.id}
                      endpoint={endpoint}
                      baseUrl={docs.baseUrl}
                      copiedId={copiedId}
                      onCopy={handleCopy}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}

            {filteredCategories.length === 0 ? (
              <div className="py-8 text-sm text-muted-foreground">No endpoints match your search.</div>
            ) : null}
          </Accordion>
        ) : null}
      </div>
    </div>
  );
}
