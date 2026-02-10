"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type AcpProtocol = {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  status: "stable" | "beta" | "draft" | "deprecated";
  category: "messaging" | "discovery" | "auth" | "data";
  specUrl: string;
  adoptionCount: number;
  lastUpdated: string;
};

const statusStyles: Record<AcpProtocol["status"], { bg: string; text: string; border: string }> = {
  stable: { bg: "bg-[#06D6A0]/10", text: "text-[#06D6A0]", border: "border-[#06D6A0]/20" },
  beta: { bg: "bg-[#3B82F6]/10", text: "text-[#3B82F6]", border: "border-[#3B82F6]/20" },
  draft: { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]", border: "border-[#F59E0B]/20" },
  deprecated: { bg: "bg-[#EF4444]/10", text: "text-[#EF4444]", border: "border-[#EF4444]/20" },
};

const categoryStyles: Record<AcpProtocol["category"], { bg: string; text: string }> = {
  messaging: { bg: "bg-cyan/10", text: "text-cyan" },
  discovery: { bg: "bg-[#8B5CF6]/10", text: "text-[#8B5CF6]" },
  auth: { bg: "bg-[#EC4899]/10", text: "text-[#EC4899]" },
  data: { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]" },
};

export function AcpDirectoryClient({ initialProtocols }: { initialProtocols: AcpProtocol[] }) {
  const [status, setStatus] = useState<"all" | AcpProtocol["status"]>("all");
  const [category, setCategory] = useState<"all" | AcpProtocol["category"]>("all");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [protocols, setProtocols] = useState<AcpProtocol[]>(initialProtocols);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialProtocols[0]?.slug || null);
  const [detail, setDetail] = useState<AcpProtocol | null>(initialProtocols[0] || null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProtocols() {
      try {
        const params = new URLSearchParams();
        if (status !== "all") params.set("status", status);
        if (category !== "all") params.set("category", category);
        if (debouncedQuery) params.set("search", debouncedQuery);
        params.set("sort", "adoption_desc");

        const response = await fetch(`/api/acp?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) return;

        const payload = (await response.json()) as { protocols?: AcpProtocol[] };
        const next = Array.isArray(payload.protocols) ? payload.protocols : [];
        setProtocols(next);

        if (next.length === 0) {
          setSelectedSlug(null);
          setDetail(null);
          return;
        }

        const stillExists = selectedSlug ? next.some((item) => item.slug === selectedSlug) : false;
        if (!stillExists) {
          setSelectedSlug(next[0].slug);
        }
      } catch {
        // keep existing state
      }
    }

    void loadProtocols();

    return () => controller.abort();
  }, [status, category, debouncedQuery, selectedSlug]);

  useEffect(() => {
    if (!selectedSlug) return;

    const controller = new AbortController();

    async function loadDetail() {
      try {
        const response = await fetch(`/api/acp/${selectedSlug}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) return;

        const payload = (await response.json()) as { protocol?: AcpProtocol };
        if (payload.protocol) {
          setDetail(payload.protocol);
        }
      } catch {
        // keep current detail
      }
    }

    void loadDetail();

    return () => controller.abort();
  }, [selectedSlug]);

  const resultLabel = useMemo(() => {
    const count = protocols.length;
    return `${count} protocol${count === 1 ? "" : "s"}`;
  }, [protocols]);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <label htmlFor="acp-search" className="sr-only">
              Search protocols
            </label>
            <input
              id="acp-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search protocols…"
              className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan/30"
            />
          </div>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as "all" | AcpProtocol["category"])}
            className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan/30"
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            <option value="messaging">Messaging</option>
            <option value="discovery">Discovery</option>
            <option value="auth">Auth</option>
            <option value="data">Data</option>
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as "all" | AcpProtocol["status"])}
            className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan/30"
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="stable">Stable</option>
            <option value="beta">Beta</option>
            <option value="draft">Draft</option>
            <option value="deprecated">Deprecated</option>
          </select>
        </div>

        <div className="text-xs font-mono text-muted-foreground">{resultLabel}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {protocols.map((protocol) => {
          const statusStyle = statusStyles[protocol.status];
          const categoryStyle = categoryStyles[protocol.category];
          const isActive = selectedSlug === protocol.slug;

          return (
            <Card
              key={protocol.id}
              className={
                "bg-card/50 border-white/5 hover:border-cyan/20 transition-all h-full cursor-pointer " +
                (isActive ? "ring-1 ring-cyan/40 border-cyan/30" : "")
              }
              onClick={() => setSelectedSlug(protocol.slug)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedSlug(protocol.slug);
                }
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span
                    className={`inline-block font-mono text-[11px] font-bold uppercase tracking-[0.08em] px-2 py-1 rounded-md border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                  >
                    {protocol.status}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${categoryStyle.bg} ${categoryStyle.text}`}
                  >
                    {protocol.category}
                  </span>
                </div>
                <CardTitle className="text-lg">{protocol.name}</CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {protocol.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground">
                  <Badge variant="outline" className="bg-white/5 border-white/10 text-white/70">
                    v{protocol.version}
                  </Badge>
                  <Badge variant="outline" className="bg-white/5 border-white/10 text-white/70">
                    {protocol.adoptionCount.toLocaleString()} adopters
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {protocols.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">No protocols match your filters.</p>
        </div>
      ) : null}

      {detail ? (
        <section className="rounded-xl border border-white/10 bg-card/40 p-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">{detail.name}</h2>
            <a
              href={detail.specUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-cyan hover:underline"
            >
              View spec ↗
            </a>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{detail.description}</p>

          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <Badge variant="outline" className="bg-white/5 border-white/10 text-white/70">
              Version {detail.version}
            </Badge>
            <Badge variant="outline" className="bg-white/5 border-white/10 text-white/70 uppercase">
              {detail.status}
            </Badge>
            <Badge variant="outline" className="bg-white/5 border-white/10 text-white/70 uppercase">
              {detail.category}
            </Badge>
            <Badge variant="outline" className="bg-white/5 border-white/10 text-white/70">
              {detail.adoptionCount.toLocaleString()} adopters
            </Badge>
            <Badge variant="outline" className="bg-white/5 border-white/10 text-white/70">
              Updated {detail.lastUpdated}
            </Badge>
          </div>
        </section>
      ) : null}
    </div>
  );
}
