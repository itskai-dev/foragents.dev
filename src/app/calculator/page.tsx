/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type CalculatorPreset = {
  id: string;
  name: string;
  description: string;
  agents: number;
  tokensPerDay: number;
  costPerToken: number;
  hoursPerDay: number;
  humanHourlyCost: number;
};

type CalculatorInputs = {
  agentCount: number;
  tokensPerDay: number;
  costPerToken: number;
  humanEquivalentHours: number;
  hourlyRate: number;
};

type CalculatorResults = {
  monthlyCost: number;
  monthlySavings: number;
  roiPercentage: number;
  breakevenDays: number | null;
};

const DEFAULT_INPUTS: CalculatorInputs = {
  agentCount: 5,
  tokensPerDay: 700000,
  costPerToken: 0.0000011,
  humanEquivalentHours: 2,
  hourlyRate: 75,
};

const SAVED_PRESET_KEY = "calculator.selectedPreset";
const SAVED_INPUTS_KEY = "calculator.inputs";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toInputModel(preset: CalculatorPreset): CalculatorInputs {
  return {
    agentCount: preset.agents,
    tokensPerDay: preset.tokensPerDay,
    costPerToken: preset.costPerToken,
    humanEquivalentHours: preset.hoursPerDay,
    hourlyRate: preset.humanHourlyCost,
  };
}

export default function CalculatorPage() {
  const [presets, setPresets] = useState<CalculatorPreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string>("");
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [presetLoading, setPresetLoading] = useState(true);
  const [presetError, setPresetError] = useState<string | null>(null);

  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [computeLoading, setComputeLoading] = useState(false);
  const [computeError, setComputeError] = useState<string | null>(null);

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

        const storedPresetId = localStorage.getItem(SAVED_PRESET_KEY);
        const storedInputsRaw = localStorage.getItem(SAVED_INPUTS_KEY);

        if (storedInputsRaw) {
          try {
            const parsed = JSON.parse(storedInputsRaw) as Partial<CalculatorInputs>;
            if (
              typeof parsed.agentCount === "number" &&
              typeof parsed.tokensPerDay === "number" &&
              typeof parsed.costPerToken === "number" &&
              typeof parsed.humanEquivalentHours === "number" &&
              typeof parsed.hourlyRate === "number"
            ) {
              setInputs(parsed as CalculatorInputs);
            }
          } catch {
            localStorage.removeItem(SAVED_INPUTS_KEY);
          }
        }

        if (storedPresetId && loadedPresets.some((preset) => preset.id === storedPresetId)) {
          setActivePresetId(storedPresetId);
        } else if (loadedPresets.length > 0) {
          setActivePresetId(loadedPresets[0].id);
          setInputs(toInputModel(loadedPresets[0]));
        }
      } catch {
        setPresetError("We couldn't load presets right now. You can still use manual inputs.");
      } finally {
        setPresetLoading(false);
      }
    };

    void loadPresets();
  }, []);

  useEffect(() => {
    localStorage.setItem(SAVED_INPUTS_KEY, JSON.stringify(inputs));
  }, [inputs]);

  useEffect(() => {
    if (activePresetId) {
      localStorage.setItem(SAVED_PRESET_KEY, activePresetId);
    }
  }, [activePresetId]);

  useEffect(() => {
    const controller = new AbortController();

    const compute = async () => {
      try {
        setComputeLoading(true);
        setComputeError(null);

        const response = await fetch("/api/calculator", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify(inputs),
        });

        if (!response.ok) {
          throw new Error("Failed to compute ROI");
        }

        const data = (await response.json()) as CalculatorResults;
        setResults(data);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        setComputeError("Unable to compute ROI right now. Please adjust and try again.");
      } finally {
        setComputeLoading(false);
      }
    };

    void compute();

    return () => controller.abort();
  }, [inputs]);

  const activePreset = useMemo(
    () => presets.find((preset) => preset.id === activePresetId) ?? null,
    [presets, activePresetId]
  );

  const updateInput = (key: keyof CalculatorInputs, value: number, min: number, max: number) => {
    setActivePresetId("");
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

  const netMonthly = results ? results.monthlySavings - results.monthlyCost : 0;
  const chartMax = Math.max(results?.monthlyCost ?? 0, results?.monthlySavings ?? 0, 1);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-[#06D6A0]/5 blur-[140px]" />
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
            Run real cost and savings math instantly. Pick a preset or tune every input for your
            environment.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-16 lg:grid-cols-2">
        <Card className="border-white/10 bg-card/50">
          <CardHeader>
            <CardTitle className="text-white">Inputs</CardTitle>
            <CardDescription>
              Configure usage and labor assumptions to model monthly ROI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-white">Preset Scenario</Label>
                {presetLoading && (
                  <span className="flex items-center text-xs text-muted-foreground">
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Loading...
                  </span>
                )}
              </div>

              <Select
                value={activePresetId || "custom"}
                onValueChange={(value) => {
                  if (value === "custom") {
                    setActivePresetId("");
                    return;
                  }

                  const preset = presets.find((candidate) => candidate.id === value);
                  if (!preset) {
                    return;
                  }

                  setActivePresetId(preset.id);
                  setInputs(toInputModel(preset));
                }}
                disabled={presetLoading}
              >
                <SelectTrigger className="w-full border-white/15 bg-white/5 text-white">
                  <SelectValue placeholder="Select a preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Inputs</SelectItem>
                  {presets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {activePreset && (
                <p className="text-xs text-muted-foreground">{activePreset.description}</p>
              )}
              {presetError && <p className="text-xs text-red-400">{presetError}</p>}
            </div>

            <InputRow
              label="Agent Count"
              value={inputs.agentCount}
              min={1}
              max={250}
              step={1}
              onChange={(value) => updateInput("agentCount", value, 1, 250)}
            />

            <InputRow
              label="Tokens per Day (per agent)"
              value={inputs.tokensPerDay}
              min={50000}
              max={5000000}
              step={10000}
              onChange={(value) => updateInput("tokensPerDay", value, 50000, 5000000)}
              displayValue={Math.round(inputs.tokensPerDay).toLocaleString()}
            />

            <InputRow
              label="Cost per Token (USD)"
              value={inputs.costPerToken}
              min={0.0000001}
              max={0.00002}
              step={0.0000001}
              onChange={(value) => updateInput("costPerToken", value, 0.0000001, 0.00002)}
              displayValue={inputs.costPerToken.toFixed(7)}
            />

            <InputRow
              label="Human Equivalent Hours Saved per Day (per agent)"
              value={inputs.humanEquivalentHours}
              min={0.25}
              max={10}
              step={0.25}
              onChange={(value) => updateInput("humanEquivalentHours", value, 0.25, 10)}
            />

            <InputRow
              label="Human Hourly Rate (USD)"
              value={inputs.hourlyRate}
              min={15}
              max={500}
              step={1}
              onChange={(value) => updateInput("hourlyRate", value, 15, 500)}
            />
          </CardContent>
        </Card>

        <Card className="border-[#06D6A0]/30 bg-gradient-to-br from-[#06D6A0]/10 via-card/80 to-purple/5">
          <CardHeader>
            <CardTitle className="text-white">Computed ROI</CardTitle>
            <CardDescription>Live values from the calculator API.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {computeLoading && !results && (
              <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 p-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Computing scenario...
              </div>
            )}

            {computeError && <p className="text-sm text-red-400">{computeError}</p>}

            {results && (
              <>
                <MetricTile label="Monthly Agent Cost" value={formatCurrency(results.monthlyCost)} />
                <MetricTile
                  label="Monthly Human Savings"
                  value={formatCurrency(results.monthlySavings)}
                  accent
                />
                <MetricTile label="ROI Percentage" value={`${results.roiPercentage.toFixed(1)}%`} />
                <MetricTile
                  label="Breakeven"
                  value={
                    results.breakevenDays === null
                      ? "No breakeven with current assumptions"
                      : `${results.breakevenDays.toFixed(1)} days`
                  }
                />

                <Separator className="bg-white/10" />

                <div className="space-y-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
                  <div className="text-sm font-medium text-white">Cost Breakdown</div>
                  <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <div>
                      Agent spend / month: <span className="text-white">{formatCurrency(results.monthlyCost)}</span>
                    </div>
                    <div>
                      Human value / month: <span className="text-white">{formatCurrency(results.monthlySavings)}</span>
                    </div>
                    <div>
                      Net monthly impact: <span className={netMonthly >= 0 ? "text-[#06D6A0]" : "text-red-400"}>{formatCurrency(netMonthly)}</span>
                    </div>
                    <div>
                      ROI: <span className="text-white">{results.roiPercentage.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
                  <div className="text-sm font-medium text-white">Savings Chart</div>
                  <BarRow
                    label="Monthly Cost"
                    value={results.monthlyCost}
                    max={chartMax}
                    colorClass="bg-red-400/70"
                  />
                  <BarRow
                    label="Monthly Savings"
                    value={results.monthlySavings}
                    max={chartMax}
                    colorClass="bg-[#06D6A0]/80"
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  Formula: monthly cost = agents × tokens/day × cost/token × 30. Monthly savings =
                  agents × hours/day × hourly rate × 22.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-6">
            <p className="text-xs leading-relaxed text-muted-foreground">
              <strong className="text-white">Note:</strong> This calculator provides directional ROI
              estimates. Actual outcomes depend on your team's utilization, model mix, process
              design, and change management.
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
  displayValue?: string;
};

function InputRow({ label, value, min, max, step, onChange, displayValue }: InputRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <Label className="text-sm text-white">{label}</Label>
        <span className="text-xs text-muted-foreground">{displayValue ?? value}</span>
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
        accent ? "border-[#06D6A0]/35 bg-[#06D6A0]/10" : "border-white/10 bg-white/5"
      }`}
    >
      <div className="mb-1 text-sm text-muted-foreground">{label}</div>
      <div className={accent ? "text-3xl font-bold text-[#06D6A0]" : "text-2xl font-bold text-white"}>
        {value}
      </div>
    </div>
  );
}

type BarRowProps = {
  label: string;
  value: number;
  max: number;
  colorClass: string;
};

function BarRow({ label, value, max, colorClass }: BarRowProps) {
  const widthPercent = Math.max(4, Math.min((value / max) * 100, 100));

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value)}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className={`h-full ${colorClass}`} style={{ width: `${widthPercent}%` }} />
      </div>
    </div>
  );
}
