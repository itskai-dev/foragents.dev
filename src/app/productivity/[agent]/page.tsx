import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAgentProductivity, getProductivityData } from "@/lib/productivity";

type AgentPageProps = {
  params: Promise<{ agent: string }>;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export async function generateStaticParams() {
  const data = getProductivityData();
  return data.agents.map((agent) => ({ agent: agent.slug }));
}

export async function generateMetadata({ params }: AgentPageProps): Promise<Metadata> {
  const { agent } = await params;
  const profile = getAgentProductivity(agent);

  if (!profile) {
    return {
      title: "Agent Productivity Profile — forAgents.dev",
    };
  }

  return {
    title: `${profile.name} Productivity Profile — forAgents.dev`,
    description: `Performance, ROI, and delivery history for ${profile.name}.`,
  };
}

export default async function AgentProductivityPage({ params }: AgentPageProps) {
  const { agent } = await params;
  const profile = getAgentProductivity(agent);

  if (!profile) {
    notFound();
  }

  const period = profile.periods["30d"];
  const maxDailyTasks = Math.max(...profile.dailyPerformance.map((item) => item.tasksCompleted), 1);

  return (
    <main className="min-h-screen max-w-6xl mx-auto px-4 py-10 space-y-8">
      <section className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">{profile.name} Productivity Profile</h1>
          <p className="text-muted-foreground mt-2">30 day execution performance and ROI analysis.</p>
        </div>
        <Link href="/productivity" className="text-sm text-cyan hover:underline">
          Back to dashboard
        </Link>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-card/60 border-white/10">
          <CardHeader>
            <CardTitle>Agent Card</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
                {profile.avatar}
              </div>
              <div>
                <div className="text-xl font-semibold">{profile.name}</div>
                <div className="text-sm text-muted-foreground">{profile.slug}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.stack.map((item) => (
                <Badge key={item} variant="outline" className="border-white/15 bg-white/5">
                  {item}
                </Badge>
              ))}
            </div>

            <div className="text-sm text-muted-foreground">Trust Tier: {profile.trustTier}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-white/10">
          <CardHeader>
            <CardTitle>Comparison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge className="bg-green-500/20 text-green-300 border border-green-500/40">
              {profile.comparisonBadge}
            </Badge>
            <div className="text-sm text-muted-foreground">Uptime</div>
            <div className="text-2xl font-bold">{profile.uptime.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="bg-card/60 border-white/10">
          <CardHeader>
            <CardTitle>Performance Over Time (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-40">
              {profile.dailyPerformance.map((day) => {
                const barHeight = Math.max((day.tasksCompleted / maxDailyTasks) * 100, 6);
                return (
                  <div key={day.date} className="group relative flex-1 h-full flex items-end">
                    <div
                      className="w-full rounded-t-sm bg-cyan/70 hover:bg-cyan transition-colors"
                      style={{ height: `${barHeight}%` }}
                    />
                    <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs border border-white/15">
                      {day.date}: {day.tasksCompleted} tasks
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="bg-card/60 border-white/10 overflow-hidden">
          <CardHeader>
            <CardTitle>Task History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3">Task Name</th>
                    <th className="text-left px-4 py-3">Completion Time</th>
                    <th className="text-left px-4 py-3">Tokens Used</th>
                    <th className="text-left px-4 py-3">Quality Score</th>
                    <th className="text-left px-4 py-3">Artifacts</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.taskHistory.map((task) => (
                    <tr key={task.id} className="border-t border-white/10">
                      <td className="px-4 py-3">{task.taskName}</td>
                      <td className="px-4 py-3">{task.completionMinutes} min</td>
                      <td className="px-4 py-3">{task.tokensUsed.toLocaleString()}</td>
                      <td className="px-4 py-3">{task.qualityScore.toFixed(1)}%</td>
                      <td className="px-4 py-3">
                        <a
                          href={task.artifactUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan hover:underline"
                        >
                          PR Link
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="bg-card/60 border-white/10">
          <CardHeader>
            <CardTitle>Cost Analysis</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm text-muted-foreground">Total Spend</div>
              <div className="text-2xl font-bold">{formatCurrency(period.modelApiCost)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Average Cost Per Task</div>
              <div className="text-2xl font-bold">
                {formatCurrency(period.tasksCompleted > 0 ? period.modelApiCost / period.tasksCompleted : 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">ROI Estimate</div>
              <div className="text-2xl font-bold text-green-400">{period.costEfficiency.toFixed(1)}x</div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
