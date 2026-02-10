/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, CircleDashed, CircleSlash2, CircleX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type AuditFramework = "GDPR" | "SOC2" | "HIPAA" | "ISO27001";
type AuditStatus = "pass" | "fail" | "partial" | "na";

interface ComplianceAudit {
  id: string;
  framework: AuditFramework;
  controlId: string;
  controlName: string;
  status: AuditStatus;
  evidence: string;
  auditor: string;
  auditDate: string;
  nextReviewDate: string;
  notes: string;
}

interface FrameworkScore {
  framework: AuditFramework;
  score: number;
  passed: number;
  partial: number;
  failed: number;
  notApplicable: number;
  totalApplicable: number;
}

interface AuditApiResponse {
  audits: ComplianceAudit[];
  total: number;
  frameworkScores: FrameworkScore[];
}

interface AuditFormState {
  framework: AuditFramework;
  controlId: string;
  controlName: string;
  status: AuditStatus;
  evidence: string;
  auditor: string;
  auditDate: string;
  nextReviewDate: string;
  notes: string;
}

const INITIAL_FORM_STATE: AuditFormState = {
  framework: "GDPR",
  controlId: "",
  controlName: "",
  status: "pass",
  evidence: "",
  auditor: "",
  auditDate: "",
  nextReviewDate: "",
  notes: "",
};

function scoreBarClass(score: number): string {
  if (score >= 85) return "bg-emerald-400";
  if (score >= 70) return "bg-amber-400";
  return "bg-rose-400";
}

function formatDate(dateInput: string): string {
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

function statusBadgeClass(status: AuditStatus): string {
  if (status === "pass") {
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
  }

  if (status === "partial") {
    return "bg-amber-500/15 text-amber-300 border-amber-500/40";
  }

  if (status === "na") {
    return "bg-slate-500/20 text-slate-300 border-slate-400/30";
  }

  return "bg-rose-500/15 text-rose-300 border-rose-500/40";
}

function frameworkBadgeClass(framework: AuditFramework): string {
  if (framework === "GDPR") return "bg-sky-500/15 text-sky-300 border-sky-500/35";
  if (framework === "SOC2") return "bg-violet-500/15 text-violet-300 border-violet-500/35";
  if (framework === "HIPAA") return "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/35";
  return "bg-cyan-500/15 text-cyan-300 border-cyan-500/35";
}

function statusIcon(status: AuditStatus) {
  if (status === "pass") return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  if (status === "partial") return <CircleDashed className="h-4 w-4 text-amber-300" />;
  if (status === "na") return <CircleSlash2 className="h-4 w-4 text-slate-300" />;
  return <CircleX className="h-4 w-4 text-rose-400" />;
}

export default function AuditComplianceClient() {
  const [frameworkFilter, setFrameworkFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const [data, setData] = useState<AuditApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<AuditFormState>(INITIAL_FORM_STATE);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAuditData() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (frameworkFilter !== "all") {
          params.set("framework", frameworkFilter);
        }

        if (statusFilter !== "all") {
          params.set("status", statusFilter);
        }

        if (search.trim()) {
          params.set("search", search.trim());
        }

        const query = params.toString();
        const url = query ? `/api/compliance/audit?${query}` : "/api/compliance/audit";

        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Unable to load audit records");
        }

        const payload = (await response.json()) as AuditApiResponse;

        if (!cancelled) {
          setData(payload);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load compliance audits right now. Please try again.");
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAuditData();

    return () => {
      cancelled = true;
    };
  }, [frameworkFilter, search, statusFilter]);

  const totalDisplayed = useMemo(() => data?.audits.length ?? 0, [data]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitMessage(null);

    try {
      const response = await fetch("/api/compliance/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { details?: string[] };
        const details = payload.details?.length ? payload.details.join(", ") : "Validation failed";
        throw new Error(details);
      }

      setSubmitMessage("Audit finding saved successfully.");
      setForm(INITIAL_FORM_STATE);

      const refresh = await fetch("/api/compliance/audit", { cache: "no-store" });
      if (refresh.ok) {
        const payload = (await refresh.json()) as AuditApiResponse;
        setData(payload);
        setFrameworkFilter("all");
        setStatusFilter("all");
        setSearch("");
      }
    } catch (submitErr) {
      const message = submitErr instanceof Error ? submitErr.message : "Unable to submit finding";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative overflow-hidden min-h-[280px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 w-full">
          <Link
            href="/compliance"
            className="text-sm text-foreground/60 hover:text-[#06D6A0] transition-colors mb-4 inline-block"
          >
            ← Back to Compliance Hub
          </Link>
          <Badge className="mb-4 bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20">Persistent Audit Data</Badge>
          <h1 className="text-[36px] md:text-[48px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-3">Compliance Audit Tracker</h1>
          <p className="text-lg text-foreground/80 max-w-3xl">
            Review framework controls, filter findings, and submit new audit entries backed by persistent data.
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Card className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle>Filter controls</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="audit-framework-filter">Framework</Label>
              <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
                <SelectTrigger id="audit-framework-filter" className="w-full">
                  <SelectValue placeholder="All frameworks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All frameworks</SelectItem>
                  <SelectItem value="GDPR">GDPR</SelectItem>
                  <SelectItem value="SOC2">SOC2</SelectItem>
                  <SelectItem value="HIPAA">HIPAA</SelectItem>
                  <SelectItem value="ISO27001">ISO27001</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audit-status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="audit-status-filter" className="w-full">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pass">Pass</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="fail">Fail</SelectItem>
                  <SelectItem value="na">N/A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="audit-search">Search controls, evidence, notes, or auditor</Label>
              <Input
                id="audit-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Try: CC7.2, encryption, Patel"
                className="bg-black/25"
              />
            </div>
          </CardContent>
        </Card>

        {loading && (
          <Card className="border-white/10 bg-card/30">
            <CardContent className="py-8 text-sm text-foreground/70">Loading audit findings...</CardContent>
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
          <>
            <div className="grid gap-4 md:grid-cols-4">
              {data.frameworkScores.map((frameworkScore) => (
                <Card key={frameworkScore.framework} className="border-white/10 bg-card/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between gap-2">
                      {frameworkScore.framework}
                      <Badge variant="outline" className={frameworkBadgeClass(frameworkScore.framework)}>
                        {frameworkScore.score}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className={`h-full ${scoreBarClass(frameworkScore.score)}`} style={{ width: `${frameworkScore.score}%` }} />
                    </div>
                    <p className="text-xs text-foreground/70">
                      Pass: {frameworkScore.passed} · Partial: {frameworkScore.partial} · Fail: {frameworkScore.failed} · N/A: {frameworkScore.notApplicable}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-white/10 bg-card/30">
              <CardHeader>
                <CardTitle>Audit table ({totalDisplayed})</CardTitle>
              </CardHeader>
              <CardContent>
                {data.audits.length === 0 ? (
                  <p className="text-sm text-foreground/70">No audit findings match the current filters.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-left text-foreground/65">
                          <th className="py-2 pr-4 font-medium">Framework</th>
                          <th className="py-2 pr-4 font-medium">Control</th>
                          <th className="py-2 pr-4 font-medium">Status</th>
                          <th className="py-2 pr-4 font-medium">Evidence</th>
                          <th className="py-2 pr-4 font-medium">Auditor</th>
                          <th className="py-2 pr-4 font-medium">Audit Date</th>
                          <th className="py-2 pr-4 font-medium">Next Review</th>
                          <th className="py-2 font-medium">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.audits.map((audit) => (
                          <tr key={audit.id} className="border-b border-white/5 align-top">
                            <td className="py-3 pr-4">
                              <Badge variant="outline" className={frameworkBadgeClass(audit.framework)}>
                                {audit.framework}
                              </Badge>
                            </td>
                            <td className="py-3 pr-4">
                              <div className="font-medium">{audit.controlName}</div>
                              <div className="text-xs text-foreground/60">{audit.controlId}</div>
                            </td>
                            <td className="py-3 pr-4">
                              <Badge variant="outline" className={statusBadgeClass(audit.status)}>
                                <span className="inline-flex items-center gap-1.5">
                                  {statusIcon(audit.status)}
                                  {audit.status.toUpperCase()}
                                </span>
                              </Badge>
                            </td>
                            <td className="py-3 pr-4">
                              <a
                                href={audit.evidence}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#06D6A0] hover:underline break-all"
                              >
                                View evidence
                              </a>
                            </td>
                            <td className="py-3 pr-4">{audit.auditor}</td>
                            <td className="py-3 pr-4">{formatDate(audit.auditDate)}</td>
                            <td className="py-3 pr-4">{formatDate(audit.nextReviewDate)}</td>
                            <td className="py-3 max-w-xs text-foreground/75">{audit.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <Card className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle>Submit audit finding</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="form-framework">Framework</Label>
                <Select value={form.framework} onValueChange={(value) => setForm((prev) => ({ ...prev, framework: value as AuditFramework }))}>
                  <SelectTrigger id="form-framework" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GDPR">GDPR</SelectItem>
                    <SelectItem value="SOC2">SOC2</SelectItem>
                    <SelectItem value="HIPAA">HIPAA</SelectItem>
                    <SelectItem value="ISO27001">ISO27001</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-status">Status</Label>
                <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as AuditStatus }))}>
                  <SelectTrigger id="form-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pass">Pass</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="fail">Fail</SelectItem>
                    <SelectItem value="na">N/A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-control-id">Control ID</Label>
                <Input
                  id="form-control-id"
                  required
                  value={form.controlId}
                  onChange={(event) => setForm((prev) => ({ ...prev, controlId: event.target.value }))}
                  placeholder="e.g. SOC2-CC6.1"
                  className="bg-black/25"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-control-name">Control name</Label>
                <Input
                  id="form-control-name"
                  required
                  value={form.controlName}
                  onChange={(event) => setForm((prev) => ({ ...prev, controlName: event.target.value }))}
                  placeholder="Control title"
                  className="bg-black/25"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-auditor">Auditor</Label>
                <Input
                  id="form-auditor"
                  required
                  value={form.auditor}
                  onChange={(event) => setForm((prev) => ({ ...prev, auditor: event.target.value }))}
                  placeholder="Auditor name"
                  className="bg-black/25"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-evidence">Evidence URL</Label>
                <Input
                  id="form-evidence"
                  required
                  type="url"
                  value={form.evidence}
                  onChange={(event) => setForm((prev) => ({ ...prev, evidence: event.target.value }))}
                  placeholder="https://..."
                  className="bg-black/25"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-audit-date">Audit date</Label>
                <Input
                  id="form-audit-date"
                  type="date"
                  value={form.auditDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, auditDate: event.target.value }))}
                  className="bg-black/25"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-next-review">Next review date</Label>
                <Input
                  id="form-next-review"
                  type="date"
                  value={form.nextReviewDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, nextReviewDate: event.target.value }))}
                  className="bg-black/25"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="form-notes">Notes</Label>
                <Textarea
                  id="form-notes"
                  required
                  rows={4}
                  value={form.notes}
                  onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Summarize findings, remediation status, and follow-up actions"
                  className="bg-black/25"
                />
              </div>

              <div className="md:col-span-2 flex flex-col gap-2">
                <Button type="submit" disabled={submitting} className="w-fit bg-[#06D6A0] text-[#04140e] hover:bg-[#05c790]">
                  {submitting ? "Submitting..." : "Submit finding"}
                </Button>

                {submitMessage && <p className="text-sm text-emerald-300">{submitMessage}</p>}
                {submitError && <p className="text-sm text-rose-300">{submitError}</p>}
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
