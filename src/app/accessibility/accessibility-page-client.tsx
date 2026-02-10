"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, CircleAlert, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type {
  AccessibilityApiResponse,
  AccessibilityAuditCheck,
  AccessibilityCheckStatus,
  AccessibilityComplianceStatus,
} from "@/lib/accessibility";

function statusStyles(status: AccessibilityCheckStatus) {
  switch (status) {
    case "pass":
      return "bg-emerald-500/15 border-emerald-400/30 text-emerald-300";
    case "warning":
      return "bg-amber-500/15 border-amber-400/30 text-amber-300";
    default:
      return "bg-red-500/15 border-red-400/30 text-red-300";
  }
}

function statusIcon(status: AccessibilityCheckStatus) {
  switch (status) {
    case "pass":
      return <CheckCircle2 className="w-4 h-4" />;
    case "warning":
      return <CircleAlert className="w-4 h-4" />;
    default:
      return <AlertTriangle className="w-4 h-4" />;
  }
}

function complianceStyles(status: AccessibilityComplianceStatus) {
  switch (status) {
    case "compliant":
      return "bg-emerald-500/15 border-emerald-400/30 text-emerald-300";
    case "partial":
      return "bg-amber-500/15 border-amber-400/30 text-amber-300";
    default:
      return "bg-red-500/15 border-red-400/30 text-red-300";
  }
}

function scoreStyles(score: number) {
  if (score >= 90) return "text-emerald-300";
  if (score >= 75) return "text-amber-300";
  return "text-red-300";
}

export function AccessibilityPageClient() {
  const [data, setData] = useState<AccessibilityApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/accessibility", { cache: "no-store" });
        const payload = (await response.json()) as AccessibilityApiResponse & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load accessibility audit data.");
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

  const failedChecks = useMemo(() => {
    if (!data) return [];
    return data.auditChecks.filter((check) => check.status === "fail");
  }, [data]);

  if (loading) {
    return (
      <Card className="bg-[#0f0f0f] border-white/10 p-10 text-center">
        <Loader2 className="w-7 h-7 mx-auto mb-4 animate-spin text-[#06D6A0]" />
        <p className="text-gray-300">Loading accessibility audit results...</p>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-red-500/10 border-red-400/30 p-10 text-center">
        <AlertTriangle className="w-7 h-7 mx-auto mb-4 text-red-300" />
        <p className="text-red-200 mb-4">{error || "Unable to load accessibility audit results."}</p>
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
    <div className="space-y-8">
      <Card className="bg-[#0f0f0f] border-white/10 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Accessibility Compliance Snapshot</h2>
            <p className="text-gray-400">Persistent audit results from the latest accessibility review cycle.</p>
          </div>

          <div className="text-right">
            <p className={`text-5xl font-bold ${scoreStyles(data.overallScore)}`}>{data.overallScore}</p>
            <p className="text-xs text-gray-500 mt-1">Score out of 100</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Badge className={`border capitalize ${complianceStyles(data.complianceStatus)}`}>
            {data.complianceStatus === "compliant" ? <ShieldCheck className="w-3.5 h-3.5 mr-1" /> : <ShieldAlert className="w-3.5 h-3.5 mr-1" />}
            {data.complianceStatus}
          </Badge>
          <Badge className="border border-cyan-400/30 bg-cyan-500/15 text-cyan-300">WCAG Target: {data.wcagLevelTarget}</Badge>
          <Badge className="border border-white/15 bg-white/5 text-gray-300">{data.summary.pass} pass</Badge>
          <Badge className="border border-white/15 bg-white/5 text-gray-300">{data.summary.warning} warning</Badge>
          <Badge className="border border-white/15 bg-white/5 text-gray-300">{data.summary.fail} fail</Badge>
        </div>
      </Card>

      <Card className="bg-[#0f0f0f] border-white/10 p-8">
        <h3 className="text-xl font-semibold mb-5">Audit Checks</h3>
        <div className="space-y-4">
          {data.auditChecks.map((check: AccessibilityAuditCheck) => (
            <div key={check.name} className="rounded-lg border border-white/10 bg-[#141414] p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-2">
                <p className="font-medium">{check.name}</p>
                <Badge className={`border capitalize ${statusStyles(check.status)}`}>
                  <span className="mr-1">{statusIcon(check.status)}</span>
                  {check.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-300">{check.description}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-[#0f0f0f] border-white/10 p-8">
        <h3 className="text-xl font-semibold mb-5">Priority Recommendations</h3>
        {failedChecks.length === 0 ? (
          <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-4 text-emerald-200">
            No failing checks. Continue monitoring warnings and maintain regression testing.
          </div>
        ) : (
          <div className="space-y-3">
            {failedChecks.map((check) => (
              <div key={check.name} className="rounded-lg border border-red-400/25 bg-red-500/10 p-4">
                <p className="font-medium text-red-200 mb-1">{check.name}</p>
                <p className="text-sm text-red-100/90">{check.recommendation}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
