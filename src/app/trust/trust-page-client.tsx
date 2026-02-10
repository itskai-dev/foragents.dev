"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Shield, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { IncidentItem, TrustCenterData } from "@/lib/trustCenter";

function scoreColor(score: number) {
  if (score >= 90) return "text-emerald-300";
  if (score >= 75) return "text-amber-300";
  return "text-red-300";
}

function severityStyles(severity: IncidentItem["severity"]) {
  switch (severity) {
    case "critical":
      return "bg-red-500/15 border-red-400/30 text-red-300";
    case "high":
      return "bg-orange-500/15 border-orange-400/30 text-orange-300";
    case "medium":
      return "bg-amber-500/15 border-amber-400/30 text-amber-300";
    default:
      return "bg-slate-500/15 border-slate-400/30 text-slate-300";
  }
}

function complianceStyles(status: "passed" | "in-progress") {
  return status === "passed"
    ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-300"
    : "bg-amber-500/15 border-amber-400/30 text-amber-300";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function TrustPageClient() {
  const [data, setData] = useState<TrustCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/trust", { cache: "no-store" });
        const payload = (await response.json()) as TrustCenterData & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load trust center data");
        }

        if (mounted) {
          setData(payload);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : "Unexpected error");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const sortedIncidents = useMemo(() => {
    if (!data) return [];

    return [...data.incidentHistory].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [data]);

  if (loading) {
    return (
      <Card className="bg-[#0f0f0f] border-white/10 p-10 text-center">
        <Loader2 className="w-7 h-7 mx-auto mb-4 animate-spin text-[#06D6A0]" />
        <p className="text-gray-300">Loading trust center data...</p>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-red-500/10 border-red-400/30 p-10 text-center">
        <AlertTriangle className="w-7 h-7 mx-auto mb-4 text-red-300" />
        <p className="text-red-200 mb-4">{error || "Unable to load trust center data."}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md border border-red-300/40 px-4 py-2 text-sm text-red-100 hover:bg-red-400/10"
        >
          Retry
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-10">
      <Card className="bg-[#0f0f0f] border-white/10 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Overall Security Posture</h2>
            <p className="text-gray-400">Current trust score and latest independent audit snapshot.</p>
          </div>

          <div className="text-center">
            <div className="relative mx-auto w-36 h-36">
              <div className="absolute inset-0 rounded-full border-8 border-white/10" />
              <div
                className="absolute inset-0 rounded-full border-8 border-[#06D6A0]"
                style={{
                  clipPath: `inset(${100 - data.overallTrustScore}% 0 0 0)`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${scoreColor(data.overallTrustScore)}`}>{data.overallTrustScore}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Score out of 100</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-white/10 bg-[#141414] p-4">
            <p className="text-xs uppercase text-gray-500">Audit Status</p>
            <p className="mt-1 font-medium capitalize text-emerald-300">{data.auditResults.overallStatus}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#141414] p-4">
            <p className="text-xs uppercase text-gray-500">Last Audit</p>
            <p className="mt-1 font-medium">{formatDate(data.auditResults.lastAudit)}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#141414] p-4">
            <p className="text-xs uppercase text-gray-500">Next Audit</p>
            <p className="mt-1 font-medium">{formatDate(data.auditResults.nextAudit)}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#141414] p-4">
            <p className="text-xs uppercase text-gray-500">Open Findings</p>
            <p className="mt-1 font-medium">{data.auditResults.findings.medium + data.auditResults.findings.low}</p>
          </div>
        </div>
      </Card>

      <Card className="bg-[#0f0f0f] border-white/10 p-8">
        <h3 className="text-xl font-semibold mb-5">Security Category Breakdown</h3>
        <div className="space-y-4">
          {data.securityCategories.map((category) => (
            <div key={category.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-gray-300">{category.label}</span>
                <span className={scoreColor(category.score)}>{category.score}/100</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-[#06D6A0]" style={{ width: `${category.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-[#0f0f0f] border-white/10 p-8">
        <h3 className="text-xl font-semibold mb-5">Certifications & Compliance</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {data.certifications.map((certification) => (
            <div key={certification.name} className="rounded-lg border border-white/10 bg-[#141414] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{certification.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Last audit: {formatDate(certification.lastAudit)}</p>
                </div>
                <Badge className={`border capitalize ${complianceStyles(certification.status)}`}>
                  {certification.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-[#0f0f0f] border-white/10 p-8">
        <h3 className="text-xl font-semibold mb-5">Recent Incident History</h3>
        <div className="space-y-4">
          {sortedIncidents.map((incident) => (
            <div key={`${incident.date}-${incident.description}`} className="rounded-lg border border-white/10 bg-[#141414] p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                <p className="text-sm text-gray-400">{formatDate(incident.date)}</p>
                <div className="flex gap-2">
                  <Badge className={`border capitalize ${severityStyles(incident.severity)}`}>{incident.severity}</Badge>
                  <Badge className={`border capitalize ${incident.status === "resolved" ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-300" : "bg-amber-500/15 border-amber-400/30 text-amber-300"}`}>
                    {incident.status}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-300">{incident.description}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="text-center text-sm text-gray-500">
        <div className="inline-flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#06D6A0]" />
          <span>Security data sourced from persistent trust center records.</span>
          <CheckCircle2 className="w-4 h-4 text-[#06D6A0]" />
        </div>
      </div>
    </div>
  );
}
