import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Rocket } from "lucide-react";

import { getMacroToolById, getMacroTools, type MacroTool } from "@/lib/macroTools";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CopyYamlButton } from "@/app/macros/[id]/copy-yaml-button";

export const revalidate = 300;

function buildReflecttMacroUrl({ id, name }: { id: string; name: string }): string {
  const url = new URL("https://chat.reflectt.ai");
  url.searchParams.set("macro", id);
  url.searchParams.set("source", "foragents");
  url.searchParams.set("name", name);
  return url.toString();
}

function yamlStr(s: string): string {
  // Always quote to keep YAML output predictable.
  return JSON.stringify(s);
}

function macroToYaml(m: MacroTool): string {
  const lines: string[] = [];
  lines.push(`id: ${yamlStr(m.id)}`);
  lines.push(`name: ${yamlStr(m.name)}`);
  lines.push(`description: ${yamlStr(m.description)}`);
  lines.push(`author: ${yamlStr(m.author)}`);
  lines.push(`createdAt: ${yamlStr(m.createdAt)}`);
  lines.push(`installs: ${m.installs}`);

  lines.push("tags:");
  for (const t of m.tags) lines.push(`  - ${yamlStr(t)}`);

  lines.push("steps:");
  for (const s of m.steps) {
    lines.push("  - tool: " + yamlStr(s.tool));
    lines.push("    server: " + yamlStr(s.server));
    lines.push("    description: " + yamlStr(s.description));
  }

  return lines.join("\n") + "\n";
}

function relatedMacros(current: MacroTool, all: MacroTool[]): MacroTool[] {
  const tags = new Set(current.tags.map((t) => t.toLowerCase()));
  return all
    .filter((m) => m.id !== current.id)
    .map((m) => ({
      macro: m,
      score: m.tags.reduce((sum, t) => sum + (tags.has(t.toLowerCase()) ? 1 : 0), 0),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.macro.installs ?? 0) - (a.macro.installs ?? 0);
    })
    .slice(0, 3)
    .map((x) => x.macro);
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const macro = getMacroToolById(params.id);
  if (!macro) return { title: "Macro Not Found" };

  const title = `${macro.name} — Macro Tool — forAgents.dev`;
  const description = macro.description;
  const url = `https://foragents.dev/macros/${macro.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "forAgents.dev",
      type: "article",
      images: [
        {
          url: `/api/og/macros/${macro.id}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og/macros/${macro.id}`],
    },
  };
}

export default async function MacroDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const macro = getMacroToolById(id);
  if (!macro) return notFound();

  const yaml = macroToYaml(macro);
  const reflecttUrl = buildReflecttMacroUrl({ id: macro.id, name: macro.name });

  const all = getMacroTools();
  const related = relatedMacros(macro, all);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="max-w-3xl">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{macro.name}</h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{macro.description}</p>

            <div className="flex flex-wrap gap-2 mt-4">
              {macro.tags.map((t) => (
                <Badge
                  key={t}
                  variant="outline"
                  className="text-xs bg-white/5 text-white/70 border-white/10"
                >
                  {t}
                </Badge>
              ))}
            </div>

            <div className="text-xs text-muted-foreground mt-4 flex flex-wrap items-center gap-2">
              <span className="font-mono">{macro.steps.length} steps</span>
              <span className="text-white/20">•</span>
              <span className="font-mono text-cyan">{macro.installs} installs</span>
              <span className="text-white/20">•</span>
              <span>by {macro.author}</span>
              <span className="text-white/20">•</span>
              <span className="font-mono">{macro.createdAt}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild className="gap-2">
              <a href={reflecttUrl} target="_blank" rel="noopener noreferrer" title="Open in chat.reflectt.ai">
                <Rocket className="size-4" />
                Run in Reflectt
              </a>
            </Button>
            <CopyYamlButton yaml={yaml} />
          </div>
        </div>

        <div className="mt-6">
          <Link href="/macros" className="text-sm text-cyan hover:underline">
            ← Back to macros
          </Link>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Pipeline */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h2 className="text-xl font-bold">Pipeline</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Steps execute in order (1 → {macro.steps.length}).
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          {macro.steps.map((s, idx) => (
            <div key={`${s.server}:${s.tool}:${idx}`} className="flex items-stretch gap-3">
              <div className="w-10 shrink-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/20 text-cyan flex items-center justify-center font-mono text-sm">
                  {idx + 1}
                </div>
              </div>

              <Card className="flex-1 bg-card/50 border-white/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="font-mono text-cyan">{s.tool}</span>
                    <span className="text-white/20">@</span>
                    <span className="font-mono text-white/70">{s.server}</span>
                  </CardTitle>
                  <CardDescription className="text-xs">{s.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xs text-muted-foreground">
                    MCP server: <span className="font-mono text-foreground">{s.server}</span>
                  </div>
                </CardContent>
              </Card>

              {idx < macro.steps.length - 1 ? (
                <div className="w-10 shrink-0 hidden md:flex items-center justify-center text-white/30" aria-hidden>
                  <ArrowRight className="size-5" />
                </div>
              ) : (
                <div className="w-10 shrink-0 hidden md:block" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 text-xs text-muted-foreground">
          Tip: macros are just compositions — you can swap tools/servers to fit your stack.
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Related */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h2 className="text-xl font-bold">Related macros</h2>
            <p className="text-sm text-muted-foreground mt-1">More workflows with overlapping tags.</p>
          </div>
        </div>

        {related.length === 0 ? (
          <div className="text-sm text-muted-foreground">No related macros yet.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {related.map((m) => (
              <Link key={m.id} href={`/macros/${m.id}`}>
                <Card className="bg-card/50 border-white/5 hover:border-cyan/20 transition-all group h-full">
                  <CardHeader>
                    <CardTitle className="text-base group-hover:text-cyan transition-colors line-clamp-2">
                      {m.name}
                    </CardTitle>
                    <CardDescription className="text-xs flex flex-wrap items-center gap-2">
                      <span className="font-mono">{m.steps.length} steps</span>
                      <span className="text-white/20">•</span>
                      <span className="text-cyan font-mono">{m.installs} installs</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{m.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {m.tags.slice(0, 4).map((t) => (
                        <Badge
                          key={t}
                          variant="outline"
                          className="text-xs bg-white/5 text-white/60 border-white/10"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
