import type { Metadata } from "next";
import { ProductivityDashboardClient } from "@/app/productivity/productivity-dashboard-client";
import { getProductivityData } from "@/lib/productivity";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Agent Productivity & ROI Analytics — forAgents.dev",
  description:
    "Track agent throughput, quality, uptime, and ROI with a productivity analytics dashboard.",
};

export default function ProductivityPage() {
  const data = getProductivityData();

  return <ProductivityDashboardClient agents={data.agents} />;
}
