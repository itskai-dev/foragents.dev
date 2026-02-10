/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { BenchmarksClient } from "./benchmarks-client";

export const metadata: Metadata = {
  title: "Benchmark Suite — forAgents.dev",
  description:
    "Browse persistent benchmark data, sort by score/date, filter by skill, and submit benchmark runs.",
};

export default function BenchmarksPage() {
  return <BenchmarksClient />;
}
