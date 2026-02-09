import { getTemplates, type TemplateCategory } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Agent Templates — forAgents.dev",
  description:
    "Starter templates for building AI agents. Pre-configured setups for chatbots, coding assistants, data analysts, and more.",
  openGraph: {
    title: "Agent Templates — forAgents.dev",
    description:
      "Starter templates for building AI agents. Pre-configured setups for chatbots, coding assistants, data analysts, and more.",
    url: "https://foragents.dev/templates",
    siteName: "forAgents.dev",
    type: "website",
    images: [
      {
        url: "/api/og?title=Agent%20Templates&subtitle=Build%20Faster",
        width: 1200,
        height: 630,
        alt: "Agent Templates — forAgents.dev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Templates — forAgents.dev",
    description:
      "Starter templates for building AI agents. Pre-configured setups for chatbots, coding assistants, data analysts, and more.",
    images: ["/api/og?title=Agent%20Templates&subtitle=Build%20Faster"],
  },
};

const categoryInfo: Record<TemplateCategory, { emoji: string; label: string; description: string }> = {
  "chatbot": {
    emoji: "💬",
    label: "Chatbots",
    description: "Conversational agents for customer support and engagement"
  },
  "coding-assistant": {
    emoji: "👨‍💻",
    label: "Coding Assistants",
    description: "AI-powered development tools and code review bots"
  },
  "data-analyst": {
    emoji: "📊",
    label: "Data Analysts",
    description: "Business intelligence and data exploration agents"
  },
  "content-creator": {
    emoji: "✍️",
    label: "Content Creators",
    description: "Writing, social media, and content generation agents"
  },
  "devops": {
    emoji: "🚀",
    label: "DevOps",
    description: "Infrastructure monitoring and deployment automation"
  }
};

export default function TemplatesPage() {
  const templates = getTemplates();
  const categories = Object.keys(categoryInfo) as TemplateCategory[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Agent Templates",
    "description": "Starter templates for building AI agents",
    "url": "https://foragents.dev/templates",
    "numberOfItems": templates.length,
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-br from-cyan/5 via-transparent to-purple/5">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-[#F8FAFC] mb-4">
              🎨 Agent Templates
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Starter templates for building AI agents. Pre-configured with best practices, models, and tools.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-cyan font-semibold">{templates.length}</span>
                <span>templates</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan font-semibold">{categories.length}</span>
                <span>categories</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Templates by Category */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        {categories.map((category) => {
          const categoryTemplates = templates.filter((t) => t.category === category);
          if (categoryTemplates.length === 0) return null;

          const info = categoryInfo[category];

          return (
            <section key={category} className="mb-16">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#F8FAFC] mb-2 flex items-center gap-2">
                  <span>{info.emoji}</span>
                  <span>{info.label}</span>
                </h2>
                <p className="text-muted-foreground">{info.description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {categoryTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="border-white/5 bg-card/40 hover:border-cyan/20 transition-all group"
                  >
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-[#F8FAFC] mb-2 group-hover:text-cyan transition-colors">
                          {template.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {template.description}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {template.useCase}
                        </Badge>
                      </div>

                      <div className="mb-4 space-y-2">
                        <div>
                          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                            Models
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.stack.models.slice(0, 2).map((model) => (
                              <Badge key={model} variant="outline" className="text-xs bg-cyan/5 text-cyan border-cyan/20">
                                {model}
                              </Badge>
                            ))}
                            {template.stack.models.length > 2 && (
                              <Badge variant="outline" className="text-xs bg-cyan/5 text-cyan border-cyan/20">
                                +{template.stack.models.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                            Tools
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.stack.tools.slice(0, 3).map((tool) => (
                              <Badge key={tool} variant="outline" className="text-xs">
                                {tool}
                              </Badge>
                            ))}
                            {template.stack.tools.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.stack.tools.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline" className="flex-1">
                          <Link href={`/templates/${template.id}`}>
                            View Details →
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-8">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <Link href="/" className="hover:text-cyan transition-colors">
            ← Home
          </Link>
          <a
            href="https://reflectt.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="aurora-text font-semibold hover:opacity-80 transition-opacity"
          >
            Team Reflectt
          </a>
        </div>
      </footer>
    </div>
  );
}
