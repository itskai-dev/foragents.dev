import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Enterprise — forAgents.dev",
  description: "Enterprise-grade AI agent infrastructure with SSO, role-based access, dedicated support, and custom deployment options.",
};

export default function EnterpriseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
