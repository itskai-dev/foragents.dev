import type { Metadata } from "next";
import { readFileSync } from "fs";
import { join } from "path";
import { BenchmarksClient } from "./benchmarks-client";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Agent Benchmarks — forAgents.dev";
  const description =
    "Performance benchmarks and comparison table for AI agents across response time, accuracy, cost efficiency, and reliability metrics.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: "https://foragents.dev/benchmarks",
      siteName: "forAgents.dev",
      type: "website",
      images: [
        {
          url: "/api/og/benchmarks",
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
      images: ["/api/og/benchmarks"],
    },
  };
}

type Benchmark = {
  id: string;
  name: string;
  category: string;
  responseTime: number;
  accuracy: number;
  costEfficiency: number;
  reliability: number;
};

function getBenchmarks(): Benchmark[] {
  const dataPath = join(process.cwd(), "data", "benchmarks.json");
  const fileContents = readFileSync(dataPath, "utf8");
  return JSON.parse(fileContents);
}

export default function BenchmarksPage() {
  const benchmarks = getBenchmarks();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Agent Benchmarks</h1>
          <p className="text-muted-foreground mt-2">
            Performance comparison of AI agents across key metrics: response time, accuracy,
            cost efficiency, and reliability.
          </p>
        </div>

        <BenchmarksClient benchmarks={benchmarks} />
      </main>
    </div>
  );
}
