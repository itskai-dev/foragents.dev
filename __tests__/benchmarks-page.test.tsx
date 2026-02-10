/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@/lib/agent-benchmarks", () => ({
  agentBenchmarksData: [{ id: "sample-benchmark" }],
}));

jest.mock("@/app/benchmarks/benchmarks-client", () => ({
  BenchmarksClient: ({ data }: { data: unknown[] }) => (
    <div>
      <h1>Agent Benchmark Suite</h1>
      <span data-testid="benchmarks-count">{data.length}</span>
    </div>
  ),
}));

import BenchmarksPage from "@/app/benchmarks/page";

describe("Benchmarks Page", () => {
  test("renders benchmarks client", () => {
    render(<BenchmarksPage />);

    expect(screen.getByRole("heading", { name: /agent benchmark suite/i })).toBeInTheDocument();
    expect(screen.getByTestId("benchmarks-count")).toHaveTextContent("1");
  });
});
