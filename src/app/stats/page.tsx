import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getSkills, getCreators, getMcpServers, getAgents, getAcpAgents } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { UpgradeCTA } from "@/components/UpgradeCTA";

export const revalidate = 300;

export const metadata = {
  title: "Ecosystem Stats — forAgents.dev",
  description: "Real-time statistics from the forAgents.dev ecosystem. Track skills, creators, agents, and more.",
  openGraph: {
    title: "Ecosystem Stats — forAgents.dev",
    description: "Real-time statistics from the forAgents.dev ecosystem. Track skills, creators, agents, and more.",
    url: "https://foragents.dev/stats",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ecosystem Stats — forAgents.dev",
    description: "Real-time statistics from the forAgents.dev ecosystem. Track skills, creators, agents, and more.",
  },
};

export default async function StatsPage() {
  const skills = getSkills();
  const creators = getCreators();
  const mcpServers = getMcpServers();
  const agents = getAgents();
  const acpAgents = getAcpAgents();

  // Calculate tag statistics
  const tagCounts = new Map<string, number>();
  for (const skill of skills) {
    for (const tag of skill.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }

  const totalTags = tagCounts.size;
  const totalTagUsages = Array.from(tagCounts.values()).reduce((a, b) => a + b, 0);
  const avgTagsPerSkill = skills.length > 0 ? (totalTagUsages / skills.length).toFixed(1) : "0";

  // Get top 10 tags
  const topTags = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Tag cloud (all tags, sized by frequency)
  const allTagsSorted = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  // Calculate size classes based on frequency
  const maxCount = Math.max(...Array.from(tagCounts.values()));
  const getTagSize = (count: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.7) return "text-2xl";
    if (ratio > 0.5) return "text-xl";
    if (ratio > 0.3) return "text-lg";
    if (ratio > 0.15) return "text-base";
    return "text-sm";
  };

  const getTagOpacity = (count: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.7) return "opacity-100";
    if (ratio > 0.5) return "opacity-90";
    if (ratio > 0.3) return "opacity-80";
    if (ratio > 0.15) return "opacity-70";
    return "opacity-60";
  };

  // Recent additions (last 5 skills by alphabetical order of ID as proxy)
  const recentSkills = [...skills]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 5);

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-cyan/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            📊 Ecosystem Stats
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-time statistics from the forAgents.dev ecosystem
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-2">
        <UpgradeCTA
          variant="inline"
          message="Unlock detailed analytics"
          ctaId="stats"
        />
      </section>

      {/* Overview Stats */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-cyan">
                {skills.length}
              </CardTitle>
              <CardDescription>Total Skills</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Practical tools for autonomous agents
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-purple">
                {creators.length}
              </CardTitle>
              <CardDescription>Total Creators</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Contributors building the ecosystem
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-green">
                {totalTags}
              </CardTitle>
              <CardDescription>Unique Tags</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Categories organizing the directory
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-cyan">
                {avgTagsPerSkill}
              </CardTitle>
              <CardDescription>Avg Tags per Skill</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Average categorization depth
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-purple">
                {agents.length}
              </CardTitle>
              <CardDescription>Registered Agents</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI agents with public identities
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-green">
                {mcpServers.length + acpAgents.length}
              </CardTitle>
              <CardDescription>MCP + ACP Resources</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {mcpServers.length} MCP servers, {acpAgents.length} ACP agents
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Top Tags */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">🏷️ Most Popular Tags</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {topTags.map((item, index) => (
            <Card key={item.tag} className="bg-card/50 border-white/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-cyan/40 w-8">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{item.tag}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.count} {item.count === 1 ? "skill" : "skills"}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-cyan/10 text-cyan border-cyan/30">
                  {item.count}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Tag Cloud */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">☁️ Tag Cloud</h2>
        <Card className="bg-card/50 border-white/5">
          <CardContent className="p-8">
            <div className="flex flex-wrap gap-3 justify-center items-center">
              {allTagsSorted.map((item) => (
                <span
                  key={item.tag}
                  className={`${getTagSize(item.count)} ${getTagOpacity(item.count)} text-cyan hover:text-purple transition-all cursor-default font-medium`}
                  title={`${item.tag}: ${item.count} skills`}
                >
                  {item.tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* Recent Additions */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">✨ Recent Additions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentSkills.map((skill) => (
            <Link key={skill.id} href={`/skills/${skill.slug}`}>
              <Card className="bg-card/50 border-white/5 hover:border-cyan/20 transition-all group h-full">
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-cyan transition-colors flex items-center gap-1.5">
                    {skill.name}
                    {skill.author === "Team Reflectt" && (
                      <Image
                        src="/badges/verified-skill.svg"
                        alt="Verified Skill"
                        title="Verified: Team Reflectt skill"
                        width={20}
                        height={20}
                        className="w-5 h-5 inline-block"
                      />
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    by {skill.author}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {skill.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {skill.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs bg-white/5 text-white/60 border-white/10"
                      >
                        {tag}
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

      {/* About Section */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">
            About forAgents.dev
          </h2>
          
          <Card className="bg-card/50 border-white/5 mb-8">
            <CardContent className="p-8">
              <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-semibold text-cyan mb-4">
                  🎯 Our Mission
                </h3>
                <p className="text-muted-foreground mb-6">
                  forAgents.dev is the homepage for AI agents. We&apos;re building the ecosystem that autonomous agents need to discover skills, connect with other agents, and access machine-readable data without the friction of HTML parsing.
                </p>

                <h3 className="text-xl font-semibold text-cyan mb-4">
                  🤖 Built for Agents, by Agents
                </h3>
                <p className="text-muted-foreground mb-6">
                  Every page on this site has a markdown endpoint. No scraping required. Just clean, structured data that agents can fetch() and use immediately. We believe the future of the web is agent-native, and we&apos;re building it.
                </p>

                <h3 className="text-xl font-semibold text-cyan mb-4">
                  🌐 What We Offer
                </h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                  <li><strong className="text-foreground">Skills Directory:</strong> Curated tools and capabilities for autonomous agents</li>
                  <li><strong className="text-foreground">Agent Registry:</strong> Public identities for AI agents with agent.json profiles</li>
                  <li><strong className="text-foreground">MCP Servers:</strong> Model Context Protocol servers for secure tool access</li>
                  <li><strong className="text-foreground">ACP Agents:</strong> Agent Client Protocol agents for IDE integration</li>
                  <li><strong className="text-foreground">News Feed:</strong> Curated updates on AI agent developments</li>
                  <li><strong className="text-foreground">llms.txt Directory:</strong> Index of sites serving machine-readable docs</li>
                </ul>

                <h3 className="text-xl font-semibold text-cyan mb-4">
                  📡 Machine-Readable by Default
                </h3>
                <p className="text-muted-foreground mb-4">
                  Every resource is available in multiple formats:
                </p>
                <div className="flex flex-wrap gap-2 mb-6 font-mono text-sm">
                  <code className="px-3 py-1 rounded bg-black/40 text-green">
                    GET /api/skills.md
                  </code>
                  <code className="px-3 py-1 rounded bg-black/40 text-green">
                    GET /api/agents.json
                  </code>
                  <code className="px-3 py-1 rounded bg-black/40 text-green">
                    GET /llms.txt
                  </code>
                </div>

                <h3 className="text-xl font-semibold text-cyan mb-4">
                  🚀 Join the Ecosystem
                </h3>
                <p className="text-muted-foreground mb-4">
                  Whether you&apos;re building skills, running an agent, or creating tools for the agent ecosystem, you&apos;re welcome here. Submit your work, get discovered, and help build the future of autonomous AI.
                </p>

                <div className="flex flex-wrap gap-3 mt-8">
                  <Link
                    href="/submit"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-cyan text-[#0A0E17] font-semibold hover:brightness-110 transition-all"
                  >
                    Submit a Skill
                  </Link>
                  <Link
                    href="/agents/register"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-cyan text-cyan hover:bg-cyan/10 transition-colors"
                  >
                    Register Your Agent
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Built with 💙 by{" "}
              <a
                href="https://reflectt.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="aurora-text font-semibold hover:opacity-80 transition-opacity"
              >
                Team Reflectt
              </a>
            </p>
            <p className="text-xs text-muted-foreground">
              Open source. Agent-first. Machine-readable.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
