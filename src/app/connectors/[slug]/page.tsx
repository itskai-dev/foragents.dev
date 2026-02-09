import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import connectorsData from "@/../data/connectors.json";
import { CopyCodeButton } from "./copy-code-button";

type ConnectorCategory = "Development" | "Monitoring" | "Project Management" | "Communication" | "Productivity" | "Payments" | "Deployment" | "Database" | "Analytics";
type AuthType = "OAuth 2.0" | "OAuth 2.0 / API Key" | "API Key" | "Service Token";
type Complexity = "Low" | "Medium" | "High";

interface Connector {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  authType: AuthType;
  category: ConnectorCategory;
  complexity: Complexity;
  featured?: boolean;
  mcpServer: string;
  setupInstructions: string;
  oauthScopes?: string[];
  steps: string[];
  mcpConfig: string;
  envVars: string[];
  useCases: string[];
  relatedSkills: string[];
  documentation: string;
}

const connectors: Connector[] = connectorsData as Connector[];

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return connectors.map((connector) => ({
    slug: connector.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const connector = connectors.find((c) => c.slug === slug);

  if (!connector) {
    return {
      title: "Connector Not Found — forAgents.dev",
    };
  }

  return {
    title: `${connector.name} MCP Connector — forAgents.dev`,
    description: connector.description,
    openGraph: {
      title: `${connector.name} MCP Connector — forAgents.dev`,
      description: connector.description,
      url: `https://foragents.dev/connectors/${slug}`,
      siteName: "forAgents.dev",
      type: "website",
    },
  };
}

export default async function ConnectorDetailPage({ params }: Props) {
  const { slug } = await params;
  const connector = connectors.find((c) => c.slug === slug);

  if (!connector) {
    notFound();
  }

  const getAuthBadgeColor = (authType: AuthType) => {
    if (authType.includes("OAuth")) {
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    } else if (authType === "API Key") {
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    } else {
      return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    }
  };

  const getComplexityBadgeColor = (complexity: Complexity) => {
    switch (complexity) {
      case "Low":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Medium":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "High":
        return "bg-red-500/20 text-red-400 border-red-500/30";
    }
  };

  const getCategoryBadgeColor = (category: ConnectorCategory) => {
    const colors: Record<ConnectorCategory, string> = {
      "Development": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      "Monitoring": "bg-rose-500/20 text-rose-400 border-rose-500/30",
      "Project Management": "bg-amber-500/20 text-amber-400 border-amber-500/30",
      "Communication": "bg-pink-500/20 text-pink-400 border-pink-500/30",
      "Productivity": "bg-teal-500/20 text-teal-400 border-teal-500/30",
      "Payments": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      "Deployment": "bg-violet-500/20 text-violet-400 border-violet-500/30",
      "Database": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      "Analytics": "bg-orange-500/20 text-orange-400 border-orange-500/30"
    };
    return colors[category] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
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
            <Link href="/connectors" className="hover:text-foreground transition-colors">
              Connectors
            </Link>
            <span>/</span>
            <span className="text-foreground">{connector.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-purple/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-16">
          <div className="flex items-start gap-6 mb-6">
            <span className="text-6xl">{connector.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC]">
                  {connector.name}
                </h1>
                {connector.featured && (
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    ★ Featured
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="outline" className={getAuthBadgeColor(connector.authType)}>
                  {connector.authType}
                </Badge>
                <Badge variant="outline" className={getComplexityBadgeColor(connector.complexity)}>
                  Setup: {connector.complexity}
                </Badge>
                <Badge variant="outline" className={getCategoryBadgeColor(connector.category)}>
                  {connector.category}
                </Badge>
              </div>
              <p className="text-lg text-foreground/80 mb-2">{connector.description}</p>
              <p className="text-sm text-muted-foreground font-mono">
                MCP Server: <span className="text-foreground">{connector.mcpServer}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={connector.documentation}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
            >
              Official Documentation ↗
            </a>
            <Link
              href="/connectors/oauth-guide"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 font-semibold text-sm hover:bg-purple-500/20 transition-colors"
            >
              OAuth Guide
            </Link>
            <Link
              href="/connectors"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
            >
              ← All Connectors
            </Link>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Setup Overview */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Setup Overview</CardTitle>
            <p className="text-muted-foreground">{connector.setupInstructions}</p>
          </CardHeader>
        </Card>
      </section>

      {/* OAuth Scopes (if applicable) */}
      {connector.oauthScopes && connector.oauthScopes.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-12">
          <Card className="bg-card/30 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <span className="text-purple-400">🔐</span> OAuth Scopes
              </CardTitle>
              <p className="text-muted-foreground">
                Required permissions for OAuth authorization:
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {connector.oauthScopes.map((scope, index) => (
                  <li key={index} className="flex gap-3 text-sm">
                    <span className="text-purple-400 mt-1">•</span>
                    <span className="text-foreground/90">{scope}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Setup Steps */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Setup Steps</CardTitle>
            <p className="text-muted-foreground">Follow these steps to configure the connector:</p>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {connector.steps.map((step, index) => (
                <li key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm border border-purple-500/30">
                    {index + 1}
                  </div>
                  <p className="flex-1 text-foreground/90 pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>

      {/* Environment Variables */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Environment Variables</CardTitle>
            <p className="text-muted-foreground">
              Configure these environment variables in your agent&apos;s configuration:
            </p>
          </CardHeader>
          <CardContent>
            <div className="bg-black/40 rounded-lg p-4 font-mono text-sm">
              {connector.envVars.map((envVar, index) => (
                <div key={index} className="py-1">
                  <span className="text-purple-400">{envVar}</span>
                  <span className="text-muted-foreground">=your_value_here</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* MCP Server Configuration */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">MCP Server Configuration</CardTitle>
            <p className="text-muted-foreground">
              Add this configuration to your MCP settings file (e.g., claude_desktop_config.json):
            </p>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-black/60 rounded-lg p-6 overflow-x-auto">
                <code className="text-sm font-mono text-foreground/90">
                  {connector.mcpConfig}
                </code>
              </pre>
              <CopyCodeButton code={connector.mcpConfig} />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Use Cases */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Common Use Cases</CardTitle>
            <p className="text-muted-foreground">
              What you can build with this connector:
            </p>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {connector.useCases.map((useCase, index) => (
                <li key={index} className="flex gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
                  <span className="text-[#06D6A0] mt-1">✓</span>
                  <span className="text-foreground/90 text-sm">{useCase}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Related Skills */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Related Skills</CardTitle>
            <p className="text-muted-foreground">
              Enhance your agent with these complementary skills:
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {connector.relatedSkills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Additional Resources */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <Card className="bg-gradient-to-br from-purple/5 via-card/80 to-[#06D6A0]/5 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-2xl">Additional Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href={connector.documentation}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg bg-card/40 border border-white/10 hover:border-purple-500/30 transition-all group"
            >
              <div>
                <p className="font-semibold text-foreground">Official Documentation</p>
                <p className="text-sm text-muted-foreground">
                  Complete API reference and guides
                </p>
              </div>
              <span className="text-purple-400 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </a>

            <Link
              href="/connectors/oauth-guide"
              className="flex items-center justify-between p-4 rounded-lg bg-card/40 border border-white/10 hover:border-purple-500/30 transition-all group"
            >
              <div>
                <p className="font-semibold text-foreground">OAuth Guide for Agents</p>
                <p className="text-sm text-muted-foreground">
                  Learn how agents handle OAuth flows
                </p>
              </div>
              <span className="text-purple-400 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>

            <Link
              href="/connectors/vault"
              className="flex items-center justify-between p-4 rounded-lg bg-card/40 border border-white/10 hover:border-purple-500/30 transition-all group"
            >
              <div>
                <p className="font-semibold text-foreground">Token Vault (Coming Soon)</p>
                <p className="text-sm text-muted-foreground">
                  Secure token storage and automatic refresh
                </p>
              </div>
              <span className="text-purple-400 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>

            <Link
              href="/contact"
              className="flex items-center justify-between p-4 rounded-lg bg-card/40 border border-white/10 hover:border-purple-500/30 transition-all group"
            >
              <div>
                <p className="font-semibold text-foreground">Need Help?</p>
                <p className="text-sm text-muted-foreground">
                  Contact us for connector support
                </p>
              </div>
              <span className="text-purple-400 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
