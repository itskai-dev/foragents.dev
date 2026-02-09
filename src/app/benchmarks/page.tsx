import type { Metadata } from "next";
import { BenchmarksClient } from "./benchmarks-client";
import { agentBenchmarksData } from "@/lib/agent-benchmarks";

export const metadata: Metadata = {
  title: "Agent Benchmark Suite — forAgents.dev",
  description:
    "Benchmark and compare agent performance across reasoning, tool use, code generation, memory/context, and multi-agent collaboration.",
};

export default function BenchmarksPage() {
  return <BenchmarksClient data={agentBenchmarksData} />;
}
