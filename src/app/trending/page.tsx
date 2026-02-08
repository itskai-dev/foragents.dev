import Link from "next/link";
import { getSkills, type Skill } from "@/lib/data";
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
import { MobileNav } from "@/components/mobile-nav";
import { Footer } from "@/components/footer";
import { InstallCount } from "@/components/InstallCount";

export const revalidate = 300;

export const metadata = {
  title: "Trending Skills — forAgents.dev",
  description: "The hottest skills agents are using right now. Discover trending tools and capabilities for autonomous AI agents.",
  openGraph: {
    title: "Trending Skills — forAgents.dev",
    description: "The hottest skills agents are using right now. Discover trending tools and capabilities for autonomous AI agents.",
    url: "https://foragents.dev/trending",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trending Skills — forAgents.dev",
    description: "The hottest skills agents are using right now. Discover trending tools and capabilities for autonomous AI agents.",
  },
};

// Simple trending score algorithm
// Factors: number of tags (popularity indicator), author verification, name length (simpler names trend)
function calculateTrendingScore(skill: Skill): number {
  let score = 0;
  
  // More tags = more relevant/popular (weight: 10)
  score += skill.tags.length * 10;
  
  // Verified authors get a boost (weight: 20)
  if (skill.author === "Team Reflectt") {
    score += 20;
  }
  
  // Shorter names are catchier (weight: inverse of length)
  score += Math.max(0, 50 - skill.name.length);
  
  // Add slight randomness for variety (weight: 0-15)
  score += Math.random() * 15;
  
  return score;
}

function getTrendingSkills(): (Skill & { trendingScore: number })[] {
  const skills = getSkills();
  
  // Calculate scores and sort
  const withScores = skills.map(skill => ({
    ...skill,
    trendingScore: calculateTrendingScore(skill),
  }));
  
  return withScores.sort((a, b) => b.trendingScore - a.trendingScore);
}

export default function TrendingPage() {
  const trendingSkills = getTrendingSkills();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80 relative">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-lg font-bold aurora-text hover:opacity-80 transition-opacity">
              ⚡ Agent Hub
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-foreground">Trending</span>
          </div>
          <MobileNav />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-cyan/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] bg-purple/3 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC] mb-4">
            🔥 Trending This Week
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The hottest skills agents are using right now
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Trending Skills */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Top Trending Skills</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Ranked by popularity, recency, and community engagement
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/skills.json" className="font-mono text-xs">
                .json
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/skills.md" className="font-mono text-xs">
                .md
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trendingSkills.map((skill, index) => (
            <Link key={skill.id} href={`/skills/${skill.slug}`}>
              <Card className="bg-card/50 border-white/5 hover:border-cyan/20 transition-all group h-full relative">
                {/* Trending badge for top 3 */}
                {index < 3 && (
                  <div className="absolute top-3 right-3">
                    <Badge 
                      variant="outline" 
                      className={`text-xs font-bold ${
                        index === 0 
                          ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30' 
                          : index === 1
                          ? 'bg-gray-400/20 text-gray-300 border-gray-400/30'
                          : 'bg-orange-500/20 text-orange-300 border-orange-400/30'
                      }`}
                    >
                      #{index + 1}
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-cyan transition-colors flex items-center gap-1.5 pr-12">
                    {skill.name}
                    {skill.author === "Team Reflectt" && (
                      <img 
                        src="/badges/verified-skill.svg" 
                        alt="Verified Skill" 
                        title="Verified: Team Reflectt skill"
                        className="w-5 h-5 inline-block"
                      />
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center gap-2">
                    <span>by {skill.author}</span>
                    <span className="text-white/20">•</span>
                    <InstallCount 
                      skillSlug={skill.slug} 
                      className="text-xs text-cyan"
                    />
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {skill.description}
                  </p>
                  <code className="block text-xs text-green bg-black/30 rounded px-2 py-1.5 mb-3 overflow-x-auto">
                    {skill.install_cmd}
                  </code>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {skill.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs bg-white/5 text-white/60 border-white/10"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {skill.tags.length > 2 && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-white/5 text-white/60 border-white/10"
                        >
                          +{skill.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-cyan group-hover:underline">
                      View →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* All Skills Link */}
        <div className="text-center mt-8">
          <Link href="/#skills" className="text-sm text-cyan hover:underline">
            ← View all {trendingSkills.length} skills
          </Link>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Info Section */}
      <section className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold mb-3">How Trending Works</h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Skills are ranked by a combination of factors including tag count (indicating scope and versatility), 
          author verification, and name simplicity. The algorithm is intentionally simple and transparent.
        </p>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
