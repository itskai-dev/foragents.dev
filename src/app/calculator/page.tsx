"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, Lightbulb, TrendingDown, Zap } from "lucide-react";

// Model pricing (per 1K tokens)
interface ModelPricing {
  id: string;
  name: string;
  provider: string;
  inputCostPer1K: number;
  outputCostPer1K: number;
  color: string;
}

const models: ModelPricing[] = [
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    inputCostPer1K: 0.01,
    outputCostPer1K: 0.03,
    color: "#10a37f",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    inputCostPer1K: 0.005,
    outputCostPer1K: 0.015,
    color: "#10a37f",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    inputCostPer1K: 0.00015,
    outputCostPer1K: 0.0006,
    color: "#10a37f",
  },
  {
    id: "claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    inputCostPer1K: 0.003,
    outputCostPer1K: 0.015,
    color: "#CC9B7A",
  },
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    inputCostPer1K: 0.015,
    outputCostPer1K: 0.075,
    color: "#CC9B7A",
  },
  {
    id: "claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    inputCostPer1K: 0.00025,
    outputCostPer1K: 0.00125,
    color: "#CC9B7A",
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    inputCostPer1K: 0.00125,
    outputCostPer1K: 0.005,
    color: "#4285F4",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "Google",
    inputCostPer1K: 0.000075,
    outputCostPer1K: 0.0003,
    color: "#4285F4",
  },
];

export default function CalculatorPage() {
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o");
  const [inputTokens, setInputTokens] = useState<number>(1000);
  const [outputTokens, setOutputTokens] = useState<number>(500);
  const [requestsPerDay, setRequestsPerDay] = useState<number>(100);
  const [agentCount, setAgentCount] = useState<number>(1);

  const currentModel = useMemo(
    () => models.find((m) => m.id === selectedModel) || models[0],
    [selectedModel]
  );

  // Calculate costs
  const costs = useMemo(() => {
    const inputCost = (inputTokens / 1000) * currentModel.inputCostPer1K;
    const outputCost = (outputTokens / 1000) * currentModel.outputCostPer1K;
    const costPerRequest = inputCost + outputCost;
    const dailyCost = costPerRequest * requestsPerDay * agentCount;
    const monthlyCost = dailyCost * 30;
    const yearlyCost = dailyCost * 365;

    return {
      perRequest: costPerRequest,
      daily: dailyCost,
      monthly: monthlyCost,
      yearly: yearlyCost,
    };
  }, [currentModel, inputTokens, outputTokens, requestsPerDay, agentCount]);

  // Calculate comparison costs for all models
  const comparisonData = useMemo(() => {
    return models.map((model) => {
      const inputCost = (inputTokens / 1000) * model.inputCostPer1K;
      const outputCost = (outputTokens / 1000) * model.outputCostPer1K;
      const costPerRequest = inputCost + outputCost;
      const monthlyCost = costPerRequest * requestsPerDay * agentCount * 30;
      return {
        model,
        monthlyCost,
      };
    }).sort((a, b) => a.monthlyCost - b.monthlyCost);
  }, [inputTokens, outputTokens, requestsPerDay, agentCount]);

  const formatCurrency = (amount: number) => {
    if (amount < 0.01) {
      return `$${amount.toFixed(4)}`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const optimizationTips = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Use smaller models for simple tasks",
      description: "Switch to models like GPT-4o Mini or Claude 3 Haiku for basic queries and save up to 95% on costs.",
    },
    {
      icon: <TrendingDown className="w-5 h-5" />,
      title: "Implement prompt caching",
      description: "Cache common system prompts to reduce input token usage by 50-90% on repeated requests.",
    },
    {
      icon: <Calculator className="w-5 h-5" />,
      title: "Optimize prompt length",
      description: "Review your prompts to remove unnecessary context. Each 1000 tokens saved can reduce costs significantly at scale.",
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "Batch requests when possible",
      description: "Group similar queries together to reduce overhead and improve efficiency.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4 text-xs bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30">
            <Calculator className="w-3 h-3 mr-1 inline" />
            Cost Estimator
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            AI Agent Cost Calculator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Estimate your AI agent operational costs across different models. Compare pricing, optimize your budget, and make informed decisions.
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card className="bg-card/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Configuration</CardTitle>
              <CardDescription>Enter your agent usage parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Model Selection */}
              <div className="space-y-2">
                <Label htmlFor="model" className="text-sm font-medium text-white">
                  AI Model
                </Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger id="model" className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id} className="text-white focus:bg-white/10 focus:text-white">
                        {model.name} <span className="text-muted-foreground text-xs">({model.provider})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Input Tokens */}
              <div className="space-y-2">
                <Label htmlFor="input-tokens" className="text-sm font-medium text-white">
                  Avg Input Tokens per Request
                </Label>
                <Input
                  id="input-tokens"
                  type="number"
                  min="1"
                  value={inputTokens}
                  onChange={(e) => setInputTokens(Number(e.target.value))}
                  className="bg-white/5 border-white/10 text-white"
                />
                <p className="text-xs text-muted-foreground">
                  Typical: 500-2000 (includes system prompt + user input)
                </p>
              </div>

              {/* Output Tokens */}
              <div className="space-y-2">
                <Label htmlFor="output-tokens" className="text-sm font-medium text-white">
                  Avg Output Tokens per Request
                </Label>
                <Input
                  id="output-tokens"
                  type="number"
                  min="1"
                  value={outputTokens}
                  onChange={(e) => setOutputTokens(Number(e.target.value))}
                  className="bg-white/5 border-white/10 text-white"
                />
                <p className="text-xs text-muted-foreground">
                  Typical: 200-1000 (agent response length)
                </p>
              </div>

              {/* Requests Per Day */}
              <div className="space-y-2">
                <Label htmlFor="requests-per-day" className="text-sm font-medium text-white">
                  Requests per Day (per agent)
                </Label>
                <Input
                  id="requests-per-day"
                  type="number"
                  min="1"
                  value={requestsPerDay}
                  onChange={(e) => setRequestsPerDay(Number(e.target.value))}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              {/* Agent Count */}
              <div className="space-y-2">
                <Label htmlFor="agent-count" className="text-sm font-medium text-white">
                  Number of Agents
                </Label>
                <Input
                  id="agent-count"
                  type="number"
                  min="1"
                  value={agentCount}
                  onChange={(e) => setAgentCount(Number(e.target.value))}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card className="bg-gradient-to-br from-[#06D6A0]/10 via-card/80 to-purple/5 border-[#06D6A0]/30">
            <CardHeader>
              <CardTitle className="text-white">Estimated Costs</CardTitle>
              <CardDescription>
                Using <span className="text-[#06D6A0] font-semibold">{currentModel.name}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Per Request Cost */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-sm text-muted-foreground mb-1">Cost per Request</div>
                <div className="text-2xl font-bold text-white">{formatCurrency(costs.perRequest)}</div>
              </div>

              {/* Daily Cost */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-sm text-muted-foreground mb-1">Daily Cost</div>
                <div className="text-2xl font-bold text-white">{formatCurrency(costs.daily)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {requestsPerDay * agentCount} requests/day
                </div>
              </div>

              {/* Monthly Cost */}
              <div className="p-4 rounded-lg bg-[#06D6A0]/10 border border-[#06D6A0]/30">
                <div className="text-sm text-muted-foreground mb-1">Monthly Cost</div>
                <div className="text-3xl font-bold text-[#06D6A0]">{formatCurrency(costs.monthly)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  ~{(requestsPerDay * agentCount * 30).toLocaleString()} requests/month
                </div>
              </div>

              {/* Yearly Cost */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-sm text-muted-foreground mb-1">Yearly Cost</div>
                <div className="text-2xl font-bold text-white">{formatCurrency(costs.yearly)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  ~{(requestsPerDay * agentCount * 365).toLocaleString()} requests/year
                </div>
              </div>

              {/* Breakdown */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Input cost:</span>
                  <span className="text-white font-mono">
                    {formatCurrency((inputTokens / 1000) * currentModel.inputCostPer1K)}/req
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Output cost:</span>
                  <span className="text-white font-mono">
                    {formatCurrency((outputTokens / 1000) * currentModel.outputCostPer1K)}/req
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Comparison Table */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 text-white">Model Comparison</h2>
          <p className="text-muted-foreground">
            See how different models compare at your usage level
          </p>
        </div>

        <Card className="bg-card/50 border-white/10">
          <CardContent className="p-0">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 p-6 border-b border-white/5">
              <div className="col-span-2 text-sm font-semibold text-muted-foreground">Model</div>
              <div className="text-sm font-semibold text-right text-muted-foreground">Monthly Cost</div>
              <div className="text-sm font-semibold text-right text-muted-foreground">vs Selected</div>
            </div>

            {/* Rows */}
            {comparisonData.map((item, idx) => {
              const isSelected = item.model.id === selectedModel;
              const diff = item.monthlyCost - costs.monthly;
              const diffPercent = costs.monthly > 0 ? (diff / costs.monthly) * 100 : 0;

              return (
                <div
                  key={item.model.id}
                  className={`grid grid-cols-4 gap-4 p-6 ${
                    idx % 2 === 0 ? "bg-white/[0.02]" : ""
                  } ${isSelected ? "bg-[#06D6A0]/5 border-l-2 border-[#06D6A0]" : ""}`}
                >
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-white">{item.model.name}</div>
                      {isSelected && (
                        <Badge className="bg-[#06D6A0]/20 text-[#06D6A0] text-xs">
                          Selected
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.model.provider}</div>
                  </div>
                  <div className="text-right font-mono text-white">
                    {formatCurrency(item.monthlyCost)}
                  </div>
                  <div className="text-right text-sm">
                    {isSelected ? (
                      <span className="text-muted-foreground">—</span>
                    ) : diff < 0 ? (
                      <span className="text-green-400">
                        {formatCurrency(Math.abs(diff))} less ({Math.abs(diffPercent).toFixed(0)}%)
                      </span>
                    ) : (
                      <span className="text-red-400">
                        {formatCurrency(diff)} more (+{diffPercent.toFixed(0)}%)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* Optimization Tips */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 text-white">Cost Optimization Tips</h2>
          <p className="text-muted-foreground">
            Reduce your AI agent costs without sacrificing quality
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {optimizationTips.map((tip) => (
            <Card key={tip.title} className="bg-card/50 border-white/10">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#06D6A0]/10 text-[#06D6A0]">
                    {tip.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg text-white mb-2">{tip.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {tip.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Disclaimer */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-white">Disclaimer:</strong> Cost estimates are based on current published pricing from model providers as of February 2025 and are subject to change. Actual costs may vary based on your specific usage patterns, volume discounts, enterprise agreements, and provider pricing updates. This calculator is for estimation purposes only and should not be considered financial advice. Always verify current pricing with your provider before making decisions.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
