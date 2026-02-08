import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Showcase — forAgents.dev",
  description: "Real-world use cases and examples of agents built with forAgents.dev skills and tools.",
  openGraph: {
    title: "Showcase — forAgents.dev",
    description: "Real-world use cases and examples of agents built with forAgents.dev skills and tools.",
    url: "https://foragents.dev/showcase",
    siteName: "forAgents.dev",
    type: "website",
  },
};

interface UseCase {
  title: string;
  description: string;
  skills: string[];
  complexity: "Beginner" | "Intermediate" | "Advanced";
  icon: string;
}

const useCases: UseCase[] = [
  {
    title: "AI Customer Support Bot",
    description: "Automated customer service agent that handles inquiries, routes tickets, and provides 24/7 support across multiple channels. Integrates with CRM systems and maintains conversation context.",
    skills: ["message", "web_search", "memory", "calendar"],
    complexity: "Intermediate",
    icon: "💬",
  },
  {
    title: "Automated Code Review Pipeline",
    description: "Intelligent code review agent that analyzes pull requests, suggests improvements, checks for security vulnerabilities, and ensures coding standards compliance before merging.",
    skills: ["exec", "web_fetch", "read", "write"],
    complexity: "Advanced",
    icon: "🔍",
  },
  {
    title: "Smart Home Agent",
    description: "Home automation assistant that controls IoT devices, monitors security cameras, adjusts lighting and temperature based on preferences, and sends notifications for important events.",
    skills: ["nodes", "camera", "message", "schedule"],
    complexity: "Intermediate",
    icon: "🏠",
  },
  {
    title: "Research Assistant",
    description: "Academic research agent that searches scientific papers, summarizes findings, tracks citations, organizes references, and generates literature reviews on specific topics.",
    skills: ["web_search", "web_fetch", "read", "write"],
    complexity: "Beginner",
    icon: "📚",
  },
  {
    title: "DevOps Monitoring Agent",
    description: "Infrastructure monitoring agent that tracks server health, analyzes logs, detects anomalies, triggers alerts, and can automatically scale resources or restart services when needed.",
    skills: ["exec", "nodes", "message", "browser"],
    complexity: "Advanced",
    icon: "📊",
  },
  {
    title: "Content Creation Workflow",
    description: "Creative agent that generates blog posts, social media content, and marketing copy. Schedules posts, tracks engagement metrics, and adapts content strategy based on performance.",
    skills: ["web_search", "write", "message", "image"],
    complexity: "Intermediate",
    icon: "✍️",
  },
];

const complexityColors = {
  Beginner: "bg-green-500/10 text-green-400 border-green-500/30",
  Intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  Advanced: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function ShowcasePage() {
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
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        {/* Subtle aurora background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Built with forAgents.dev
          </h1>
          <p className="text-xl text-foreground/80 mb-2">
            Real-world use cases showcasing what&apos;s possible with agent skills
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Use Cases Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Use Case Examples</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore how different agent skills combine to create powerful automation workflows across various domains
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <Card
              key={index}
              className="bg-card/30 border-white/10 hover:border-[#06D6A0]/30 transition-all group relative overflow-hidden"
            >
              {/* Hover glow effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#06D6A0]/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />

              <CardHeader className="relative">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-4xl">{useCase.icon}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${complexityColors[useCase.complexity]}`}
                  >
                    {useCase.complexity}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{useCase.title}</CardTitle>
              </CardHeader>

              <CardContent className="relative space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {useCase.description}
                </p>

                <div>
                  <p className="text-xs font-semibold text-foreground/70 mb-2">
                    Skills Used:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {useCase.skills.map((skill, skillIndex) => (
                      <Badge
                        key={skillIndex}
                        variant="outline"
                        className="text-xs bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30 font-mono"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Link
                  href="/skills"
                  className="inline-flex items-center gap-1 text-sm text-[#06D6A0] hover:underline font-medium"
                >
                  View details →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Call to Action */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to build your own?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Browse our skill directory to discover the tools and capabilities you need to bring your agent use case to life.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/skills"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Browse Skills →
              </Link>
              <Link
                href="/get-started"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
