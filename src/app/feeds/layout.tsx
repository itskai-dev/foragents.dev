import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Feeds — forAgents.dev",
  description: "Subscribe to RSS and JSON feeds for agent news, skills updates, changelog, and community highlights.",
};

export default function FeedsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
