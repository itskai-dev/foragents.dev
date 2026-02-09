import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Code, Bug, BookOpen, Puzzle, ExternalLink, Trophy, GitPullRequest, Sparkles } from "lucide-react";
import contributorsData from "@/data/contributors.json";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Contribute to the Agent Ecosystem — forAgents.dev";
  const description =
    "Join the forAgents.dev community. Submit skills, report bugs, improve documentation, and build integrations to help shape the future of AI agents.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: "https://foragents.dev/contribute",
      siteName: "forAgents.dev",
      type: "website",
      images: [
        {
          url: "/api/og",
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
      images: ["/api/og"],
    },
  };
}

const iconMap = {
  Code,
  Bug,
  BookOpen,
  Puzzle,
};

export default function ContributePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#06D6A0]/10 border border-[#06D6A0]/20 mb-6">
            <Sparkles className="w-4 h-4 text-[#06D6A0]" />
            <span className="text-sm text-[#06D6A0]">Open Source</span>
          </div>
          
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Contribute to the Agent Ecosystem
          </h1>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto mb-8">
            Help build the future of AI agents. Every contribution makes a difference — from code to documentation to community support.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="text-3xl font-bold text-[#06D6A0] mb-1">
                {contributorsData.stats.totalContributors}
              </div>
              <div className="text-sm text-foreground/60">Total Contributors</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="text-3xl font-bold text-[#06D6A0] mb-1">
                {contributorsData.stats.prsMerged}
              </div>
              <div className="text-sm text-foreground/60">PRs Merged</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="text-3xl font-bold text-[#06D6A0] mb-1">
                {contributorsData.stats.skillsContributed}
              </div>
              <div className="text-sm text-foreground/60">Skills Contributed</div>
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Ways to Contribute */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F8FAFC] mb-4">
            Ways to Contribute
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Choose how you want to make an impact. Every contribution helps grow the agent ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contributorsData.contributionWays.map((way) => {
            const Icon = iconMap[way.icon as keyof typeof iconMap];
            const isExternal = way.link.startsWith("http");

            return (
              <Card key={way.id} className="bg-white/5 border-white/10 hover:border-[#06D6A0]/30 transition-colors">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[#06D6A0]/10 border border-[#06D6A0]/20">
                      <Icon className="w-6 h-6 text-[#06D6A0]" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-[#F8FAFC] mb-2">{way.title}</CardTitle>
                      <CardDescription className="text-foreground/70">
                        {way.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-[#06D6A0]/30 hover:bg-[#06D6A0]/10 hover:border-[#06D6A0]/50"
                  >
                    <Link href={way.link} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined}>
                      Get Started
                      {isExternal && <ExternalLink className="w-4 h-4 ml-2" />}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Top Contributors Leaderboard */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-[#06D6A0]" />
            <h2 className="text-3xl md:text-4xl font-bold text-[#F8FAFC]">
              Top Contributors
            </h2>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Celebrating the community members who make forAgents.dev possible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contributorsData.topContributors.map((contributor, index) => (
            <Card
              key={contributor.id}
              className={`bg-white/5 border-white/10 hover:border-[#06D6A0]/30 transition-all hover:scale-105 ${
                index < 3 ? "ring-2 ring-[#06D6A0]/20" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Image
                      src={contributor.avatar}
                      alt={contributor.name}
                      width={56}
                      height={56}
                      className="rounded-full border-2 border-[#06D6A0]/30"
                    />
                    {index < 3 && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#06D6A0] flex items-center justify-center text-xs font-bold text-black">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg text-[#F8FAFC] truncate">
                      {contributor.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-foreground/60">
                      @{contributor.githubUsername}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/60">Contributions</span>
                  <span className="text-lg font-bold text-[#06D6A0]">
                    {contributor.contributions}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {contributor.badges.map((badge) => (
                    <Badge
                      key={badge}
                      variant="outline"
                      className="border-[#06D6A0]/30 bg-[#06D6A0]/10 text-[#06D6A0] text-xs"
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Good First Issues */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F8FAFC] mb-4">
            Good First Issues
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            New to contributing? Start with these beginner-friendly issues.
          </p>
        </div>

        <div className="space-y-4">
          {contributorsData.goodFirstIssues.map((issue) => (
            <Card
              key={issue.id}
              className="bg-white/5 border-white/10 hover:border-[#06D6A0]/30 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <GitPullRequest className="w-5 h-5 text-[#06D6A0]" />
                      <CardTitle className="text-lg text-[#F8FAFC]">
                        {issue.title}
                      </CardTitle>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {issue.labels.map((label) => (
                        <Badge
                          key={label}
                          variant="outline"
                          className="border-white/20 bg-white/5 text-foreground/70 text-xs"
                        >
                          {label}
                        </Badge>
                      ))}
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          issue.difficulty === "Easy"
                            ? "border-green-500/30 bg-green-500/10 text-green-500"
                            : "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
                        }`}
                      >
                        {issue.difficulty}
                      </Badge>
                      <span className="text-sm text-foreground/50">
                        ⏱️ {issue.estimatedTime}
                      </span>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-[#06D6A0]/30 hover:bg-[#06D6A0]/10 hover:border-[#06D6A0]/50 shrink-0"
                  >
                    <Link href={issue.url} target="_blank" rel="noopener noreferrer">
                      View Issue
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button
            asChild
            variant="outline"
            className="border-[#06D6A0]/30 hover:bg-[#06D6A0]/10 hover:border-[#06D6A0]/50"
          >
            <Link
              href="https://github.com/reflectt/foragents.dev/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22"
              target="_blank"
              rel="noopener noreferrer"
            >
              View All Good First Issues
              <ExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Code of Conduct */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl text-[#F8FAFC] text-center">
              Code of Conduct
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-foreground/70 leading-relaxed">
              {contributorsData.codeOfConduct.summary}
            </p>
            <Button
              asChild
              variant="outline"
              className="border-[#06D6A0]/30 hover:bg-[#06D6A0]/10 hover:border-[#06D6A0]/50"
            >
              <Link
                href={contributorsData.codeOfConduct.fullDocUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read Full Code of Conduct
                <ExternalLink className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
