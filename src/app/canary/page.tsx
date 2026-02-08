import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { readCanaryResults } from "@/lib/server/canaryStore";

export const dynamic = "force-dynamic";

function formatMs(ms: number) {
  if (!Number.isFinite(ms)) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export default async function CanaryPage() {
  const results = await readCanaryResults();
  const recent = results.slice(0, 100);

  const total = recent.length;
  const passes = recent.filter((r) => r.status === "pass").length;
  const uptimePct = total ? (passes / total) * 100 : 0;
  const avgResponseMs =
    total > 0
      ? recent.reduce((sum, r) => sum + (Number.isFinite(r.responseTimeMs) ? r.responseTimeMs : 0), 0) /
        total
      : 0;

  const lastFailure = recent.find((r) => r.status === "fail");

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Canary Runs</h1>
          <p className="text-muted-foreground mt-2">
            Lightweight regression checks against key endpoints.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card/50 border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Uptime (last 100 checks)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {uptimePct.toFixed(2)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {passes}/{total} passing
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatMs(avgResponseMs)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Across last 100 checks</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Last Failure</CardTitle>
            </CardHeader>
            <CardContent>
              {lastFailure ? (
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-foreground">
                    {lastFailure.endpoint}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(lastFailure.checkedAt).toLocaleString()} · {lastFailure.errorMessage ?? "Failed"}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No failures in last 100 checks.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Recent Results</h2>
            <p className="text-muted-foreground">
              Each row is a single endpoint check.
            </p>
          </div>
          <Link
            href="/api/canary/results"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            View JSON →
          </Link>
        </div>

        <Card className="bg-card/50 border-white/5 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-4 py-3">Timestamp</th>
                    <th className="text-left font-medium px-4 py-3">Endpoint</th>
                    <th className="text-left font-medium px-4 py-3">Status</th>
                    <th className="text-left font-medium px-4 py-3">Response</th>
                    <th className="text-left font-medium px-4 py-3">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-muted-foreground" colSpan={5}>
                        No canary results yet. Run POST /api/canary/run to generate results.
                      </td>
                    </tr>
                  ) : (
                    recent.map((r) => (
                      <tr key={r.id} className="border-t border-white/5">
                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                          {new Date(r.checkedAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-mono text-foreground">
                          {r.endpoint}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                r.status === "pass"
                                  ? "bg-green-500/10 text-green-500 border-green-500/30"
                                  : "bg-red-500/10 text-red-500 border-red-500/30"
                              }
                            >
                              {r.status === "pass" ? "PASS" : "FAIL"}
                            </Badge>
                            {r.regression ? (
                              <Badge
                                variant="outline"
                                className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                              >
                                REGRESSION
                              </Badge>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatMs(r.responseTimeMs)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[36rem]">
                          {r.errorMessage ?? "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
