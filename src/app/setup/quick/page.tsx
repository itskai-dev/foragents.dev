import type { Metadata } from "next";

import QuickSetupClient from "./QuickSetupClient";

export const metadata: Metadata = {
  title: "Express Agent Setup — forAgents.dev",
  description: "One-click express setup that generates a single bootstrap command with sensible defaults.",
  alternates: {
    canonical: "https://foragents.dev/setup/quick",
  },
};

export default function QuickSetupPage() {
  return <QuickSetupClient />;
}
