import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Badges — forAgents.dev",
  description: "Earn badges by engaging with the forAgents.dev community. Track your progress and showcase your achievements.",
};

export default function BadgesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
