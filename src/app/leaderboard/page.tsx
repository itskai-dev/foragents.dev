import type { Metadata } from "next";
import { getSkills } from "@/lib/data";
import { LeaderboardClient } from "@/app/leaderboard/leaderboard-client";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Skill Leaderboard — forAgents.dev";
  const description = "Top skills ranked by installs, reviews, and average rating.";

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

export default function LeaderboardPage() {
  const categories = Array.from(new Set(getSkills().flatMap((skill) => skill.tags)))
    .sort((a, b) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Skill Leaderboard</h1>
          <p className="text-muted-foreground mt-2">
            Real-time rankings computed from installs, reviews, and ratings.
          </p>
        </div>

        <LeaderboardClient categories={categories} />
      </main>
    </div>
  );
}
