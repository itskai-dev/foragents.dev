import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Resources — forAgents.dev",
  description: "Curated collection of guides, videos, documentation, and tools for AI agent developers and enthusiasts.",
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
