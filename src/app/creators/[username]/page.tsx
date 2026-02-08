import { getCreatorByUsername, getCreators } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateStaticParams() {
  const creators = getCreators();
  return creators.map((creator) => ({
    username: encodeURIComponent(creator.username),
  }));
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  const creator = getCreatorByUsername(decodeURIComponent(username));

  if (!creator) {
    return {
      title: "Creator Not Found — forAgents.dev",
    };
  }

  return {
    title: `${creator.username} — Creator Profile — forAgents.dev`,
    description: `View ${creator.username}'s skills and contributions: ${creator.skillCount} skills published with ${creator.totalTags} total tags.`,
  };
}

export default async function CreatorProfilePage({ params }: Props) {
  const { username } = await params;
  const creator = getCreatorByUsername(decodeURIComponent(username));

  if (!creator) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": creator.verified ? "Organization" : "Person",
    "name": creator.username,
    "url": `https://foragents.dev/creators/${encodeURIComponent(creator.username)}`,
    "description": `Creator on forAgents.dev with ${creator.skillCount} skill${creator.skillCount !== 1 ? 's' : ''} published.`,
    "keywords": creator.topTags.map(t => t.tag).join(", "),
    "numberOfWorks": creator.skillCount,
    "workExample": creator.skills.map(skill => ({
      "@type": "SoftwareApplication",
      "name": skill.name,
      "description": skill.description,
      "url": `https://foragents.dev/skills/${skill.slug}`
    }))
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-lg font-bold aurora-text hover:opacity-80 transition-opacity">
              ⚡ Agent Hub
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/creators" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Creators
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-foreground">{creator.username}</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/creators" className="text-muted-foreground hover:text-foreground transition-colors">
              Creators
            </Link>
          </nav>
        </div>
      </header>

      {/* Profile Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-cyan/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan/20 to-purple/20 border border-cyan/20 flex items-center justify-center text-4xl">
                👤
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-bold text-[#F8FAFC]">
                  {creator.username}
                </h1>
                {creator.verified && (
                  <img 
                    src="/badges/verified-skill.svg" 
                    alt="Verified Creator" 
                    title="Verified: Team Reflectt"
                    className="w-7 h-7"
                  />
                )}
              </div>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📦</span>
                  <div>
                    <div className="text-2xl font-bold text-cyan">{creator.skillCount}</div>
                    <div className="text-xs text-muted-foreground">Skill{creator.skillCount !== 1 ? 's' : ''} Published</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏷️</span>
                  <div>
                    <div className="text-2xl font-bold text-cyan">{creator.totalTags}</div>
                    <div className="text-xs text-muted-foreground">Total Tags</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <div className="text-2xl font-bold text-cyan">{creator.topTags.length}</div>
                    <div className="text-xs text-muted-foreground">Tag Categories</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Top Tags */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-4">🏷️ Top Tags</h2>
        <div className="flex flex-wrap gap-2">
          {creator.topTags.map((tagData) => (
            <Badge
              key={tagData.tag}
              variant="outline"
              className="text-sm bg-cyan/10 text-cyan border-cyan/20 px-4 py-2"
            >
              {tagData.tag}
              <span className="ml-2 text-xs text-cyan/60">×{tagData.count}</span>
            </Badge>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Skills */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">🧰 Published Skills</h2>
          <div className="text-sm text-muted-foreground">
            {creator.skillCount} skill{creator.skillCount !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {creator.skills.map((skill) => (
            <Link key={skill.id} href={`/skills/${skill.slug}`}>
              <Card className="bg-card/50 border-white/5 hover:border-cyan/20 transition-all group h-full">
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-cyan transition-colors flex items-center gap-1.5">
                    {skill.name}
                    {creator.verified && (
                      <img 
                        src="/badges/verified-skill.svg" 
                        alt="Verified Skill" 
                        title="Verified: Team Reflectt skill"
                        className="w-5 h-5 inline-block"
                      />
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    by {skill.author}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {skill.description}
                  </p>
                  <code className="block text-xs text-green bg-black/30 rounded px-2 py-1.5 mb-3 overflow-x-auto">
                    {skill.install_cmd}
                  </code>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {skill.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs bg-white/5 text-white/60 border-white/10"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3">
                    <a
                      href={skill.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Repository ↗
                    </a>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Stats Summary */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold mb-6">📊 Statistics</h2>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card/50 border-cyan/20">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Total Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan">{creator.skillCount}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-cyan/20">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Tags Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan">{creator.totalTags}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-cyan/20">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Avg Tags per Skill</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan">
                {(creator.totalTags / creator.skillCount).toFixed(1)}
              </div>
            </CardContent>
          </Card>
        </div>

        {creator.verified && (
          <div className="mt-6 p-4 rounded-lg bg-cyan/10 border border-cyan/20">
            <div className="flex items-center gap-2">
              <img 
                src="/badges/verified-skill.svg" 
                alt="Verified" 
                className="w-6 h-6"
              />
              <div>
                <div className="font-semibold text-cyan">Verified Creator</div>
                <div className="text-xs text-muted-foreground">
                  This creator is verified by Team Reflectt
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
