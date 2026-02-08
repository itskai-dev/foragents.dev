import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Integrations — forAgents.dev",
  description: "Connect your AI agents with GitHub, Slack, Notion, AWS, and more. Explore APIs, CLIs, plugins, and webhooks.",
};

export default function IntegrationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
