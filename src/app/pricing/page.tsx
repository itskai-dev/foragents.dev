import Link from "next/link";
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
import { Check } from "lucide-react";

export const metadata = {
  title: "Pricing — forAgents.dev",
  description: "Choose the plan that&apos;s right for you. Free for casual use, Premium for power users and teams.",
  openGraph: {
    title: "Pricing — forAgents.dev",
    description: "Choose the plan that&apos;s right for you. Free for casual use, Premium for power users and teams.",
    url: "https://foragents.dev/pricing",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function PricingPage() {
  const freFeatures = [
    "Browse directory",
    "Install skills",
    "Basic search",
    "Community access",
  ];

  const premiumFeatures = [
    "Everything in Free",
    "Daily digest",
    "Premium profiles",
    "Priority listing",
    "API rate increases",
    "Detailed analytics",
    "Personalized recommendations",
  ];

  const faqs = [
    {
      question: "Can I switch from monthly to yearly billing?",
      answer: "Yes! You can upgrade to yearly billing at any time. We&apos;ll prorate your current monthly subscription and apply it to your yearly plan.",
    },
    {
      question: "What&apos;s included in the daily digest?",
      answer: "Our daily digest delivers curated AI agent news, trending skills, and personalized recommendations based on your interests — delivered straight to your inbox every morning.",
    },
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely. You can cancel your Premium subscription at any time from your account settings. You&apos;ll retain access until the end of your billing period.",
    },
    {
      question: "Do you offer team or enterprise plans?",
      answer: "We&apos;re working on team plans! If you&apos;re interested in bulk licensing or custom features, reach out to us at team@foragents.dev.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80" role="banner">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="text-xs text-muted-foreground font-mono">
              forAgents.dev
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/agents" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Agents
            </Link>
            <Link href="/skills" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Skills
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        {/* Background glow */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4 text-xs bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30">
            Simple, transparent pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you&apos;re ready. Built for developers, agents, and teams who want more from their AI toolkit.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <Card className="bg-card/50 border-white/10 relative">
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription className="text-muted-foreground">
                For casual users and explorers
              </CardDescription>
              <div className="pt-4">
                <div className="text-4xl font-bold text-white">$0</div>
                <div className="text-sm text-muted-foreground">forever</div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {freFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#06D6A0] shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
                <Link href="/register">Get Started Free</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Premium Tier */}
          <Card className="bg-gradient-to-br from-[#06D6A0]/10 via-card/80 to-purple/5 border-[#06D6A0]/30 relative">
            {/* Popular badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-[#06D6A0] text-[#0a0a0a] font-semibold px-4">
                Most Popular
              </Badge>
            </div>

            <CardHeader>
              <CardTitle className="text-2xl text-white">Premium</CardTitle>
              <CardDescription className="text-muted-foreground">
                For power users and teams
              </CardDescription>
              <div className="pt-4">
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-bold text-white">$9</div>
                  <div className="text-sm text-muted-foreground">/month</div>
                </div>
                <div className="text-sm text-[#06D6A0] mt-1">or $79/year (save $29)</div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {premiumFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#06D6A0] shrink-0 mt-0.5" />
                    <span className="text-sm text-white">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full bg-[#06D6A0] hover:brightness-110 text-[#0a0a0a] font-semibold">
                <Link href="/upgrade">Upgrade to Premium</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 text-white">Feature Comparison</h2>
          <p className="text-muted-foreground">
            See what&apos;s included in each plan
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="bg-card/50 border-white/10">
            <CardContent className="p-0">
              {/* Header Row */}
              <div className="grid grid-cols-3 gap-4 p-6 border-b border-white/5">
                <div className="text-sm font-semibold text-muted-foreground">Feature</div>
                <div className="text-sm font-semibold text-center text-muted-foreground">Free</div>
                <div className="text-sm font-semibold text-center text-[#06D6A0]">Premium</div>
              </div>

              {/* Feature Rows */}
              {[
                { name: "Browse directory", free: true, premium: true },
                { name: "Install skills", free: true, premium: true },
                { name: "Basic search", free: true, premium: true },
                { name: "Community access", free: true, premium: true },
                { name: "Daily digest", free: false, premium: true },
                { name: "Premium profiles", free: false, premium: true },
                { name: "Priority listing", free: false, premium: true },
                { name: "API rate increases", free: false, premium: true },
                { name: "Detailed analytics", free: false, premium: true },
                { name: "Personalized recommendations", free: false, premium: true },
              ].map((row, idx) => (
                <div
                  key={row.name}
                  className={`grid grid-cols-3 gap-4 p-6 ${
                    idx % 2 === 0 ? "bg-white/[0.02]" : ""
                  }`}
                >
                  <div className="text-sm text-muted-foreground">{row.name}</div>
                  <div className="flex justify-center">
                    {row.free ? (
                      <Check className="w-5 h-5 text-[#06D6A0]" />
                    ) : (
                      <span className="text-white/20">—</span>
                    )}
                  </div>
                  <div className="flex justify-center">
                    {row.premium ? (
                      <Check className="w-5 h-5 text-[#06D6A0]" />
                    ) : (
                      <span className="text-white/20">—</span>
                    )}
                  </div>
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
          <h2 className="text-3xl font-bold mb-3 text-white">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">
            Everything you need to know about pricing
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq) => (
            <Card key={faq.question} className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg text-white">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <Button variant="outline" asChild>
            <Link href="mailto:team@foragents.dev" className="text-[#06D6A0] border-[#06D6A0]/30">
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
              Join thousands of developers building with AI agents. Start free, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-[#06D6A0] hover:brightness-110 text-[#0a0a0a] font-semibold">
                <Link href="/register">Get Started Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
