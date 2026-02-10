/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, Loader2, X } from "lucide-react";

type PlanFeature = {
  name: string;
  included: boolean;
  limit?: string;
};

type PlanPrice = {
  monthly: number | null;
  yearly: number | null;
};

type PricingPlan = {
  name: string;
  slug: string;
  description: string;
  price: PlanPrice;
  features: PlanFeature[];
  limits: Record<string, string>;
  highlighted: boolean;
  interestCount: number;
  ctaLabel: string;
  ctaHref: string;
};

const faqs = [
  {
    question: "Can I switch between monthly and annual billing?",
    answer:
      "Yes! You can switch between monthly and annual billing at any time from your account settings. When upgrading to annual billing, we'll prorate your current subscription and apply the credit to your new plan.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Absolutely. You can cancel your subscription at any time from your account settings with no cancellation fees. You'll retain access to paid features until the end of your current billing period.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied within the first 30 days, contact us at team@foragents.dev for a full refund, no questions asked.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express, Discover) and PayPal. Enterprise customers can also pay via invoice with NET-30 terms.",
  },
];

function getFeatureValue(plan: PricingPlan, featureName: string): PlanFeature | null {
  return plan.features.find((feature) => feature.name === featureName) ?? null;
}

export function PricingContent() {
  const [isYearly, setIsYearly] = useState(false);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [interestLoading, setInterestLoading] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPricing() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/pricing", {
          method: "GET",
          cache: "no-store",
        });

        const data = (await response.json()) as { plans?: PricingPlan[]; error?: string };

        if (!response.ok) {
          throw new Error(data.error || "Failed to load pricing data");
        }

        if (active) {
          setPlans(Array.isArray(data.plans) ? data.plans : []);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load pricing data");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPricing();

    return () => {
      active = false;
    };
  }, []);

  const allFeatureNames = useMemo(() => {
    const names: string[] = [];

    for (const plan of plans) {
      for (const feature of plan.features) {
        if (!names.includes(feature.name)) {
          names.push(feature.name);
        }
      }
    }

    return names;
  }, [plans]);

  async function trackInterest(plan: PricingPlan) {
    if (interestLoading) return;

    setInterestLoading(plan.slug);

    try {
      await fetch("/api/pricing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug: plan.slug }),
      });

      setPlans((currentPlans) =>
        currentPlans.map((currentPlan) =>
          currentPlan.slug === plan.slug
            ? { ...currentPlan, interestCount: currentPlan.interestCount + 1 }
            : currentPlan
        )
      );
    } catch {
      // Intentionally swallow errors so CTA navigation still works.
    } finally {
      setInterestLoading(null);
      window.location.href = plan.ctaHref;
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple/3 rounded-full blur-[140px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <Badge
            variant="outline"
            className="mb-4 text-xs bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30"
          >
            Simple, transparent pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Start free, upgrade when you're ready. Built for developers, agents, and teams who
            want more from their AI toolkit.
          </p>

          <div className="flex items-center justify-center gap-3 mb-2">
            <span
              className={`text-sm font-medium transition-colors ${
                !isYearly ? "text-white" : "text-muted-foreground"
              }`}
            >
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              aria-label="Toggle yearly billing"
            />
            <span
              className={`text-sm font-medium transition-colors ${
                isYearly ? "text-white" : "text-muted-foreground"
              }`}
            >
              Yearly
            </span>
          </div>
          <p className="text-sm text-[#06D6A0]">See yearly savings instantly</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        {loading && (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading plans...
          </div>
        )}

        {!loading && error && (
          <Card className="max-w-2xl mx-auto bg-red-500/10 border-red-500/30">
            <CardContent className="p-6 text-center">
              <p className="text-red-300 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const hasCustomPrice = plan.price.monthly === null || plan.price.yearly === null;
              const monthly = plan.price.monthly ?? 0;
              const yearly = plan.price.yearly ?? 0;
              const shownPrice = hasCustomPrice ? null : isYearly ? yearly : monthly;
              const yearlySavings = !hasCustomPrice ? Math.max(monthly * 12 - yearly, 0) : 0;

              return (
                <Card
                  key={plan.slug}
                  className={`relative ${
                    plan.highlighted
                      ? "bg-gradient-to-br from-[#06D6A0]/10 via-card/80 to-purple/5 border-[#06D6A0]/30"
                      : "bg-card/50 border-white/10"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-[#06D6A0] text-[#0a0a0a] font-semibold px-4">
                        Recommended
                      </Badge>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>

                    <div className="pt-4">
                      {shownPrice === null ? (
                        <div className="text-4xl font-bold text-white">Custom</div>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-2">
                            <div className="text-4xl font-bold text-white">${shownPrice}</div>
                            <div className="text-sm text-muted-foreground">
                              /{isYearly ? "year" : "month"}
                            </div>
                          </div>
                          {isYearly && yearlySavings > 0 && (
                            <div className="text-sm text-[#06D6A0] mt-1">
                              Save ${yearlySavings}/year vs monthly
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features
                        .filter((feature) => feature.included)
                        .slice(0, 6)
                        .map((feature) => (
                          <li key={`${plan.slug}-${feature.name}`} className="flex items-start gap-3">
                            <Check className="w-5 h-5 shrink-0 mt-0.5 text-[#06D6A0]" />
                            <span className="text-sm text-muted-foreground">
                              {feature.name}
                              {feature.limit ? ` (${feature.limit})` : ""}
                            </span>
                          </li>
                        ))}
                    </ul>

                    <Button
                      className={`w-full ${
                        plan.highlighted
                          ? "bg-[#06D6A0] hover:brightness-110 text-[#0a0a0a] font-semibold"
                          : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                      }`}
                      onClick={() => trackInterest(plan)}
                      disabled={interestLoading === plan.slug}
                    >
                      {interestLoading === plan.slug ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> Tracking...
                        </span>
                      ) : (
                        plan.ctaLabel
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      {plan.interestCount} interested this week
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {!loading && !error && plans.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 text-white">Feature Comparison</h2>
            <p className="text-muted-foreground">See exactly what's included in each plan</p>
          </div>

          <div className="max-w-6xl mx-auto overflow-x-auto">
            <Card className="bg-card/50 border-white/10 min-w-[760px]">
              <CardContent className="p-0">
                <div
                  className="grid gap-4 p-6 border-b border-white/5 sticky top-0 bg-card/50 backdrop-blur-sm"
                  style={{ gridTemplateColumns: `2fr repeat(${plans.length}, minmax(110px, 1fr))` }}
                >
                  <div className="text-sm font-semibold text-muted-foreground">Feature</div>
                  {plans.map((plan) => (
                    <div
                      key={`head-${plan.slug}`}
                      className={`text-sm font-semibold text-center ${
                        plan.highlighted ? "text-[#06D6A0]" : "text-muted-foreground"
                      }`}
                    >
                      {plan.name}
                    </div>
                  ))}
                </div>

                {allFeatureNames.map((featureName, index) => (
                  <div
                    key={featureName}
                    className={`grid gap-4 p-6 ${index % 2 === 0 ? "bg-white/[0.01]" : ""}`}
                    style={{ gridTemplateColumns: `2fr repeat(${plans.length}, minmax(110px, 1fr))` }}
                  >
                    <div className="text-sm text-muted-foreground">{featureName}</div>
                    {plans.map((plan) => {
                      const feature = getFeatureValue(plan, featureName);

                      return (
                        <div key={`${plan.slug}-${featureName}`} className="flex justify-center">
                          {!feature || !feature.included ? (
                            <X className="w-5 h-5 text-white/20" />
                          ) : feature.limit ? (
                            <span className="text-sm text-white">{feature.limit}</span>
                          ) : (
                            <Check className="w-5 h-5 text-[#06D6A0]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      <Separator className="opacity-10" />

      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 text-white">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">Everything you need to know about pricing</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={faq.question}
                value={`item-${idx}`}
                className="bg-card/50 border border-white/10 rounded-lg px-6 data-[state=open]:bg-card/70"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  <span className="text-white font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <Button variant="outline" asChild>
            <Link href="/contact" className="text-[#06D6A0] border-[#06D6A0]/30">
              Contact Us
            </Link>
          </Button>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#06D6A0]/10 via-purple/10 to-[#06D6A0]/10 border border-white/10 p-12 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/20 rounded-full blur-[80px]" />
          <div className="relative">
            <h2 className="text-3xl font-bold mb-4 text-white">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of developers building with AI agents. Start free, no credit card
              required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-[#06D6A0] hover:brightness-110 text-[#0a0a0a] font-semibold"
                onClick={() => {
                  const freePlan = plans.find((plan) => plan.slug === "free");
                  if (freePlan) {
                    void trackInterest(freePlan);
                  } else {
                    window.location.href = "/register";
                  }
                }}
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => {
                  const enterprisePlan = plans.find((plan) => plan.slug === "enterprise");
                  if (enterprisePlan) {
                    void trackInterest(enterprisePlan);
                  } else {
                    window.location.href = "/contact";
                  }
                }}
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
