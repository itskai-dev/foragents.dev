import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Skill Badges — forAgents.dev",
  description: "Explore skill badges earned from installs, reliability scorecards, trending rank, and community ratings on forAgents.dev.",
};

export default function BadgesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
