import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "History — forAgents.dev",
  description: "View your skill installation history. Track what you've installed and quickly re-run previous install commands.",
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
