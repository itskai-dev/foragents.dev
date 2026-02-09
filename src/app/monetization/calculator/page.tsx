"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function PricingCalculatorPage() {
  // Input state
  const [tokenCostPer1M, setTokenCostPer1M] = useState(15); // Default: GPT-4
  const [avgTokensPerRequest, setAvgTokensPerRequest] = useState(2000);
  const [requestsPerUserPerMonth, setRequestsPerUserPerMonth] = useState(100);
  const [monthlyUsers, setMonthlyUsers] = useState(50);
  const [targetMargin, setTargetMargin] = useState(70); // %
  const [marketplaceFee, setMarketplaceFee] = useState(0); // %

  // Calculations
  const calculations = useMemo(() => {
    const costPerRequest = (avgTokensPerRequest / 1_000_000) * tokenCostPer1M;
    const costPerUserPerMonth = costPerRequest * requestsPerUserPerMonth;
    const totalMonthlyCost = costPerUserPerMonth * monthlyUsers;
    
    const requiredRevenue = totalMonthlyCost / (1 - targetMargin / 100);
    const pricePerUser = requiredRevenue / monthlyUsers;
    
    const marketplaceFeeAmount = (requiredRevenue * marketplaceFee) / 100;
    const revenueAfterFees = requiredRevenue - marketplaceFeeAmount;
    const actualMargin = ((revenueAfterFees - totalMonthlyCost) / revenueAfterFees) * 100;
    
    const breakEvenUsers = totalMonthlyCost / pricePerUser;
    
    // Suggested tiers
    const starterPrice = Math.ceil(pricePerUser * 0.5);
    const proPrice = Math.ceil(pricePerUser);
    const teamPrice = Math.ceil(pricePerUser * 2.5);
    
    return {
      costPerRequest,
      costPerUserPerMonth,
      totalMonthlyCost,
      requiredRevenue,
      pricePerUser,
      marketplaceFeeAmount,
      revenueAfterFees,
      actualMargin,
      breakEvenUsers,
      tiers: {
        starter: starterPrice,
        pro: proPrice,
        team: teamPrice,
      },
    };
  }, [tokenCostPer1M, avgTokensPerRequest, requestsPerUserPerMonth, monthlyUsers, targetMargin, marketplaceFee]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 right-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <Link href="/monetization">
            <Badge className="mb-4 bg-[#06D6A0]/20 text-[#06D6A0] border-[#06D6A0]/30 cursor-pointer hover:bg-[#06D6A0]/30">
              ← Back to Monetization Guide
            </Badge>
          </Link>
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            🧮 Pricing Calculator
          </h1>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            Calculate optimal pricing based on your costs, usage, and target margins
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Calculator */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-6">
            <Card className="bg-card/30 border-white/10">
              <CardHeader>
                <CardTitle>Cost Inputs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Model Cost ($ per 1M tokens)
                  </label>
                  <input
                    type="number"
                    value={tokenCostPer1M}
                    onChange={(e) => setTokenCostPer1M(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-foreground focus:border-[#06D6A0]/50 focus:outline-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    GPT-4: $15 | GPT-3.5: $2 | Claude Opus: $15 | Haiku: $0.80
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Avg Tokens Per Request
                  </label>
                  <input
                    type="number"
                    value={avgTokensPerRequest}
                    onChange={(e) => setAvgTokensPerRequest(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-foreground focus:border-[#06D6A0]/50 focus:outline-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Include both input and output tokens
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-white/10">
              <CardHeader>
                <CardTitle>Usage Inputs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Requests Per User Per Month
                  </label>
                  <input
                    type="number"
                    value={requestsPerUserPerMonth}
                    onChange={(e) => setRequestsPerUserPerMonth(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-foreground focus:border-[#06D6A0]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Expected Monthly Users
                  </label>
                  <input
                    type="number"
                    value={monthlyUsers}
                    onChange={(e) => setMonthlyUsers(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-foreground focus:border-[#06D6A0]/50 focus:outline-none"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-white/10">
              <CardHeader>
                <CardTitle>Business Inputs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Target Profit Margin (%)
                  </label>
                  <input
                    type="number"
                    value={targetMargin}
                    onChange={(e) => setTargetMargin(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-foreground focus:border-[#06D6A0]/50 focus:outline-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Typical SaaS: 70-80%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Marketplace Fee (%)
                  </label>
                  <input
                    type="number"
                    value={marketplaceFee}
                    onChange={(e) => setMarketplaceFee(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-foreground focus:border-[#06D6A0]/50 focus:outline-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    App stores: 30% | Self-hosted: 0% | Stripe: 2.9%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-[#06D6A0]/10 to-cyan-500/5 border-[#06D6A0]/30">
              <CardHeader>
                <CardTitle>💰 Recommended Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-foreground/70 mb-2">Price Per User (Monthly)</p>
                  <div className="text-4xl font-bold text-[#06D6A0]">
                    ${calculations.pricePerUser.toFixed(2)}
                  </div>
                </div>

                <Separator className="opacity-10" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/70">Cost per request:</span>
                    <span className="font-mono text-sm">${calculations.costPerRequest.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/70">Cost per user/month:</span>
                    <span className="font-mono text-sm">${calculations.costPerUserPerMonth.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/70">Total monthly cost:</span>
                    <span className="font-mono text-sm font-semibold text-red-400">${calculations.totalMonthlyCost.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/70">Required revenue:</span>
                    <span className="font-mono text-sm font-semibold text-green-400">${calculations.requiredRevenue.toFixed(2)}</span>
                  </div>
                  {marketplaceFee > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground/70">Marketplace fees:</span>
                        <span className="font-mono text-sm text-amber-400">-${calculations.marketplaceFeeAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground/70">Actual margin:</span>
                        <span className="font-mono text-sm text-cyan-400">{calculations.actualMargin.toFixed(1)}%</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-purple-500/20">
              <CardHeader>
                <CardTitle>📊 Break-Even Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70 mb-2">Users needed to break even:</p>
                <div className="text-3xl font-bold text-purple-400 mb-4">
                  {Math.ceil(calculations.breakEvenUsers)} users
                </div>
                
                {/* Pure CSS Bar Chart */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-foreground/60 w-16">Current:</span>
                    <div className="flex-1 h-8 bg-black/40 rounded-lg overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-[#06D6A0] transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${Math.min((monthlyUsers / calculations.breakEvenUsers) * 100, 100)}%` }}
                      >
                        <span className="text-xs font-bold text-black">{monthlyUsers}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-foreground/60 w-16">Needed:</span>
                    <div className="flex-1 h-8 bg-black/40 rounded-lg overflow-hidden relative">
                      <div className="h-full w-full bg-gradient-to-r from-purple-500 to-purple-400 flex items-center justify-end pr-2">
                        <span className="text-xs font-bold text-black">{Math.ceil(calculations.breakEvenUsers)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {monthlyUsers >= calculations.breakEvenUsers ? (
                  <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-sm text-green-400 font-semibold">✓ Profitable! You're above break-even.</p>
                  </div>
                ) : (
                  <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                    <p className="text-sm text-amber-400 font-semibold">
                      ⚠️ Need {Math.ceil(calculations.breakEvenUsers - monthlyUsers)} more users to break even
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-white/10">
              <CardHeader>
                <CardTitle>🎯 Suggested Tiers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-black/40 rounded-lg p-4 border border-green-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-green-400">Starter</span>
                      <span className="text-2xl font-bold text-green-400">${calculations.tiers.starter}</span>
                    </div>
                    <p className="text-xs text-foreground/60">
                      50% of calculated price • {Math.floor(requestsPerUserPerMonth * 0.5)} requests/mo
                    </p>
                  </div>

                  <div className="bg-[#06D6A0]/10 rounded-lg p-4 border border-[#06D6A0]/50 relative">
                    <div className="absolute -top-2 -right-2 bg-[#06D6A0] text-black text-xs font-bold px-2 py-1 rounded-full">
                      RECOMMENDED
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-[#06D6A0]">Pro</span>
                      <span className="text-2xl font-bold text-[#06D6A0]">${calculations.tiers.pro}</span>
                    </div>
                    <p className="text-xs text-foreground/60">
                      Full calculated price • {requestsPerUserPerMonth} requests/mo
                    </p>
                  </div>

                  <div className="bg-black/40 rounded-lg p-4 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-purple-400">Team</span>
                      <span className="text-2xl font-bold text-purple-400">${calculations.tiers.team}</span>
                    </div>
                    <p className="text-xs text-foreground/60">
                      250% of calculated price • {Math.floor(requestsPerUserPerMonth * 3)} requests/mo + priority
                    </p>
                  </div>
                </div>

                <div className="mt-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                  <p className="text-xs text-cyan-300">
                    💡 <strong>Tip:</strong> Most users will pick Pro. Price Starter to attract trials, 
                    Team to anchor high and serve power users.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Margin Visualization */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle>📈 Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Pure CSS Stacked Bar */}
              <div className="h-16 w-full bg-black/40 rounded-lg overflow-hidden flex">
                <div 
                  className="bg-red-500 flex items-center justify-center text-white font-bold text-sm transition-all duration-500"
                  style={{ width: `${(calculations.totalMonthlyCost / calculations.requiredRevenue) * 100}%` }}
                  title={`Costs: $${calculations.totalMonthlyCost.toFixed(2)}`}
                >
                  {((calculations.totalMonthlyCost / calculations.requiredRevenue) * 100).toFixed(0)}% Cost
                </div>
                {marketplaceFee > 0 && (
                  <div 
                    className="bg-amber-500 flex items-center justify-center text-white font-bold text-sm transition-all duration-500"
                    style={{ width: `${(calculations.marketplaceFeeAmount / calculations.requiredRevenue) * 100}%` }}
                    title={`Fees: $${calculations.marketplaceFeeAmount.toFixed(2)}`}
                  >
                    {((calculations.marketplaceFeeAmount / calculations.requiredRevenue) * 100).toFixed(0)}% Fees
                  </div>
                )}
                <div 
                  className="bg-gradient-to-r from-[#06D6A0] to-green-400 flex items-center justify-center text-black font-bold text-sm transition-all duration-500"
                  style={{ width: `${marketplaceFee > 0 ? calculations.actualMargin : targetMargin}%` }}
                  title={`Profit: $${(calculations.revenueAfterFees - calculations.totalMonthlyCost).toFixed(2)}`}
                >
                  {(marketplaceFee > 0 ? calculations.actualMargin : targetMargin).toFixed(0)}% Profit
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-foreground/60 mb-1">Total Costs</div>
                  <div className="text-xl font-bold text-red-400">${calculations.totalMonthlyCost.toFixed(0)}</div>
                </div>
                {marketplaceFee > 0 && (
                  <div>
                    <div className="text-sm text-foreground/60 mb-1">Marketplace Fees</div>
                    <div className="text-xl font-bold text-amber-400">${calculations.marketplaceFeeAmount.toFixed(0)}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-foreground/60 mb-1">Net Profit</div>
                  <div className="text-xl font-bold text-[#06D6A0]">
                    ${(calculations.revenueAfterFees - calculations.totalMonthlyCost).toFixed(0)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple/5 via-card/80 to-[#06D6A0]/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#06D6A0]/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Implement?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Learn how real agents monetize successfully, or explore x402 for automated pay-per-use billing.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/monetization/cases"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                View Case Studies →
              </Link>
              <Link
                href="/monetization/x402"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 font-semibold text-sm hover:bg-purple-500/20 transition-colors"
              >
                x402 Payment Protocol
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
