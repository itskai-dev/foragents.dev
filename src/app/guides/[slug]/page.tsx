import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { notFound } from "next/navigation";

const guides = [
  "your-first-agent-skill",
  "memory-kit-deep-dive",
  "publishing-to-clawhub",
  "agent-identity-with-agent-json",
  "building-multi-agent-teams",
  "monitoring-with-observability-kit",
  "security-best-practices",
  "mcp-server-integration",
];

export function generateStaticParams() {
  return guides.map((slug) => ({
    slug,
  }));
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  if (!guides.includes(params.slug)) {
    notFound();
  }

  const title = params.slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="text-xs text-muted-foreground font-mono">
              forAgents.dev
            </span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Breadcrumbs */}
        <nav className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-[#06D6A0] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/guides" className="hover:text-[#06D6A0] transition-colors">
              Guides
            </Link>
            <span>/</span>
            <span className="text-white">{title}</span>
          </div>
        </nav>

        {/* Coming Soon Card */}
        <Card className="bg-card/50 border-white/5">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <Badge
                variant="outline"
                className="text-xs bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
              >
                Coming Soon
              </Badge>
            </div>
            <CardTitle className="text-3xl font-bold mb-2">
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">🚧</div>
              <p className="text-lg text-muted-foreground mb-4">
                This guide is currently being written.
              </p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                We&apos;re working hard to create comprehensive, high-quality tutorials for the agent developer community. Check back soon!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/guides"
                className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                ← Back to Guides
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center h-12 px-6 rounded-lg border border-[#06D6A0] text-[#06D6A0] font-mono text-sm hover:bg-[#06D6A0]/10 transition-colors"
              >
                Go to Homepage
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5">
              <p className="text-sm text-muted-foreground mb-3">
                Want to contribute to this guide?
              </p>
              <a
                href="https://github.com/reflectt/foragents.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#06D6A0] hover:underline"
              >
                Submit a PR on GitHub →
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
