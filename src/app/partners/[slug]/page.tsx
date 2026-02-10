/* eslint-disable react/no-unescaped-entities */
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import partnersData from "@/data/partners.json";

type PartnerTier = "founding" | "gold" | "silver" | "community";

interface Partner {
  name: string;
  slug: string;
  website: string;
  description: string;
  logo: string;
  tier: PartnerTier;
  featured: boolean;
  joinedAt: string;
  fullDescription?: string;
  features?: string[];
  integrationGuide?: string;
  docsUrl?: string;
  contactEmail?: string;
}

const partners: Partner[] = partnersData as Partner[];

interface Props {
  params: Promise<{ slug: string }>;
}

const tierLabels: Record<PartnerTier, string> = {
  founding: "Founding",
  gold: "Gold",
  silver: "Silver",
  community: "Community",
};

function getTierBadgeColor(tier: PartnerTier) {
  switch (tier) {
    case "founding":
      return "bg-purple-500/20 text-purple-300 border-purple-400/40";
    case "gold":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-400/40";
    case "silver":
      return "bg-slate-500/20 text-slate-200 border-slate-400/40";
    case "community":
      return "bg-cyan-500/20 text-cyan-300 border-cyan-400/40";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

export async function generateStaticParams() {
  return partners.map((partner) => ({
    slug: partner.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const partner = partners.find((p) => p.slug === slug);

  if (!partner) {
    return {
      title: "Partner Not Found — forAgents.dev",
    };
  }

  return {
    title: `${partner.name} — forAgents.dev Partners`,
    description: partner.description,
    openGraph: {
      title: `${partner.name} — forAgents.dev Partners`,
      description: partner.description,
      url: `https://foragents.dev/partners/${slug}`,
      siteName: "forAgents.dev",
      type: "website",
    },
  };
}

export default async function PartnerDetailPage({ params }: Props) {
  const { slug } = await params;
  const partner = partners.find((p) => p.slug === slug);

  if (!partner) {
    notFound();
  }

  const docsUrl = partner.docsUrl ?? partner.website;
  const contactEmail = partner.contactEmail ?? "partners@foragents.dev";
  const features = partner.features ?? [
    "Dedicated onboarding support",
    "Partner directory listing",
    "Cross-promotion opportunities",
  ];
  const integrationGuide =
    partner.integrationGuide ??
    `# ${partner.name} integration\nVisit docs and follow the quickstart for your stack.`;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/partners" className="hover:text-foreground transition-colors">
              Partners
            </Link>
            <span>/</span>
            <span className="text-foreground">{partner.name}</span>
          </nav>
        </div>
      </div>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-16">
          <div className="flex items-start gap-6 mb-6">
            <div
              className="h-20 w-20 rounded-xl border border-white/10 bg-cover bg-center"
              style={{ backgroundImage: `url('${partner.logo}')` }}
              aria-label={`${partner.name} logo`}
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC]">{partner.name}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="outline" className={getTierBadgeColor(partner.tier)}>
                  {tierLabels[partner.tier]} Partner
                </Badge>
                {partner.featured && (
                  <Badge variant="outline" className="border-[#06D6A0]/40 text-[#8af5d8]">
                    Featured
                  </Badge>
                )}
              </div>
              <p className="text-lg text-foreground/80 mb-4">{partner.description}</p>
              <p className="text-foreground/70">{partner.fullDescription ?? partner.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
            >
              Visit Website ↗
            </a>
            <Link
              href="/partners"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
            >
              ← Back to Partners
            </Link>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Key Features</CardTitle>
            <p className="text-muted-foreground">What you can build with {partner.name}</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#06D6A0]/20 flex items-center justify-center mt-0.5">
                    <span className="text-[#06D6A0] text-sm">✓</span>
                  </div>
                  <span className="text-foreground/90">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-12">
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Integration Guide</CardTitle>
            <p className="text-muted-foreground">Quick start example to integrate {partner.name}</p>
          </CardHeader>
          <CardContent>
            <pre className="bg-black/60 rounded-lg p-6 overflow-x-auto">
              <code className="text-sm font-mono text-foreground/90 whitespace-pre">{integrationGuide}</code>
            </pre>
          </CardContent>
        </Card>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-16">
        <Card className="bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5 border-[#06D6A0]/20">
          <CardHeader>
            <CardTitle className="text-2xl">Get in Touch</CardTitle>
            <p className="text-muted-foreground">Questions about collaborating with {partner.name}?</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg bg-card/40 border border-white/10 hover:border-[#06D6A0]/30 transition-all group"
            >
              <div>
                <p className="font-semibold text-foreground">Partner Website</p>
                <p className="text-sm text-muted-foreground">{partner.website}</p>
              </div>
              <span className="text-[#06D6A0] group-hover:translate-x-1 transition-transform">→</span>
            </a>

            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center justify-between p-4 rounded-lg bg-card/40 border border-white/10 hover:border-[#06D6A0]/30 transition-all group"
            >
              <div>
                <p className="font-semibold text-foreground">Partner Contact</p>
                <p className="text-sm text-muted-foreground">{contactEmail}</p>
              </div>
              <span className="text-[#06D6A0] group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
