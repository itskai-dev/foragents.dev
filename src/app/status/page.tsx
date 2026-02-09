"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type ServiceStatus = "operational" | "degraded" | "outage";

interface Service {
  name: string;
  status: ServiceStatus;
  uptime: number;
  responseTime: number;
}

interface Incident {
  id: string;
  date: string;
  title: string;
  description: string;
  status: "resolved" | "investigating" | "monitoring";
  affectedServices: string[];
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
  outage: {
    color: "bg-red-500",
    text: "Outage",
    badgeVariant: "destructive" as const,
  },
};

// Mock data - in production this would come from an API
const initialServices: Service[] = [
  {
    name: "API",
    status: "operational",
    uptime: 99.98,
    responseTime: 145,
  },
  {
    name: "Website",
    status: "operational",
    uptime: 99.99,
    responseTime: 87,
  },
  {
    name: "MCP Registry",
    status: "operational",
    uptime: 99.95,
    responseTime: 213,
  },
  {
    name: "Supabase",
    status: "operational",
    uptime: 99.97,
    responseTime: 92,
  },
  {
    name: "CDN",
    status: "operational",
    uptime: 100.0,
    responseTime: 34,
  },
];

const incidents: Incident[] = [
  {
    id: "inc-005",
    date: "2026-02-05",
    title: "Brief API Latency Spike",
    description:
      "Users experienced elevated API response times for approximately 8 minutes. Root cause identified as database connection pool exhaustion. Connection limits have been increased.",
    status: "resolved",
    affectedServices: ["API"],
  },
  {
    id: "inc-004",
    date: "2026-01-28",
    title: "CDN Cache Invalidation Issue",
    description:
      "CDN cache invalidation failed for approximately 15 minutes, causing some users to see stale content. Issue was resolved by manually purging cache and redeploying edge configuration.",
    status: "resolved",
    affectedServices: ["CDN", "Website"],
  },
  {
    id: "inc-003",
    date: "2026-01-22",
    title: "MCP Registry Search Degradation",
    description:
      "Search functionality in the MCP Registry experienced degraded performance due to an index optimization job running during peak hours. Job has been rescheduled to off-peak times.",
    status: "resolved",
    affectedServices: ["MCP Registry"],
  },
  {
    id: "inc-002",
    date: "2026-01-15",
    title: "Supabase Connection Timeout",
    description:
      "Database connection timeouts affected user authentication for approximately 12 minutes. Supabase team resolved the issue on their end. Implementing additional retry logic.",
    status: "resolved",
    affectedServices: ["Supabase", "API"],
  },
  {
    id: "inc-001",
    date: "2026-01-09",
    title: "Scheduled Maintenance",
    description:
      "Planned maintenance window for infrastructure upgrades. All services were briefly unavailable for approximately 30 minutes. Upgrades included security patches and performance improvements.",
    status: "resolved",
    affectedServices: ["API", "Website", "MCP Registry", "Supabase", "CDN"],
  },
];

export default function StatusPage() {
  const [services] = useState<Service[]>(initialServices);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Status — forAgents.dev",
    description:
      "Real-time status and uptime information for forAgents.dev services including API, Website, MCP Registry, Supabase, and CDN.",
    url: "https://foragents.dev/status",
  };

  // Simulate periodic updates (in production, this would poll an API)
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const overallStatus: ServiceStatus =
    services.every((s) => s.status === "operational")
      ? "operational"
      : services.some((s) => s.status === "outage")
        ? "outage"
        : "degraded";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      {/* Hero Section with Overall Status */}
      <section className="relative overflow-hidden min-h-[300px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 w-full">
          <div className="text-center mb-8">
            <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
              System Status
            </h1>
            <p className="text-xl text-foreground/80 mb-6">
              Real-time status and uptime information
            </p>
          </div>

          {/* Overall Status Banner */}
          <Card className="bg-[#0f0f0f] border-white/10 max-w-3xl mx-auto">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full ${statusConfig[overallStatus].color}`}
                  />
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {overallStatus === "operational"
                        ? "All Systems Operational"
                        : overallStatus === "degraded"
                          ? "Some Systems Degraded"
                          : "Service Outage"}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Services Status */}
      <section className="relative max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Services</h2>

        <div className="space-y-4">
          {services.map((service) => (
            <Card
              key={service.name}
              className="bg-[#0f0f0f] border-white/10 hover:border-white/20 transition-colors"
            >
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${statusConfig[service.status].color}`}
                    />
                    <h3 className="text-xl font-semibold">{service.name}</h3>
                    <Badge
                      variant={statusConfig[service.status].badgeVariant}
                      className="ml-2"
                    >
                      {statusConfig[service.status].text}
                    </Badge>
                  </div>

                  <div className="flex gap-8 text-sm">
                    <div>
                      <p className="text-muted-foreground">Uptime (30d)</p>
                      <p className="font-semibold text-[#06D6A0]">
                        {service.uptime.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Response Time</p>
                      <p className="font-semibold text-[#06D6A0]">
                        {service.responseTime}ms
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Incident History */}
      <section className="relative max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Incident History</h2>

        <div className="space-y-6">
          {incidents.map((incident) => (
            <Card
              key={incident.id}
              className="bg-[#0f0f0f] border-white/10"
            >
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">
                        {incident.title}
                      </CardTitle>
                      <Badge
                        variant={
                          incident.status === "resolved"
                            ? "default"
                            : "secondary"
                        }
                        className="capitalize"
                      >
                        {incident.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(incident.date)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 mb-4">
                  {incident.description}
                </p>
                <Separator className="my-4" />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Affected Services:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {incident.affectedServices.map((service) => (
                      <Badge
                        key={service}
                        variant="secondary"
                        className="bg-white/5"
                      >
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Subscribe to Updates */}
      <section className="relative max-w-5xl mx-auto px-4 py-12 mb-12">
        <Card className="bg-gradient-to-br from-[#06D6A0]/10 to-[#06D6A0]/5 border-[#06D6A0]/20">
          <CardContent className="pt-6 text-center">
            <h3 className="text-2xl font-bold mb-2">
              Stay Updated
            </h3>
            <p className="text-foreground/80 mb-4">
              Subscribe to status updates and be notified of incidents as they happen.
            </p>
            <p className="text-sm text-muted-foreground">
              Coming soon: Email and webhook notifications
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
