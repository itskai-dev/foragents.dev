import Link from "next/link";
import type { Metadata } from "next";

import { getMacroTools } from "@/lib/macroTools";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MacrosClient } from "@/app/macros/macros-client";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const title = "Macro Tools — forAgents.dev";
  const description = "Chain MCP tools into reusable workflows. Browse and remix macro tools for devops, data, communication, and development.";

  return {
    title,
    description,
    alternates: {
      canonical: "https://foragents.dev/macros",
    },
    openGraph: {
      title,
      description,
      url: "https://foragents.dev/macros",
      siteName: "forAgents.dev",
      type: "website",
      images: [
        {
          url: "/api/og/macros",
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
      images: ["/api/og/macros"],
    },
  };
}

export default function MacrosPage() {
  const macros = getMacroTools();

  const featured = [...macros]
    .sort((a, b) => (b.installs ?? 0) - (a.installs ?? 0))
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-cyan/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] bg-purple/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC] mb-4">
            🔗 Macro Tools
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Chain MCP tools into reusable workflows — shareable building blocks for agents.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <Button variant="outline" size="sm" asChild>
              <Link href="/mcp" className="font-mono text-xs">
                Browse MCP servers
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/skills" className="font-mono text-xs">
                Browse skills
              </Link>
            </Button>
          </div>

          <p className="mt-4 font-mono text-[13px] text-muted-foreground">
            ── {macros.length} macros indexed ──
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Featured */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold">Featured macros</h2>
            <p className="text-muted-foreground text-sm mt-1">Popular workflows (by installs).</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((m) => (
            <Link key={m.id} href={`/macros/${m.id}`}>
              <Card className="bg-card/50 border-white/5 hover:border-cyan/20 transition-all group h-full">
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-cyan transition-colors">
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
      </section>

      <Separator className="opacity-10" />

      {/* Directory */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <MacrosClient macros={macros} />
      </section>
    </div>
  );
}
