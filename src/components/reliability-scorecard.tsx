import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AggregatedScorecard, CanaryScorecardTrend } from "@/lib/server/canaryScorecardStore";

function formatMs(ms: number) {
  if (!Number.isFinite(ms)) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function trendGlyph(trend: CanaryScorecardTrend) {
  if (trend === "improving") return "↑";
  if (trend === "declining") return "↓";
  return "→";
}

function trendLabel(trend: CanaryScorecardTrend) {
  if (trend === "improving") return "Improving";
  if (trend === "declining") return "Declining";
  return "Stable";
}

export function ReliabilityScorecard({
  scorecard,
  skillHref,
}: {
  scorecard: AggregatedScorecard;
  skillHref?: string;
}) {
  const pct = scorecard.passRate * 100;
  const qualifies = scorecard.passRate >= 0.95;

  return (
    <Card className="bg-card/50 border-white/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Reliability</CardTitle>
            <div className="text-xs text-muted-foreground mt-1">
              {scorecard.startDate === scorecard.endDate
                ? scorecard.endDate
                : `${scorecard.startDate} → ${scorecard.endDate}`}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {qualifies ? (
              <Badge className="bg-green-500/10 text-green-400 border border-green-500/20">✅ 95%+</Badge>
            ) : null}
            <Badge
              variant="outline"
              className={
                scorecard.trend === "improving"
                  ? "bg-green-500/10 text-green-400 border-green-500/30"
                  : scorecard.trend === "declining"
                    ? "bg-red-500/10 text-red-400 border-red-500/30"
                    : "bg-white/5 text-white/70 border-white/10"
              }
              title={trendLabel(scorecard.trend)}
            >
              {trendGlyph(scorecard.trend)} {trendLabel(scorecard.trend)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <div className="text-xs text-muted-foreground">Pass rate</div>
            <div className="text-2xl font-bold text-foreground">{pct.toFixed(2)}%</div>
            <div className="text-xs text-muted-foreground">
              {scorecard.testsPassed}/{scorecard.testsRun} passing
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Avg latency</div>
            <div className="text-2xl font-bold text-foreground">{formatMs(scorecard.avgLatencyMs)}</div>
            <div className="text-xs text-muted-foreground">Weighted by test count</div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Regressions</div>
            <div className="text-2xl font-bold text-foreground">{scorecard.regressions.length}</div>
            <div className="text-xs text-muted-foreground">Latest day only</div>
          </div>
        </div>

        {scorecard.regressions.length > 0 ? (
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="text-xs font-semibold text-foreground mb-2">Notes</div>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {scorecard.regressions.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No regressions reported on the latest day.</div>
        )}

        <div className="flex items-center justify-between gap-3">
          <Link href="/leaderboard" className="text-sm text-cyan hover:underline">
            View reliability leaderboard →
          </Link>
          {skillHref ? (
            <Link href={skillHref} className="text-sm text-muted-foreground hover:text-foreground">
              Details →
            </Link>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
