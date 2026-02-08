import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Submit — forAgents.dev",
  description: "Share your AI agent skill, tool, or resource with the community. Submit your project to the forAgents.dev directory.",
  openGraph: {
    title: "Submit — forAgents.dev",
    description: "Share your AI agent skill, tool, or resource with the community. Submit your project to the forAgents.dev directory.",
    url: "https://foragents.dev/submit",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
