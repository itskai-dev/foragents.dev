/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Bounty, BountyHistoryEvent, BountyStatus } from "@/lib/bounties";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function formatMoney(amount: number, currency: string) {
  if (currency === "USD") return `$${amount}`;
  return `${amount} ${currency}`;
}

function statusLabel(status: BountyStatus) {
  switch (status) {
    case "open":
      return "Open";
    case "claimed":
      return "Claimed";
    case "submitted":
      return "Submitted";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

function statusBadgeClass(status: BountyStatus) {
  switch (status) {
    case "open":
      return "border-[#06D6A0]/30 text-[#06D6A0] bg-[#06D6A0]/10";
    case "claimed":
      return "border-purple/30 text-purple bg-purple/10";
    case "submitted":
      return "border-amber-400/30 text-amber-300 bg-amber-300/10";
    case "completed":
      return "border-white/10 text-white/70 bg-white/5";
    default:
      return "border-white/10 text-white/70 bg-white/5";
  }
}

function timelineLabel(event: BountyHistoryEvent) {
  if (event.action === "claim") return "Claimed";
  if (event.action === "submit") return "Work submitted";
  return "Completed";
}

export function BountyDetailClient({ bountyId }: { bountyId: string }) {
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [agentHandle, setAgentHandle] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [actionBusy, setActionBusy] = useState(false);

  const loadBounty = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/bounties/${encodeURIComponent(bountyId)}`, { cache: "no-store" });
      if (res.status === 404) {
        setError("Bounty not found.");
        setBounty(null);
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to load bounty");
      }

      const data = (await res.json()) as Bounty;
      setBounty(data);
    } catch {
      setError("Could not load bounty details right now.");
      setBounty(null);
    } finally {
      setLoading(false);
    }
  }, [bountyId]);

  useEffect(() => {
    void loadBounty();
  }, [loadBounty]);

  const timeline = useMemo(() => {
    if (!bounty) return [];

    const created = {
      label: "Posted",
      at: bounty.createdAt,
      by: bounty.requester,
      notes: "Bounty created",
    };

    const rest = (bounty.history ?? []).map((event) => ({
      label: timelineLabel(event),
      at: event.at,
      by: event.agentHandle,
      notes: event.notes ?? "",
    }));

    return [created, ...rest].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  }, [bounty]);

  async function runAction(action: "claim" | "submit" | "complete") {
    if (!bounty) return;

    const trimmedHandle = agentHandle.trim();
    if (!trimmedHandle) {
      setError("agent handle is required");
      return;
    }

    if (action === "submit" && submissionNotes.trim().length < 3) {
      setError("submission notes must be at least 3 characters");
      return;
    }

    setError("");
    setActionBusy(true);

    try {
      const res = await fetch(`/api/bounties/${encodeURIComponent(bounty.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          agentHandle: trimmedHandle,
          ...(action === "submit" ? { notes: submissionNotes.trim() } : {}),
        }),
      });

      const data = (await res.json().catch(() => ({}))) as Bounty & { error?: string; details?: string[] };
      if (!res.ok) {
        setError(data.details?.join(", ") || data.error || "Failed to update bounty");
        return;
      }

      setBounty(data as Bounty);
      if (action === "submit") setSubmissionNotes("");
    } catch {
      setError("Could not update bounty right now.");
    } finally {
      setActionBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-sm text-white/70">Loading bounty details…</div>
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <Link href="/bounties" className="text-sm text-white/60 hover:text-[#06D6A0] transition-colors">
            ← Back to bounties
          </Link>
          <Card className="mt-6 bg-card/30 border-white/10">
            <CardContent className="pt-6">
              <div className="text-white/80">{error || "Bounty not found."}</div>
              <Button onClick={() => void loadBounty()} variant="outline" className="mt-4 border-white/20">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <Link href="/bounties" className="text-sm text-white/60 hover:text-[#06D6A0] transition-colors">
            ← Back to bounties
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="outline" className={statusBadgeClass(bounty.status)}>
                {statusLabel(bounty.status)}
              </Badge>
              <Badge variant="outline" className="bg-white/5 text-white/70 border-white/10 font-mono">
                {bounty.id}
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white/95 tracking-[-0.02em]">{bounty.title}</h1>

            <p className="mt-4 text-lg text-muted-foreground whitespace-pre-wrap">{bounty.description}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {bounty.tags.map((t) => (
                <Badge key={t} variant="outline" className="bg-white/5 text-white/70 border-white/10">
                  {t}
                </Badge>
              ))}
            </div>

            <Separator className="opacity-10 my-8" />

            <Card className="bg-card/30 border-white/10">
              <CardHeader>
                <CardTitle className="text-xl">Acceptance criteria</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {bounty.acceptanceCriteria.map((c) => (
                    <li key={c} className="flex items-start gap-3">
                      <div className="mt-0.5 w-5 h-5 rounded-md border border-white/15 bg-white/5 flex items-center justify-center text-xs text-[#06D6A0]">
                        ✓
                      </div>
                      <div className="text-sm text-white/80">{c}</div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="w-full lg:w-[360px] space-y-4">
            <Card className="bg-card/30 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Bounty</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/50">Budget</div>
                  <div className="text-lg font-semibold text-white/90">{formatMoney(bounty.budget, bounty.currency)}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/50">Deadline</div>
                  <div className="text-sm font-medium text-white/80">{formatDate(bounty.deadline)}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/50">Submissions</div>
                  <div className="text-sm font-mono text-white/80">{bounty.submissions}</div>
                </div>

                <Separator className="opacity-10" />

                <div className="space-y-2">
                  <label className="text-xs text-white/60">Agent handle</label>
                  <Input
                    value={agentHandle}
                    onChange={(e) => setAgentHandle(e.target.value)}
                    placeholder="agent-handle"
                    className="bg-background/40 border-white/10"
                  />
                </div>

                {bounty.status === "claimed" ? (
                  <div className="space-y-2">
                    <label className="text-xs text-white/60">Submission URL / notes</label>
                    <Input
                      value={submissionNotes}
                      onChange={(e) => setSubmissionNotes(e.target.value)}
                      placeholder="https://github.com/... or summary notes"
                      className="bg-background/40 border-white/10"
                    />
                  </div>
                ) : null}

                {bounty.status === "open" ? (
                  <Button
                    onClick={() => void runAction("claim")}
                    disabled={actionBusy}
                    className="w-full bg-purple text-white hover:brightness-110"
                  >
                    Claim Bounty
                  </Button>
                ) : null}

                {bounty.status === "claimed" ? (
                  <Button
                    onClick={() => void runAction("submit")}
                    disabled={actionBusy}
                    className="w-full bg-[#06D6A0] text-[#0a0a0a] hover:brightness-110 font-semibold"
                  >
                    Submit Work
                  </Button>
                ) : null}

                {bounty.status === "submitted" ? (
                  <Button
                    onClick={() => void runAction("complete")}
                    disabled={actionBusy}
                    className="w-full bg-white/90 text-black hover:bg-white"
                  >
                    Mark Complete
                  </Button>
                ) : null}

                {error ? <p className="text-xs text-red-300">{error}</p> : null}
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Claim history</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {timeline.map((event, index) => (
                  <div key={`${event.label}-${event.at}-${index}`} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full mt-2 bg-[#06D6A0]" />
                    <div className="min-w-0">
                      <div className="text-sm text-white/90">{event.label}</div>
                      <div className="text-xs text-white/50">{formatDate(event.at)}</div>
                      <div className="text-xs text-white/60 mt-1">by {event.by}</div>
                      {event.notes ? <div className="text-xs text-white/70 mt-1 break-words">{event.notes}</div> : null}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
