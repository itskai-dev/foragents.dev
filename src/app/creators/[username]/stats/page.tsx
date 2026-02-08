import { getCreatorByUsername, getCreators, type Skill } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ShareStatsButton } from "@/components/share-stats-button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

type Props = {
  params: Promise<{ username: string }>;
};

// Mock analytics data generator
function generateMockAnalytics(skillCount: number) {
  // Generate realistic install/view counts based on skill count
  const baseInstalls = Math.floor(Math.random() * 50 + 20) * skillCount;
  const baseViews = baseInstalls * (Math.floor(Math.random() * 10) + 15);

  const installs7d = Math.floor(baseInstalls * 0.15);
  const installs30d = Math.floor(baseInstalls * 0.4);

  const views7d = Math.floor(baseViews * 0.15);
  const views30d = Math.floor(baseViews * 0.4);

  // Trend calculations (% change vs previous period)
  const installsTrend7d = Math.floor(Math.random() * 60) - 20; // -20% to +40%
  const installsTrend30d = Math.floor(Math.random() * 80) - 30; // -30% to +50%
  const viewsTrend7d = Math.floor(Math.random() * 70) - 25;
  const viewsTrend30d = Math.floor(Math.random() * 90) - 35;

  return {
    totalInstalls: baseInstalls,
    totalViews: baseViews,
    installs7d,
    installs30d,
    views7d,
    views30d,
    installsTrend7d,
    installsTrend30d,
    viewsTrend7d,
    viewsTrend30d,
  };
}

function generateKitAnalytics(skills: Skill[]) {
  return skills.map((skill) => {
    const installs = Math.floor(Math.random() * 150) + 50;
    const views = installs * (Math.floor(Math.random() * 10) + 15);
    const lastUpdated = new Date(
      Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
    ).toISOString().split('T')[0];

    // Generate sparkline data (last 7 days)
    const sparkline = Array.from({ length: 7 }, () =>
      Math.floor(Math.random() * 30) + 10
    );

    return {
      ...skill,
      installs,
      views,
      lastUpdated,
      sparkline,
    };
  }).sort((a, b) => b.installs - a.installs);
}

function TrendIndicator({ value }: { value: number }) {
  const isPositive = value > 0;
  const color = isPositive ? "text-green" : "text-destructive";
  const Icon = isPositive ? ArrowUpIcon : ArrowDownIcon;

  return (
    <div className={`flex items-center gap-1 text-sm ${color}`}>
      <Icon className="w-4 h-4" />
      <span className="font-semibold">{Math.abs(value)}%</span>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((value, i) => {
        const height = ((value - min) / range) * 100;
        return (
          <div
            key={i}
            className="flex-1 bg-cyan/40 rounded-sm transition-all hover:bg-cyan/60"
            style={{ height: `${Math.max(height, 10)}%` }}
            title={`Day ${i + 1}: ${value}`}
          />
        );
      })}
    </div>
  );
}

export async function generateStaticParams() {
  const creators = getCreators();
  return creators.map((creator) => ({
    username: encodeURIComponent(creator.username),
  }));
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  const creator = getCreatorByUsername(decodeURIComponent(username));

  if (!creator) {
    return {
      title: "Creator Not Found — forAgents.dev",
    };
  }

  return {
    title: `${creator.username} — Analytics Dashboard — forAgents.dev`,
    description: `View detailed analytics for ${creator.username}&apos;s ${creator.skillCount} published skills. Track installs, views, and growth trends.`,
    openGraph: {
      title: `${creator.username} — Analytics Dashboard — forAgents.dev`,
      description: `View detailed analytics for ${creator.username}&apos;s ${creator.skillCount} published skills.`,
      url: `https://foragents.dev/creators/${encodeURIComponent(creator.username)}/stats`,
      siteName: "forAgents.dev",
      type: "website",
    },
  };
}

export default async function CreatorStatsPage({ params }: Props) {
  const { username } = await params;
  const creator = getCreatorByUsername(decodeURIComponent(username));

  if (!creator) {
    notFound();
  }

  const analytics = generateMockAnalytics(creator.skillCount);
  const kitAnalytics = generateKitAnalytics(creator.skills);
  const topKit = kitAnalytics[0];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Breadcrumbs
            items={[
              { label: "⚡ Agent Hub", href: "/" },
              { label: "Creators", href: "/creators" },
              { label: creator.username, href: `/creators/${encodeURIComponent(creator.username)}` },
              { label: "Analytics" },
            ]}
          />
          <nav className="flex items-center gap-4 text-sm">
            <Link href={`/creators/${encodeURIComponent(creator.username)}`} className="text-muted-foreground hover:text-foreground transition-colors">
              Profile
            </Link>
            <Link href="/creators" className="text-muted-foreground hover:text-foreground transition-colors">
              All Creators
            </Link>
          </nav>
        </div>
      </header>

      {/* Page Header */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-cyan/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#F8FAFC] mb-2">
                📊 Analytics Dashboard
              </h1>
              <p className="text-muted-foreground">
                Performance metrics for {creator.username}&apos;s skills
              </p>
            </div>
            <div className="hidden md:block">
              <ShareStatsButton username={creator.username} />
            </div>
          </div>
        </div>
      </section>

      {/* Overview Stats */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-6 text-[#F8FAFC]">📈 Overview</h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Installs */}
          <Card className="bg-card/50 border-cyan/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground font-normal">
                Total Installs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan mb-2">
                {analytics.totalInstalls.toLocaleString()}
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <div className="text-muted-foreground mb-1">7 days</div>
                  <TrendIndicator value={analytics.installsTrend7d} />
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">30 days</div>
                  <TrendIndicator value={analytics.installsTrend30d} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Views */}
          <Card className="bg-card/50 border-cyan/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground font-normal">
                Total Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan mb-2">
                {analytics.totalViews.toLocaleString()}
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <div className="text-muted-foreground mb-1">7 days</div>
                  <TrendIndicator value={analytics.viewsTrend7d} />
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">30 days</div>
                  <TrendIndicator value={analytics.viewsTrend30d} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Installs (7d) */}
          <Card className="bg-card/50 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground font-normal">
                Installs (7d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#F8FAFC] mb-2">
                {analytics.installs7d.toLocaleString()}
              </div>
              <TrendIndicator value={analytics.installsTrend7d} />
            </CardContent>
          </Card>

          {/* Views (7d) */}
          <Card className="bg-card/50 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground font-normal">
                Views (7d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#F8FAFC] mb-2">
                {analytics.views7d.toLocaleString()}
              </div>
              <TrendIndicator value={analytics.viewsTrend7d} />
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Top Kit */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-6 text-[#F8FAFC]">⭐ Top Kit by Installs</h2>

        <Card className="bg-card/50 border-cyan/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg text-cyan mb-1">
                  {topKit.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {topKit.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-cyan">
                  {topKit.installs.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">installs</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <div className="text-xs text-muted-foreground mb-2">Last 7 days activity</div>
              <Sparkline data={topKit.sparkline} />
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Views:</span>{" "}
                <span className="font-semibold text-[#F8FAFC]">{topKit.views.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Updated:</span>{" "}
                <span className="font-semibold text-[#F8FAFC]">{topKit.lastUpdated}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* Kit Breakdown */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-6 text-[#F8FAFC]">📦 Kit-by-Kit Breakdown</h2>

        <div className="bg-card/30 border border-white/5 rounded-lg overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-card/50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Kit Name
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Installs
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Views
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Last Updated
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {kitAnalytics.map((kit) => (
                  <tr
                    key={kit.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <Link
                        href={`/skills/${kit.slug}`}
                        className="text-[#F8FAFC] hover:text-cyan transition-colors font-medium"
                      >
                        {kit.name}
                      </Link>
                    </td>
                    <td className="text-right py-3 px-4 font-semibold text-cyan">
                      {kit.installs.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-[#F8FAFC]">
                      {kit.views.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-muted-foreground text-sm">
                      {kit.lastUpdated}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end">
                        <div className="w-20">
                          <Sparkline data={kit.sparkline} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-white/5">
            {kitAnalytics.map((kit) => (
              <div key={kit.id} className="p-4">
                <Link
                  href={`/skills/${kit.slug}`}
                  className="text-[#F8FAFC] hover:text-cyan transition-colors font-medium mb-2 block"
                >
                  {kit.name}
                </Link>
                <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                  <div>
                    <div className="text-muted-foreground text-xs">Installs</div>
                    <div className="font-semibold text-cyan">{kit.installs.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Views</div>
                    <div className="font-semibold text-[#F8FAFC]">{kit.views.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Updated</div>
                    <div className="text-[#F8FAFC]">{kit.lastUpdated}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">7d Trend</div>
                    <Sparkline data={kit.sparkline} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Share Button */}
      <section className="md:hidden max-w-5xl mx-auto px-4 py-6">
        <ShareStatsButton username={creator.username} />
      </section>

      <Separator className="opacity-10" />

    </div>
  );
}
