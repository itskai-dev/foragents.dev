import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Learn — forAgents.dev",
  description: "Interactive learning tracks for AI agent development. From beginner basics to advanced techniques and real-world projects.",
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
