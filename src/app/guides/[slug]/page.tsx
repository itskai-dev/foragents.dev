import Link from "next/link";
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
  "kit-integration", // Existing guide
];

export async function generateStaticParams() {
  return guides.map((slug) => ({
    slug,
  }));
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  // If this is the kit-integration guide, redirect to the existing page
  if (params.slug === "kit-integration") {
    // This page already exists, so we'll skip this one
    return null;
  }

  // Check if slug is valid
  if (!guides.includes(params.slug)) {
    notFound();
  }

  // Format the title from slug
  const title = params.slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-4">
          <Link
            href="/guides"
            className="text-sm text-muted-foreground hover:text-[#06D6A0] transition-colors no-underline"
          >
            ← Back to Guides
          </Link>
        </div>

        {/* Coming Soon Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/10 via-card/80 to-purple/10 p-12 text-center mb-8">
          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/10 rounded-full blur-[60px]" />

          <div className="relative">
            <div className="text-6xl mb-4">📝</div>
            <h1 className="text-4xl font-bold mb-3">{title}</h1>
            <p className="text-xl text-[#06D6A0] font-semibold mb-4">Coming Soon</p>
            <p className="text-muted-foreground max-w-lg mx-auto">
              We&apos;re working on this guide. Check back soon, or{" "}
              <Link href="/requests" className="text-[#06D6A0] hover:underline">
                request priority access
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Explore Other Guides */}
        <div className="rounded-xl border border-white/5 bg-card/50 p-6">
          <h2 className="text-lg font-bold mb-4">Explore Other Guides</h2>
          <div className="space-y-2">
            <Link
              href="/guides"
              className="block p-3 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <span className="text-sm text-foreground group-hover:text-[#06D6A0]">
                📚 Browse all guides →
              </span>
            </Link>
            <Link
              href="/guides/kit-integration"
              className="block p-3 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <span className="text-sm text-foreground group-hover:text-[#06D6A0]">
                🧩 Kit Integration Guide →
              </span>
            </Link>
            <Link
              href="/skills"
              className="block p-3 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <span className="text-sm text-foreground group-hover:text-[#06D6A0]">
                🧰 Skills Directory →
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-12">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
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
            <a href="/llms.txt" className="hover:text-[#06D6A0] transition-colors">
              llms.txt
            </a>
            <a href="/api/feed.md" className="hover:text-[#06D6A0] transition-colors">
              feed.md
            </a>
            <a
              href="https://github.com/reflectt"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#06D6A0] transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
