import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Users, Zap, Award } from "lucide-react";
import sponsorsData from "@/data/sponsors.json";

export const metadata = {
  title: "Sponsor the Agent Ecosystem — forAgents.dev",
  description:
    "Support the future of AI agents. Help us build tools, resources, and community infrastructure for agent developers worldwide.",
  openGraph: {
    title: "Sponsor the Agent Ecosystem — forAgents.dev",
    description:
      "Support the future of AI agents. Help us build tools, resources, and community infrastructure for agent developers worldwide.",
    url: "https://foragents.dev/sponsor",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Sponsor the Agent Ecosystem — forAgents.dev",
    description:
      "Support the future of AI agents. Help us build tools, resources, and community infrastructure for agent developers worldwide.",
  },
};

type Sponsor = {
  id: string;
  name: string;
  logo: string;
  tier: string;
  website: string;
  since: string;
};

const sponsors = sponsorsData as Sponsor[];

const tiers = [
  {
    name: "Individual",
    price: 5,
    period: "mo",
    benefits: [
      "Supporter badge on your profile",
      "Early access to new features",
      "Exclusive community updates",
      "Voting rights on roadmap priorities",
    ],
  },
  {
    name: "Team",
    price: 25,
    period: "mo",
    benefits: [
      "Everything in Individual",
      "Team logo in sponsors section",
      "Priority support channel",
      "Monthly sponsor-only office hours",
      "Beta access to enterprise features",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    price: 100,
    period: "mo",
    benefits: [
      "Everything in Team",
      "Featured placement on homepage",
      "Dedicated account manager",
      "Custom integration support",
      "Co-marketing opportunities",
      "Annual strategic planning session",
    ],
  },
  {
    name: "Custom",
    price: null,
    period: null,
    benefits: [
      "Tailored sponsorship package",
      "Custom brand placement",
      "Speaking opportunities at events",
      "White-label solutions available",
      "Direct engineering collaboration",
    ],
  },
];

const whySponsorReasons = [
  {
    icon: Sparkles,
    title: "Visibility",
    description:
      "Get your brand in front of thousands of agent developers, AI researchers, and forward-thinking engineering teams.",
  },
  {
    icon: Zap,
    title: "Priority Support",
    description:
      "Direct access to our core team, priority bug fixes, and influence over the product roadmap.",
  },
  {
    icon: Award,
    title: "Early Access",
    description:
      "Be the first to test new features, tools, and integrations before they're publicly released.",
  },
  {
    icon: Users,
    title: "Community Recognition",
    description:
      "Join a select group of sponsors recognized across our platform, documentation, and community spaces.",
  },
];

const impactStats = [
  { label: "Skills Funded", value: "127" },
  { label: "Agents Supported", value: "2,400+" },
  { label: "Community Members", value: "18,000+" },
  { label: "Countries Reached", value: "94" },
];

function getTierBadgeColor(tier: string) {
  switch (tier) {
    case "Enterprise":
      return "bg-purple/20 text-purple border-purple/30";
    case "Team":
      return "bg-cyan/20 text-cyan border-cyan/30";
    case "Individual":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    default:
      return "bg-muted text-muted-foreground border-muted-foreground/30";
  }
}

export default function SponsorPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-cyan/5 rounded-full blur-[140px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[520px] max-h-[520px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#F8FAFC] mb-6">
            Support the Agent Ecosystem
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            forAgents.dev is built by the community, for the community. Your
            sponsorship helps us maintain free tools, resources, and
            infrastructure that empower thousands of agent developers worldwide.
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Impact Stats */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {impactStats.map((stat) => (
            <Card
              key={stat.label}
              className="border-white/10 bg-card/40 text-center"
            >
              <CardContent className="pt-6">
                <div className="text-3xl md:text-4xl font-bold text-cyan mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Sponsor Tiers */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F8FAFC] mb-4">
            Sponsor Tiers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the tier that aligns with your goals and budget. Every
            contribution makes a difference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`border-white/10 ${
                tier.featured
                  ? "bg-cyan/5 border-cyan/30 relative"
                  : "bg-card/40"
              } hover:bg-card/60 transition-colors flex flex-col`}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-cyan text-black border-0 font-mono text-xs">
                    POPULAR
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-xl text-[#F8FAFC]">
                  {tier.name}
                </CardTitle>
                <div className="pt-2">
                  {tier.price !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-cyan">
                        ${tier.price}
                      </span>
                      <span className="text-muted-foreground">/{tier.period}</span>
                    </div>
                  ) : (
                    <div className="text-4xl font-bold text-cyan">Custom</div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-6 flex-1">
                  {tier.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-cyan shrink-0 mt-0.5" />
                      <span className="text-foreground/90">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    tier.featured
                      ? "bg-cyan text-black hover:bg-cyan/90"
                      : "border-cyan text-cyan hover:bg-cyan/10"
                  } font-mono`}
                  variant={tier.featured ? "default" : "outline"}
                >
                  {tier.price !== null ? "Sponsor" : "Contact Us"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Why Sponsor */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F8FAFC] mb-4">
            Why Sponsor?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sponsoring forAgents.dev is an investment in the future of AI
            development and your organization&apos;s presence in this rapidly
            growing space.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {whySponsorReasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <Card
                key={reason.title}
                className="border-white/10 bg-card/40 hover:bg-card/60 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-cyan" />
                    </div>
                    <CardTitle className="text-xl text-[#F8FAFC]">
                      {reason.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/90 leading-relaxed">
                    {reason.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Current Sponsors */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F8FAFC] mb-4">
            Our Sponsors
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Thank you to these amazing organizations and individuals supporting
            the agent ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {sponsors.map((sponsor) => (
            <Card
              key={sponsor.id}
              className="border-white/10 bg-card/40 hover:bg-card/60 transition-colors group"
            >
              <CardContent className="pt-6">
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="aspect-[2/1] bg-muted/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                    <Image
                      src={sponsor.logo}
                      alt={`${sponsor.name} logo`}
                      width={240}
                      height={120}
                      className="max-w-full max-h-full object-contain p-4 group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-[#F8FAFC] group-hover:text-cyan transition-colors">
                      {sponsor.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getTierBadgeColor(sponsor.tier)}`}
                    >
                      {sponsor.tier}
                    </Badge>
                  </div>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-6">
            Want to see your organization here?
          </p>
          <Button
            className="bg-cyan text-black hover:bg-cyan/90 font-mono"
            size="lg"
          >
            Become a Sponsor
          </Button>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Footer CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#F8FAFC] mb-4">
          Ready to make an impact?
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Join us in building the future of AI agent development. Every
          contribution helps us create better tools and resources for the
          community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            className="bg-cyan text-black hover:bg-cyan/90 font-mono"
            size="lg"
          >
            Choose a Tier
          </Button>
          <Link href="/contact">
            <Button
              variant="outline"
              className="border-cyan text-cyan hover:bg-cyan/10 font-mono w-full sm:w-auto"
              size="lg"
            >
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
