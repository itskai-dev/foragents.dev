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
import { getAcpAgents } from "@/lib/data";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ACP Agent Directory — forAgents.dev",
  description:
    "Discover Agent Client Protocol (ACP) coding agents for JetBrains IDEs and Zed. Claude Code, Copilot, Gemini, and more — all in one directory.",
  openGraph: {
    title: "ACP Agent Directory — forAgents.dev",
    description:
      "Discover ACP coding agents for JetBrains and Zed. The open standard for AI agents in your IDE.",
  },
};

const licenseColors: Record<string, { bg: string; text: string; border: string }> = {
  "MIT":         { bg: "bg-[#06D6A0]/10", text: "text-[#06D6A0]", border: "border-[#06D6A0]/20" },
  "Apache-2.0":  { bg: "bg-[#3B82F6]/10", text: "text-[#3B82F6]", border: "border-[#3B82F6]/20" },
  "proprietary": { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]", border: "border-[#F59E0B]/20" },
};

const ideColors: Record<string, { bg: string; text: string }> = {
  "JetBrains": { bg: "bg-[#8B5CF6]/20", text: "text-[#8B5CF6]" },
  "Zed":       { bg: "bg-[#EC4899]/20", text: "text-[#EC4899]" },
};

function CopyButton({ text }: { text: string }) {
  return (
    <button
      data-copy={text}
      className="absolute top-2 right-2 text-[10px] font-mono text-muted-foreground hover:text-cyan transition-colors opacity-0 group-hover/cmd:opacity-100 cursor-pointer"
      title="Copy install command"
    >
      📋
    </button>
  );
}

export default function AcpPage() {
  const agents = getAcpAgents();

  return (
    <div className="min-h-screen">
      {/* Header */}

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[40vw] max-w-[800px] max-h-[500px] bg-purple/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/4 w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] bg-cyan/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-[32px] md:text-[42px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-3">
            🤖 ACP Agent Directory
          </h1>
          <p className="text-lg text-foreground/80 mb-2">
            Agent Client Protocol — AI coding agents for your IDE
          </p>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Open standard by JetBrains + Zed. Like LSP, but for AI agents.
            One integration, every editor.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/acp.json" className="font-mono text-xs">
                .json
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/acp.md" className="font-mono text-xs">
                .md
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://agentclientprotocol.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs"
              >
                ACP Docs ↗
              </a>
            </Button>
          </div>

          <p className="mt-4 font-mono text-[13px] text-muted-foreground">
            ── {agents.length} agents indexed ──
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Agent Cards */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid gap-4 md:grid-cols-2">
          {agents.map((agent) => {
            const licenseStyle = licenseColors[agent.license] || licenseColors.proprietary;

            return (
              <Card
                key={agent.id}
                className="bg-card/50 border-white/5 hover:border-cyan/20 transition-all group h-full"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`inline-block font-mono text-[11px] font-bold uppercase tracking-[0.08em] px-2 py-1 rounded-md ${licenseStyle.bg} ${licenseStyle.text} ${licenseStyle.border} border`}
                    >
                      {agent.license}
                    </span>
                    <div className="flex gap-1">
                      {agent.ides.map((ide) => {
                        const ideStyle = ideColors[ide] || ideColors.JetBrains;
                        return (
                          <span
                            key={ide}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded ${ideStyle.bg} ${ideStyle.text}`}
                          >
                            {ide}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg group-hover:text-cyan transition-colors">
                      {agent.name}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground font-mono">
                      v{agent.version}
                    </span>
                  </div>
                  <CardDescription className="text-xs">
                    by {agent.author}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {agent.description}
                  </p>

                  {/* Install command - copyable */}
                  {agent.install_cmd && !agent.install_cmd.startsWith("#") ? (
                    <div className="relative group/cmd">
                      <code className="block text-xs text-green bg-black/30 rounded px-3 py-2 mb-3 overflow-x-auto font-mono">
                        $ {agent.install_cmd}
                      </code>
                      <CopyButton text={agent.install_cmd} />
                    </div>
                  ) : (
                    <div className="relative">
                      <code className="block text-xs text-muted-foreground bg-black/30 rounded px-3 py-2 mb-3 font-mono">
                        Install via ACP Registry in IDE
                      </code>
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex items-center gap-3 mb-3">
                    <a
                      href={agent.repository}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-cyan transition-colors font-mono"
                    >
                      GitHub ↗
                    </a>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {agent.tags.map((tag) => (
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

      {/* What is ACP */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-3">What is ACP?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            The{" "}
            <a
              href="https://agentclientprotocol.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan hover:underline"
            >
              Agent Client Protocol
            </a>{" "}
            is an open standard that lets any AI coding agent work in any supporting editor.
            Think of it like the Language Server Protocol (LSP), but for AI agents.
            Agents implement it once and work everywhere — JetBrains, Zed, and any future editor.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Developed jointly by{" "}
            <a
              href="https://blog.jetbrains.com/ai/2026/01/acp-agent-registry/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan hover:underline"
            >
              JetBrains
            </a>{" "}
            and{" "}
            <a
              href="https://zed.dev/acp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan hover:underline"
            >
              Zed
            </a>
            , ACP eliminates vendor lock-in and lets you choose your preferred agent and editor.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 font-mono text-xs">
            <code className="px-4 py-2 rounded-lg bg-card border border-white/10 text-muted-foreground">
              GET /api/acp.md
            </code>
            <code className="px-4 py-2 rounded-lg bg-card border border-white/10 text-muted-foreground">
              GET /api/acp.json
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
            <a href="/api/acp.md" className="hover:text-cyan transition-colors">
              acp.md
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
