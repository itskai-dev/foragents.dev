/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  calculateTokenCostUSD,
  complexityMultipliers,
  modelEconomics,
  taskProfiles,
  type ComplexityKey,
  type TaskType,
} from "@/lib/economics";

const featuredModelIds = [
  "gpt-5.3",
  "gpt-5.3-codex",
  "claude-opus-4.1",
  "claude-sonnet-4.5",
  "gemini-2.5-pro",
  "llama-4-maverick",
];

const complexityLabels: Record<ComplexityKey, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  extreme: "Extreme",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value);

export default function EconomicsHubPage() {
  const [taskType, setTaskType] = useState<TaskType>("bug-fix");
  const [complexity, setComplexity] = useState<ComplexityKey>("medium");
  const [selectedModelId, setSelectedModelId] = useState("gpt-5.3-codex");

  const [tasksPerDay, setTasksPerDay] = useState(120);
  const [avgInputTokens, setAvgInputTokens] = useState(3200);
  const [avgOutputTokens, setAvgOutputTokens] = useState(1400);
  const [mixPrimary, setMixPrimary] = useState("gpt-5.3-codex");
  const [mixSecondary, setMixSecondary] = useState("claude-sonnet-4.5");
  const [mixTertiary, setMixTertiary] = useState("gemini-2.5-flash");
  const [mixPrimaryShare, setMixPrimaryShare] = useState(40);
  const [mixSecondaryShare, setMixSecondaryShare] = useState(35);

  const tertiaryShare = Math.max(0, 100 - mixPrimaryShare - mixSecondaryShare);

  const featuredModels = useMemo(
    () => modelEconomics.filter((model) => featuredModelIds.includes(model.id)),
    []
  );

  const selectedModel =
    modelEconomics.find((model) => model.id === selectedModelId) ?? modelEconomics[0];

  const taskEstimate = useMemo(() => {
    const profile = taskProfiles[taskType];
    const multiplier = complexityMultipliers[complexity];
    const input = Math.round(profile.inputTokens * multiplier);
    const output = Math.round(profile.outputTokens * multiplier);
    const cost = calculateTokenCostUSD(selectedModel, input, output);

    return {
      input,
      output,
      cost,
    };
  }, [complexity, selectedModel, taskType]);

  const monthlyProjection = useMemo(() => {
    const primaryModel = modelEconomics.find((model) => model.id === mixPrimary) ?? modelEconomics[0];
    const secondaryModel =
      modelEconomics.find((model) => model.id === mixSecondary) ?? modelEconomics[1] ?? modelEconomics[0];
    const tertiaryModel =
      modelEconomics.find((model) => model.id === mixTertiary) ?? modelEconomics[2] ?? modelEconomics[0];

    const costFor = (modelId: string) => {
      const model = modelEconomics.find((candidate) => candidate.id === modelId) ?? modelEconomics[0];
      return calculateTokenCostUSD(model, avgInputTokens, avgOutputTokens);
    };

    const weightedTaskCost =
      costFor(primaryModel.id) * (mixPrimaryShare / 100) +
      costFor(secondaryModel.id) * (mixSecondaryShare / 100) +
      costFor(tertiaryModel.id) * (tertiaryShare / 100);

    const monthlyTasks = tasksPerDay * 30;

    return {
      weightedTaskCost,
      monthlyTasks,
      monthlyCost: weightedTaskCost * monthlyTasks,
      annualCost: weightedTaskCost * monthlyTasks * 12,
      models: [primaryModel, secondaryModel, tertiaryModel],
    };
  }, [
    avgInputTokens,
    avgOutputTokens,
    mixPrimary,
    mixPrimaryShare,
    mixSecondary,
    mixSecondaryShare,
    mixTertiary,
    tasksPerDay,
    tertiaryShare,
  ]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="max-w-6xl mx-auto px-4 py-16">
        <Badge className="mb-4 bg-[#06D6A0]/15 text-[#06D6A0] border border-[#06D6A0]/30">
          Agent Economics Hub
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Agent Economics & Cost Calculator</h1>
        <p className="text-foreground/70 max-w-3xl">
          Understand true operating cost per task, compare model pricing, and project monthly agent spend before your workload scales.
        </p>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <h2 className="text-2xl font-semibold text-white">Model cost comparison</h2>
          <Link href="/economics/compare" className="text-sm text-[#06D6A0] hover:underline">
            Open deep comparison →
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left px-4 py-3 text-foreground/70">Model</th>
                <th className="text-left px-4 py-3 text-foreground/70">Provider</th>
                <th className="text-right px-4 py-3 text-foreground/70">Input / 1M</th>
                <th className="text-right px-4 py-3 text-foreground/70">Output / 1M</th>
              </tr>
            </thead>
            <tbody>
              {featuredModels.map((model, index) => (
                <tr key={model.id} className={index % 2 === 0 ? "bg-white/[0.02]" : ""}>
                  <td className="px-4 py-3 text-white">{model.name}</td>
                  <td className="px-4 py-3 text-foreground/70">{model.provider}</td>
                  <td className="px-4 py-3 text-right text-white">{formatCurrency(model.inputPricePer1M)}</td>
                  <td className="px-4 py-3 text-right text-white">{formatCurrency(model.outputPricePer1M)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-14 grid lg:grid-cols-2 gap-6">
        <Card className="bg-card/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Cost per task estimator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm text-foreground/70 mb-1">Task type</label>
              <select
                value={taskType}
                onChange={(event) => setTaskType(event.target.value as TaskType)}
                className="w-full rounded-md border border-white/15 bg-[#111] p-2 text-white"
              >
                {Object.entries(taskProfiles).map(([value, profile]) => (
                  <option key={value} value={value}>
                    {profile.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-foreground/70 mb-1">Model</label>
              <select
                value={selectedModelId}
                onChange={(event) => setSelectedModelId(event.target.value)}
                className="w-full rounded-md border border-white/15 bg-[#111] p-2 text-white"
              >
                {modelEconomics.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-foreground/70 mb-1">Complexity</label>
              <select
                value={complexity}
                onChange={(event) => setComplexity(event.target.value as ComplexityKey)}
                className="w-full rounded-md border border-white/15 bg-[#111] p-2 text-white"
              >
                {Object.entries(complexityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-lg border border-[#06D6A0]/30 bg-[#06D6A0]/10 p-4">
              <p className="text-sm text-foreground/70">Projected cost for this task</p>
              <p className="text-3xl font-bold text-[#06D6A0]">{formatCurrency(taskEstimate.cost)}</p>
              <p className="text-xs text-foreground/70 mt-1">
                {taskEstimate.input.toLocaleString()} input + {taskEstimate.output.toLocaleString()} output tokens
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Monthly cost projection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="text-sm text-foreground/70">Tasks per day: {tasksPerDay}</label>
              <input
                type="range"
                min={5}
                max={1000}
                value={tasksPerDay}
                onChange={(event) => setTasksPerDay(Number(event.target.value))}
                className="w-full mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-foreground/70">Avg input tokens: {avgInputTokens.toLocaleString()}</label>
              <input
                type="range"
                min={500}
                max={30000}
                step={100}
                value={avgInputTokens}
                onChange={(event) => setAvgInputTokens(Number(event.target.value))}
                className="w-full mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-foreground/70">Avg output tokens: {avgOutputTokens.toLocaleString()}</label>
              <input
                type="range"
                min={200}
                max={12000}
                step={100}
                value={avgOutputTokens}
                onChange={(event) => setAvgOutputTokens(Number(event.target.value))}
                className="w-full mt-1"
              />
            </div>

            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-2">
                <select value={mixPrimary} onChange={(event) => setMixPrimary(event.target.value)} className="rounded-md border border-white/15 bg-[#111] p-2 text-white">
                  {modelEconomics.map((model) => (
                    <option key={model.id} value={model.id}>{model.name}</option>
                  ))}
                </select>
                <div>
                  <label className="text-xs text-foreground/70">Primary mix: {mixPrimaryShare}%</label>
                  <input type="range" min={0} max={100} value={mixPrimaryShare} onChange={(event) => setMixPrimaryShare(Number(event.target.value))} className="w-full" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select value={mixSecondary} onChange={(event) => setMixSecondary(event.target.value)} className="rounded-md border border-white/15 bg-[#111] p-2 text-white">
                  {modelEconomics.map((model) => (
                    <option key={model.id} value={model.id}>{model.name}</option>
                  ))}
                </select>
                <div>
                  <label className="text-xs text-foreground/70">Secondary mix: {mixSecondaryShare}%</label>
                  <input type="range" min={0} max={100 - mixPrimaryShare} value={mixSecondaryShare} onChange={(event) => setMixSecondaryShare(Number(event.target.value))} className="w-full" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select value={mixTertiary} onChange={(event) => setMixTertiary(event.target.value)} className="rounded-md border border-white/15 bg-[#111] p-2 text-white">
                  {modelEconomics.map((model) => (
                    <option key={model.id} value={model.id}>{model.name}</option>
                  ))}
                </select>
                <p className="text-xs text-foreground/70 self-center">Tertiary mix auto-balances: {tertiaryShare}%</p>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 p-4 space-y-1">
              <p className="text-sm text-foreground/70">Weighted cost per task</p>
              <p className="text-xl font-semibold text-white">{formatCurrency(monthlyProjection.weightedTaskCost)}</p>
              <p className="text-sm text-foreground/70">Monthly: <span className="text-[#06D6A0] font-semibold">{formatCurrency(monthlyProjection.monthlyCost)}</span></p>
              <p className="text-sm text-foreground/70">Annual run-rate: {formatCurrency(monthlyProjection.annualCost)}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-semibold text-white mb-6">How to reduce agent costs</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-card/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">Caching strategy</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/75">
              Cache stable system prompts, docs retrieval blocks, and repeated context so agents spend fewer input tokens each run.
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">Model routing</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/75">
              Route simple tests and docs work to lower-cost models. Escalate only complex feature and architecture tasks to premium models.
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">Prompt optimization</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/75">
              Keep prompts short, structured, and explicit. Better instructions reduce retries, output bloat, and wasted token cycles.
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
