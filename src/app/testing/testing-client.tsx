"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  difficulty: string;
  estimatedDuration: string;
  steps: string[];
  assertions: string[];
  tags: string[];
}

interface TestResult {
  templateId: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
}

interface TestConfig {
  model: string;
  timeout: number;
  retries: number;
  environment: string;
}

interface TestRun {
  id: string;
  timestamp: string;
  config: TestConfig;
  results: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
    coverage: number;
  };
  tests: TestResult[];
}

interface TestingData {
  categories: Category[];
  templates: Template[];
  testRuns: TestRun[];
}

export function TestingClient({ data }: { data: TestingData }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<TestConfig>({
    model: "claude-sonnet-4",
    timeout: 30000,
    retries: 3,
    environment: "staging",
  });

  const filteredTemplates =
    selectedCategory === "all"
      ? data.templates
      : data.templates.filter((t) => t.category === selectedCategory);

  const latestRun = data.testRuns[0];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-[#06D6A0]/20 text-[#06D6A0] border-[#06D6A0]/30";
      case "intermediate":
        return "bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30";
      case "advanced":
        return "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30";
      default:
        return "bg-foreground/20 text-foreground border-foreground/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "bg-[#06D6A0]/20 text-[#06D6A0] border-[#06D6A0]/30";
      case "failed":
        return "bg-red-500/20 text-red-500 border-red-500/30";
      case "skipped":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      default:
        return "bg-foreground/20 text-foreground border-foreground/30";
    }
  };

  const exportConfig = (format: "json" | "yaml") => {
    if (format === "json") {
      const json = JSON.stringify(config, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "test-config.json";
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const yaml = Object.entries(config)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
      const blob = new Blob([yaml], { type: "text/yaml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "test-config.yaml";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#8B5CF6]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-[#06D6A0]/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 w-full">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-2">
            Agent Testing Framework
          </h1>
          <p className="text-xl text-foreground/80 mb-6">
            Comprehensive testing suite for validating agent behavior, performance, and
            reliability
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="px-6 py-3 rounded-lg bg-[#8B5CF6] text-white font-semibold hover:brightness-110 transition-all"
            >
              {showConfig ? "Hide Configuration" : "Configure Tests"}
            </button>
            <button className="px-6 py-3 rounded-lg border border-white/10 text-foreground font-semibold hover:bg-white/5 transition-colors">
              Run All Tests
            </button>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Test Configuration Panel */}
      {showConfig && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <Card className="bg-card/30 border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl">Test Configuration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure test parameters and environment settings
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Model</label>
                  <select
                    value={config.model}
                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-card border border-white/10 text-foreground"
                  >
                    <option value="claude-opus-4">Claude Opus 4</option>
                    <option value="claude-sonnet-4">Claude Sonnet 4</option>
                    <option value="claude-haiku-4">Claude Haiku 4</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Timeout (ms)
                  </label>
                  <input
                    type="number"
                    value={config.timeout}
                    onChange={(e) =>
                      setConfig({ ...config, timeout: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-card border border-white/10 text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Retries</label>
                  <input
                    type="number"
                    value={config.retries}
                    onChange={(e) =>
                      setConfig({ ...config, retries: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-card border border-white/10 text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Environment
                  </label>
                  <select
                    value={config.environment}
                    onChange={(e) =>
                      setConfig({ ...config, environment: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-card border border-white/10 text-foreground"
                  >
                    <option value="development">Development</option>
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => exportConfig("json")}
                  className="px-4 py-2 rounded-lg border border-white/10 text-foreground text-sm hover:bg-white/5 transition-colors"
                >
                  Export JSON
                </button>
                <button
                  onClick={() => exportConfig("yaml")}
                  className="px-4 py-2 rounded-lg border border-white/10 text-foreground text-sm hover:bg-white/5 transition-colors"
                >
                  Export YAML
                </button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Test Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Test Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`p-4 rounded-lg border transition-all text-left ${
              selectedCategory === "all"
                ? "border-white/30 bg-white/5"
                : "border-white/10 bg-card/20 hover:bg-white/5"
            }`}
          >
            <div className="text-2xl mb-2">🎨</div>
            <div className="font-semibold">All Tests</div>
            <div className="text-sm text-muted-foreground">
              {data.templates.length} templates
            </div>
          </button>

          {data.categories.map((category) => {
            const count = data.templates.filter(
              (t) => t.category === category.id
            ).length;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-lg border transition-all text-left ${
                  selectedCategory === category.id
                    ? "border-white/30 bg-white/5"
                    : "border-white/10 bg-card/20 hover:bg-white/5"
                }`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="font-semibold">{category.name}</div>
                <div className="text-sm text-muted-foreground">
                  {count} {count === 1 ? "test" : "tests"}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Test Templates */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-6">Test Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="bg-card/30 border-white/10 hover:border-white/20 transition-all cursor-pointer"
              onClick={() => setSelectedTemplate(template)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge
                    variant="outline"
                    className={getDifficultyColor(template.difficulty)}
                  >
                    {template.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{template.estimatedDuration}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="bg-white/5 text-foreground/70 border-white/10 text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTemplate(null)}
        >
          <div
            className="bg-[#0a0a0a] border border-white/10 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedTemplate.name}
                  </h2>
                  <p className="text-muted-foreground">
                    {selectedTemplate.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={getDifficultyColor(selectedTemplate.difficulty)}
                >
                  {selectedTemplate.difficulty}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedTemplate.estimatedDuration}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Test Steps</h3>
                <ol className="space-y-2">
                  {selectedTemplate.steps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center text-sm font-semibold">
                        {i + 1}
                      </span>
                      <span className="text-foreground/80">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Assertions</h3>
                <ul className="space-y-2">
                  {selectedTemplate.assertions.map((assertion, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-[#06D6A0]">✓</span>
                      <span className="text-foreground/80">{assertion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-white/5 text-foreground/70 border-white/10"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <button className="w-full px-6 py-3 rounded-lg bg-[#8B5CF6] text-white font-semibold hover:brightness-110 transition-all">
                Run This Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Latest Results Dashboard */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-6">Latest Test Results</h2>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-[#06D6A0]/10 to-card/30 border-[#06D6A0]/20">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-[#06D6A0] mb-1">
                {latestRun.results.passed}
              </div>
              <p className="text-xs text-muted-foreground">Passed</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-card/30 border-red-500/20">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-500 mb-1">
                {latestRun.results.failed}
              </div>
              <p className="text-xs text-muted-foreground">Failed</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-card/30 border-yellow-500/20">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-500 mb-1">
                {latestRun.results.skipped}
              </div>
              <p className="text-xs text-muted-foreground">Skipped</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#3B82F6]/10 to-card/30 border-[#3B82F6]/20">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-[#3B82F6] mb-1">
                {latestRun.results.total}
              </div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#8B5CF6]/10 to-card/30 border-[#8B5CF6]/20">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-[#8B5CF6] mb-1">
                {(latestRun.results.duration / 1000).toFixed(1)}s
              </div>
              <p className="text-xs text-muted-foreground">Duration</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#F59E0B]/10 to-card/30 border-[#F59E0B]/20">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-[#F59E0B] mb-1">
                {latestRun.results.coverage.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Coverage</p>
            </CardContent>
          </Card>
        </div>

        {/* Visual Coverage Chart */}
        <Card className="bg-card/30 border-white/10 mb-6">
          <CardHeader>
            <CardTitle>Test Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Overall Coverage</span>
                <span className="font-bold text-[#06D6A0]">
                  {latestRun.results.coverage.toFixed(1)}%
                </span>
              </div>
              <div className="relative w-full h-8 bg-card/20 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#06D6A0] to-[#3B82F6] rounded-full transition-all"
                  style={{ width: `${latestRun.results.coverage}%` }}
                />
              </div>
              
              {/* Pass/Fail Distribution */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Pass Rate</div>
                  <div className="text-lg font-bold text-[#06D6A0]">
                    {((latestRun.results.passed / latestRun.results.total) * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Fail Rate</div>
                  <div className="text-lg font-bold text-red-500">
                    {((latestRun.results.failed / latestRun.results.total) * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Skip Rate</div>
                  <div className="text-lg font-bold text-yellow-500">
                    {((latestRun.results.skipped / latestRun.results.total) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individual Test Results */}
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle>Individual Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {latestRun.tests.map((test) => {
                const template = data.templates.find((t) => t.id === test.templateId);
                if (!template) return null;

                return (
                  <div
                    key={test.templateId}
                    className="flex items-center justify-between p-4 rounded-lg bg-card/20 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {template.category}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {test.duration > 0 ? `${test.duration}ms` : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Test History */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-6">Test History</h2>
        <Card className="bg-card/30 border-white/10">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {data.testRuns.map((run, index) => {
                const isLatest = index === 0;
                const previousRun = data.testRuns[index + 1];
                const coverageDiff = previousRun
                  ? run.results.coverage - previousRun.results.coverage
                  : 0;

                return (
                  <div
                    key={run.id}
                    className="p-4 rounded-lg bg-card/20 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold">{run.id}</span>
                          {isLatest && (
                            <Badge
                              variant="outline"
                              className="bg-[#06D6A0]/20 text-[#06D6A0] border-[#06D6A0]/30"
                            >
                              Latest
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(run.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">
                          Coverage
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{run.results.coverage.toFixed(1)}%</span>
                          {previousRun && (
                            <span
                              className={`text-sm ${
                                coverageDiff > 0
                                  ? "text-[#06D6A0]"
                                  : coverageDiff < 0
                                    ? "text-red-500"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {coverageDiff > 0 ? "↑" : coverageDiff < 0 ? "↓" : "—"}
                              {Math.abs(coverageDiff).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Model</div>
                        <div className="text-sm font-mono">{run.config.model}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Environment
                        </div>
                        <div className="text-sm">{run.config.environment}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Passed</div>
                        <div className="text-sm text-[#06D6A0] font-semibold">
                          {run.results.passed}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Failed</div>
                        <div className="text-sm text-red-500 font-semibold">
                          {run.results.failed}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Duration
                        </div>
                        <div className="text-sm font-semibold">
                          {(run.results.duration / 1000).toFixed(1)}s
                        </div>
                      </div>
                    </div>

                    {previousRun && (
                      <button className="text-sm text-[#8B5CF6] hover:underline">
                        Compare with previous run →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#8B5CF6]/20 bg-gradient-to-br from-[#8B5CF6]/5 via-card/80 to-[#06D6A0]/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B5CF6]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#06D6A0]/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Build Custom Test Suites
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Premium members can create custom test templates, schedule automated runs,
              and integrate with CI/CD pipelines.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#8B5CF6] text-white font-semibold text-sm hover:brightness-110 transition-all"
              >
                Upgrade to Premium →
              </a>
              <a
                href="/api-docs"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                API Documentation
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
