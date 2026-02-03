import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit — forAgents.dev",
  description: "Submit your agent, MCP server, or skill to the forAgents.dev directory.",
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
