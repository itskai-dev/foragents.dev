import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Demos — forAgents.dev",
  description: "Watch interactive demos and video walkthroughs of forAgents.dev features. Learn by example.",
  openGraph: {
    title: "Demos — forAgents.dev",
    description: "Watch interactive demos and video walkthroughs of forAgents.dev features. Learn by example.",
    url: "https://foragents.dev/demos",
    siteName: "forAgents.dev",
    type: "website",
  },
};

const demos = [
  {
    title: "Installing Your First Skill",
    description: "Learn how to discover, install, and configure your first agent skill from the marketplace.",
    duration: "5 min",
    difficulty: "Beginner" as const,
  },
  {
    title: "Building a Custom Kit",
    description: "Step-by-step guide to creating a custom agent kit with your own tools and capabilities.",
    duration: "12 min",
    difficulty: "Intermediate" as const,
  },
  {
    title: "API Playground Walkthrough",
    description: "Explore the API playground interface and learn how to test endpoints in real-time.",
    duration: "8 min",
    difficulty: "Beginner" as const,
  },
  {
    title: "Multi-Agent Setup",
    description: "Configure multiple agents to work together with shared context and coordination.",
    duration: "15 min",
    difficulty: "Advanced" as const,
  },
  {
    title: "Creator Dashboard Tour",
    description: "A complete tour of the creator dashboard for managing your published skills and kits.",
    duration: "10 min",
    difficulty: "Intermediate" as const,
  },
  {
    title: "Deploying to Production",
    description: "Best practices for deploying your agent setup to production with monitoring and rollback.",
    duration: "18 min",
    difficulty: "Advanced" as const,
  },
];

const difficultyColors = {
  Beginner: "bg-green-500/10 text-green-500 border-green-500/30",
  Intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  Advanced: "bg-red-500/10 text-red-500 border-red-500/30",
};

export default function DemosPage() {
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

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[300px] flex items-center">
        {/* Subtle aurora background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Learn by Example
          </h1>
          <p className="text-xl text-foreground/80 mb-2">
            Interactive demos and video walkthroughs
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Featured Demo */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-6">
          <Badge className="bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30 mb-4">
            Featured Demo
          </Badge>
          <h2 className="text-3xl font-bold mb-2">Getting Started with forAgents.dev</h2>
          <p className="text-muted-foreground">
            A comprehensive introduction to the platform, from your first skill to deploying agents in production.
          </p>
        </div>

        {/* Video Placeholder */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#06D6A0]/20 via-purple/10 to-[#06D6A0]/10 aspect-video flex items-center justify-center group cursor-pointer hover:border-[#06D6A0]/30 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-[#06D6A0]/5 via-transparent to-purple/5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#06D6A0]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple/10 rounded-full blur-[100px]" />
          
          {/* Play Button Overlay */}
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[#06D6A0] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-[#06D6A0]/50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-10 h-10 text-[#0a0a0a] ml-1"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-[#F8FAFC] mb-1">Watch Demo</p>
              <p className="text-sm text-muted-foreground">20 minutes • Complete walkthrough</p>
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* All Demos Grid */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">All Demos</h2>
          <p className="text-muted-foreground">
            Explore specific features and workflows
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demos.map((demo, index) => (
            <Card
              key={index}
              className="bg-card/50 border-white/10 hover:border-[#06D6A0]/30 transition-all group overflow-hidden"
            >
              {/* Thumbnail Placeholder */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#06D6A0]/10 via-purple/5 to-transparent aspect-video flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#06D6A0]/5 via-transparent to-purple/5" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#06D6A0]/10 rounded-full blur-[60px]" />
                
                {/* Play Button */}
                <div className="relative z-10 w-12 h-12 rounded-full bg-[#06D6A0]/80 flex items-center justify-center group-hover:bg-[#06D6A0] transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-[#0a0a0a] ml-0.5"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-lg font-bold text-foreground group-hover:text-[#06D6A0] transition-colors">
                    {demo.title}
                  </h3>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {demo.description}
                </p>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${difficultyColors[demo.difficulty]}`}
                    >
                      {demo.difficulty}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs bg-white/5 text-muted-foreground border-white/10"
                    >
                      {demo.duration}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5">
                  <button className="w-full text-sm font-semibold text-[#06D6A0] hover:text-[#06D6A0]/80 transition-colors flex items-center justify-center gap-2">
                    Watch
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Call to Action */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-3xl">🚀</span>
              <h2 className="text-2xl font-bold">Ready to Build?</h2>
            </div>

            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Start building with forAgents.dev today. Browse skills, explore the API, or create your first custom kit.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/get-started"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Get Started →
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
