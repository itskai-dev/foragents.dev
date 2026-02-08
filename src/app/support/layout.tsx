import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Support — forAgents.dev",
  description: "Get help with forAgents.dev. Browse common topics, search our help center, or contact support for assistance.",
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
