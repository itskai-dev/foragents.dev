import { getCreators } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Creator Directory — forAgents.dev",
  description: "Discover skill creators and their contributions to the agent ecosystem.",
  openGraph: {
    title: "Creator Directory — forAgents.dev",
    description: "Discover skill creators and their contributions to the agent ecosystem.",
    url: "https://foragents.dev/creators",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creator Directory — forAgents.dev",
    description: "Discover skill creators and their contributions to the agent ecosystem.",
  },
};

export default function CreatorsPage() {
  const creators = getCreators();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-lg font-bold aurora-text hover:opacity-80 transition-opacity">
              ⚡ Agent Hub
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-foreground">Creators</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/agents" className="text-muted-foreground hover:text-foreground transition-colors">
              Agents
            </Link>
            <Link href="/mcp" className="text-muted-foreground hover:text-foreground transition-colors">
              MCP
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-cyan/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            👥 Creator Directory
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6">
            Discover the people and teams building skills for AI agents. View their contributions, stats, and expertise.
          </p>
          <p className="mt-6 font-mono text-sm text-muted-foreground">
            {creators.length} creators · {creators.reduce((sum, c) => sum + c.skillCount, 0)} total skills
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Creators List */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid gap-4">
          {creators.map((creator) => (
            <Link
              key={creator.username}
              href={`/creators/${encodeURIComponent(creator.username)}`}
              className="block rounded-xl border border-white/5 bg-card/50 p-6 transition-all hover:border-cyan/20 hover:shadow-[0_0_20px_rgba(6,214,160,0.05)] group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-[#F8FAFC] group-hover:text-cyan transition-colors flex items-center gap-2">
                      {creator.username}
                      {creator.verified && (
                        <Image
                          src="/badges/verified-skill.svg"
                          alt="Verified Creator"
                          title="Verified: Team Reflectt"
                          width={20}
                          height={20}
                          className="w-5 h-5 inline-block"
                        />
                      )}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-cyan">📦</span>
                      <span>{creator.skillCount} skill{creator.skillCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-cyan">🏷️</span>
                      <span>{creator.totalTags} total tags</span>
                    </div>
                  </div>

                  {/* Top Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {creator.topTags.slice(0, 5).map((tagData) => (
                      <Badge
                        key={tagData.tag}
                        variant="outline"
                        className="text-xs bg-cyan/10 text-cyan border-cyan/20"
                      >
                        {tagData.tag} ({tagData.count})
                      </Badge>
                    ))}
                  </div>

                  {/* Sample Skills */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {creator.skills.slice(0, 2).map((skill) => (
                      <div
                        key={skill.id}
                        className="text-xs text-muted-foreground border border-white/5 rounded-lg px-3 py-2 bg-black/20"
                      >
                        <div className="font-semibold text-foreground mb-0.5">
                          {skill.name}
                        </div>
                        <div className="line-clamp-1">{skill.description}</div>
                      </div>
                    ))}
                    {creator.skillCount > 2 && (
                      <div className="text-xs text-cyan flex items-center justify-center border border-cyan/20 rounded-lg px-3 py-2 bg-cyan/5">
                        +{creator.skillCount - 2} more skill{creator.skillCount - 2 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-cyan opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    View Profile →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold mb-3">Become a Creator</h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Build skills for AI agents and join this directory. Share your tools with the agent ecosystem.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/submit">
              📤 Submit Your Skill
            </Link>
          </Button>
        </div>
      </section>

    </div>
  );
}
