"use client";

import { useState } from "react";
import benchmarksData from "@/data/test-benchmarks.json";

interface Metric {
  id: string;
  name: string;
  description: string;
  weight: number;
  scale: string;
  measurement: string;
}

interface Benchmark {
  id: string;
  name: string;
  description: string;
  metrics: Metric[];
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  tests: number;
  coverage: string[];
  useCases: string[];
}

interface ExampleScore {
  agent: string;
  model: string;
  scores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
}

const benchmarks = benchmarksData.benchmarks as Benchmark[];
const testSuites = benchmarksData.testSuites as TestSuite[];
const exampleScores = benchmarksData.exampleScores as ExampleScore[];
const scoringMethodology = benchmarksData.scoringMethodology;
const leaderboard = benchmarksData.leaderboard;

export default function BenchmarksPage() {
  const [selectedBenchmark, setSelectedBenchmark] = useState<string>(benchmarks[0].id);
  const [activeTab, setActiveTab] = useState<"benchmarks" | "methodology" | "leaderboard" | "suites">("benchmarks");

  const currentBenchmark = benchmarks.find((b) => b.id === selectedBenchmark) || benchmarks[0];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <section className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mb-8">
            <a
              href="/testing-hub"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              ← Back to Testing Hub
            </a>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">Benchmark Suite</h1>
          <p className="text-lg text-white/70 max-w-3xl">
            Standardized benchmarks for measuring agent capabilities. Compare performance across dimensions like response
            quality, tool efficiency, and error handling.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Tabs */}
        <div className="mb-8 flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab("benchmarks")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "benchmarks"
                ? "border-white text-white"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            Benchmarks
          </button>
          <button
            onClick={() => setActiveTab("suites")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "suites"
                ? "border-white text-white"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            Test Suites
          </button>
          <button
            onClick={() => setActiveTab("methodology")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "methodology"
                ? "border-white text-white"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            Methodology
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "leaderboard"
                ? "border-white text-white"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            Leaderboard
          </button>
        </div>

        {/* Benchmarks Tab */}
        {activeTab === "benchmarks" && (
          <div className="space-y-8">
            {/* Benchmark Selector */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              {benchmarks.map((benchmark) => (
                <button
                  key={benchmark.id}
                  onClick={() => setSelectedBenchmark(benchmark.id)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    selectedBenchmark === benchmark.id
                      ? "border-white bg-white/10 shadow-lg"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <h3 className="font-bold mb-2 text-sm">{benchmark.name}</h3>
                  <p className="text-xs text-white/60 line-clamp-2">{benchmark.description}</p>
                </button>
              ))}
            </div>

            {/* Selected Benchmark Details */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-3xl font-bold mb-4">{currentBenchmark.name}</h2>
              <p className="text-white/70 mb-8">{currentBenchmark.description}</p>

              <h3 className="text-xl font-bold mb-6">Metrics</h3>
              <div className="space-y-4">
                {currentBenchmark.metrics.map((metric) => (
                  <div key={metric.id} className="rounded-xl border border-white/10 bg-black/20 p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h4 className="text-lg font-bold">{metric.name}</h4>
                        <p className="text-sm text-white/60">{metric.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-400">{(metric.weight * 100).toFixed(0)}%</div>
                        <div className="text-xs text-white/40">Weight</div>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 text-sm">
                      <div>
                        <span className="text-white/60">Scale: </span>
                        <span className="text-white">{metric.scale}</span>
                      </div>
                      <div>
                        <span className="text-white/60">Measurement: </span>
                        <span className="text-white">{metric.measurement}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Example Scores */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Example Scores</h3>
              <div className="grid gap-6 md:grid-cols-2">
                {exampleScores.map((score) => (
                  <div key={score.agent} className="rounded-xl border border-white/10 bg-white/5 p-6">
                    <div className="mb-4">
                      <h4 className="text-xl font-bold">{score.agent}</h4>
                      <p className="text-sm text-white/60">{score.model}</p>
                    </div>

                    <div className="mb-4 space-y-2">
                      {Object.entries(score.scores).map(([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize text-white/70">{key.replace(/-/g, " ")}</span>
                            <span className="font-bold">{value}</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                value >= 90
                                  ? "bg-green-500"
                                  : value >= 80
                                  ? "bg-blue-500"
                                  : value >= 70
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 text-sm">
                      <div>
                        <div className="font-semibold text-green-400 mb-2">Strengths</div>
                        <ul className="space-y-1">
                          {score.strengths.map((s, i) => (
                            <li key={i} className="text-white/70">
                              + {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="font-semibold text-yellow-400 mb-2">Areas to Improve</div>
                        <ul className="space-y-1">
                          {score.weaknesses.map((w, i) => (
                            <li key={i} className="text-white/70">
                              − {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Test Suites Tab */}
        {activeTab === "suites" && (
          <div className="space-y-6">
            {testSuites.map((suite) => (
              <div key={suite.id} className="rounded-2xl border border-white/10 bg-white/5 p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">{suite.name}</h2>
                  <p className="text-white/70">{suite.description}</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3 mb-6">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-center">
                    <div className="text-3xl font-bold text-blue-400">{suite.tests}</div>
                    <div className="text-sm text-white/60">Test Cases</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="text-sm font-semibold text-white/60 mb-2">Coverage</div>
                    <div className="space-y-1">
                      {suite.coverage.map((cov, i) => (
                        <div key={i} className="text-sm text-white/80">
                          • {cov}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="text-sm font-semibold text-white/60 mb-2">Best For</div>
                    <div className="space-y-1">
                      {suite.useCases.map((useCase, i) => (
                        <div key={i} className="text-sm text-white/80">
                          • {useCase}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Methodology Tab */}
        {activeTab === "methodology" && (
          <div className="space-y-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-2xl font-bold mb-4">Scoring Methodology</h2>
              <p className="text-white/70 mb-6">{scoringMethodology.overview}</p>

              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-black/20 p-6">
                  <h3 className="font-bold mb-2">Calculation</h3>
                  <code className="text-sm text-green-400">{scoringMethodology.calculation}</code>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-6">
                  <h3 className="font-bold mb-2">Normalization</h3>
                  <p className="text-white/70 text-sm">{scoringMethodology.normalization}</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-6">
                  <h3 className="font-bold mb-2">Aggregation</h3>
                  <p className="text-white/70 text-sm">{scoringMethodology.aggregation}</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-6">
                  <h3 className="font-bold mb-4">Statistical Rigor</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-white/60">Confidence: </span>
                      <span className="text-white">{scoringMethodology.statistical.confidence}</span>
                    </div>
                    <div>
                      <span className="text-white/60">Minimum Runs: </span>
                      <span className="text-white">{scoringMethodology.statistical.minimumRuns}</span>
                    </div>
                    <div>
                      <span className="text-white/60">Outlier Removal: </span>
                      <span className="text-white">{scoringMethodology.statistical.outlierRemoval}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && (
          <div className="space-y-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-2xl font-bold mb-4">Community Leaderboard Concept</h2>
              <p className="text-white/70 mb-6">{leaderboard.description}</p>

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Categories</h3>
                <div className="space-y-4">
                  {leaderboard.categories.map((category: { id: string; name: string; description: string; options?: string[]; calculation?: string }) => (
                    <div key={category.id} className="rounded-xl border border-white/10 bg-black/20 p-6">
                      <h4 className="font-bold mb-2">{category.name}</h4>
                      <p className="text-sm text-white/70 mb-3">{category.description}</p>
                      {category.options && (
                        <div className="flex flex-wrap gap-2">
                          {category.options.map((option: string) => (
                            <span key={option} className="px-3 py-1 rounded-full bg-white/5 text-sm text-white/70">
                              {option}
                            </span>
                          ))}
                        </div>
                      )}
                      {category.calculation && (
                        <div className="text-sm text-white/60 mt-2">
                          <span className="font-semibold">Calculation:</span> {category.calculation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Submission Requirements</h3>
                <ul className="space-y-2">
                  {leaderboard.submissions.requirements.map((req: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-white/70">{req}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
                  <p className="text-sm text-white/70">
                    <strong className="text-white">Verification:</strong> {leaderboard.submissions.verification}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
