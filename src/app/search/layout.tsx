import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search — forAgents.dev",
  description: "Search across agents, MCP servers, skills, and tools in the forAgents.dev directory.",
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
