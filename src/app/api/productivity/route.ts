import { NextResponse } from "next/server";
import {
  PERIODS,
  type ProductivityPeriod,
  getAgentProductivity,
  getOverview,
  getProductivityData,
} from "@/lib/productivity";

export const dynamic = "force-static";

function isPeriod(value: string | null): value is ProductivityPeriod {
  return value !== null && PERIODS.includes(value as ProductivityPeriod);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedPeriod = searchParams.get("period");
  const period: ProductivityPeriod = isPeriod(requestedPeriod) ? requestedPeriod : "30d";
  const agentSlug = searchParams.get("agent");

  if (agentSlug) {
    const agent = getAgentProductivity(agentSlug);

    if (!agent) {
      return NextResponse.json(
        {
          error: "agent_not_found",
          message: `No productivity metrics found for agent '${agentSlug}'.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      period,
      generatedAt: getProductivityData().generatedAt,
      agent: {
        slug: agent.slug,
        name: agent.name,
        avatar: agent.avatar,
        trustTier: agent.trustTier,
        uptime: agent.uptime,
        comparisonBadge: agent.comparisonBadge,
        metrics: agent.periods[period],
        dailyPerformance: agent.dailyPerformance,
        recentTasks: agent.taskHistory.slice(0, 10),
      },
    });
  }

  const data = getProductivityData();
  const overview = getOverview(period);

  return NextResponse.json({
    period,
    generatedAt: data.generatedAt,
    overview,
    agents: data.agents.map((agent) => ({
      slug: agent.slug,
      name: agent.name,
      avatar: agent.avatar,
      trustTier: agent.trustTier,
      uptime: agent.uptime,
      comparisonBadge: agent.comparisonBadge,
      metrics: agent.periods[period],
    })),
  });
}
