"use client";

import Link from "next/link";
import { useState } from "react";
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
import { Check, X } from "lucide-react";

const tiers = [
  {
    name: "Free",
    id: "free",
    priceMonthly: 0,
    priceYearly: 0,
    description: "For getting started and exploring",
    features: [
      "100 API calls/day",
      "5 skills",
      "Community support",
      "Basic analytics",
      "Public agent profile",
    ],
    cta: "Get Started",
    ctaHref: "/register",
    popular: false,
  },
  {
    name: "Pro",
    id: "pro",
    priceMonthly: 29,
    priceYearly: 23.2, // 20% discount
    description: "For power users and small teams",
    features: [
      "10,000 API calls/day",
      "Unlimited skills",
      "Priority support",
      "Advanced analytics",
      "Custom domains",
      "Webhook integrations",
      "Team collaboration (up to 5)",
    ],
    cta: "Start Free Trial",
    ctaHref: "/upgrade?plan=pro",
    popular: true,
  },
  {
    name: "Enterprise",
    id: "enterprise",
    priceMonthly: null,
    priceYearly: null,
    description: "For large teams and organizations",
    features: [
      "Unlimited API calls",
      "Unlimited skills",
      "SLA guarantee",
      "Dedicated support",
      "SSO/SAML",
      "Audit logs",
      "Custom integrations",
      "On-premise option",
    ],
    cta: "Contact Sales",
    ctaHref: "/contact?subject=enterprise",
    popular: false,
  },
];

const comparisonFeatures = [
  {
    category: "Usage",
    features: [
      {
        name: "API calls/day",
        free: "100",
        pro: "10,000",
        enterprise: "Unlimited",
      },
      { name: "Skills", free: "5", pro: "Unlimited", enterprise: "Unlimited" },
      {
        name: "Team members",
        free: "1",
        pro: "Up to 5",
        enterprise: "Unlimited",
      },
    ],
  },
  {
    category: "Features",
    features: [
      {
        name: "Public agent profile",
        free: true,
        pro: true,
        enterprise: true,
      },
      { name: "Basic analytics", free: true, pro: true, enterprise: true },
      { name: "Advanced analytics", free: false, pro: true, enterprise: true },
      { name: "Custom domains", free: false, pro: true, enterprise: true },
      {
        name: "Webhook integrations",
        free: false,
        pro: true,
        enterprise: true,
      },
      { name: "SSO/SAML", free: false, pro: false, enterprise: true },
      { name: "Audit logs", free: false, pro: false, enterprise: true },
      { name: "On-premise option", free: false, pro: false, enterprise: true },
    ],
  },
  {
    category: "Support",
    features: [
      { name: "Community support", free: true, pro: true, enterprise: true },
      { name: "Priority support", free: false, pro: true, enterprise: true },
      { name: "Dedicated support", free: false, pro: false, enterprise: true },
      { name: "SLA guarantee", free: false, pro: false, enterprise: true },
    ],
  },
];

const faqs = [
  {
    question: "Can I switch between monthly and annual billing?",
    answer:
      "Yes! You can switch between monthly and annual billing at any time from your account settings. When upgrading to annual billing, we'll prorate your current subscription and apply the credit to your new plan.",
  },
  {
    question: "What happens after my free trial ends?",
    answer:
      "Your Pro trial lasts 14 days with full access to all Pro features. After the trial, you'll be automatically downgraded to the Free plan unless you add a payment method. You won't be charged without your explicit consent.",
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
    question: "How does team collaboration work?",
    answer:
      "Pro plans include up to 5 team members with shared access to skills, analytics, and integrations. Each member gets their own login and can be assigned different permission levels. Enterprise plans support unlimited team members.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express, Discover) and PayPal. Enterprise customers can also pay via invoice with NET-30 terms.",
  },
];

export function PricingContent() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        {/* Background glow */}
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Start free, upgrade when you&apos;re ready. Built for developers,
            agents, and teams who want more from their AI toolkit.
          </p>

          {/* Billing Toggle */}
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
          <p className="text-sm text-[#06D6A0]">Save 20% with annual billing</p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => {
            const price =
              tier.priceMonthly === null
                ? null
                : isYearly
                  ? tier.priceYearly
                  : tier.priceMonthly;
            const isPro = tier.id === "pro";

            return (
              <Card
                key={tier.id}
                className={`relative ${
                  isPro
                    ? "bg-gradient-to-br from-[#06D6A0]/10 via-card/80 to-purple/5 border-[#06D6A0]/30"
                    : "bg-card/50 border-white/10"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#06D6A0] text-[#0a0a0a] font-semibold px-4">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl text-white">
                    {tier.name}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {tier.description}
                  </CardDescription>
                  <div className="pt-4">
                    {price === null ? (
                      <div className="text-4xl font-bold text-white">Custom</div>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-2">
                          <div className="text-4xl font-bold text-white">
                            ${Math.round(price)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            /{isYearly ? "year" : "month"}
                          </div>
                        </div>
                        {isYearly && price > 0 && (
                          <div className="text-sm text-[#06D6A0] mt-1">
                            ${tier.priceMonthly}/mo billed annually
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check
                          className={`w-5 h-5 shrink-0 mt-0.5 ${
                            isPro ? "text-[#06D6A0]" : "text-[#06D6A0]"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            isPro ? "text-white" : "text-muted-foreground"
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className={`w-full ${
                      isPro
                        ? "bg-[#06D6A0] hover:brightness-110 text-[#0a0a0a] font-semibold"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    }`}
                  >
                    <Link href={tier.ctaHref}>{tier.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 text-white">
            Feature Comparison
          </h2>
          <p className="text-muted-foreground">
            See what&apos;s included in each plan
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Card className="bg-card/50 border-white/10">
            <CardContent className="p-0">
              {/* Header Row */}
              <div className="grid grid-cols-4 gap-4 p-6 border-b border-white/5 sticky top-0 bg-card/50 backdrop-blur-sm">
                <div className="text-sm font-semibold text-muted-foreground">
                  Feature
                </div>
                <div className="text-sm font-semibold text-center text-muted-foreground">
                  Free
                </div>
                <div className="text-sm font-semibold text-center text-[#06D6A0]">
                  Pro
                </div>
                <div className="text-sm font-semibold text-center text-muted-foreground">
                  Enterprise
                </div>
              </div>

              {/* Feature Rows by Category */}
              {comparisonFeatures.map((category) => (
                <div key={category.category}>
                  <div className="px-6 py-4 bg-white/[0.02]">
                    <h3 className="text-sm font-semibold text-white">
                      {category.category}
                    </h3>
                  </div>
                  {category.features.map((feature, idx) => (
                    <div
                      key={feature.name}
                      className={`grid grid-cols-4 gap-4 p-6 ${
                        idx % 2 === 0 ? "bg-white/[0.01]" : ""
                      }`}
                    >
                      <div className="text-sm text-muted-foreground">
                        {feature.name}
                      </div>
                      <div className="flex justify-center">
                        {typeof feature.free === "boolean" ? (
                          feature.free ? (
                            <Check className="w-5 h-5 text-[#06D6A0]" />
                          ) : (
                            <X className="w-5 h-5 text-white/20" />
                          )
                        ) : (
                          <span className="text-sm text-white">
                            {feature.free}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-center">
                        {typeof feature.pro === "boolean" ? (
                          feature.pro ? (
                            <Check className="w-5 h-5 text-[#06D6A0]" />
                          ) : (
                            <X className="w-5 h-5 text-white/20" />
                          )
                        ) : (
                          <span className="text-sm text-white">
                            {feature.pro}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-center">
                        {typeof feature.enterprise === "boolean" ? (
                          feature.enterprise ? (
                            <Check className="w-5 h-5 text-[#06D6A0]" />
                          ) : (
                            <X className="w-5 h-5 text-white/20" />
                          )
                        ) : (
                          <span className="text-sm text-white">
                            {feature.enterprise}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about pricing
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="bg-card/50 border border-white/10 rounded-lg px-6 data-[state=open]:bg-card/70"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  <span className="text-white font-semibold">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <Button variant="outline" asChild>
            <Link
              href="/contact"
              className="text-[#06D6A0] border-[#06D6A0]/30"
            >
              Contact Us
            </Link>
          </Button>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#06D6A0]/10 via-purple/10 to-[#06D6A0]/10 border border-white/10 p-12 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/20 rounded-full blur-[80px]" />
          <div className="relative">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of developers building with AI agents. Start free,
              no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-[#06D6A0] hover:brightness-110 text-[#0a0a0a] font-semibold"
              >
                <Link href="/register">Get Started Free</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
