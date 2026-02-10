import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Users, Zap, Award } from "lucide-react";

export const metadata = {
  title: "Sponsor the Agent Ecosystem — forAgents.dev",
  description:
    "Support the future of AI agents. Help us build tools, resources, and community infrastructure for agent developers worldwide.",
};

type Partner = {
  id: string;
  name: string;
  icon: string;
  tier: string;
  website: string;
  type: "partner" | "sponsor";
  description: string;
};

const PARTNERS_PATH = path.join(process.cwd(), "data", "partners.json");

async function readSponsors(): Promise<Partner[]> {
  try {
    const raw = await fs.readFile(PARTNERS_PATH, "utf-8");
    const partners = JSON.parse(raw) as Partner[];
    if (!Array.isArray(partners)) return [];
    return partners.filter((partner) => partner.type === "sponsor");
  } catch {
    return [];
  }
}

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
];

const whySponsorReasons = [
  {
    icon: Sparkles,
    title: "Visibility",
    description:
      "Get your brand in front of thousands of agent developers and AI-forward engineering teams.",
  },
  {
    icon: Zap,
    title: "Priority Support",
    description:
      "Direct access to our core team, priority bug fixes, and influence over roadmap priorities.",
  },
  {
    icon: Award,
    title: "Early Access",
    description:
      "Be first to test new features, tools, and integrations before public release.",
  },
  {
    icon: Users,
    title: "Community Recognition",
    description:
      "Join a select group of sponsors recognized across forAgents.dev and community channels.",
  },
];

function getTierBadgeColor(tier: string) {
  switch (tier) {
    case "Gold":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Silver":
      return "bg-gray-400/20 text-gray-300 border-gray-400/30";
    case "Bronze":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    default:
      return "bg-muted text-muted-foreground border-muted-foreground/30";
  }
}

export default async function SponsorPage() {
  const sponsors = await readSponsors();

  return (
    <div className="min-h-screen">
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
            Sponsorship helps us maintain free tools, resources, and infrastructure for the agent developer community.
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F8FAFC] mb-4">Sponsor Tiers</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the tier that matches your goals. Every contribution helps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`border-white/10 ${tier.featured ? "bg-cyan/5 border-cyan/30" : "bg-card/40"} flex flex-col`}
            >
              <CardHeader>
                <CardTitle className="text-xl text-[#F8FAFC]">{tier.name}</CardTitle>
                <div className="pt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-cyan">${tier.price}</span>
                  <span className="text-muted-foreground">/{tier.period}</span>
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

                <Link href="/partners#apply">
                  <Button
                    className={`w-full ${tier.featured ? "bg-cyan text-black hover:bg-cyan/90" : "border-cyan text-cyan hover:bg-cyan/10"} font-mono`}
                    variant={tier.featured ? "default" : "outline"}
                  >
                    Apply
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F8FAFC] mb-4">Why Sponsor?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {whySponsorReasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <Card key={reason.title} className="border-white/10 bg-card/40">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-cyan" />
                    </div>
                    <CardTitle className="text-xl text-[#F8FAFC]">{reason.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/90 leading-relaxed">{reason.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F8FAFC] mb-4">Current Sponsors</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Live data from data/partners.json filtered by sponsor type.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {sponsors.map((sponsor) => (
            <Card key={sponsor.id} className="border-white/10 bg-card/40 hover:bg-card/60 transition-colors group">
              <CardContent className="pt-6">
                <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="aspect-[2/1] bg-muted/20 rounded-lg mb-4 flex items-center justify-center text-4xl">
                    {sponsor.icon}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-[#F8FAFC] group-hover:text-cyan transition-colors">
                      {sponsor.name}
                    </h3>
                    <Badge variant="outline" className={`text-xs ${getTierBadgeColor(sponsor.tier)}`}>
                      {sponsor.tier}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{sponsor.description}</p>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/partners#apply">
            <Button className="bg-cyan text-black hover:bg-cyan/90 font-mono" size="lg">
              Become a Sponsor
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
