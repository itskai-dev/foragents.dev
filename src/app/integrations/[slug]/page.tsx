import { notFound } from "next/navigation";
import integrationsData from "@/../data/integrations.json";
import { IntegrationDetailClient } from "./integration-detail-client";

type IntegrationCategory = "monitoring" | "storage" | "communication" | "deployment" | "security";

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
  installCount: number;
  rating: {
    average: number;
    count: number;
  };
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
  const integration = integrations.find((item) => item.slug === slug);

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
  const integration = integrations.find((item) => item.slug === slug);

  if (!integration) {
    notFound();
  }

  return <IntegrationDetailClient slug={slug} />;
}
