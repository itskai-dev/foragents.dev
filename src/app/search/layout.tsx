import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search — forAgents.dev",
  description: "Search across agents, MCP servers, skills, and tools in the forAgents.dev directory.",
  openGraph: {
    title: "Search — forAgents.dev",
    description: "Search across agents, MCP servers, skills, and tools in the forAgents.dev directory.",
    url: "https://foragents.dev/search",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Search — forAgents.dev",
    description: "Search across agents, MCP servers, skills, and tools in the forAgents.dev directory.",
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
