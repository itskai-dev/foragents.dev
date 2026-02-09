import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import partnersData from "@/data/partners.json";

type PartnerTier = "Gold" | "Silver" | "Bronze" | "Community";
type IntegrationType = "API" | "SDK" | "Plugin" | "Service";

interface Partner {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  fullDescription: string;
  tier: PartnerTier;
  integrationType: IntegrationType;
  features: string[];
  integrationGuide: string;
  docsUrl: string;
  contactEmail: string;
}

const partners: Partner[] = partnersData as Partner[];

interface Props {
  params: Promise<{ slug: string }>;
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

  const getTierBadgeColor = (tier: PartnerTier) => {
    switch (tier) {
      case "Gold":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Silver":
        return "bg-gray-400/20 text-gray-300 border-gray-400/30";
      case "Bronze":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "Community":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getTypeBadgeColor = (type: IntegrationType) => {
    switch (type) {
      case "API":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "SDK":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Plugin":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      case "Service":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Breadcrumb */}
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

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-16">
          <div className="flex items-start gap-6 mb-6">
            <span className="text-6xl">{partner.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC]">
                  {partner.name}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="outline" className={getTierBadgeColor(partner.tier)}>
                  {partner.tier} Partner
                </Badge>
                <Badge variant="outline" className={getTypeBadgeColor(partner.integrationType)}>
                  {partner.integrationType}
                </Badge>
              </div>
              <p className="text-lg text-foreground/80 mb-4">{partner.description}</p>
              <p className="text-foreground/70">{partner.fullDescription}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={partner.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
            >
              View Documentation ↗
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

      {/* Supported Features */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Key Features</CardTitle>
            <p className="text-muted-foreground">
              What you can build with {partner.name}
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {partner.features.map((feature, index) => (
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

      {/* Integration Guide */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Integration Guide</CardTitle>
            <p className="text-muted-foreground">
              Quick start example to integrate {partner.name} with your AI agents
            </p>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-black/60 rounded-lg p-6 overflow-x-auto">
                <code className="text-sm font-mono text-foreground/90 whitespace-pre">
                  {partner.integrationGuide}
                </code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Contact Information */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <Card className="bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5 border-[#06D6A0]/20">
          <CardHeader>
            <CardTitle className="text-2xl">Get in Touch</CardTitle>
            <p className="text-muted-foreground">
              Need help with your integration or have questions?
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href={partner.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg bg-card/40 border border-white/10 hover:border-[#06D6A0]/30 transition-all group"
            >
              <div>
                <p className="font-semibold text-foreground">Official Documentation</p>
                <p className="text-sm text-muted-foreground">
                  Complete guides, API reference, and examples
                </p>
              </div>
              <span className="text-[#06D6A0] group-hover:translate-x-1 transition-transform">
                →
              </span>
            </a>

            <a
              href={`mailto:${partner.contactEmail}`}
              className="flex items-center justify-between p-4 rounded-lg bg-card/40 border border-white/10 hover:border-[#06D6A0]/30 transition-all group"
            >
              <div>
                <p className="font-semibold text-foreground">Partner Support</p>
                <p className="text-sm text-muted-foreground">
                  {partner.contactEmail}
                </p>
              </div>
              <span className="text-[#06D6A0] group-hover:translate-x-1 transition-transform">
                →
              </span>
            </a>

            <Link
              href="/guides"
              className="flex items-center justify-between p-4 rounded-lg bg-card/40 border border-white/10 hover:border-[#06D6A0]/30 transition-all group"
            >
              <div>
                <p className="font-semibold text-foreground">forAgents.dev Guides</p>
                <p className="text-sm text-muted-foreground">
                  Learn how to build AI agents with our partners
                </p>
              </div>
              <span className="text-[#06D6A0] group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>

            <Link
              href="/contact"
              className="flex items-center justify-between p-4 rounded-lg bg-card/40 border border-white/10 hover:border-[#06D6A0]/30 transition-all group"
            >
              <div>
                <p className="font-semibold text-foreground">General Support</p>
                <p className="text-sm text-muted-foreground">
                  Contact forAgents.dev for integration help
                </p>
              </div>
              <span className="text-[#06D6A0] group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
