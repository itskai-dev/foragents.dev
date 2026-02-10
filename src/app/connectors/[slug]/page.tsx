"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type ConnectorType = "oauth" | "api-key" | "webhook" | "mcp";
type ConnectorStatus = "active" | "beta" | "deprecated";

interface Connector {
  name: string;
  slug: string;
  type: ConnectorType;
  status: ConnectorStatus;
  description: string;
  authMethod: string;
  configFields: string[];
  installCount: number;
}

const TYPE_LABELS: Record<ConnectorType, string> = {
  oauth: "OAuth",
  "api-key": "API Key",
  webhook: "Webhook",
  mcp: "MCP",
};

export default function ConnectorDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [connector, setConnector] = useState<Connector | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const abort = new AbortController();

    async function loadConnector() {
      try {
        setLoading(true);
        setNotFound(false);

        const response = await fetch(`/api/connectors/${slug}`, {
          method: "GET",
          cache: "no-store",
          signal: abort.signal,
        });

        if (response.status === 404) {
          setNotFound(true);
          setConnector(null);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load connector");
        }

        const data = (await response.json()) as { connector: Connector };
        setConnector(data.connector);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setConnector(null);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadConnector();
    }

    return () => {
      abort.abort();
    };
  }, [slug]);

  const getTypeBadgeColor = (type: ConnectorType) => {
    switch (type) {
      case "oauth":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "api-key":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "webhook":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "mcp":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
    }
  };

  const getStatusBadgeColor = (status: ConnectorStatus) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "beta":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "deprecated":
        return "bg-red-500/20 text-red-300 border-red-500/30";
    }
  };

  async function trackInstall() {
    if (!connector) return;

    const response = await fetch("/api/connectors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "install", slug: connector.slug }),
    });

    if (!response.ok) return;

    const data = (await response.json()) as { connector?: Connector };
    if (!data.connector) return;

    setConnector(data.connector);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] max-w-4xl mx-auto px-4 py-16 text-muted-foreground">
        Loading connector...
      </div>
    );
  }

  if (notFound || !connector) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-[#F8FAFC] mb-3">Connector not found</h1>
        <p className="text-muted-foreground mb-6">
          The connector you requested does not exist or may have been removed.
        </p>
        <Link href="/connectors" className="text-purple-400 hover:underline">
          ← Back to connectors
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/connectors" className="hover:text-foreground transition-colors">
              Connectors
            </Link>
            <span>/</span>
            <span className="text-foreground">{connector.name}</span>
          </nav>
        </div>
      </div>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-purple/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC] mb-4">{connector.name}</h1>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="outline" className={getTypeBadgeColor(connector.type)}>
              {TYPE_LABELS[connector.type]}
            </Badge>
            <Badge variant="outline" className={getStatusBadgeColor(connector.status)}>
              {connector.status}
            </Badge>
          </div>

          <p className="text-lg text-foreground/80 mb-4">{connector.description}</p>
          <p className="text-sm text-muted-foreground">Authentication: {connector.authMethod}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={trackInstall}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
            >
              Track install +1
            </button>
            <span className="text-sm text-muted-foreground">
              Total installs: {connector.installCount.toLocaleString()}
            </span>
            <Link
              href="/connectors"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
            >
              ← All connectors
            </Link>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Required configuration fields</CardTitle>
            <p className="text-muted-foreground">Add these values when registering this connector in your agent host.</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {connector.configFields.map((field) => (
                <li key={field} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-foreground/90">
                  {field}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
