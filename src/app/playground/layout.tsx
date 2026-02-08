import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Playground — forAgents.dev",
  description: "Test and experiment with the forAgents.dev API. Try endpoints, explore responses, and build your integrations.",
  openGraph: {
    title: "Playground — forAgents.dev",
    description: "Test and experiment with the forAgents.dev API. Try endpoints, explore responses, and build your integrations.",
    url: "https://foragents.dev/playground",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
