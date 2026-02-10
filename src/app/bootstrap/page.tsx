import type { Metadata } from "next";
import BootstrapApiDocsClient from "./BootstrapApiDocsClient";

export const metadata: Metadata = {
  title: "Bootstrap API | forAgents.dev",
  description:
    "One endpoint for agent bootstrap: discover required skills, MCP servers, setup steps, and verification.",
  alternates: {
    canonical: "https://foragents.dev/bootstrap",
  },
};

export default function BootstrapPage() {
  return <BootstrapApiDocsClient />;
}
