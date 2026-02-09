import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import integrationsData from "@/../data/integrations.json";
import { CopyCodeButton } from "./copy-code-button";

type IntegrationCategory = "CI/CD" | "Communication" | "Project Management" | "Cloud" | "AI/ML";

interface Integration {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  type: "API" | "CLI" | "Plugin" | "Webhook";
  category: IntegrationCategory;
  learnMoreUrl: string;
  setupInstructions: string;
  steps: string[];
  codeSnippet: string;
  requiredEnvVars: string[];
  documentation: string;
  featured?: boolean;
}

const integrations: Integration[] = integrationsData as Integration[];

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return integrations.map((integration) => ({
    slug: integration.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const integration = integrations.find((i) => i.slug === slug);

  if (!integration) {
    return {
      title: "Integration Not Found — forAgents.dev",
    };
  }

  return {
    title: `${integration.name} Integration — forAgents.dev`,
    description: integration.description,
    openGraph: {
      title: `${integration.name} Integration — forAgents.dev`,
      description: integration.description,
      url: `https://foragents.dev/integrations/${slug}`,
      siteName: "forAgents.dev",
      type: "website",
    },
  };
}

export default async function IntegrationDetailPage({ params }: Props) {
  const { slug } = await params;
  const integration = integrations.find((i) => i.slug === slug);

  if (!integration) {
    notFound();
  }

  const getTypeBadgeColor = (type: Integration["type"]) => {
    switch (type) {
      case "API":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "CLI":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Plugin":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Webhook":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getCategoryBadgeColor = (category: IntegrationCategory) => {
    switch (category) {
      case "CI/CD":
        return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
      case "Communication":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      case "Project Management":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "Cloud":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case "AI/ML":
        return "bg-violet-500/20 text-violet-400 border-violet-500/30";
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
            <Link href="/integrations" className="hover:text-foreground transition-colors">
              Integrations
            </Link>
            <span>/</span>
            <span className="text-foreground">{integration.name}</span>
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
            <span className="text-6xl">{integration.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC]">
                  {integration.name}
                </h1>
                {integration.featured && (
                  <Badge className="bg-[#06D6A0]/20 text-[#06D6A0] border-[#06D6A0]/30">
                    ★ Featured
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="outline" className={getTypeBadgeColor(integration.type)}>
                  {integration.type}
                </Badge>
                <Badge variant="outline" className={getCategoryBadgeColor(integration.category)}>
                  {integration.category}
                </Badge>
              </div>
              <p className="text-lg text-foreground/80">{integration.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={integration.learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
            >
              Official Documentation ↗
            </a>
            <Link
              href="/integrations"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
            >
              ← Back to Integrations
            </Link>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Setup Instructions */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Setup Instructions</CardTitle>
            <p className="text-muted-foreground">{integration.setupInstructions}</p>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {integration.steps.map((step, index) => (
                <li key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#06D6A0]/20 text-[#06D6A0] flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <p className="flex-1 text-foreground/90 pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>

      {/* Required Environment Variables */}
      {integration.requiredEnvVars.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-12">
          <Card className="bg-card/30 border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl">Required Environment Variables</CardTitle>
              <p className="text-muted-foreground">
                Set these variables in your environment to authenticate and configure the integration.
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-black/40 rounded-lg p-4 font-mono text-sm">
                {integration.requiredEnvVars.map((envVar, index) => (
                  <div key={index} className="py-1">
                    <span className="text-[#06D6A0]">{envVar}</span>
                    <span className="text-muted-foreground">=your_value_here</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Code Example */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Code Example</CardTitle>
            <p className="text-muted-foreground">
              Here&apos;s a quick example to get you started with the {integration.name} integration.
            </p>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-black/60 rounded-lg p-6 overflow-x-auto">
                <code className="text-sm font-mono text-foreground/90">
                  {integration.codeSnippet}
                </code>
              </pre>
              <CopyCodeButton code={integration.codeSnippet} />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Additional Resources */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <Card className="bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5 border-[#06D6A0]/20">
          <CardHeader>
            <CardTitle className="text-2xl">Additional Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href={integration.documentation}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg bg-card/40 border border-white/10 hover:border-[#06D6A0]/30 transition-all group"
            >
              <div>
                <p className="font-semibold text-foreground">Official Documentation</p>
                <p className="text-sm text-muted-foreground">
                  Complete API reference and guides
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
                  Learn how to build AI agents
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
                <p className="font-semibold text-foreground">Need Help?</p>
                <p className="text-sm text-muted-foreground">
                  Contact us for integration support
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
