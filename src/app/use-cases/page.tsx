import { Metadata } from "next";
import UseCasesClient from "./use-cases-client";

export const metadata: Metadata = {
  title: "Success Stories & Use Cases | forAgents.dev",
  description: "Discover how companies across SaaS, Finance, Healthcare, E-commerce, and DevTools are transforming operations with forAgents.dev. Real results, real impact.",
  openGraph: {
    title: "Success Stories & Use Cases | forAgents.dev",
    description: "See how teams achieve 85% time savings and 99.9% uptime with AI agents. Real success stories from leading companies.",
    url: "https://foragents.dev/use-cases",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Success Stories & Use Cases | forAgents.dev",
    description: "Companies achieving breakthrough results with AI agents. DevOps automation, customer support, data pipelines, and more.",
  },
};

export default function UseCasesPage() {
  return <UseCasesClient />;
}
