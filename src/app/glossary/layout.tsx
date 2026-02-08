import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Glossary — forAgents.dev",
  description: "Comprehensive glossary of AI agent terminology. Learn about agents, autonomy, tool use, protocols, and more.",
};

export default function GlossaryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
