/* eslint-disable react/no-unescaped-entities */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BenchmarksClient } from "../benchmarks-client";
import { benchmarkCategories, type BenchmarkCategory } from "@/types/benchmarks";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

const categoryMeta: Record<BenchmarkCategory, { name: string; description: string }> = {
  speed: {
    name: "Speed",
    description: "Execution-time and latency focused benchmark runs.",
  },
  accuracy: {
    name: "Accuracy",
    description: "Result correctness and precision benchmark runs.",
  },
  reliability: {
    name: "Reliability",
    description: "Consistency and failure-rate benchmark runs.",
  },
  memory: {
    name: "Memory",
    description: "Context retention and memory-efficiency benchmark runs.",
  },
};

function isBenchmarkCategory(value: string): value is BenchmarkCategory {
  return benchmarkCategories.includes(value as BenchmarkCategory);
}

export function generateStaticParams() {
  return benchmarkCategories.map((category) => ({ category }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;

  if (!isBenchmarkCategory(category)) {
    return {
      title: "Benchmark Category Not Found — forAgents.dev",
    };
  }

  return {
    title: `${categoryMeta[category].name} Benchmarks — forAgents.dev`,
    description: categoryMeta[category].description,
  };
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const { category } = await params;

  if (!isBenchmarkCategory(category)) {
    notFound();
  }

  return <BenchmarksClient initialCategory={category} />;
}
