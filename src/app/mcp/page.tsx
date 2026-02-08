import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getMcpServers } from "@/lib/data";
import { McpHubClient } from "@/app/mcp/mcp-client";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCP Hub — MCP Server Directory | forAgents.dev",
  description:
    "A curated directory of Model Context Protocol (MCP) servers: filesystem, search, databases, APIs, and communication tools — all installable with a single command.",
  openGraph: {
    title: "MCP Hub — MCP Server Directory | forAgents.dev",
    description:
      "Browse top MCP servers: filesystem, search, databases, APIs, and communication tools.",
    url: "https://foragents.dev/mcp",
    siteName: "forAgents.dev",
    type: "website",
    images: [
      {
        url: "/api/og/mcp",
        width: 1200,
        height: 630,
        alt: "MCP Hub — MCP Server Directory | forAgents.dev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MCP Hub — MCP Server Directory | forAgents.dev",
    description:
      "Browse top MCP servers: filesystem, search, databases, APIs, and communication tools.",
    images: ["/api/og/mcp"],
  },
};

export default function McpPage() {
  const servers = getMcpServers();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[40vw] max-w-[800px] max-h-[500px] bg-purple/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/4 w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] bg-cyan/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-[32px] md:text-[42px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-3">
            🔌 MCP Hub
          </h1>
          <p className="text-lg text-foreground/80 mb-2">
            Curated MCP servers for AI agents
          </p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Filter by category, search by name, and copy a one-line install command.
            MCP servers let agents securely connect to tools and data sources.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/mcp/servers" className="font-mono text-xs">
                /api/mcp/servers
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/mcp.json" className="font-mono text-xs">
                /api/mcp.json
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/mcp.md" className="font-mono text-xs">
                /api/mcp.md
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://modelcontextprotocol.io"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs"
              >
                MCP Docs ↗
              </a>
            </Button>
          </div>

          <p className="mt-4 font-mono text-[13px] text-muted-foreground">
            ── {servers.length} servers indexed ──
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Directory */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <McpHubClient servers={servers} />
      </section>

      <Separator className="opacity-10" />

      {/* What is MCP */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-3">What is MCP?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            The{" "}
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan hover:underline"
            >
              Model Context Protocol
            </a>{" "}
            is an open standard that lets AI agents connect to tools and data sources.
            MCP servers act as adapters for things like the filesystem, databases, search, and APIs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 font-mono text-xs">
            <code className="px-4 py-2 rounded-lg bg-card border border-white/10 text-muted-foreground">
              GET /api/mcp/servers?category=search
            </code>
            <code className="px-4 py-2 rounded-lg bg-card border border-white/10 text-muted-foreground">
              GET /api/mcp.json
            </code>
          </div>
        </div>
      </section>
    </div>
  );
}
