/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, Loader2, Save, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type CalculatorInputs = {
  agents: number;
  hoursSavedPerAgentPerDay: number;
  hourlyRate: number;
  monthlyToolCosts: number;
};

type CalculatorPreset = {
  id: string;
  name: string;
  description: string;
  inputs: CalculatorInputs;
};

type CalculatorResults = {
  monthlySavings: number;
  annualRoi: number;
  paybackPeriodMonths: number | null;
  efficiencyGainPercent: number;
  monthlyProductivityValue: number;
};

const DEFAULT_INPUTS: CalculatorInputs = {
  agents: 5,
  hoursSavedPerAgentPerDay: 2,
  hourlyRate: 75,
  monthlyToolCosts: 699,
};

const WORK_DAYS_PER_MONTH = 22;
const HOURS_PER_WORK_DAY = 8;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function calculateResults(inputs: CalculatorInputs): CalculatorResults {
  const monthlyProductivityValue =
    inputs.agents * inputs.hoursSavedPerAgentPerDay * inputs.hourlyRate * WORK_DAYS_PER_MONTH;
  const monthlySavings = monthlyProductivityValue - inputs.monthlyToolCosts;
  const annualToolCost = inputs.monthlyToolCosts * 12;
  const annualNetSavings = monthlySavings * 12;

  const annualRoi =
    annualToolCost > 0
      ? (annualNetSavings / annualToolCost) * 100
      : annualNetSavings > 0
        ? 9999
        : 0;

  const paybackPeriodMonths = monthlySavings > 0 ? inputs.monthlyToolCosts / monthlySavings : null;

  const efficiencyGainPercent = (inputs.hoursSavedPerAgentPerDay / HOURS_PER_WORK_DAY) * 100;

  return {
    monthlySavings,
    annualRoi,
    paybackPeriodMonths,
    efficiencyGainPercent,
    monthlyProductivityValue,
  };
}

export default function CalculatorPage() {
  const [presets, setPresets] = useState<CalculatorPreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [presetLoading, setPresetLoading] = useState(true);
  const [presetError, setPresetError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const results = useMemo(() => calculateResults(inputs), [inputs]);

  useEffect(() => {
    const loadPresets = async () => {
      try {
        setPresetLoading(true);
        setPresetError(null);

        const response = await fetch("/api/calculator", { method: "GET" });
        if (!response.ok) {
          throw new Error("Failed to load presets");
        }

        const data = (await response.json()) as { presets?: CalculatorPreset[] };
        const loadedPresets = Array.isArray(data.presets) ? data.presets : [];

        setPresets(loadedPresets);

        if (loadedPresets.length > 0) {
          setActivePresetId(loadedPresets[0].id);
          setInputs(loadedPresets[0].inputs);
        }
      } catch {
        setPresetError("We couldn't load presets right now. You can still use manual inputs.");
      } finally {
        setPresetLoading(false);
      }
    };

    void loadPresets();
  }, []);

  const updateInput = (key: keyof CalculatorInputs, value: number, min: number, max: number) => {
    setActivePresetId(null);
    setInputs((prev) => ({
      ...prev,
      [key]: clamp(value, min, max),
    }));
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  const handleSaveCalculation = async () => {
    try {
      setSaveLoading(true);
      setSaveError(null);
      setSaveSuccess(null);

      const presetName = presets.find((preset) => preset.id === activePresetId)?.name;
      const name = presetName ? `${presetName} Snapshot` : "Custom ROI Snapshot";

      const response = await fetch("/api/calculator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          inputs,
          results: {
            monthlySavings: Number(results.monthlySavings.toFixed(2)),
            annualRoi: Number(results.annualRoi.toFixed(2)),
            paybackPeriodMonths:
              results.paybackPeriodMonths === null
                ? null
                : Number(results.paybackPeriodMonths.toFixed(2)),
            efficiencyGainPercent: Number(results.efficiencyGainPercent.toFixed(2)),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save calculation");
      }

      setSaveSuccess("Calculation saved successfully.");
    } catch {
      setSaveError("Failed to save calculation. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full bg-[#06D6A0]/5 blur-[140px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <Badge
            variant="outline"
            className="mb-4 border-[#06D6A0]/30 bg-[#06D6A0]/10 text-xs text-[#06D6A0]"
          >
            <TrendingUp className="mr-1 inline h-3 w-3" />
            ROI Calculator
          </Badge>
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">Agent ROI Calculator</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Model your automation upside in real time. Pick a preset, tune your inputs, and save
            your scenario.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-16 lg:grid-cols-2">
        <Card className="border-white/10 bg-card/50">
          <CardHeader>
            <CardTitle className="text-white">Inputs</CardTitle>
            <CardDescription>Adjust your team assumptions and compare outcomes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-sm text-white">Presets</Label>
                {presetLoading && (
                  <span className="flex items-center text-xs text-muted-foreground">
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Loading...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <Button
                    key={preset.id}
                    variant={activePresetId === preset.id ? "default" : "outline"}
                    className={
                      activePresetId === preset.id
                        ? "border-[#06D6A0]/40 bg-[#06D6A0] text-black hover:bg-[#06D6A0]/90"
                        : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                    }
                    onClick={() => {
                      setActivePresetId(preset.id);
                      setInputs(preset.inputs);
                    }}
                    type="button"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
              {presetError && <p className="mt-2 text-xs text-red-400">{presetError}</p>}
            </div>

            <InputRow
              label="Number of Agents"
              value={inputs.agents}
              min={1}
              max={200}
              step={1}
              onChange={(value) => updateInput("agents", value, 1, 200)}
            />

            <InputRow
              label="Hours Saved per Agent per Day"
              value={inputs.hoursSavedPerAgentPerDay}
              min={0.25}
              max={8}
              step={0.25}
              onChange={(value) => updateInput("hoursSavedPerAgentPerDay", value, 0.25, 8)}
            />

            <InputRow
              label="Average Hourly Rate (USD)"
              value={inputs.hourlyRate}
              min={15}
              max={400}
              step={1}
              onChange={(value) => updateInput("hourlyRate", value, 15, 400)}
            />

            <InputRow
              label="Monthly Tool Costs (USD)"
              value={inputs.monthlyToolCosts}
              min={0}
              max={100000}
              step={50}
              onChange={(value) => updateInput("monthlyToolCosts", value, 0, 100000)}
            />

            <div className="space-y-2">
              <Button
                onClick={handleSaveCalculation}
                disabled={saveLoading}
                className="w-full bg-[#06D6A0] text-black hover:bg-[#06D6A0]/90"
                type="button"
              >
                {saveLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Calculation
                  </>
                )}
              </Button>
              {saveError && <p className="text-xs text-red-400">{saveError}</p>}
              {saveSuccess && <p className="text-xs text-[#06D6A0]">{saveSuccess}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#06D6A0]/30 bg-gradient-to-br from-[#06D6A0]/10 via-card/80 to-purple/5">
          <CardHeader>
            <CardTitle className="text-white">Computed ROI</CardTitle>
            <CardDescription>Real-time impact from your current assumptions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricTile
              label="Monthly Productivity Value"
              value={formatCurrency(results.monthlyProductivityValue)}
            />
            <MetricTile
              label="Monthly Savings"
              value={formatCurrency(results.monthlySavings)}
              accent
            />
            <MetricTile label="Annual ROI" value={formatPercent(results.annualRoi)} />
            <MetricTile
              label="Payback Period"
              value={
                results.paybackPeriodMonths === null
                  ? "No payback (cost exceeds value)"
                  : `${results.paybackPeriodMonths.toFixed(2)} months`
              }
            />
            <MetricTile
              label="Efficiency Gain"
              value={formatPercent(results.efficiencyGainPercent)}
            />

            <Separator className="bg-white/10" />

            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-sm text-muted-foreground">
              <p>
                Formula used: <span className="text-white">agents × hours saved × hourly rate × 22
                days</span> − monthly tool costs.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-6">
            <p className="text-xs leading-relaxed text-muted-foreground">
              <strong className="text-white">Note:</strong> This calculator provides directional ROI
              estimates. Your actual outcomes depend on utilization, training quality, integration
              depth, and process maturity.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

type InputRowProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

function InputRow({ label, value, min, max, step, onChange }: InputRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm text-white">{label}</Label>
        <span className="text-xs text-muted-foreground">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[#06D6A0]"
      />
      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="border-white/10 bg-white/5 text-white"
      />
    </div>
  );
}

type MetricTileProps = {
  label: string;
  value: string;
  accent?: boolean;
};

function MetricTile({ label, value, accent }: MetricTileProps) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        accent
          ? "border-[#06D6A0]/35 bg-[#06D6A0]/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="mb-1 text-sm text-muted-foreground">{label}</div>
      <div className={accent ? "text-3xl font-bold text-[#06D6A0]" : "text-2xl font-bold text-white"}>
        {value}
      </div>
    </div>
  );
}
