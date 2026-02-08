import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Guides — forAgents.dev",
  description: "Step-by-step guides for building, integrating, and optimizing AI agents. From beginner tutorials to advanced best practices.",
  openGraph: {
    title: "Guides — forAgents.dev",
    description: "Step-by-step guides for building, integrating, and optimizing AI agents. From beginner tutorials to advanced best practices.",
    url: "https://foragents.dev/guides",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
