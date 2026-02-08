"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/code-block";
import type { TraceRun, TraceStep } from "@/lib/trace";
import { formatDuration, getStepIcon } from "@/lib/trace";

function safeStringify(value: unknown): string {
  if (value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function StatusPill({ status }: { status: TraceRun["status"] }) {
  const { label, className } =
    status === "success"
      ? { label: "Success", className: "bg-green/15 text-green border-green/30" }
      : status === "error"
        ? { label: "Error", className: "bg-aurora-pink/15 text-aurora-pink border-aurora-pink/30" }
        : { label: "Running", className: "bg-electric-blue/15 text-electric-blue border-electric-blue/30" };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function DurationPill({ ms }: { ms: number }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[11px] text-muted-foreground">
      {formatDuration(ms)}
    </span>
  );
}

function StepDetails({ step }: { step: TraceStep }) {
  const input = safeStringify(step.details?.input);
  const output = safeStringify(step.details?.output);
  const error = safeStringify(step.details?.error);

  const hasAnything = Boolean(input || output || error);
  if (!hasAnything) return null;

  return (
    <details className="mt-3">
      <summary className="cursor-pointer select-none text-sm text-cyan hover:text-cyan/90">
        Details
      </summary>
      <div className="mt-3 grid gap-4">
        {input ? (
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Input
            </div>
            <CodeBlock code={input} language="json" />
          </div>
        ) : null}

        {output ? (
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Output
            </div>
            <CodeBlock code={output} language={typeof step.details?.output === "string" ? undefined : "json"} />
          </div>
        ) : null}

        {error ? (
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Error
            </div>
            <CodeBlock code={error} language="json" className="[&_div]:border [&_div]:border-aurora-pink/20" />
          </div>
        ) : null}
      </div>
    </details>
  );
}

function StepCard({ step }: { step: TraceStep }) {
  const icon = getStepIcon(step.type);

  return (
    <div className="relative pl-10">
      {/* timeline line */}
      <div className="absolute left-[18px] top-0 h-full w-px bg-white/10" />

      {/* icon */}
      <div className="absolute left-2 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-card shadow-sm">
        <span className="text-sm">{icon}</span>
      </div>

      <Card className="bg-card/40 border-white/10">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base md:text-lg">
                {step.name}
                <span className="ml-2 text-xs font-mono text-muted-foreground">
                  {step.type}
                </span>
              </CardTitle>
              {step.description ? (
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              ) : null}
            </div>
            <DurationPill ms={step.durationMs} />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <StepDetails step={step} />
        </CardContent>
      </Card>
    </div>
  );
}

export function TraceClient({ initialId }: { initialId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlId = searchParams.get("id")?.trim();
  const activeId = urlId || initialId;

  const [inputId, setInputId] = useState(activeId);
  const [trace, setTrace] = useState<TraceRun | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setTrace(null);

      try {
        const res = await fetch(`/api/trace/${encodeURIComponent(activeId)}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as any;
          const msg = typeof body?.error === "string" ? body.error : `Request failed (${res.status})`;
          throw new Error(msg);
        }

        const json = (await res.json()) as { trace: TraceRun };
        if (!json?.trace) throw new Error("Malformed response");

        if (!cancelled) setTrace(json.trace);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load trace");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  useEffect(() => {
    setInputId(activeId);
  }, [activeId]);

  const summary = useMemo(() => {
    if (!trace) return null;
    return {
      stepCount: trace.steps.length,
      totalDurationMs: trace.durationMs,
      startedAt: new Date(trace.startedAt),
      endedAt: new Date(trace.endedAt),
    };
  }, [trace]);

  return (
    <div className="grid gap-6">
      <Card className="bg-card/30 border-white/10">
        <CardContent className="pt-6">
          <form
            className="flex flex-col gap-3 md:flex-row md:items-center"
            onSubmit={(e) => {
              e.preventDefault();
              const next = inputId.trim() || "demo";
              router.push(`/trace?id=${encodeURIComponent(next)}`);
            }}
          >
            <div className="flex-1">
              <label className="text-sm text-muted-foreground">Trace ID</label>
              <input
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                placeholder="demo"
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-cyan/40"
              />
              <div className="mt-1 text-xs text-muted-foreground">
                Try <button type="button" className="text-cyan hover:underline" onClick={() => router.push("/trace?id=demo")}>demo</button> or{" "}
                <button type="button" className="text-cyan hover:underline" onClick={() => router.push("/trace?id=error-demo")}>error-demo</button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-[#0A0E17] hover:bg-cyan/90"
              >
                Load
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading trace…</div>
      ) : null}

      {error ? (
        <Card className="bg-card/30 border-aurora-pink/25">
          <CardContent className="pt-6">
            <div className="text-sm">
              <div className="font-semibold text-aurora-pink">Failed to load trace</div>
              <div className="mt-1 text-muted-foreground">{error}</div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {trace && summary ? (
        <>
          <Card className="bg-card/40 border-white/10">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg md:text-xl">
                    {trace.title || `Trace ${trace.id}`}
                  </CardTitle>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <StatusPill status={trace.status} />
                    <span className="text-muted-foreground">•</span>
                    <span>{summary.stepCount} steps</span>
                    <span className="text-muted-foreground">•</span>
                    <span>Total {formatDuration(summary.totalDurationMs)}</span>
                  </div>
                </div>

                <div className="text-xs font-mono text-muted-foreground">
                  <div>Start: {isFinite(summary.startedAt.getTime()) ? summary.startedAt.toISOString() : "—"}</div>
                  <div>End: {isFinite(summary.endedAt.getTime()) ? summary.endedAt.toISOString() : "—"}</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-4">
            {trace.steps.map((step) => (
              <StepCard key={step.id} step={step} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
