"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type ServiceStatus = "operational" | "degraded" | "down";

interface Service {
  name: string;
  status: ServiceStatus;
  latencyMs: number;
  lastCheck: string;
}

interface StatusResponse {
  services: Service[];
  overall: ServiceStatus;
}

interface HistoryEntry {
  date: string;
  uptime: number;
  incidents: number;
}

interface HistoryResponse {
  history: HistoryEntry[];
}

const statusConfig = {
  operational: {
    color: "bg-green-500",
    text: "Operational",
    badgeVariant: "default" as const,
  },
  degraded: {
    color: "bg-yellow-500",
    text: "Degraded",
    badgeVariant: "secondary" as const,
  },
  down: {
    color: "bg-red-500",
    text: "Down",
    badgeVariant: "destructive" as const,
  },
};

export default function StatusPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [overallStatus, setOverallStatus] = useState<ServiceStatus>("operational");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Status — forAgents.dev",
    description: "Real-time status and uptime information for forAgents.dev services.",
    url: "https://foragents.dev/status",
  };

  useEffect(() => {
    let mounted = true;

    const fetchStatus = async () => {
      try {
        const [statusRes, historyRes] = await Promise.all([
          fetch("/api/status", { cache: "no-store" }),
          fetch("/api/status/history", { cache: "no-store" }),
        ]);

        if (!statusRes.ok || !historyRes.ok) {
          throw new Error("Failed to load status");
        }

        const statusData = (await statusRes.json()) as StatusResponse;
        const historyData = (await historyRes.json()) as HistoryResponse;

        if (!mounted) return;

        setServices(statusData.services);
        setOverallStatus(statusData.overall);
        setHistory(historyData.history);
        setLastUpdated(new Date());
        setError(null);
      } catch {
        if (!mounted) return;
        setError("Unable to load live status checks right now.");
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30_000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const overallHeading = useMemo(() => {
    if (overallStatus === "operational") return "All Systems Operational";
    if (overallStatus === "degraded") return "Some Systems Degraded";
    return "Service Outage";
  }, [overallStatus]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      <section className="relative overflow-hidden min-h-[260px] flex items-center">
        <div className="relative max-w-5xl mx-auto px-4 py-16 w-full">
          <div className="text-center mb-8">
            <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
              System Status
            </h1>
            <p className="text-xl text-foreground/80">Live health checks, refreshed every 30 seconds</p>
          </div>

          <Card className="bg-[#0f0f0f] border-white/10 max-w-3xl mx-auto">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${statusConfig[overallStatus].color}`} />
                <div>
                  <h2 className="text-2xl font-semibold">{overallHeading}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : "Loading..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {error ? <p className="text-center text-sm text-red-400 mt-4">{error}</p> : null}
        </div>
      </section>

      <section className="relative max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Services</h2>
        <div className="space-y-4">
          {services.map((service) => (
            <Card
              key={service.name}
              className="bg-[#0f0f0f] border-white/10 hover:border-white/20 transition-colors"
            >
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${statusConfig[service.status].color}`} />
                    <h3 className="text-xl font-semibold">{service.name}</h3>
                    <Badge variant={statusConfig[service.status].badgeVariant} className="ml-2">
                      {statusConfig[service.status].text}
                    </Badge>
                  </div>

                  <div className="flex gap-8 text-sm">
                    <div>
                      <p className="text-muted-foreground">Latency</p>
                      <p className="font-semibold text-[#06D6A0]">{service.latencyMs}ms</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last check</p>
                      <p className="font-semibold text-[#06D6A0]">
                        {new Date(service.lastCheck).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="relative max-w-5xl mx-auto px-4 py-8 mb-12">
        <h2 className="text-3xl font-bold mb-6">Uptime (Last 7 Days)</h2>

        <Card className="bg-[#0f0f0f] border-white/10">
          <CardContent className="pt-6">
            <div className="grid grid-cols-7 gap-3 h-48 items-end">
              {history.map((entry) => {
                const heightPct = Math.max(8, Math.round(entry.uptime));

                return (
                  <div key={entry.date} className="flex flex-col items-center gap-2">
                    <div className="w-full h-36 bg-white/5 rounded-md relative overflow-hidden border border-white/10">
                      <div
                        className="absolute bottom-0 w-full bg-[#06D6A0]"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
                    <p className="text-xs text-[#06D6A0] font-semibold">{entry.uptime.toFixed(2)}%</p>
                    <p className="text-[10px] text-muted-foreground">Incidents: {entry.incidents}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
