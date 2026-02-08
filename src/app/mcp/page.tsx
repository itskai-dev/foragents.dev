
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CopyButton } from "@/components/copy-button";
import { getMcpServers } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCP Server Directory — forAgents.dev",
  description:
    "Discover Model Context Protocol (MCP) servers for AI agents. Filesystem, search, databases, Git, and more — all installable with a single command.",
  openGraph: {
    title: "MCP Server Directory — forAgents.dev",
    description:
      "Discover MCP servers for AI agents. Tools, data sources, and integrations — all via the Model Context Protocol.",
  },
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  "file-system":    { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]", border: "border-[#F59E0B]/20" },
  "dev-tools":      { bg: "bg-[#8B5CF6]/10", text: "text-[#8B5CF6]", border: "border-[#8B5CF6]/20" },
  "web":            { bg: "bg-[#3B82F6]/10", text: "text-[#3B82F6]", border: "border-[#3B82F6]/20" },
  "data":           { bg: "bg-[#06D6A0]/10", text: "text-[#06D6A0]", border: "border-[#06D6A0]/20" },
  "productivity":   { bg: "bg-[#EC4899]/10", text: "text-[#EC4899]", border: "border-[#EC4899]/20" },
  "communication":  { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]", border: "border-[#F59E0B]/20" },
};


export default function McpPage() {
  const servers = getMcpServers();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-lg font-bold aurora-text">
              ⚡ Agent Hub
            </Link>
            <span className="text-xs text-muted-foreground font-mono">
              forAgents.dev
            </span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/#news"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              News
            </Link>
            <Link
              href="/#skills"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Skills
            </Link>
            <Link
              href="/mcp"
              className="text-foreground font-semibold transition-colors"
            >
              MCP
            </Link>
            <Link
              href="/acp"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ACP
            </Link>
            <Link
              href="/llms-txt"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              llms.txt
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/api/mcp.md"
              className="text-muted-foreground hover:text-cyan font-mono text-xs transition-colors"
            >
              /mcp.md
            </Link>
            <Link
              href="/llms.txt"
              className="text-muted-foreground hover:text-cyan font-mono text-xs transition-colors"
            >
              /llms.txt
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[40vw] max-w-[800px] max-h-[500px] bg-purple/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/4 w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] bg-cyan/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-[32px] md:text-[42px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-3">
            🔌 MCP Server Directory
          </h1>
          <p className="text-lg text-foreground/80 mb-2">
            Model Context Protocol servers for AI agents
          </p>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Tools, data sources, and integrations — all installable with a single command.
            Give your agent superpowers.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/mcp.json" className="font-mono text-xs">
                .json
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/mcp.md" className="font-mono text-xs">
                .md
              </Link>
            </Button>
          </div>

          <p className="mt-4 font-mono text-[13px] text-muted-foreground">
            ── {servers.length} servers indexed ──
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Server Cards */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid gap-4 md:grid-cols-2">
          {servers.map((server) => {
            const catStyle = categoryColors[server.category] || categoryColors.web;

            return (
              <Card
                key={server.id}
                className="bg-card/50 border-white/5 hover:border-cyan/20 transition-all group h-full"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`inline-block font-mono text-[11px] font-bold uppercase tracking-[0.08em] px-2 py-1 rounded-md ${catStyle.bg} ${catStyle.text} ${catStyle.border} border`}
                    >
                      {server.category}
                    </span>
                    <a
                      href={server.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-cyan transition-colors font-mono"
                    >
                      GitHub ↗
                    </a>
                  </div>
                  <CardTitle className="text-lg group-hover:text-cyan transition-colors flex items-center gap-1.5">
                    {server.name}
                    {server.tags.includes("official") && (
                      <Image
                        src="/badges/verified-mcp.svg"
                        alt="Official MCP Server"
                        title="Official: Maintained by MCP team"
                        width={20}
                        height={20}
                        className="w-5 h-5 inline-block"
                      />
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    by {server.author}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {server.description}
                  </p>

                  {/* Install command - copyable */}
                  <div className="relative group/cmd">
                    <code className="block text-xs text-green bg-black/30 rounded px-3 py-2 mb-3 overflow-x-auto font-mono">
                      $ {server.install_cmd}
                    </code>
                    <CopyButton text={server.install_cmd} />
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {server.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-[10px] bg-white/5 text-white/60 border-white/10"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
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
            is an open standard that lets AI agents securely connect to tools and data
            sources. Instead of building custom integrations, agents use MCP servers as
            universal adapters — filesystem, databases, APIs, browsers, and more.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 font-mono text-xs">
            <code className="px-4 py-2 rounded-lg bg-card border border-white/10 text-muted-foreground">
              GET /api/mcp.md
            </code>
            <code className="px-4 py-2 rounded-lg bg-card border border-white/10 text-muted-foreground">
              GET /api/mcp.json
            </code>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Built by</span>
            <a
              href="https://reflectt.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="aurora-text font-semibold hover:opacity-80 transition-opacity"
            >
              Team Reflectt
            </a>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <a href="/llms.txt" className="hover:text-cyan transition-colors">
              llms.txt
            </a>
            <a href="/api/mcp.md" className="hover:text-cyan transition-colors">
              mcp.md
            </a>
            <a
              href="https://github.com/reflectt"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>

      {/* Copy-to-clipboard script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('click', function(e) {
              var btn = e.target.closest('[data-copy]');
              if (btn) {
                navigator.clipboard.writeText(btn.dataset.copy).then(function() {
                  var orig = btn.textContent;
                  btn.textContent = '✅';
                  setTimeout(function() { btn.textContent = orig; }, 1500);
                });
              }
            });
          `,
        }}
      />
    </div>
  );
}
