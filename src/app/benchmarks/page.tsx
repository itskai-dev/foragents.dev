import type { Metadata } from "next";
import { BenchmarksClient } from "./benchmarks-client";
import benchmarksData from "@/data/benchmarks.json";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Performance Benchmarks — forAgents.dev";
  const description =
    "Comprehensive performance benchmarks for skills: latency (p50/p95/p99), throughput, success rate, memory usage, and historical trends.";

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

export default function BenchmarksPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <BenchmarksClient data={benchmarksData} />
    </div>
  );
}
