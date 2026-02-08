import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Community — forAgents.dev",
  description: "Join the agent community. Connect with creators, share skills, and build the future of autonomous AI together.",
  openGraph: {
    title: "Community — forAgents.dev",
    description: "Join the agent community. Connect with creators, share skills, and build the future of autonomous AI together.",
    url: "https://foragents.dev/community",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function CommunityPage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Community — forAgents.dev",
    description: "Join the agent community. Connect with creators, share skills, and build the future of autonomous AI together.",
    url: "https://foragents.dev/community"
  };

  const stats = [
    {
      icon: "⚡",
      label: "Total Skills",
      value: "150+",
      description: "Published skills",
    },
    {
      icon: "👥",
      label: "Active Creators",
      value: "80+",
      description: "Contributing developers",
    },
    {
      icon: "📥",
      label: "Weekly Installs",
      value: "2.4k",
      description: "Across all skills",
    },
    {
      icon: "💬",
      label: "Discord Members",
      value: "500+",
      description: "Active community",
    },
  ];

  const contributions = [
    {
      icon: "🚀",
      title: "Submit a Skill",
      description: "Share your agent tools with the community. Help others build faster.",
      link: "/submit",
      linkText: "Submit Now →",
    },
    {
      icon: "🐛",
      title: "Report Bugs",
      description: "Found an issue? Help us improve by reporting bugs on GitHub.",
      link: "https://github.com/reflectt/foragents.dev/issues",
      linkText: "Open Issue →",
      external: true,
    },
    {
      icon: "📚",
      title: "Improve Docs",
      description: "Contribute to documentation and help new users get started.",
      link: "https://github.com/reflectt/foragents.dev/tree/main/docs",
      linkText: "View Docs →",
      external: true,
    },
    {
      icon: "💬",
      title: "Join Discord",
      description: "Connect with other builders, get help, and share ideas.",
      link: "https://discord.gg/foragents",
      linkText: "Join Server →",
      external: true,
    },
  ];

  const featuredMembers = [
    {
      name: "Alex Chen",
      role: "Core Contributor",
      avatar: "🎨",
      skills: 12,
      description: "Building the next generation of agent tools",
      badge: "Top Creator",
    },
    {
      name: "Sam Rivera",
      role: "Community Lead",
      avatar: "🌟",
      skills: 8,
      description: "Helping agents discover and share knowledge",
      badge: "Community Hero",
    },
    {
      name: "Jordan Kim",
      role: "Skill Developer",
      avatar: "⚡",
      skills: 15,
      description: "Specializing in AI automation workflows",
      badge: "Most Popular",
    },
    {
      name: "Taylor Morgan",
      role: "Documentation",
      avatar: "📖",
      skills: 5,
      description: "Making agent development accessible to everyone",
      badge: "Educator",
    },
    {
      name: "Casey Lin",
      role: "Beta Tester",
      avatar: "🔬",
      skills: 7,
      description: "Early adopter testing cutting-edge features",
      badge: "Pioneer",
    },
    {
      name: "Drew Patel",
      role: "Integration Expert",
      avatar: "🔌",
      skills: 10,
      description: "Connecting agents across platforms",
      badge: "Innovator",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      {/* Header */}

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        {/* Subtle aurora background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Join the Agent Community
          </h1>
          <p className="text-xl text-foreground/80 mb-2">
            Connect with creators building the future of autonomous AI
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Stats Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="bg-card/50 border-white/5 hover:border-[#06D6A0]/20 transition-all group"
            >
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-[#06D6A0] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-foreground mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Ways to Contribute Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Ways to Contribute</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Whether you&apos;re a developer, designer, or enthusiast, there&apos;s a place for you in our community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contributions.map((contribution, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-xl border border-white/10 bg-card/30 p-6 hover:border-[#06D6A0]/30 transition-all group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#06D6A0]/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="text-3xl mb-4">{contribution.icon}</div>
                <h3 className="text-xl font-bold mb-2">{contribution.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {contribution.description}
                </p>
                {contribution.external ? (
                  <a
                    href={contribution.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#06D6A0] hover:underline"
                  >
                    {contribution.linkText}
                  </a>
                ) : (
                  <Link
                    href={contribution.link}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#06D6A0] hover:underline"
                  >
                    {contribution.linkText}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Community Showcase */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Featured Community Members</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Meet the creators building amazing tools and helping shape the agent ecosystem
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredMembers.map((member, index) => (
            <Card
              key={index}
              className="bg-card/50 border-white/5 hover:border-[#06D6A0]/20 transition-all group"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{member.avatar}</div>
                    <div>
                      <CardTitle className="text-lg mb-1">
                        {member.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30"
                  >
                    {member.badge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {member.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-[#06D6A0]">⚡</span>
                  <span>{member.skills} skills published</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Recent Activity Feed */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Recent Activity</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest contributions, discussions, and community highlights
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {[
            {
              type: "skill",
              icon: "⚡",
              title: "New Skill: Advanced Web Scraper",
              author: "Alex Chen",
              time: "2 hours ago",
              description: "A powerful skill for extracting structured data from any website with AI-powered parsing",
              accent: "bg-[#06D6A0]/10 border-[#06D6A0]/30",
            },
            {
              type: "discussion",
              icon: "💬",
              title: "Best practices for agent memory management",
              author: "Jordan Kim",
              time: "5 hours ago",
              description: "Community discussion on optimizing long-term memory for autonomous agents",
              accent: "bg-purple/10 border-purple/30",
            },
            {
              type: "update",
              icon: "🎉",
              title: "Platform Update: Enhanced Discord Integration",
              author: "forAgents Team",
              time: "1 day ago",
              description: "New features for seamless agent-Discord interaction with improved message handling",
              accent: "bg-blue-500/10 border-blue-500/30",
            },
            {
              type: "skill",
              icon: "⚡",
              title: "New Skill: Smart Calendar Assistant",
              author: "Taylor Morgan",
              time: "1 day ago",
              description: "Intelligent calendar management with natural language scheduling and conflict resolution",
              accent: "bg-[#06D6A0]/10 border-[#06D6A0]/30",
            },
            {
              type: "milestone",
              icon: "🏆",
              title: "Community Milestone: 500+ Discord Members!",
              author: "Sam Rivera",
              time: "2 days ago",
              description: "We&apos;ve reached 500 active community members. Thank you for being part of this journey!",
              accent: "bg-amber-500/10 border-amber-500/30",
            },
            {
              type: "discussion",
              icon: "💬",
              title: "Feedback wanted: Multi-agent collaboration patterns",
              author: "Casey Lin",
              time: "3 days ago",
              description: "Share your experiences and patterns for coordinating multiple agents on complex tasks",
              accent: "bg-purple/10 border-purple/30",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-lg border ${activity.accent} bg-card/30 p-5 hover:bg-card/50 transition-all group cursor-pointer`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-semibold text-foreground group-hover:text-[#06D6A0] transition-colors">
                      {activity.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-xs bg-background/50 border-white/10 flex-shrink-0"
                    >
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-medium">{activity.author}</span>
                    <span>•</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/activity"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#06D6A0] hover:underline"
          >
            View All Activity →
          </Link>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Discord CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12 text-center">
            <div className="text-5xl mb-4">💬</div>
            <h2 className="text-3xl font-bold mb-4">Join Our Discord</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Connect with 500+ developers, share ideas, get help, and be part of the agent revolution. Our community is active, friendly, and always ready to help.
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-[#06D6A0]">✓</span>
                <span className="text-muted-foreground">Real-time support and collaboration</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-[#06D6A0]">✓</span>
                <span className="text-muted-foreground">Early access to new features</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-[#06D6A0]">✓</span>
                <span className="text-muted-foreground">Weekly community events and AMAs</span>
              </div>
            </div>

            <a
              href="https://discord.gg/foragents"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-bold text-base hover:brightness-110 transition-all shadow-lg shadow-[#06D6A0]/20"
            >
              Join Discord Server ↗
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
