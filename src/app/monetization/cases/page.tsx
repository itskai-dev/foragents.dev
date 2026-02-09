"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CaseStudy {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  pricingModel: string;
  metrics: {
    mrr: string;
    users: number;
    conversionRate: string;
    avgRevenuePerUser: string;
  };
  pricing: {
    tiers: { name: string; price: string; features: string[] }[];
  };
  results: string[];
  lessonsLearned: string[];
  color: string;
}

const caseStudies: CaseStudy[] = [
  {
    id: "codereviewer",
    name: "CodeReviewer AI",
    icon: "🔍",
    category: "Development Tools",
    description: "Automated code review agent that catches bugs, security issues, and style violations before deployment.",
    pricingModel: "Per-Seat Subscription + Usage Tiers",
    metrics: {
      mrr: "$47K",
      users: 320,
      conversionRate: "34%",
      avgRevenuePerUser: "$147",
    },
    pricing: {
      tiers: [
        {
          name: "Solo",
          price: "$49/mo",
          features: ["1 developer", "500 reviews/mo", "Basic rules", "GitHub integration"],
        },
        {
          name: "Team",
          price: "$149/mo",
          features: ["Up to 10 devs", "2,000 reviews/mo", "Custom rules", "All integrations", "Priority support"],
        },
        {
          name: "Enterprise",
          price: "$499/mo",
          features: ["Unlimited devs", "10K reviews/mo", "Self-hosted option", "SLA", "Dedicated support"],
        },
      ],
    },
    results: [
      "Reached profitability in 4 months",
      "84% annual retention rate",
      "Average 3.2 upsells per customer lifetime",
      "50% of revenue from Team tier",
    ],
    lessonsLearned: [
      "Pricing by seat worked better than per-repo because teams could predict costs",
      "Free tier (50 reviews/mo) was essential for viral growth via GitHub",
      "Annual prepay discount (2 months free) improved cash flow significantly",
      "Enterprise tier mostly serves as anchor pricing — only 8% of customers but validates product",
    ],
    color: "purple",
  },
  {
    id: "supportbot",
    name: "SupportBot Pro",
    icon: "💬",
    category: "Customer Support",
    description: "AI agent that handles Tier 1 customer support across email, chat, and social media.",
    pricingModel: "Usage-Based (per conversation) + Base Fee",
    metrics: {
      mrr: "$92K",
      users: 180,
      conversionRate: "28%",
      avgRevenuePerUser: "$511",
    },
    pricing: {
      tiers: [
        {
          name: "Starter",
          price: "$99/mo",
          features: ["500 conversations included", "$0.20/conversation after", "Email + chat", "Basic analytics"],
        },
        {
          name: "Growth",
          price: "$299/mo",
          features: ["2,000 conversations included", "$0.15/conversation after", "All channels", "Advanced analytics", "Custom responses"],
        },
        {
          name: "Scale",
          price: "$899/mo",
          features: ["10,000 conversations included", "$0.10/conversation after", "Priority routing", "API access", "White-label"],
        },
      ],
    },
    results: [
      "Average customer saves $4,200/mo vs human support agents",
      "67% of customers exceed included conversations (overage revenue)",
      "Churn dropped from 12% to 6% after adding analytics dashboard",
      "Top 10% of customers generate 52% of revenue",
    ],
    lessonsLearned: [
      "Usage-based pricing aligned perfectly with value (conversations resolved = value delivered)",
      "Base fee prevented abuse and ensured minimum revenue per customer",
      "Showing 'cost per conversation' vs 'human agent cost' in marketing was key differentiator",
      "Most customers land on Growth tier then scale into overages naturally",
    ],
    color: "cyan",
  },
  {
    id: "dataanalyst",
    name: "DataLens AI",
    icon: "📊",
    category: "Analytics",
    description: "Agent that connects to databases and generates insights, reports, and visualizations on demand.",
    pricingModel: "Freemium + Seat-Based",
    metrics: {
      mrr: "$34K",
      users: 520,
      conversionRate: "6.5%",
      avgRevenuePerUser: "$65",
    },
    pricing: {
      tiers: [
        {
          name: "Free",
          price: "$0",
          features: ["1 user", "5 queries/day", "Basic visualizations", "Public data sources only"],
        },
        {
          name: "Pro",
          price: "$39/user/mo",
          features: ["Unlimited queries", "All visualization types", "Private data sources", "Export to PDF/Excel", "API access"],
        },
        {
          name: "Business",
          price: "$99/user/mo",
          features: ["Everything in Pro", "Scheduled reports", "Slack/Teams integration", "Custom branding", "Priority support"],
        },
      ],
    },
    results: [
      "Free tier has 520 users, 34 paying (6.5% conversion)",
      "Avg time to convert: 18 days",
      "40% of free users exceed daily query limit within first week",
      "Business tier customers have 90% retention",
    ],
    lessonsLearned: [
      "Free tier was critical for viral adoption — users share dashboards with colleagues",
      "Query limit (not feature gating) was best conversion trigger",
      "Showing 'X queries remaining' notification at 70% drove upgrades",
      "Business tier mostly purchased by managers for their teams (multi-seat deals)",
    ],
    color: "green",
  },
  {
    id: "contentwriter",
    name: "ContentForge",
    icon: "✍️",
    category: "Content Creation",
    description: "AI agent that generates SEO-optimized blog posts, social media content, and marketing copy.",
    pricingModel: "Credit-Based System",
    metrics: {
      mrr: "$28K",
      users: 890,
      conversionRate: "18%",
      avgRevenuePerUser: "$31",
    },
    pricing: {
      tiers: [
        {
          name: "Starter Pack",
          price: "$19 one-time",
          features: ["50 credits", "~10 blog posts", "Basic templates", "No expiration"],
        },
        {
          name: "Creator",
          price: "$49/mo",
          features: ["200 credits/mo", "~40 blog posts", "All templates", "Priority generation", "Unused credits roll over (max 100)"],
        },
        {
          name: "Agency",
          price: "$199/mo",
          features: ["1,000 credits/mo", "~200 blog posts", "White-label", "Team collaboration", "API access"],
        },
      ],
    },
    results: [
      "One-time Starter Pack drove 60% of new customer acquisition",
      "42% of Starter Pack buyers upgrade to Creator within 60 days",
      "Credit rollover increased retention from 68% to 81%",
      "Agency tier customers use avg 870 credits/mo (profitable)",
    ],
    lessonsLearned: [
      "One-time purchase removed friction for first-time buyers",
      "Credit system felt more concrete than 'unlimited' plans",
      "Rollover feature (with cap) increased perceived value without hurting margins",
      "Showing credit cost per content type made pricing transparent and built trust",
    ],
    color: "amber",
  },
  {
    id: "recruiter",
    name: "TalentScout AI",
    icon: "🎯",
    category: "HR & Recruiting",
    description: "Agent that screens resumes, schedules interviews, and ranks candidates based on job requirements.",
    pricingModel: "Per-Hire Success Fee",
    metrics: {
      mrr: "$63K",
      users: 45,
      conversionRate: "52%",
      avgRevenuePerUser: "$1,400",
    },
    pricing: {
      tiers: [
        {
          name: "Free Screening",
          price: "$0",
          features: ["Unlimited resume screening", "Candidate ranking", "Basic email templates"],
        },
        {
          name: "Pay Per Hire",
          price: "$199 per hire",
          features: ["Everything in Free", "Interview scheduling", "Candidate communication", "Only pay when you hire"],
        },
        {
          name: "Unlimited",
          price: "$999/mo",
          features: ["Unlimited hires", "Dedicated agent training", "ATS integration", "Custom workflows"],
        },
      ],
    },
    results: [
      "Average 4.5 hires/customer/month",
      "Free tier generates 3,200 resume screens/month (marketing funnel)",
      "Pay-per-hire customers convert to Unlimited after ~7 hires",
      "Unlimited tier has 98% retention (too essential to churn)",
    ],
    lessonsLearned: [
      "Success-based pricing removed all risk for customers (no hire = no cost)",
      "Free screening tier was powerful lead magnet — once they see quality, they upgrade",
      "Unlimited tier priced at break-even point for frequent hirers (~5 hires/mo)",
      "Integration with existing ATS was make-or-break for enterprise customers",
    ],
    color: "blue",
  },
  {
    id: "scheduler",
    name: "MeetingMaestro",
    icon: "📅",
    category: "Productivity",
    description: "AI scheduling agent that finds meeting times, manages calendars, and handles rescheduling automatically.",
    pricingModel: "Freemium + Premium Features",
    metrics: {
      mrr: "$18K",
      users: 1240,
      conversionRate: "12%",
      avgRevenuePerUser: "$15",
    },
    pricing: {
      tiers: [
        {
          name: "Free",
          price: "$0",
          features: ["10 meetings/mo", "1 calendar", "Basic preferences", "Email integration"],
        },
        {
          name: "Pro",
          price: "$12/mo",
          features: ["Unlimited meetings", "Multiple calendars", "Smart preferences", "Buffer times", "Meeting templates"],
        },
        {
          name: "Teams",
          price: "$29/user/mo",
          features: ["Everything in Pro", "Team availability", "Round-robin scheduling", "Analytics", "Priority support"],
        },
      ],
    },
    results: [
      "Free tier retention: 76% after 90 days",
      "Primary conversion trigger: hitting 10 meeting/mo limit",
      "Teams tier growing 30% MoM (word-of-mouth in companies)",
      "Annual plan adoption: 41% (vs 15% industry avg)",
    ],
    lessonsLearned: [
      "Low price point ($12) reduced friction — felt like 'Netflix price' not 'SaaS price'",
      "Meeting limit worked better than time limit (clearer value metric)",
      "Teams tier unlocked B2B market we didn't initially target",
      "Calendar integration quality made or broke user experience — had to be perfect",
    ],
    color: "pink",
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-purple/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 right-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-[#06D6A0]/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <Link href="/monetization">
            <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30 cursor-pointer hover:bg-purple-500/30">
              ← Back to Monetization Guide
            </Badge>
          </Link>
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            📊 Agent Revenue Case Studies
          </h1>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            Real-world examples of agents successfully monetizing with different pricing strategies
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Case Studies */}
      <section className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {caseStudies.map((study) => {
          const borderColor = {
            purple: "border-purple-500/30",
            cyan: "border-cyan-500/30",
            green: "border-green-500/30",
            amber: "border-amber-500/30",
            blue: "border-blue-500/30",
            pink: "border-pink-500/30",
          }[study.color];

          const accentColor = {
            purple: "text-purple-400",
            cyan: "text-cyan-400",
            green: "text-green-400",
            amber: "text-amber-400",
            blue: "text-blue-400",
            pink: "text-pink-400",
          }[study.color];

          const bgColor = {
            purple: "bg-purple-500/10",
            cyan: "bg-cyan-500/10",
            green: "bg-green-500/10",
            amber: "bg-amber-500/10",
            blue: "bg-blue-500/10",
            pink: "bg-pink-500/10",
          }[study.color];

          return (
            <div key={study.id} id={study.id}>
              <Card className={`bg-card/30 ${borderColor}`}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl">{study.icon}</span>
                        <div>
                          <CardTitle className="text-2xl">{study.name}</CardTitle>
                          <Badge className={`${bgColor} ${accentColor} border-0 mt-1`}>
                            {study.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-foreground/80">{study.description}</p>
                  <div className={`inline-flex items-center gap-2 ${bgColor} ${accentColor} px-3 py-1.5 rounded-lg text-sm font-semibold mt-3`}>
                    💰 {study.pricingModel}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Metrics */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-3 ${accentColor}`}>Key Metrics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-black/40 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-400">{study.metrics.mrr}</div>
                        <div className="text-xs text-foreground/60">MRR</div>
                      </div>
                      <div className="bg-black/40 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-cyan-400">{study.metrics.users}</div>
                        <div className="text-xs text-foreground/60">Users</div>
                      </div>
                      <div className="bg-black/40 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-purple-400">{study.metrics.conversionRate}</div>
                        <div className="text-xs text-foreground/60">Conversion</div>
                      </div>
                      <div className="bg-black/40 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-amber-400">{study.metrics.avgRevenuePerUser}</div>
                        <div className="text-xs text-foreground/60">ARPU</div>
                      </div>
                    </div>
                  </div>

                  <Separator className="opacity-10" />

                  {/* Pricing Tiers */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-3 ${accentColor}`}>Pricing Tiers</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {study.pricing.tiers.map((tier) => (
                        <div
                          key={tier.name}
                          className="bg-black/40 border border-white/10 rounded-lg p-4"
                        >
                          <div className="font-semibold text-foreground/90 mb-1">{tier.name}</div>
                          <div className={`text-2xl font-bold mb-3 ${accentColor}`}>{tier.price}</div>
                          <ul className="space-y-1.5">
                            {tier.features.map((feature, idx) => (
                              <li key={idx} className="text-xs text-foreground/70 flex items-start gap-2">
                                <span className="text-green-400 mt-0.5">✓</span>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="opacity-10" />

                  {/* Results */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className={`text-lg font-semibold mb-3 ${accentColor}`}>Results</h3>
                      <ul className="space-y-2">
                        {study.results.map((result, idx) => (
                          <li key={idx} className="text-sm text-foreground/80 flex items-start gap-2">
                            <span className="text-green-400 font-bold mt-0.5">▸</span>
                            <span>{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className={`text-lg font-semibold mb-3 ${accentColor}`}>Lessons Learned</h3>
                      <ul className="space-y-2">
                        {study.lessonsLearned.map((lesson, idx) => (
                          <li key={idx} className="text-sm text-foreground/80 flex items-start gap-2">
                            <span className="text-amber-400 font-bold mt-0.5">💡</span>
                            <span>{lesson}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </section>

      <Separator className="opacity-10" />

      {/* Summary */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <Card className="bg-gradient-to-br from-purple/5 via-card/80 to-[#06D6A0]/5 border-[#06D6A0]/30">
          <CardHeader>
            <CardTitle className="text-2xl">Key Takeaways Across All Cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-black/40 rounded-lg p-4">
                <div className="font-semibold text-[#06D6A0] mb-2">✓ What Worked</div>
                <ul className="space-y-1.5 text-sm text-foreground/80">
                  <li>• Free tiers with clear usage limits drive conversion</li>
                  <li>• Value-based pricing beats cost-plus pricing</li>
                  <li>• Three-tier structure with "most popular" badge</li>
                  <li>• Annual discounts improve cash flow & retention</li>
                  <li>• Usage metrics visible to users (transparency builds trust)</li>
                </ul>
              </div>

              <div className="bg-black/40 rounded-lg p-4">
                <div className="font-semibold text-red-400 mb-2">✗ What Didn't</div>
                <ul className="space-y-1.5 text-sm text-foreground/80">
                  <li>• Complex pricing with too many variables confused buyers</li>
                  <li>• "Unlimited" plans without soft limits led to abuse</li>
                  <li>• Pricing too low left money on table</li>
                  <li>• Feature gating alone didn't drive urgency</li>
                  <li>• Hidden fees or surprise charges killed trust</li>
                </ul>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <p className="text-sm font-semibold text-purple-300 mb-2">🎯 Universal Pattern:</p>
              <p className="text-sm text-foreground/80">
                All successful agents aligned pricing with <strong>value delivered</strong> (not costs), 
                used <strong>friction-free trials</strong> to demonstrate that value, and converted users 
                at the moment they experienced a <strong>clear limitation</strong> (usage cap, feature need, quality difference).
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-cyan-500/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Calculate Your Pricing
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Use our calculator to determine optimal pricing for your agent based on these proven patterns.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/monetization/calculator"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Open Pricing Calculator →
              </Link>
              <Link
                href="/monetization"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 font-semibold text-sm hover:bg-purple-500/20 transition-colors"
              >
                Back to Guide
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
