import { getCreatorByUsername, getCreators, type Skill } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ShareStatsButton } from "@/components/share-stats-button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";

type Props = {
  params: Promise<{ username: string }>;
};

type KitAnalytics = Skill & {
  installs: number;
  views: number;
  installs7d: number;
  installs30d: number;
  views7d: number;
  views30d: number;
  installsTrend7d: number;
  installsTrend30d: number;
  viewsTrend7d: number;
  viewsTrend30d: number;
  lastUpdated: string;
  sparkline: number[];
};

type CreatorAnalytics = {
  totalInstalls: number;
  totalViews: number;
  installs7d: number;
  installs30d: number;
  views7d: number;
  views30d: number;
  installsTrend7d: number;
  installsTrend30d: number;
  viewsTrend7d: number;
  viewsTrend30d: number;
};

function hashStringToUint32(input: string) {
  // Simple deterministic hash (djb2-ish).
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  // Deterministic PRNG (fast, decent distribution for mock data).
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randFloat(rng: () => number, min: number, max: number) {
  return rng() * (max - min) + min;
}

function toISODate(d: Date) {
  return d.toISOString().split("T")[0];
}

function weightedAverage(
  kits: KitAnalytics[],
  weight: (k: KitAnalytics) => number,
  value: (k: KitAnalytics) => number
) {
  const totalWeight = kits.reduce((sum, k) => sum + weight(k), 0);
  if (totalWeight <= 0) return 0;
  const weighted = kits.reduce((sum, k) => sum + weight(k) * value(k), 0);
  return weighted / totalWeight;
}

function generateMockCreatorAnalytics(username: string, skills: Skill[]) {
  const seed = hashStringToUint32(username);
  const rng = mulberry32(seed);
  const referenceNow = new Date("2026-02-01T00:00:00.000Z").getTime();

  const kitAnalytics: KitAnalytics[] = skills
    .map((skill) => {
      const installs = randInt(rng, 60, 420);
      const views = installs * randInt(rng, 10, 22);

      const installs7d = Math.max(1, Math.floor(installs * randFloat(rng, 0.06, 0.22)));
      const installs30d = Math.max(installs7d, Math.floor(installs * randFloat(rng, 0.18, 0.55)));

      const views7d = Math.max(1, Math.floor(views * randFloat(rng, 0.06, 0.22)));
      const views30d = Math.max(views7d, Math.floor(views * randFloat(rng, 0.18, 0.55)));

      const installsTrend7d = randInt(rng, -20, 45);
      const installsTrend30d = randInt(rng, -30, 55);
      const viewsTrend7d = randInt(rng, -25, 55);
      const viewsTrend30d = randInt(rng, -35, 65);

      const daysAgo = randInt(rng, 1, 90);
      const lastUpdated = toISODate(
        new Date(referenceNow - daysAgo * 24 * 60 * 60 * 1000)
      );

      // "Last 7 days" activity bars.
      const sparkline = Array.from({ length: 7 }, () => randInt(rng, 8, 38));

      return {
        ...skill,
        installs,
        views,
        installs7d,
        installs30d,
        views7d,
        views30d,
        installsTrend7d,
        installsTrend30d,
        viewsTrend7d,
        viewsTrend30d,
        lastUpdated,
        sparkline,
      };
    })
    .sort((a, b) => b.installs - a.installs);

  const totalInstalls = kitAnalytics.reduce((sum, k) => sum + k.installs, 0);
  const totalViews = kitAnalytics.reduce((sum, k) => sum + k.views, 0);
  const installs7d = kitAnalytics.reduce((sum, k) => sum + k.installs7d, 0);
  const installs30d = kitAnalytics.reduce((sum, k) => sum + k.installs30d, 0);
  const views7d = kitAnalytics.reduce((sum, k) => sum + k.views7d, 0);
  const views30d = kitAnalytics.reduce((sum, k) => sum + k.views30d, 0);

  // Overall trends (weighted by recent activity so it's more believable).
  const installsTrend7d = Math.round(
    weightedAverage(kitAnalytics, (k) => k.installs7d, (k) => k.installsTrend7d)
  );
  const installsTrend30d = Math.round(
    weightedAverage(kitAnalytics, (k) => k.installs30d, (k) => k.installsTrend30d)
  );
  const viewsTrend7d = Math.round(
    weightedAverage(kitAnalytics, (k) => k.views7d, (k) => k.viewsTrend7d)
  );
  const viewsTrend30d = Math.round(
    weightedAverage(kitAnalytics, (k) => k.views30d, (k) => k.viewsTrend30d)
  );

  const analytics: CreatorAnalytics = {
    totalInstalls,
    totalViews,
    installs7d,
    installs30d,
    views7d,
    views30d,
    installsTrend7d,
    installsTrend30d,
    viewsTrend7d,
    viewsTrend30d,
  };

  return {
    analytics,
    kitAnalytics,
    topKit: kitAnalytics[0],
  };
}

function TrendIndicator({ value }: { value: number }) {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  const color = isNeutral
    ? "text-muted-foreground"
    : isPositive
      ? "text-green"
      : "text-destructive";
  const Icon = isNeutral ? MinusIcon : isPositive ? ArrowUpIcon : ArrowDownIcon;

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
    <div className="flex items-end gap-0.5 h-8" aria-label="7 day activity">
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

function BarRow({
  label,
  value,
  max,
  href,
  accent = "bg-cyan/60",
}: {
  label: string;
  value: number;
  max: number;
  href?: string;
  accent?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  const Label = href ? (
    <Link
      href={href}
      className="text-sm text-[#F8FAFC] hover:text-cyan transition-colors font-medium truncate"
      title={label}
    >
      {label}
    </Link>
  ) : (
    <div className="text-sm text-[#F8FAFC] font-medium truncate" title={label}>
      {label}
    </div>
  );

  return (
    <div className="grid grid-cols-[1fr,80px] gap-3 items-center">
      <div>
        <div className="flex items-center justify-between gap-3 mb-1">
          {Label}
          <div className="text-xs text-muted-foreground tabular-nums shrink-0">{pct}%</div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full ${accent}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="text-right text-sm font-semibold tabular-nums text-[#F8FAFC]">
        {value.toLocaleString()}
      </div>
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

  const { analytics, kitAnalytics, topKit } = generateMockCreatorAnalytics(
    creator.username,
    creator.skills
  );

  const maxKitInstalls = Math.max(1, ...kitAnalytics.map((k) => k.installs));
  const maxKitViews = Math.max(1, ...kitAnalytics.map((k) => k.views));

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

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
              <p className="text-xs text-muted-foreground mt-2">
                Mock data (for now) · {creator.skillCount} kit{creator.skillCount !== 1 ? "s" : ""}
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
              <div className="flex items-center gap-5 text-xs">
                <div>
                  <div className="text-muted-foreground mb-1">7 days</div>
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-[#F8FAFC] tabular-nums">
                      {analytics.installs7d.toLocaleString()}
                    </div>
                    <TrendIndicator value={analytics.installsTrend7d} />
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">30 days</div>
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-[#F8FAFC] tabular-nums">
                      {analytics.installs30d.toLocaleString()}
                    </div>
                    <TrendIndicator value={analytics.installsTrend30d} />
                  </div>
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
              <div className="flex items-center gap-5 text-xs">
                <div>
                  <div className="text-muted-foreground mb-1">7 days</div>
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-[#F8FAFC] tabular-nums">
                      {analytics.views7d.toLocaleString()}
                    </div>
                    <TrendIndicator value={analytics.viewsTrend7d} />
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">30 days</div>
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-[#F8FAFC] tabular-nums">
                      {analytics.views30d.toLocaleString()}
                    </div>
                    <TrendIndicator value={analytics.viewsTrend30d} />
                  </div>
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
        <h2 className="text-xl font-bold mb-6 text-[#F8FAFC]">
          ⭐ Top Kit by Installs
        </h2>

        <Card className="bg-card/50 border-cyan/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <CardTitle className="text-lg text-cyan mb-1 truncate">
                  {topKit.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {topKit.description}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-bold text-cyan">
                  {topKit.installs.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">installs</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <div className="text-xs text-muted-foreground mb-2">
                Last 7 days activity
              </div>
              <Sparkline data={topKit.sparkline} />
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Views:</span>{" "}
                <span className="font-semibold text-[#F8FAFC]">
                  {topKit.views.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Updated:</span>{" "}
                <span className="font-semibold text-[#F8FAFC]">
                  {topKit.lastUpdated}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Link:</span>{" "}
                <Link
                  href={`/skills/${topKit.slug}`}
                  className="font-semibold text-cyan hover:underline"
                >
                  View kit →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* Simple Bar Charts */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#F8FAFC]">📊 Bars</h2>
          <div className="text-xs text-muted-foreground">Simple CSS bars (no chart libs)</div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-card/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground font-normal">
                Installs by Kit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {kitAnalytics.slice(0, 8).map((kit) => (
                <BarRow
                  key={kit.id}
                  label={kit.name}
                  value={kit.installs}
                  max={maxKitInstalls}
                  href={`/skills/${kit.slug}`}
                />
              ))}
              {kitAnalytics.length > 8 && (
                <div className="text-xs text-muted-foreground pt-2">
                  Showing top 8 of {kitAnalytics.length} kits
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground font-normal">
                Views by Kit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {kitAnalytics
                .slice()
                .sort((a, b) => b.views - a.views)
                .slice(0, 8)
                .map((kit) => (
                  <BarRow
                    key={kit.id}
                    label={kit.name}
                    value={kit.views}
                    max={maxKitViews}
                    href={`/skills/${kit.slug}`}
                    accent="bg-purple/60"
                  />
                ))}
              {kitAnalytics.length > 8 && (
                <div className="text-xs text-muted-foreground pt-2">
                  Showing top 8 of {kitAnalytics.length} kits
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Kit Breakdown */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-6 text-[#F8FAFC]">
          📦 Kit-by-Kit Breakdown
        </h2>

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
                    7d Activity
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
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {kit.description}
                      </div>
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
                    <div className="font-semibold text-cyan">
                      {kit.installs.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Views</div>
                    <div className="font-semibold text-[#F8FAFC]">
                      {kit.views.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Updated</div>
                    <div className="text-[#F8FAFC]">{kit.lastUpdated}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">
                      7d Activity
                    </div>
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
