import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Roadmap — forAgents.dev",
  description: "See what's planned, in progress, and recently shipped for forAgents.dev. Vote on upcoming features and improvements.",
  openGraph: {
    title: "Roadmap — forAgents.dev",
    description: "See what's planned, in progress, and recently shipped for forAgents.dev. Vote on upcoming features and improvements.",
    url: "https://foragents.dev/roadmap",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
