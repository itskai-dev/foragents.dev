import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Contact — forAgents.dev",
  description: "Get in touch with the forAgents.dev team. Send us a message or reach out via email, GitHub, or Twitter.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
