import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Security — forAgents.dev",
  description: "Learn about our security practices, data protection policies, and responsible disclosure program for AI agent safety.",
};

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
