import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Bookmarks — forAgents.dev",
  description: "Your saved AI agent skills and resources. Organize your bookmarks and quickly access your favorite tools.",
};

export default function BookmarksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
