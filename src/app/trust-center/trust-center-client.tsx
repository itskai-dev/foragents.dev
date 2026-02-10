"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { TrustCenterCategory, TrustCenterEntry } from "@/lib/trustCenterStore";

type TrustCenterResponse = {
  entries: TrustCenterEntry[];
  total: number;
  availableCategories: TrustCenterCategory[];
};

const CATEGORY_OPTIONS: Array<TrustCenterCategory | "all"> = [
  "all",
  "security",
  "privacy",
  "compliance",
  "transparency",
];

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusClass(status: TrustCenterEntry["status"]) {
  if (status === "active") {
    return "bg-emerald-500/15 border-emerald-400/30 text-emerald-300";
  }

  if (status === "monitoring") {
    return "bg-amber-500/15 border-amber-400/30 text-amber-300";
  }

  return "bg-slate-500/15 border-slate-400/30 text-slate-300";
}

export default function TrustCenterClient() {
  const [entries, setEntries] = useState<TrustCenterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<TrustCenterCategory | "all">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadEntries() {
      setLoading(true);
      setError(null);

      try {
        const query = new URLSearchParams();

        if (category !== "all") {
          query.set("category", category);
        }

        if (search.trim()) {
          query.set("search", search.trim());
        }

        const response = await fetch(`/api/trust-center?${query.toString()}`, {
          cache: "no-store",
        });

        const payload = (await response.json()) as TrustCenterResponse & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load trust center records");
        }

        if (!isCancelled) {
          setEntries(payload.entries);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unexpected error");
          setEntries([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadEntries();

    return () => {
      isCancelled = true;
    };
  }, [category, search]);

  const totalByCategory = useMemo(() => {
    return entries.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.category] = (acc[entry.category] ?? 0) + 1;
      return acc;
    }, {});
  }, [entries]);

  return (
    <div className="space-y-8">
      <Card className="bg-[#0f0f0f] border-white/10 p-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-[#06D6A0]">Trust Records</h2>
            <p className="text-gray-400 text-sm">Live records loaded from persistent JSON through /api/trust-center.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search trust records"
              className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-gray-500"
            />

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as TrustCenterCategory | "all")}
              className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-[#0f0f0f]">
                  {option === "all" ? "All categories" : option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="bg-[#0f0f0f] border-white/10 p-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-[#06D6A0]" />
          <p className="text-gray-300 text-sm">Loading trust records...</p>
        </Card>
      ) : null}

      {error ? (
        <Card className="bg-red-500/10 border-red-400/30 p-8 text-center">
          <AlertTriangle className="w-6 h-6 mx-auto mb-3 text-red-300" />
          <p className="text-red-200 text-sm">{error}</p>
        </Card>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(["security", "privacy", "compliance", "transparency"] as TrustCenterCategory[]).map((label) => (
              <Card key={label} className="bg-[#0f0f0f] border-white/10 p-4">
                <p className="text-xs uppercase text-gray-500">{label}</p>
                <p className="mt-1 text-xl font-semibold">{totalByCategory[label] ?? 0}</p>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="bg-[#0f0f0f] border-white/10 p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-lg font-medium">{entry.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">Updated {formatDate(entry.updatedAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="capitalize border bg-[#06D6A0]/15 border-[#06D6A0]/30 text-[#9CF6DA]">{entry.category}</Badge>
                    <Badge className={`capitalize border ${statusClass(entry.status)}`}>{entry.status}</Badge>
                  </div>
                </div>

                <p className="text-sm text-gray-300 mb-3">{entry.description}</p>
                <div className="rounded-md border border-white/10 bg-black/30 p-3">
                  <p className="text-xs text-gray-500 mb-1">Evidence</p>
                  <p className="text-sm text-gray-300">{entry.evidence}</p>
                </div>
              </Card>
            ))}

            {entries.length === 0 ? (
              <Card className="bg-[#0f0f0f] border-white/10 p-8 text-center">
                <p className="text-gray-400">No trust records match your current filters.</p>
              </Card>
            ) : null}
          </div>
        </>
      ) : null}

      <div className="text-center text-sm text-gray-500">
        <div className="inline-flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#06D6A0]" />
          <span>Persistent trust records API is active for /trust-center.</span>
        </div>
      </div>
    </div>
  );
}
