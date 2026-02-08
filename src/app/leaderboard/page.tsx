import type { Metadata } from "next";
import { getSkills } from "@/lib/data";
import { readCanaryScorecards } from "@/lib/server/canaryScorecardStore";
import { LeaderboardClient } from "@/app/leaderboard/leaderboard-client";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Reliability Leaderboard — forAgents.dev";
  const description = "Daily canary scorecards and a reliability leaderboard for the skill directory.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: "https://foragents.dev/leaderboard",
      siteName: "forAgents.dev",
      type: "website",
      images: [
        {
          url: "/api/og/leaderboard",
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
      images: ["/api/og/leaderboard"],
    },
  };
}

export default async function LeaderboardPage() {
  const skills = getSkills();
  const scorecards = await readCanaryScorecards();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Reliability Leaderboard</h1>
          <p className="text-muted-foreground mt-2">
            Daily canary scorecards ranked by pass rate, latency, and test volume.
          </p>
        </div>

        <LeaderboardClient skills={skills} scorecards={scorecards} />
      </main>
    </div>
  );
}
