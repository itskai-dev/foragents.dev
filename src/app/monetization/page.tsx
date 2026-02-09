"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function MonetizationPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[500px] flex items-center">
        {/* Aurora background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 right-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <Badge className="mb-4 bg-[#06D6A0]/20 text-[#06D6A0] border-[#06D6A0]/30">
            💰 Agent Monetization
          </Badge>
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Agent Monetization Guide
          </h1>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            Turn your agent into a sustainable business. Learn pricing models, billing strategies, and revenue optimization for AI products.
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Quick Navigation */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/monetization/calculator">
            <Card className="bg-card/30 border-white/10 hover:border-[#06D6A0]/30 transition-all group h-full cursor-pointer">
              <CardHeader>
                <div className="text-4xl mb-3">🧮</div>
                <CardTitle className="text-xl group-hover:text-[#06D6A0] transition-colors">
                  Pricing Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Interactive tool to calculate pricing tiers, margins, and break-even points based on your costs.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/monetization/cases">
            <Card className="bg-card/30 border-white/10 hover:border-purple-500/30 transition-all group h-full cursor-pointer">
              <CardHeader>
                <div className="text-4xl mb-3">📊</div>
                <CardTitle className="text-xl group-hover:text-purple-400 transition-colors">
                  Case Studies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Real-world examples of agents successfully monetizing with different pricing models.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/monetization/x402">
            <Card className="bg-card/30 border-white/10 hover:border-cyan-500/30 transition-all group h-full cursor-pointer">
              <CardHeader>
                <div className="text-4xl mb-3">⚡</div>
                <CardTitle className="text-xl group-hover:text-cyan-400 transition-colors">
                  x402 Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Implement pay-per-use billing with the x402 payment protocol for agent services.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <article className="prose prose-invert prose-lg max-w-none">
          {/* Pricing Models */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-[#F8FAFC]">Pricing Models for Agents</h2>
            
            <Card className="bg-card/30 border-purple-500/20 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-2xl">💎</span>
                  Per-Agent Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/80">
                  Charge a flat monthly/annual fee per agent instance. Best for specialized agents with clear value prop.
                </p>
                <div className="bg-black/40 rounded-lg p-4 font-mono text-sm">
                  <div className="text-green-400 mb-2">✓ Pros:</div>
                  <ul className="text-foreground/70 list-disc list-inside space-y-1">
                    <li>Simple, predictable revenue</li>
                    <li>Easy for customers to understand</li>
                    <li>Low billing complexity</li>
                  </ul>
                  <div className="text-red-400 mt-4 mb-2">✗ Cons:</div>
                  <ul className="text-foreground/70 list-disc list-inside space-y-1">
                    <li>Doesn't scale with usage</li>
                    <li>May overprice light users</li>
                    <li>Harder to justify high prices</li>
                  </ul>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-sm font-semibold text-purple-300 mb-2">💡 Code Example: Stripe Subscription</p>
                  <pre className="text-xs overflow-x-auto bg-black/60 p-3 rounded">
{`// Create subscription checkout
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{
    price: 'price_agent_monthly', // Stripe price ID
    quantity: 1,
  }],
  success_url: 'https://yourapp.com/success',
  cancel_url: 'https://yourapp.com/cancel',
});`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-[#06D6A0]/20 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-2xl">👥</span>
                  Per-Seat Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/80">
                  Charge per user/team member accessing the agent. Common for team collaboration agents.
                </p>
                <div className="bg-black/40 rounded-lg p-4 font-mono text-sm">
                  <div className="text-green-400 mb-2">✓ Pros:</div>
                  <ul className="text-foreground/70 list-disc list-inside space-y-1">
                    <li>Scales with team size naturally</li>
                    <li>Familiar model (like SaaS)</li>
                    <li>Predictable expansion revenue</li>
                  </ul>
                  <div className="text-red-400 mt-4 mb-2">✗ Cons:</div>
                  <ul className="text-foreground/70 list-disc list-inside space-y-1">
                    <li>Teams may share accounts</li>
                    <li>Doesn't account for usage variance</li>
                    <li>Can get expensive fast</li>
                  </ul>
                </div>
                <div className="bg-[#06D6A0]/10 border border-[#06D6A0]/30 rounded-lg p-4">
                  <p className="text-sm font-semibold text-[#06D6A0] mb-2">💡 Implementation Pattern</p>
                  <pre className="text-xs overflow-x-auto bg-black/60 p-3 rounded">
{`// Metered billing with Stripe
const usageRecord = await stripe.subscriptionItems.createUsageRecord(
  subscriptionItemId,
  {
    quantity: teamMemberCount,
    timestamp: Math.floor(Date.now() / 1000),
    action: 'set', // or 'increment'
  }
);`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-cyan-500/20 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  Usage-Based Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/80">
                  Charge based on consumption: API calls, tokens, tasks completed, etc. Most fair but complex.
                </p>
                <div className="bg-black/40 rounded-lg p-4 font-mono text-sm">
                  <div className="text-green-400 mb-2">✓ Pros:</div>
                  <ul className="text-foreground/70 list-disc list-inside space-y-1">
                    <li>Aligns cost with value delivered</li>
                    <li>Lower barrier to entry</li>
                    <li>Scales automatically</li>
                  </ul>
                  <div className="text-red-400 mt-4 mb-2">✗ Cons:</div>
                  <ul className="text-foreground/70 list-disc list-inside space-y-1">
                    <li>Unpredictable revenue</li>
                    <li>Complex billing logic</li>
                    <li>Requires usage tracking</li>
                  </ul>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                  <p className="text-sm font-semibold text-cyan-300 mb-2">💡 Token Tracking Example</p>
                  <pre className="text-xs overflow-x-auto bg-black/60 p-3 rounded">
{`// Track token usage
const trackUsage = async (userId: string, tokens: number) => {
  await db.usage.create({
    userId,
    tokens,
    cost: tokens * COST_PER_TOKEN,
    timestamp: new Date(),
  });
  
  // Bill monthly aggregate
  const monthlyTokens = await db.usage.aggregate({
    where: { 
      userId, 
      timestamp: { gte: startOfMonth() } 
    },
    _sum: { tokens: true }
  });
  
  return monthlyTokens._sum.tokens * PRICE_PER_TOKEN;
};`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-amber-500/20 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  Hybrid: Base + Overage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/80">
                  Flat monthly fee with usage tiers. Combines predictability with scalability.
                </p>
                <div className="bg-black/40 rounded-lg p-4 font-mono text-sm">
                  <div className="text-amber-400 mb-2">Example Tiers:</div>
                  <ul className="text-foreground/70 space-y-2">
                    <li><strong className="text-green-400">Starter:</strong> $29/mo → 10K tokens included, $0.005/token after</li>
                    <li><strong className="text-blue-400">Pro:</strong> $99/mo → 50K tokens included, $0.004/token after</li>
                    <li><strong className="text-purple-400">Team:</strong> $299/mo → 200K tokens included, $0.003/token after</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="opacity-10 my-16" />

          {/* Marketplace Listing Fees */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-[#F8FAFC]">Marketplace Distribution</h2>
            
            <Card className="bg-card/30 border-white/10">
              <CardHeader>
                <CardTitle>Listing on Agent Marketplaces</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/80">
                  Many platforms take a revenue share for hosting and distribution. Typical ranges:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <div className="font-semibold text-purple-300 mb-2">🏪 App Store Model</div>
                    <div className="text-2xl font-bold text-purple-400 mb-1">30%</div>
                    <p className="text-sm text-foreground/70">
                      Standard for established marketplaces (OpenAI GPT Store, etc.)
                    </p>
                  </div>
                  
                  <div className="bg-[#06D6A0]/10 border border-[#06D6A0]/30 rounded-lg p-4">
                    <div className="font-semibold text-[#06D6A0] mb-2">🤝 Creator-Friendly</div>
                    <div className="text-2xl font-bold text-[#06D6A0] mb-1">10-15%</div>
                    <p className="text-sm text-foreground/70">
                      Lower takes for smaller platforms trying to attract developers
                    </p>
                  </div>
                  
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                    <div className="font-semibold text-cyan-300 mb-2">⚡ Transaction Fee</div>
                    <div className="text-2xl font-bold text-cyan-400 mb-1">2.9% + $0.30</div>
                    <p className="text-sm text-foreground/70">
                      Direct payment processing (Stripe standard rates)
                    </p>
                  </div>
                  
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <div className="font-semibold text-amber-300 mb-2">🔓 Self-Hosted</div>
                    <div className="text-2xl font-bold text-amber-400 mb-1">0%</div>
                    <p className="text-sm text-foreground/70">
                      Run your own billing, keep 100% (minus payment fees)
                    </p>
                  </div>
                </div>

                <div className="bg-black/40 rounded-lg p-4 mt-4">
                  <p className="text-sm font-semibold text-amber-300 mb-2">💡 Pricing Strategy Tip:</p>
                  <p className="text-sm text-foreground/70">
                    If you list on marketplaces with 30% take, price your agent 40-50% higher than direct sales 
                    to maintain margins. Offer "direct purchase discount" to incentivize customers to buy from your site.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="opacity-10 my-16" />

          {/* Freemium Conversion */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-[#F8FAFC]">Freemium Conversion Strategies</h2>
            
            <Card className="bg-card/30 border-white/10 mb-6">
              <CardHeader>
                <CardTitle>The Freemium Playbook</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#06D6A0] mb-3">1. Usage Limits</h3>
                  <p className="text-foreground/80 mb-2">
                    Free tier: 1,000 requests/month. Pro: Unlimited.
                  </p>
                  <div className="bg-black/40 rounded-lg p-3 text-sm">
                    <strong className="text-green-400">Conversion trigger:</strong> Show usage meter at 70%, upgrade CTA at 90%.
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">2. Feature Gating</h3>
                  <p className="text-foreground/80 mb-2">
                    Free: Basic functionality. Pro: Advanced features, integrations, priority support.
                  </p>
                  <div className="bg-black/40 rounded-lg p-3 text-sm">
                    <strong className="text-green-400">Conversion trigger:</strong> "Unlock [feature] with Pro" inline when users try premium features.
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-cyan-400 mb-3">3. Response Quality</h3>
                  <p className="text-foreground/80 mb-2">
                    Free: GPT-3.5 / Claude Haiku. Pro: GPT-4 / Claude Opus.
                  </p>
                  <div className="bg-black/40 rounded-lg p-3 text-sm">
                    <strong className="text-green-400">Conversion trigger:</strong> A/B test showing Pro response quality after free response.
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-amber-400 mb-3">4. Time-Based</h3>
                  <p className="text-foreground/80 mb-2">
                    Free trial: 14 days full access. Then downgrade to free tier or convert.
                  </p>
                  <div className="bg-black/40 rounded-lg p-3 text-sm">
                    <strong className="text-green-400">Conversion trigger:</strong> Email drip campaign on days 3, 7, 12, 14 with value reminders.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-[#06D6A0]/10 border-purple-500/30">
              <CardHeader>
                <CardTitle>Conversion Benchmarks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">2-5%</div>
                    <p className="text-sm text-foreground/70">Typical free → paid</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#06D6A0]">20-40%</div>
                    <p className="text-sm text-foreground/70">Trial → paid</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-400">60-80%</div>
                    <p className="text-sm text-foreground/70">Annual retention</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="opacity-10 my-16" />

          {/* Pricing Psychology */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-[#F8FAFC]">Pricing Psychology for AI Products</h2>
            
            <div className="space-y-6">
              <Card className="bg-card/30 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">🧠</span>
                    Anchor High, Discount Often
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 mb-4">
                    Start with a high "enterprise" tier to make mid-tier seem reasonable. Offer launch discounts, student discounts, annual prepay discounts.
                  </p>
                  <div className="bg-black/40 rounded-lg p-4 font-mono text-sm">
                    <div className="space-y-1">
                      <div className="line-through text-red-400">Enterprise: $999/mo</div>
                      <div className="text-amber-400">Pro: $99/mo ← Feels like a steal</div>
                      <div className="text-green-400">Starter: $29/mo ← Easy yes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">💸</span>
                    Value Metric Alignment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 mb-4">
                    Price based on the value your agent delivers, not your costs. If your agent saves 10 hours/week, $200/mo is cheap.
                  </p>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <p className="text-sm"><strong className="text-purple-300">Example:</strong> A code review agent finds bugs before production. 
                    Price it as "insurance" not "API calls." $500/mo to prevent one production incident worth $50K is obvious ROI.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">🎯</span>
                    Three-Tier Goldilocks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 mb-4">
                    Most customers pick the middle option. Make your target tier the middle one.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                      <div className="text-sm text-foreground/60 mb-2">Too cheap</div>
                      <div className="text-xl font-bold">Starter</div>
                      <div className="text-2xl font-bold text-foreground/80">$29</div>
                    </div>
                    <div className="bg-[#06D6A0]/10 rounded-lg p-4 border border-[#06D6A0]/50 relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#06D6A0] text-black text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </div>
                      <div className="text-sm text-[#06D6A0] mb-2">Just right ✓</div>
                      <div className="text-xl font-bold">Pro</div>
                      <div className="text-2xl font-bold text-[#06D6A0]">$99</div>
                    </div>
                    <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                      <div className="text-sm text-foreground/60 mb-2">Overkill</div>
                      <div className="text-xl font-bold">Enterprise</div>
                      <div className="text-2xl font-bold text-foreground/80">$499</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">📅</span>
                    Annual Prepay Incentive
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 mb-4">
                    Offer 2 months free (17% discount) for annual. Improves cash flow and reduces churn.
                  </p>
                  <div className="bg-black/40 rounded-lg p-4 font-mono text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground/70">Monthly:</span>
                        <span className="text-foreground/90">$99/mo × 12 = <span className="text-red-400">$1,188</span></span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground/70">Annual:</span>
                        <span className="text-foreground/90">$990/yr <span className="text-green-400">(save $198)</span></span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        </article>
      </section>

      <Separator className="opacity-10" />

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Set Your Pricing?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Use our interactive calculator to determine optimal pricing based on your costs, 
              or explore real-world case studies from successful agent businesses.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/monetization/calculator"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Open Pricing Calculator →
              </Link>
              <Link
                href="/monetization/cases"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 font-semibold text-sm hover:bg-purple-500/20 transition-colors"
              >
                View Case Studies
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
