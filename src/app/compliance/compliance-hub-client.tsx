/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, CircleX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ComplianceCheck, ComplianceFramework } from "@/lib/complianceHub";

interface ComplianceApiResponse {
  overallComplianceScore: number;
  frameworks: ComplianceFramework[];
  checks: ComplianceCheck[];
  summary: {
    totalFrameworks: number;
    totalChecks: number;
    passingChecks: number;
  };
}

const FILTERS = [
  { label: "All categories", value: "all" },
  { label: "Framework: GDPR", value: "gdpr" },
  { label: "Framework: SOC2", value: "soc2" },
  { label: "Framework: HIPAA", value: "hipaa" },
  { label: "Framework: ISO27001", value: "iso27001" },
  { label: "Framework: CCPA", value: "ccpa" },
  { label: "Category: Privacy", value: "privacy" },
  { label: "Category: Security", value: "security" },
  { label: "Category: Governance", value: "governance" },
  { label: "Category: Risk", value: "risk" },
  { label: "Category: Healthcare", value: "healthcare" },
];

function statusBadgeClass(status: ComplianceFramework["status"]) {
  if (status === "compliant") {
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
  }

  if (status === "partial") {
    return "bg-amber-500/15 text-amber-300 border-amber-500/40";
  }

  return "bg-rose-500/15 text-rose-300 border-rose-500/40";
}

function scoreBarClass(score: number) {
  if (score >= 85) {
    return "bg-emerald-400";
  }

  if (score >= 70) {
    return "bg-amber-400";
  }

  return "bg-rose-400";
}

function formatDate(dateInput: string) {
  const date = new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    return dateInput;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ComplianceHubClient() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [data, setData] = useState<ComplianceApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadComplianceData() {
      setLoading(true);
      setError(null);

      try {
        const query = selectedCategory === "all" ? "" : `?category=${encodeURIComponent(selectedCategory)}`;
        const response = await fetch(`/api/compliance${query}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load compliance data");
        }

        const payload = (await response.json()) as ComplianceApiResponse;

        if (!isCancelled) {
          setData(payload);
        }
      } catch {
        if (!isCancelled) {
          setError("Unable to load compliance data right now. Please try again.");
          setData(null);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadComplianceData();

    return () => {
      isCancelled = true;
    };
  }, [selectedCategory]);

  const passRate = useMemo(() => {
    if (!data || data.summary.totalChecks === 0) {
      return 0;
    }

    return Math.round((data.summary.passingChecks / data.summary.totalChecks) * 100);
  }, [data]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative overflow-hidden min-h-[320px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <Badge className="mb-4 bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20">Real-time Compliance Tracking</Badge>
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">Compliance Hub</h1>
          <p className="text-lg text-foreground/80">Monitor each framework's readiness with persistent audits and requirement-level checks.</p>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-end gap-6 md:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Framework filter</h2>
            <p className="text-sm text-foreground/70">Filter by compliance framework or requirement category.</p>
          </div>

          <div className="flex flex-col gap-2 min-w-[260px]">
            <label htmlFor="category-filter" className="text-sm text-foreground/70">
              Category
            </label>
            <select
              id="category-filter"
              className="rounded-md border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#06D6A0]/50"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              {FILTERS.map((filterOption) => (
                <option key={filterOption.value} value={filterOption.value}>
                  {filterOption.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-8">
        {loading && (
          <Card className="border-white/10 bg-card/30">
            <CardContent className="py-8 text-sm text-foreground/70">Loading compliance framework data...</CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-rose-500/30 bg-rose-500/10">
            <CardContent className="py-8 flex items-center gap-3 text-rose-200 text-sm">
              <AlertTriangle className="h-5 w-5" />
              {error}
            </CardContent>
          </Card>
        )}

        {!loading && !error && data && (
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-3 border-white/10 bg-card/30">
              <CardHeader>
                <CardTitle className="text-xl">Overall compliance score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-4xl font-bold text-[#F8FAFC]">{data.overallComplianceScore}%</p>
                    <p className="text-sm text-foreground/70 mt-1">
                      {data.summary.passingChecks} of {data.summary.totalChecks} checks passing ({passRate}% pass rate)
                    </p>
                  </div>
                  <div className="w-full md:max-w-md">
                    <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full ${scoreBarClass(data.overallComplianceScore)}`}
                        style={{ width: `${data.overallComplianceScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {data.frameworks.length === 0 && (
              <Card className="md:col-span-3 border-white/10 bg-card/30">
                <CardContent className="py-8 text-sm text-foreground/70">No frameworks matched this filter.</CardContent>
              </Card>
            )}

            {data.frameworks.map((framework) => (
              <Card key={framework.id} className="md:col-span-3 border-white/10 bg-card/30">
                <CardHeader className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <CardTitle className="text-2xl">{framework.name}</CardTitle>
                      <p className="text-sm text-foreground/65 mt-1">Last audit: {formatDate(framework.lastAudit)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={statusBadgeClass(framework.status)}>
                        {framework.status}
                      </Badge>
                      <Badge variant="secondary">{framework.score}%</Badge>
                    </div>
                  </div>

                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full ${scoreBarClass(framework.score)}`} style={{ width: `${framework.score}%` }} />
                  </div>
                </CardHeader>

                <CardContent>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-md border border-white/10 bg-black/25 px-4 py-3 text-sm font-medium">
                      <span>Requirements checklist ({framework.requirements.length})</span>
                      <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                    </summary>

                    <div className="mt-3 space-y-3">
                      {framework.requirements.map((requirement) => (
                        <div
                          key={requirement.id}
                          className="rounded-md border border-white/10 bg-black/20 px-4 py-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">{requirement.title}</p>
                              <p className="text-sm text-foreground/70 mt-1">{requirement.description}</p>
                              <p className="text-xs text-foreground/50 mt-2 uppercase tracking-wide">Category: {requirement.category}</p>
                            </div>
                            <div className="mt-0.5">
                              {requirement.pass ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                              ) : (
                                <CircleX className="h-5 w-5 text-rose-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
