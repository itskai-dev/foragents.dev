"use client";

import { useState } from "react";
import cicdData from "@/data/ci-cd-templates.json";

interface Workflow {
  id: string;
  name: string;
  description: string;
  platform: string;
  difficulty: string;
  triggers: string[];
  code: string;
}

interface Strategy {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  implementation: {
    steps: string[];
    tools: string[];
  };
}

const workflows = cicdData.workflows as Workflow[];
const strategies = cicdData.strategies as Strategy[];
const monitoring = cicdData.monitoring;
const rollbackStrategies = cicdData.rollbackStrategies;
const bestPractices = cicdData.bestPractices;
const examplePipeline = cicdData.examplePipeline;

const DIFFICULTY_COLORS = {
  beginner: "bg-green-500/10 text-green-500 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function CICDPage() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"templates" | "strategies" | "monitoring" | "best-practices">("templates");

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert("Copied to clipboard!");
  };

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
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">CI/CD for Agents</h1>
          <p className="text-lg text-white/70 max-w-3xl">
            Production-ready continuous integration and deployment pipelines for AI agents. Includes GitHub Actions
            templates, deployment strategies, monitoring, and rollback procedures.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Tabs */}
        <div className="mb-8 flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "templates"
                ? "border-white text-white"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab("strategies")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "strategies"
                ? "border-white text-white"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            Deployment Strategies
          </button>
          <button
            onClick={() => setActiveTab("monitoring")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "monitoring"
                ? "border-white text-white"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            Monitoring & Rollback
          </button>
          <button
            onClick={() => setActiveTab("best-practices")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "best-practices"
                ? "border-white text-white"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            Best Practices
          </button>
        </div>

        {/* Templates Tab */}
        {activeTab === "templates" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6">
              <h3 className="font-bold mb-2">🚀 Quick Start</h3>
              <p className="text-sm text-white/70">
                Copy these templates into your repository&apos;s <code className="bg-black/30 px-2 py-1 rounded">.github/workflows/</code> directory.
                Customize environment variables and secrets as needed.
              </p>
            </div>

            {workflows.map((workflow) => (
              <div key={workflow.id} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                <button
                  onClick={() => setSelectedWorkflow(selectedWorkflow === workflow.id ? null : workflow.id)}
                  className="w-full text-left p-6 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{workflow.name}</h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium border ${
                            DIFFICULTY_COLORS[workflow.difficulty as keyof typeof DIFFICULTY_COLORS]
                          }`}
                        >
                          {workflow.difficulty}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-medium border border-white/20 bg-white/5">
                          {workflow.platform}
                        </span>
                      </div>
                      <p className="text-white/70 mb-3">{workflow.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {workflow.triggers.map((trigger) => (
                          <span key={trigger} className="px-2 py-1 rounded-md bg-black/30 text-xs text-white/60">
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-white/40 text-2xl">{selectedWorkflow === workflow.id ? "−" : "+"}</div>
                  </div>
                </button>

                {selectedWorkflow === workflow.id && (
                  <div className="border-t border-white/10 p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">Code Template</h4>
                      <button
                        onClick={() => copyToClipboard(workflow.code)}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
                      >
                        📋 Copy
                      </button>
                    </div>
                    <div className="rounded-lg bg-black/50 border border-white/10 p-4 overflow-x-auto">
                      <pre className="text-sm text-green-400">
                        <code>{workflow.code}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Strategies Tab */}
        {activeTab === "strategies" && (
          <div className="space-y-6">
            {strategies.map((strategy) => (
              <div key={strategy.name} className="rounded-2xl border border-white/10 bg-white/5 p-8">
                <h2 className="text-2xl font-bold mb-3">{strategy.name}</h2>
                <p className="text-white/70 mb-6">{strategy.description}</p>

                <div className="grid gap-6 md:grid-cols-2 mb-6">
                  <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
                    <h4 className="font-bold text-green-400 mb-3">✓ Pros</h4>
                    <ul className="space-y-2">
                      {strategy.pros.map((pro, i) => (
                        <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">+</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                    <h4 className="font-bold text-red-400 mb-3">✗ Cons</h4>
                    <ul className="space-y-2">
                      {strategy.cons.map((con, i) => (
                        <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                          <span className="text-red-400 mt-0.5">−</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 mb-4">
                  <h4 className="font-bold text-blue-400 mb-2">Best For</h4>
                  <p className="text-sm text-white/70">{strategy.bestFor}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <h4 className="font-semibold mb-3">Implementation Steps</h4>
                    <ol className="space-y-2">
                      {strategy.implementation.steps.map((step, i) => (
                        <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                          <span className="text-white/40 font-bold">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <h4 className="font-semibold mb-3">Recommended Tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {strategy.implementation.tools.map((tool) => (
                        <span key={tool} className="px-3 py-1 rounded-full bg-white/5 text-sm text-white/70">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Monitoring Tab */}
        {activeTab === "monitoring" && (
          <div className="space-y-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-2xl font-bold mb-4">{monitoring.title}</h2>

              <div className="space-y-6">
                {monitoring.metrics.map((category: { category: string; metrics: string[] }) => (
                  <div key={category.category} className="rounded-xl border border-white/10 bg-black/20 p-6">
                    <h3 className="text-xl font-bold mb-4">{category.category}</h3>
                    <div className="grid gap-2 md:grid-cols-2">
                      {category.metrics.map((metric: string) => (
                        <div key={metric} className="flex items-start gap-2 text-sm text-white/70">
                          <span className="text-blue-400 mt-1">•</span>
                          {metric}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
                  <h3 className="text-xl font-bold text-red-400 mb-4">🚨 Critical Alerts</h3>
                  <ul className="space-y-2">
                    {monitoring.alerting.critical.map((alert: string, i: number) => (
                      <li key={i} className="text-sm text-white/70">
                        {alert}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-6">
                  <h3 className="text-xl font-bold text-yellow-400 mb-4">⚠️ Warning Alerts</h3>
                  <ul className="space-y-2">
                    {monitoring.alerting.warning.map((alert: string, i: number) => (
                      <li key={i} className="text-sm text-white/70">
                        {alert}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
                <h4 className="font-semibold mb-3">Recommended Tools</h4>
                <div className="flex flex-wrap gap-2">
                  {monitoring.tools.map((tool: string) => (
                    <span key={tool} className="px-3 py-1.5 rounded-full bg-white/5 text-sm text-white/70">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-2xl font-bold mb-6">Rollback Strategies</h2>
              <div className="space-y-4">
                {rollbackStrategies.map((strategy: { name: string; description: string; when: string; howTo: string; timeframe: string }) => (
                  <div key={strategy.name} className="rounded-xl border border-white/10 bg-black/20 p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-lg font-bold">{strategy.name}</h3>
                        <p className="text-sm text-white/60">{strategy.description}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium whitespace-nowrap">
                        {strategy.timeframe}
                      </span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 text-sm">
                      <div>
                        <span className="text-white/60">When: </span>
                        <span className="text-white">{strategy.when}</span>
                      </div>
                      <div>
                        <span className="text-white/60">How: </span>
                        <span className="text-white">{strategy.howTo}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Best Practices Tab */}
        {activeTab === "best-practices" && (
          <div className="space-y-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-2xl font-bold mb-6">CI/CD Best Practices</h2>
              <div className="space-y-6">
                {bestPractices.map((section: { category: string; practices: string[] }) => (
                  <div key={section.category} className="rounded-xl border border-white/10 bg-black/20 p-6">
                    <h3 className="text-xl font-bold mb-4">{section.category}</h3>
                    <ul className="space-y-3">
                      {section.practices.map((practice: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-white/70">
                          <span className="text-green-400 mt-1">✓</span>
                          <span>{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-2xl font-bold mb-6">{examplePipeline.name}</h2>
              <div className="space-y-4">
                {examplePipeline.stages.map((stage: { name: string; duration: string; steps: string[] }, index: number) => (
                  <div key={stage.name} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      {index < examplePipeline.stages.length - 1 && (
                        <div className="w-0.5 flex-1 bg-white/10 my-2" />
                      )}
                    </div>
                    <div className="flex-1 rounded-xl border border-white/10 bg-black/20 p-6 mb-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-lg font-bold">{stage.name}</h3>
                        <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-white/60 whitespace-nowrap">
                          {stage.duration}
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {stage.steps.map((step: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                            <span className="text-blue-400 mt-1">→</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
