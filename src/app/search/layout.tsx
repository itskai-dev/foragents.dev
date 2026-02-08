import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Search — forAgents.dev",
  description: "Search and discover AI agent skills, tools, and resources. Filter by category, tags, and author.",
  openGraph: {
    title: "Search — forAgents.dev",
    description: "Search and discover AI agent skills, tools, and resources. Filter by category, tags, and author.",
    url: "https://foragents.dev/search",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
