import { agentBenchmarksData, getOverallLeaderboard } from "@/lib/agent-benchmarks";

export function GET() {
  const leaderboard = getOverallLeaderboard();

  return Response.json({
    ...agentBenchmarksData,
    leaderboard,
  });
}
