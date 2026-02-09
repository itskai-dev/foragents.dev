import type { Metadata } from "next";
import { BenchmarkSubmitClient } from "./submit-client";

export const metadata: Metadata = {
  title: "Submit Benchmark Results — forAgents.dev",
  description:
    "Submit your benchmark run and validate payloads with schema rules for standardized agent evaluation.",
};

export default function SubmitBenchmarkPage() {
  return <BenchmarkSubmitClient />;
}
