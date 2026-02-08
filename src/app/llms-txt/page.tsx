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
import { getLlmsTxtEntries } from "@/lib/data";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "llms.txt Directory — forAgents.dev",
  description:
    "The first directory of llms.txt files on the web. Discover which sites serve machine-readable documentation for AI agents.",
  openGraph: {
    title: "llms.txt Directory — forAgents.dev",
    description:
      "The first directory of llms.txt files on the web. Discover which sites serve machine-readable documentation for AI agents.",
  },
};

export default function LlmsTxtPage() {
  const entries = getLlmsTxtEntries();

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[40vw] max-w-[800px] max-h-[500px] bg-cyan/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 right-1/4 w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <Badge className="mb-4 bg-cyan/10 text-cyan border-cyan/20 font-mono text-xs">
            FIRST ON THE WEB
          </Badge>
          <h1 className="text-[32px] md:text-[42px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-3">
            📄 llms.txt Directory
          </h1>
          <p className="text-lg text-foreground/80 mb-2">
            The first directory of{" "}
            <code className="text-cyan font-mono text-base">llms.txt</code>{" "}
            files on the web
          </p>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Discover which sites serve machine-readable documentation for AI
            agents. The{" "}
            <a
              href="https://llmstxt.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan hover:underline"
            >
              llms.txt standard
            </a>{" "}
            lets sites provide LLM-friendly content at a well-known URL.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/llms-directory.md" className="font-mono text-xs">
                .md
              </Link>
            </Button>
          </div>

          <p className="mt-4 font-mono text-[13px] text-muted-foreground">
            ── {entries.length} sites indexed ──
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Directory Cards */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid gap-4 md:grid-cols-2">
          {entries.map((entry) => (
            <Card
              key={entry.id}
              className="bg-card/50 border-white/5 hover:border-cyan/20 transition-all group h-full"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-block font-mono text-[11px] font-bold uppercase tracking-[0.08em] px-2 py-1 rounded-md bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20 border">
                    {entry.sections.length} sections
                  </span>
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-cyan transition-colors font-mono"
                  >
                    llms.txt ↗
                  </a>
                </div>
                <CardTitle className="text-lg group-hover:text-cyan transition-colors">
                  {entry.title}
                </CardTitle>
                <CardDescription className="text-xs font-mono">
                  {entry.domain}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {entry.description}
                </p>

                {/* Sections */}
                <div className="flex flex-wrap gap-1.5">
                  {entry.sections.slice(0, 5).map((section) => (
                    <Badge
                      key={section}
                      variant="outline"
                      className="text-[10px] bg-white/5 text-white/60 border-white/10"
                    >
                      {section}
                    </Badge>
                  ))}
                  {entry.sections.length > 5 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-white/5 text-white/40 border-white/10"
                    >
                      +{entry.sections.length - 5} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* What is llms.txt */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-3">What is llms.txt?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            <a
              href="https://llmstxt.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan hover:underline"
            >
              llms.txt
            </a>{" "}
            is a proposed standard for websites to provide LLM-friendly content
            at a well-known URL. Instead of forcing AI agents to parse HTML,
            sites serve a structured markdown file with their key documentation,
            APIs, and resources — making it trivial for agents to understand what
            a site offers.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Think of it like <code className="text-cyan/80 font-mono text-xs">robots.txt</code> but
            for helping AI agents, not restricting them.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 font-mono text-xs">
            <code className="px-4 py-2 rounded-lg bg-card border border-white/10 text-muted-foreground">
              GET /api/llms-directory.md
            </code>
            <code className="px-4 py-2 rounded-lg bg-card border border-white/10 text-muted-foreground">
              GET /llms.txt
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
            <a
              href="/api/llms-directory.md"
              className="hover:text-cyan transition-colors"
            >
              llms-directory.md
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
    </div>
  );
}
