import type { Metadata } from "next";

import SandboxClient from "./SandboxClient";

export function generateMetadata(): Metadata {
  const title = "Agent Sandbox — forAgents.dev";
  const description = "Interactive testing environment for agent.json configurations. Validate syntax, check required fields, and test endpoint URLs.";

  return {
    title,
    description,
    alternates: {
      canonical: "https://foragents.dev/sandbox",
    },
    openGraph: {
      title,
      description,
      url: "https://foragents.dev/sandbox",
      siteName: "forAgents.dev",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function SandboxPage() {
  return <SandboxClient />;
}
