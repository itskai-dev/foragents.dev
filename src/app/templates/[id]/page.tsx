import { getTemplates, getTemplateById } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TemplateDetailClient } from "./template-detail-client";

// Generate static paths for all templates
export function generateStaticParams() {
  return getTemplates().map((template) => ({ id: template.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = getTemplateById(id);
  
  if (!template) return { title: "Template Not Found" };

  return {
    title: `${template.name} — Agent Template — forAgents.dev`,
    description: template.description,
    openGraph: {
      title: `${template.name} — Agent Template`,
      description: template.description,
      url: `https://foragents.dev/templates/${id}`,
      siteName: "forAgents.dev",
      type: "website",
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(template.name)}&subtitle=Agent%20Template`,
          width: 1200,
          height: 630,
          alt: `${template.name} — Agent Template`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${template.name} — Agent Template`,
      description: template.description,
      images: [`/api/og?title=${encodeURIComponent(template.name)}&subtitle=Agent%20Template`],
    },
  };
}

export default async function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = getTemplateById(id);

  if (!template) {
    notFound();
  }

  const relatedTemplates = getTemplates()
    .filter((t) => t.id !== template.id && t.category === template.category)
    .slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-br from-cyan/5 via-transparent to-purple/5">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="mb-4">
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-cyan transition-colors"
            >
              ← Back to Templates
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-[#F8FAFC] mb-4">{template.name}</h1>
          <p className="text-lg text-muted-foreground mb-6">{template.description}</p>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="text-sm capitalize">
              {template.category.replace("-", " ")}
            </Badge>
            <Badge variant="outline" className="text-sm bg-cyan/5 text-cyan border-cyan/20">
              {template.useCase}
            </Badge>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Stack */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#F8FAFC] mb-6">🛠️ Tech Stack</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#F8FAFC] mb-3">Models</h3>
              <div className="flex flex-wrap gap-2">
                {template.stack.models.map((model) => (
                  <Badge key={model} variant="outline" className="text-sm bg-cyan/5 text-cyan border-cyan/20">
                    {model}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#F8FAFC] mb-3">Tools & Skills</h3>
              <div className="flex flex-wrap gap-2">
                {template.stack.tools.map((tool) => (
                  <Badge key={tool} variant="outline" className="text-sm">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#F8FAFC] mb-3">Frameworks & Libraries</h3>
              <div className="flex flex-wrap gap-2">
                {template.stack.frameworks.map((framework) => (
                  <Badge key={framework} variant="outline" className="text-sm">
                    {framework}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Configuration (with client-side copy button) */}
        <TemplateDetailClient config={template.config} />

        {/* Use Cases */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#F8FAFC] mb-4">💡 Use Cases</h2>
          <div className="rounded-lg border border-white/5 bg-card/40 p-6">
            <p className="text-foreground/90">{template.useCase}</p>
          </div>
        </section>

        {/* Getting Started */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#F8FAFC] mb-4">🚀 Getting Started</h2>
          <div className="rounded-lg border border-white/5 bg-card/40 p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-[#F8FAFC] mb-2">1. Copy the configuration</h3>
              <p className="text-sm text-muted-foreground">
                Click &quot;Copy Config&quot; above to copy the full template configuration to your clipboard.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#F8FAFC] mb-2">2. Install required tools</h3>
              <p className="text-sm text-muted-foreground">
                Install the tools listed in the stack section. Most can be found in the{" "}
                <Link href="/skills" className="text-cyan hover:underline">
                  Skills directory
                </Link>
                .
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#F8FAFC] mb-2">3. Configure your agent</h3>
              <p className="text-sm text-muted-foreground">
                Paste the configuration into your agent setup and customize as needed.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#F8FAFC] mb-2">4. Deploy</h3>
              <p className="text-sm text-muted-foreground">
                Test locally, then deploy to your preferred platform. Check out our{" "}
                <Link href="/guides" className="text-cyan hover:underline">
                  deployment guides
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Related Templates */}
        {relatedTemplates.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-[#F8FAFC] mb-4">🔗 Related Templates</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedTemplates.map((related) => (
                <Link
                  key={related.id}
                  href={`/templates/${related.id}`}
                  className="rounded-lg border border-white/5 bg-card/40 p-4 hover:border-cyan/20 transition-all group"
                >
                  <h3 className="font-semibold text-[#F8FAFC] mb-2 group-hover:text-cyan transition-colors">
                    {related.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {related.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-8">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <Link href="/templates" className="hover:text-cyan transition-colors">
            ← Back to Templates
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
