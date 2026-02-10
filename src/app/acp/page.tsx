/* eslint-disable react/no-unescaped-entities */

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AcpDirectoryClient, type AcpProtocol } from "@/app/acp/acp-directory-client";
import protocols from "@/data/acp-protocols.json";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ACP Protocol Directory — forAgents.dev",
  description:
    "Browse real Agent Communication Protocol (ACP) specs with category/status filters, adoption counts, and protocol detail views.",
  openGraph: {
    title: "ACP Protocol Directory — forAgents.dev",
    description:
      "Discover real ACP protocols for agent messaging, discovery, auth, and data exchange.",
  },
};

export default function AcpPage() {
  const initialProtocols = (protocols as AcpProtocol[])
    .slice()
    .sort((a, b) => b.adoptionCount - a.adoptionCount);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[40vw] max-w-[800px] max-h-[500px] bg-purple/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/4 w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] bg-cyan/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-[32px] md:text-[42px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-3">
            🛰️ ACP Protocol Directory
          </h1>
          <p className="text-lg text-foreground/80 mb-2">
            Real protocol data for agent messaging, discovery, auth, and data
          </p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Explore live ACP protocol records with adoption-based ranking, quick filtering,
            and protocol detail views directly from the API.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/acp" className="font-mono text-xs">
                /api/acp
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/acp?status=stable" className="font-mono text-xs">
                ?status=stable
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/acp?category=messaging" className="font-mono text-xs">
                ?category=messaging
              </Link>
            </Button>
          </div>

          <p className="mt-4 font-mono text-[13px] text-muted-foreground">
            ── {initialProtocols.length} protocols indexed ──
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-5xl mx-auto px-4 py-12">
        <AcpDirectoryClient initialProtocols={initialProtocols} />
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-3">What is ACP?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            ACP (Agent Communication Protocols) defines shared standards for how agents discover
            each other, authenticate requests, exchange messages, and move structured data.
            Standardized protocols make multi-agent systems portable, composable, and safer.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 font-mono text-xs">
            <code className="px-4 py-2 rounded-lg bg-card border border-white/10 text-muted-foreground">
              GET /api/acp?search=auth&sort=adoption_desc
            </code>
            <code className="px-4 py-2 rounded-lg bg-card border border-white/10 text-muted-foreground">
              GET /api/acp/[slug]
            </code>
          </div>
        </div>
      </section>
    </div>
  );
}
