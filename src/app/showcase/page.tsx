import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Showcase — forAgents.dev",
  description:
    "Real projects and agents built with forAgents.dev kits. See what&apos;s possible.",
  openGraph: {
    title: "Showcase — forAgents.dev",
    description:
      "Real projects and agents built with forAgents.dev kits. See what&apos;s possible.",
    url: "https://foragents.dev/showcase",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Showcase — forAgents.dev",
    description:
      "Real projects and agents built with forAgents.dev kits. See what&apos;s possible.",
  },
};

const tags = ["All", "Automation", "DevOps", "Content", "Analytics", "Communication"] as const;

type Project = {
  name: string;
  creator: string;
  description: string;
  tags: string[];
  link: string;
  gradient: string;
  featured?: boolean;
};

const projects: Project[] = [
  {
    name: "CloudOps Commander",
    creator: "DevOps Team at Acme Inc",
    description: "Automated cloud infrastructure management across AWS, GCP, and Azure. Handles deployments, monitoring, and cost optimization autonomously.",
    tags: ["DevOps", "Automation"],
    link: "https://github.com/example/cloudops",
    gradient: "from-cyan-500/10 to-blue-500/10",
    featured: true,
  },
  {
    name: "Content Forge AI",
    creator: "Sarah Chen",
    description: "Multi-platform content creation agent that generates, schedules, and publishes blog posts, social media content, and newsletters.",
    tags: ["Content", "Automation"],
    link: "https://github.com/example/content-forge",
    gradient: "from-purple/10 to-pink-500/10",
  },
  {
    name: "DataPulse Analytics",
    creator: "Analytics Lab",
    description: "Real-time data pipeline orchestration with automated insights, anomaly detection, and custom reporting dashboards.",
    tags: ["Analytics", "DevOps"],
    link: "https://github.com/example/datapulse",
    gradient: "from-green-500/10 to-emerald-500/10",
  },
  {
    name: "SlackBot Pro",
    creator: "Team Productivity Inc",
    description: "Intelligent Slack assistant that manages standups, tracks tasks, and integrates with project management tools.",
    tags: ["Communication", "Automation"],
    link: "https://github.com/example/slackbot",
    gradient: "from-amber-500/10 to-yellow-500/10",
  },
  {
    name: "GitFlow Automator",
    creator: "Marcus Developer",
    description: "Streamlines Git workflows with automated PR reviews, merge conflict resolution, and release management.",
    tags: ["DevOps", "Automation"],
    link: "https://github.com/example/gitflow",
    gradient: "from-orange-500/10 to-red-500/10",
  },
  {
    name: "Newsletter Studio",
    creator: "Emma Rodriguez",
    description: "Curates trending topics, generates newsletter drafts, and manages subscriber lists with personalized content.",
    tags: ["Content", "Communication"],
    link: "https://github.com/example/newsletter",
    gradient: "from-cyan-500/10 to-purple/10",
  },
  {
    name: "Metrics Monitor",
    creator: "Observability Team",
    description: "Aggregates metrics from multiple sources, detects performance issues, and sends intelligent alerts.",
    tags: ["Analytics", "DevOps"],
    link: "https://github.com/example/metrics",
    gradient: "from-blue-500/10 to-cyan/10",
  },
  {
    name: "Support Hub",
    creator: "Customer Success Co",
    description: "AI-powered customer support agent that handles tickets, answers FAQs, and escalates complex issues.",
    tags: ["Communication", "Automation"],
    link: "https://github.com/example/support",
    gradient: "from-green-500/10 to-cyan-500/10",
  },
  {
    name: "SEO Optimizer",
    creator: "Growth Hackers",
    description: "Analyzes website performance, suggests SEO improvements, and tracks keyword rankings across search engines.",
    tags: ["Analytics", "Content"],
    link: "https://github.com/example/seo",
    gradient: "from-amber-500/20 to-yellow-500/20",
  },
  {
    name: "Code Review Assistant",
    creator: "Engineering at Scale",
    description: "Reviews pull requests for code quality, security vulnerabilities, and best practices compliance.",
    tags: ["DevOps", "Automation"],
    link: "https://github.com/example/code-review",
    gradient: "from-purple/10 to-blue-500/10",
  },
];

export default function ShowcasePage() {
  const featuredProject = projects.find((p) => p.featured);
  const regularProjects = projects.filter((p) => !p.featured);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80 relative">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-lg font-bold aurora-text hover:opacity-80 transition-opacity"
            >
              ⚡ Agent Hub
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-foreground">Showcase</span>
          </div>
          <MobileNav />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-cyan/5 rounded-full blur-[140px]" />
          <div className="absolute top-1/3 right-1/4 w-[40vw] h-[40vw] max-w-[520px] max-h-[520px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC] mb-4">
            Built with forAgents
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real projects and agents built by the community. From automation to analytics, see what&apos;s possible.
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Featured Project */}
        {featuredProject && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-1 bg-[#06D6A0] rounded-full" />
              <h2 className="text-xl font-semibold text-[#F8FAFC]">Featured</h2>
            </div>
            <Card className="border-white/10 bg-card/40 hover:bg-card/60 transition-colors overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Screenshot placeholder */}
                  <div
                    className={`min-h-[300px] bg-gradient-to-br ${featuredProject.gradient} flex items-center justify-center relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                    <div className="relative text-6xl opacity-20">⚡</div>
                  </div>

                  {/* Content */}
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {featuredProject.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-[#06D6A0]/10 border border-[#06D6A0]/20 text-[#06D6A0] text-xs font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-2xl font-bold text-[#F8FAFC] mb-2">
                      {featuredProject.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      by {featuredProject.creator}
                    </p>
                    <p className="text-foreground/90 leading-relaxed mb-6">
                      {featuredProject.description}
                    </p>
                    <a
                      href={featuredProject.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-11 px-5 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-mono text-sm hover:bg-[#05c090] transition-colors w-fit"
                    >
                      View Project →
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter Tags */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <button
                key={tag}
                className="px-4 py-2 rounded-lg border border-white/10 text-sm font-mono text-foreground/80 hover:border-[#06D6A0]/30 hover:bg-[#06D6A0]/10 hover:text-[#06D6A0] transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 font-mono">
            💡 Tip: Click tags to filter projects
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {regularProjects.map((project) => (
            <Card
              key={project.name}
              className="border-white/10 bg-card/40 hover:bg-card/60 transition-colors overflow-hidden group"
            >
              <CardContent className="p-0">
                {/* Screenshot placeholder */}
                <div
                  className={`h-48 bg-gradient-to-br ${project.gradient} flex items-center justify-center relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                  <div className="relative text-5xl opacity-20 group-hover:scale-110 transition-transform">
                    ⚡
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded text-xs font-mono bg-white/5 border border-white/10 text-foreground/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-lg font-semibold text-[#F8FAFC] mb-1">
                    {project.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    by {project.creator}
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-4 line-clamp-3">
                    {project.description}
                  </p>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#06D6A0] text-sm font-mono hover:underline"
                  >
                    View Project
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submit CTA */}
        <div className="border border-white/10 rounded-xl bg-gradient-to-br from-[#06D6A0]/5 to-purple/5 p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#F8FAFC] mb-4">
            Built something amazing?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Share your project with the community. We&apos;d love to feature your work and inspire others.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-mono text-sm font-semibold hover:bg-[#05c090] transition-colors"
          >
            Submit Your Project
          </Link>
        </div>
      </main>

    </div>
  );
}
