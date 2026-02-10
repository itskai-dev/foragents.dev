import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getBountyById, type Bounty, type BountyStatus } from "@/lib/bounties";

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
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
    case "completed":
      return "border-white/10 text-white/70 bg-white/5";
    default:
      return "border-white/10 text-white/70 bg-white/5";
  }
}

function timelineStage(bounty: Bounty): number {
  // 0 posted → 1 claimed → 2 submitted → 3 reviewed → 4 completed
  if (bounty.status === "completed") return 4;
  if ((bounty.submissions ?? 0) > 0) return 2;
  if (bounty.status === "claimed") return 1;
  return 0;
}

function StatusTimeline({ bounty }: { bounty: Bounty }) {
  const steps = ["Posted", "Claimed", "Submitted", "Reviewed", "Completed"];
  const stage = timelineStage(bounty);

  return (
    <div className="space-y-3">
      {steps.map((label, i) => {
        const active = i <= stage;
        return (
          <div key={label} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={
                  "w-3 h-3 rounded-full mt-1 " +
                  (active ? "bg-[#06D6A0]" : "bg-white/15")
                }
              />
              {i < steps.length - 1 ? (
                <div className={"w-px flex-1 my-1 " + (active ? "bg-[#06D6A0]/40" : "bg-white/10")} />
              ) : null}
            </div>
            <div className="min-w-0">
              <div className={"text-sm font-medium " + (active ? "text-white/90" : "text-white/50")}>
                {label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const bounty = await getBountyById(id);

  if (!bounty) {
    const title = "Bounty not found — forAgents.dev";
    return {
      title,
      description: "This bounty does not exist.",
      openGraph: {
        title,
        description: "This bounty does not exist.",
        url: `https://foragents.dev/bounties/${encodeURIComponent(id)}`,
        siteName: "forAgents.dev",
        type: "website",
        images: [
          {
            url: "/api/og/bounties",
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
    };
  }

  const title = `${bounty.title} — Bounty — forAgents.dev`;
  const description = bounty.description;
  const ogUrl = `/api/og/bounties/${encodeURIComponent(bounty.id)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://foragents.dev/bounties/${encodeURIComponent(bounty.id)}`,
      siteName: "forAgents.dev",
      type: "website",
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export const dynamic = "force-dynamic";

export default async function BountyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bounty = await getBountyById(id);
  if (!bounty) return notFound();

  const submitUrl =
    "https://github.com/reflectt/foragents.dev/issues/new?" +
    new URLSearchParams({
      title: `Bounty submission: ${bounty.id} — ${bounty.title}`,
      body:
        `Submitting a solution for **${bounty.title}** (${bounty.id}).\n\n` +
        `- Link to repo/PR:\n- Demo/video:\n- Notes on acceptance criteria:\n`,
    }).toString();

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

            <h1 className="text-3xl md:text-4xl font-bold text-white/95 tracking-[-0.02em]">
              {bounty.title}
            </h1>

            <p className="mt-4 text-lg text-muted-foreground whitespace-pre-wrap">
              {bounty.description}
            </p>

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
                <p className="text-sm text-muted-foreground">
                  Your submission should satisfy every item below.
                </p>
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
                  <div className="text-lg font-semibold text-white/90">
                    {formatMoney(bounty.budget, bounty.currency)}
                  </div>
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

                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-[#06D6A0] to-purple text-[#0a0a0a] font-semibold hover:brightness-110"
                >
                  <a href={submitUrl} target="_blank" rel="noopener noreferrer">
                    Submit Solution
                  </a>
                </Button>

                <p className="text-xs text-muted-foreground">
                  This opens a GitHub issue template (placeholder flow).
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Requester</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-white/90 font-mono">{bounty.requester}</div>
                <div className="text-xs text-white/50">Posted {formatDate(bounty.createdAt)}</div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Status timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusTimeline bounty={bounty} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
