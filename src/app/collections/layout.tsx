import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Collections — forAgents.dev",
  description: "Organize and curate your favorite agent skills, tools, and resources into shareable collections.",
};

export default function CollectionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
