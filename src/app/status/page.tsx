"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type ServiceStatus = "operational" | "degraded" | "down";

interface Service {
  name: string;
  status: ServiceStatus;
  uptime: number;
  lastChecked: Date;
}

interface Incident {
  date: string;
  title: string;
  status: "resolved" | "investigating" | "monitoring";
  description: string;
}

export default function StatusPage() {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Mock service data - in production this would come from an API
  const services: Service[] = [
    {
      name: "API",
      status: "operational",
      uptime: 99.95,
      lastChecked: lastRefresh,
    },
    {
      name: "Website",
      status: "operational",
      uptime: 99.98,
      lastChecked: lastRefresh,
    },
    {
      name: "CDN",
      status: "operational",
      uptime: 99.99,
      lastChecked: lastRefresh,
    },
    {
      name: "Database",
      status: "operational",
      uptime: 99.92,
      lastChecked: lastRefresh,
    },
    {
      name: "Search",
      status: "operational",
      uptime: 99.97,
      lastChecked: lastRefresh,
    },
  ];

  const incidents: Incident[] = [
    {
      date: "2026-02-05",
      title: "Elevated API Response Times",
      status: "resolved",
      description:
        "API endpoints experienced increased latency due to database query optimization. Issue was identified and resolved within 15 minutes.",
    },
    {
      date: "2026-02-01",
      title: "Search Indexing Delay",
      status: "resolved",
      description:
        "Search index update was delayed by 2 hours due to upstream data pipeline maintenance. Normal operation resumed automatically.",
    },
    {
      date: "2026-01-28",
      title: "Skills Registry Rate Limiting",
      status: "resolved",
      description:
        "Temporary rate limiting applied to Skills Registry API due to unexpected traffic spike. Capacity increased and limits removed.",
    },
    {
      date: "2026-01-25",
      title: "News Feed Synchronization",
      status: "resolved",
      description:
        "News feed RSS sync experienced intermittent failures. Feed parser updated and monitoring improved.",
    },
  ];

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case "operational":
        return "bg-green-500";
      case "degraded":
        return "bg-yellow-500";
      case "down":
        return "bg-red-500";
    }
  };

  const getStatusText = (status: ServiceStatus) => {
    switch (status) {
      case "operational":
        return "Operational";
      case "degraded":
        return "Degraded";
      case "down":
        return "Down";
    }
  };

  const allOperational = services.every((s) => s.status === "operational");

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="text-xs text-muted-foreground font-mono">
              forAgents.dev
            </span>
          </Link>
        </div>
      </header>

      {/* Overall Status Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] ${
              allOperational ? "bg-[#06D6A0]/5" : "bg-yellow-500/5"
            } rounded-full blur-[160px]`}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div
                className={`w-4 h-4 rounded-full ${
                  allOperational ? "bg-[#06D6A0]" : "bg-yellow-500"
                } animate-pulse`}
              />
              <h1 className="text-3xl md:text-4xl font-bold text-[#F8FAFC]">
                {allOperational ? "All Systems Operational" : "System Status"}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Last updated: {lastRefresh.toLocaleTimeString()} · Auto-refreshes
              every 30 seconds
            </p>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Services Status */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Service Status</h2>
          <p className="text-muted-foreground">
            Current operational status of all forAgents.dev services
          </p>
        </div>

        <div className="grid gap-4">
          {services.map((service, index) => (
            <Card
              key={index}
              className="bg-card/50 border-white/5 hover:border-[#06D6A0]/20 transition-all"
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-3 h-3 rounded-full ${getStatusColor(
                        service.status
                      )} ${
                        service.status === "operational" ? "animate-pulse" : ""
                      }`}
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {service.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {getStatusText(service.status)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Uptime: </span>
                      <span className="font-semibold text-[#06D6A0]">
                        {service.uptime}%
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Checked: {service.lastChecked.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Incident History */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Incident History</h2>
          <p className="text-muted-foreground">
            Recent incidents and their resolutions
          </p>
        </div>

        <div className="space-y-4">
          {incidents.map((incident, index) => (
            <Card
              key={index}
              className="bg-card/50 border-white/5 hover:border-[#06D6A0]/20 transition-all"
            >
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">
                      {incident.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-500/10 text-green-500 border-green-500/30"
                      >
                        {incident.status === "resolved"
                          ? "✓ Resolved"
                          : incident.status === "investigating"
                          ? "⚠ Investigating"
                          : "👁 Monitoring"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(incident.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {incident.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Status Subscribe CTA */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />

          <div className="relative p-8 md:p-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📬</span>
              <h2 className="text-2xl font-bold">Stay Updated</h2>
            </div>

            <p className="text-muted-foreground mb-6 max-w-2xl">
              Want to receive notifications about incidents and maintenance
              windows? We&apos;ll notify you of any service disruptions or
              planned maintenance.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Link
                href="/subscribe"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Subscribe to Updates
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                Back to Home →
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
