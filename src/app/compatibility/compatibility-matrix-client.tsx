"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CompatibilityStatus = "works" | "partial" | "broken" | "untested";

type CompatibilityClient = {
  id: string;
  name: string;
  versionRange: string;
};

type CompatibilityRow = {
  slug: string;
  name: string;
  category: string;
  repoUrl: string | null;
  notes: string | null;
  statuses: Record<string, CompatibilityStatus>;
};

type CompatibilityKnownIssue = {
  id: string;
  title: string;
  severity: "low" | "medium" | "high";
  details: string;
  affected: string[];
};

type CompatibilityResponse = {
  updatedAt: string;
  clients: CompatibilityClient[];
  rows: CompatibilityRow[];
  knownIssues: CompatibilityKnownIssue[];
};

const STATUS_LABELS: Record<CompatibilityStatus, string> = {
  works: "✅ Works",
  partial: "⚠️ Partial",
  broken: "❌ Broken",
  untested: "❓ Untested",
};

const STATUS_BADGE_STYLES: Record<CompatibilityStatus, string> = {
  works: "border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
  partial: "border-amber-400/30 bg-amber-500/15 text-amber-200",
  broken: "border-rose-400/30 bg-rose-500/15 text-rose-200",
  untested: "border-slate-500/40 bg-slate-500/10 text-slate-300",
};

const ISSUE_SEVERITY_STYLES: Record<CompatibilityKnownIssue["severity"], string> = {
  low: "border-sky-400/30 bg-sky-500/10 text-sky-200",
  medium: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  high: "border-rose-400/30 bg-rose-500/10 text-rose-200",
};

export function CompatibilityMatrixClient() {
  const [data, setData] = useState<CompatibilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | CompatibilityStatus>("all");

  useEffect(() => {
    const abort = new AbortController();

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/compatibility", {
          method: "GET",
          signal: abort.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load compatibility data");
        }

        const payload = (await response.json()) as CompatibilityResponse;
        setData(payload);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError("Could not load compatibility data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadData();

    return () => {
      abort.abort();
    };
  }, []);

  const visibleClients = useMemo(() => {
    if (!data) return [];
    if (clientFilter === "all") return data.clients;
    return data.clients.filter((client) => client.id === clientFilter);
  }, [clientFilter, data]);

  const filteredRows = useMemo(() => {
    if (!data) return [];

    return data.rows.filter((row) => {
      if (statusFilter === "all") return true;

      if (clientFilter === "all") {
        return Object.values(row.statuses).some((status) => status === statusFilter);
      }

      return row.statuses[clientFilter] === statusFilter;
    });
  }, [clientFilter, data, statusFilter]);

  if (loading) {
    return <p className="text-sm text-slate-400">Loading compatibility matrix...</p>;
  }

  if (error || !data) {
    return <p className="text-sm text-rose-300">{error ?? "Compatibility data unavailable."}</p>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-[#0D1322]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-100">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-slate-400">Client</p>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-full border-white/10 bg-[#0A0E17] text-slate-100">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All clients</SelectItem>
                  {data.clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.versionRange})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as "all" | CompatibilityStatus)}
              >
                <SelectTrigger className="w-full border-white/10 bg-[#0A0E17] text-slate-100">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="works">✅ Works</SelectItem>
                  <SelectItem value="partial">⚠️ Partial</SelectItem>
                  <SelectItem value="broken">❌ Broken</SelectItem>
                  <SelectItem value="untested">❓ Untested</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-xs text-slate-400">
              Showing {filteredRows.length} of {data.rows.length} servers
            </p>
            <Button asChild size="sm" className="bg-cyan-500 text-[#071019] hover:bg-cyan-400">
              <Link
                href="https://github.com/reflectt/foragents.dev/issues/new?template=blank.yml&title=%5BCompatibility%5D%20Client%20x%20Server%20report"
                target="_blank"
                rel="noreferrer"
              >
                Report compatibility
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0D1322]">
        <table className="min-w-[900px] w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="sticky left-0 z-10 bg-[#0F1526] px-4 py-3 text-left font-semibold text-slate-200">Server</th>
              {visibleClients.map((client) => (
                <th key={client.id} className="px-4 py-3 text-left font-semibold text-slate-200">
                  <div>{client.name}</div>
                  <div className="text-xs font-normal text-slate-400">{client.versionRange}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.slug} className="border-b border-white/5 align-top">
                <td className="sticky left-0 bg-[#0D1322] px-4 py-3">
                  <div className="font-medium text-slate-100">{row.name}</div>
                  <div className="mt-1 text-xs capitalize text-slate-400">{row.category}</div>
                  {row.notes ? <div className="mt-2 text-xs text-slate-500">{row.notes}</div> : null}
                </td>
                {visibleClients.map((client) => {
                  const status = row.statuses[client.id] ?? "untested";
                  return (
                    <td key={`${row.slug}-${client.id}`} className="px-4 py-3">
                      <Badge variant="outline" className={STATUS_BADGE_STYLES[status]}>
                        {STATUS_LABELS[status]}
                      </Badge>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card className="border-white/10 bg-[#0D1322]">
        <CardHeader>
          <CardTitle className="text-lg text-slate-100">Known issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.knownIssues.map((issue) => (
            <div key={issue.id} className="rounded-lg border border-white/10 bg-[#0A0E17] p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={ISSUE_SEVERITY_STYLES[issue.severity]}>
                  {issue.severity}
                </Badge>
                <p className="font-medium text-slate-100">{issue.title}</p>
              </div>
              <p className="mt-2 text-sm text-slate-300">{issue.details}</p>
              <p className="mt-2 text-xs text-slate-400">Affected: {issue.affected.join(", ")}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
