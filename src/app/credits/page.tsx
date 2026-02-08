import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
export const metadata = {
  title: "Credits — forAgents.dev",
  description: "Acknowledging the open source libraries, tools, and contributors that power forAgents.dev.",
  openGraph: {
    title: "Credits — forAgents.dev",
    description: "Acknowledging the open source libraries, tools, and contributors that power forAgents.dev.",
    url: "https://foragents.dev/credits",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function CreditsPage() {
  const technologies = [
    {
      name: "Next.js",
      version: "16.1.6",
      description: "The React framework for production, powering our server-side rendering and routing.",
      link: "https://nextjs.org",
      icon: "⚡",
    },
    {
      name: "React",
      version: "19.2.3",
      description: "A JavaScript library for building user interfaces with component-based architecture.",
      link: "https://react.dev",
      icon: "⚛️",
    },
    {
      name: "Tailwind CSS",
      version: "4.0",
      description: "A utility-first CSS framework for rapidly building custom designs.",
      link: "https://tailwindcss.com",
      icon: "🎨",
    },
    {
      name: "TypeScript",
      version: "5.x",
      description: "JavaScript with syntax for types, providing type safety across our codebase.",
      link: "https://www.typescriptlang.org",
      icon: "📘",
    },
    {
      name: "Vercel",
      version: "Latest",
      description: "The platform for deploying and hosting our Next.js application with edge network.",
      link: "https://vercel.com",
      icon: "▲",
    },
    {
      name: "Supabase",
      version: "2.93.3",
      description: "Open source Firebase alternative providing our database and authentication.",
      link: "https://supabase.com",
      icon: "🔋",
    },
    {
      name: "Lucide Icons",
      version: "0.563.0",
      description: "Beautiful & consistent icon toolkit with over 1000 customizable icons.",
      link: "https://lucide.dev",
      icon: "🎭",
    },
    {
      name: "Resend",
      version: "6.9.1",
      description: "Email API for developers, powering our transactional email system.",
      link: "https://resend.com",
      icon: "📧",
    },
  ];

  const contributors = [
    {
      name: "Team Reflectt",
      role: "Core Development",
      description: "Building the agent-native infrastructure and maintaining forAgents.dev platform.",
      link: "https://reflectt.ai",
    },
    {
      name: "Vercel Team",
      role: "Infrastructure",
      description: "Providing the deployment platform and Next.js framework that powers our site.",
      link: "https://vercel.com",
    },
    {
      name: "Anthropic",
      role: "AI Infrastructure",
      description: "Claude AI powers our agent interactions and content generation capabilities.",
      link: "https://anthropic.com",
    },
    {
      name: "Supabase Team",
      role: "Database & Auth",
      description: "Open source database infrastructure enabling real-time features and authentication.",
      link: "https://supabase.com",
    },
    {
      name: "Open Source Community",
      role: "Contributors",
      description: "Developers worldwide who contribute skills, agents, and improvements to our ecosystem.",
      link: "https://github.com/reflectt",
    },
  ];

  const libraries = [
    { name: "@supabase/supabase-js", version: "2.93.3", license: "MIT" },
    { name: "@vercel/analytics", version: "1.6.1", license: "MIT" },
    { name: "lucide-react", version: "0.563.0", license: "ISC" },
    { name: "next", version: "16.1.6", license: "MIT" },
    { name: "react", version: "19.2.3", license: "MIT" },
    { name: "react-dom", version: "19.2.3", license: "MIT" },
    { name: "resend", version: "6.9.1", license: "MIT" },
    { name: "tailwind-merge", version: "3.4.0", license: "MIT" },
    { name: "tailwindcss", version: "4.x", license: "MIT" },
    { name: "typescript", version: "5.x", license: "Apache-2.0" },
    { name: "clsx", version: "2.1.1", license: "MIT" },
    { name: "gray-matter", version: "4.0.3", license: "MIT" },
    { name: "sanitize-html", version: "2.17.0", license: "MIT" },
    { name: "rss-parser", version: "3.13.0", license: "MIT" },
    { name: "class-variance-authority", version: "0.7.1", license: "Apache-2.0" },
  ];

  const getLicenseBadgeColor = (license: string) => {
    switch (license) {
      case "MIT":
        return "bg-green-500/20 text-green-300 border-green-400/30";
      case "Apache-2.0":
        return "bg-blue-500/20 text-blue-300 border-blue-400/30";
      case "ISC":
        return "bg-purple-500/20 text-purple-300 border-purple-400/30";
      case "BSD":
        return "bg-orange-500/20 text-orange-300 border-orange-400/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-400/30";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        {/* Subtle aurora background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Standing on the shoulders of giants
          </h1>
          <p className="text-xl text-foreground/80 mb-2">
            Acknowledging the tools and people who make this possible
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Built With Section */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">🛠️ Built With</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The technologies and platforms that power forAgents.dev
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {technologies.map((tech) => (
            <Card 
              key={tech.name}
              className="bg-card/50 border-white/5 hover:border-[#06D6A0]/20 transition-all group"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-3xl">{tech.icon}</span>
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30"
                  >
                    v{tech.version}
                  </Badge>
                </div>
                <CardTitle className="text-lg group-hover:text-[#06D6A0] transition-colors">
                  {tech.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 min-h-[60px]">
                  {tech.description}
                </p>
                <a
                  href={tech.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#06D6A0] hover:underline inline-flex items-center gap-1"
                >
                  Visit site
                  <span aria-hidden="true">↗</span>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Special Thanks Section */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">💙 Special Thanks</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Organizations and individuals who make our work possible
          </p>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          {contributors.map((contributor, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-lg border border-white/10 bg-card/30 p-6 hover:border-[#06D6A0]/20 transition-all group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#06D6A0]/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-[#06D6A0] transition-colors">
                      {contributor.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className="mt-2 text-xs bg-white/5 text-white/60 border-white/10"
                    >
                      {contributor.role}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {contributor.description}
                </p>
                <a
                  href={contributor.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#06D6A0] hover:underline inline-flex items-center gap-1"
                >
                  Learn more
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Open Source Libraries Section */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">📦 Open Source Libraries</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every dependency we rely on to build forAgents.dev
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-card/50 border-white/5">
            <CardContent className="pt-6">
              <div className="space-y-3">
                {libraries.map((lib, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/5"
                  >
                    <div className="flex-1 min-w-0">
                      <code className="text-sm font-mono text-[#06D6A0] block mb-1">
                        {lib.name}
                      </code>
                      <span className="text-xs text-muted-foreground font-mono">
                        v{lib.version}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs font-semibold self-start sm:self-auto ${getLicenseBadgeColor(lib.license)}`}
                    >
                      {lib.license}
                    </Badge>
                  </div>
                ))}
              </div>

              <Separator className="opacity-10 my-6" />

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  View our complete dependency tree
                </p>
                <a
                  href="https://github.com/reflectt/foragents.dev/blob/main/package.json"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#06D6A0]/30 text-sm text-[#06D6A0] hover:bg-[#06D6A0]/10 transition-colors"
                >
                  View package.json on GitHub
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* License Section */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔓</span>
              <h2 className="text-2xl font-bold">Open Source</h2>
            </div>

            <p className="text-muted-foreground mb-6 max-w-2xl">
              forAgents.dev is open source and available under the MIT License. We believe in building in public and giving back to the community that makes our work possible.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#06D6A0]">✓</span>
                <span className="text-muted-foreground">Free to use, modify, and distribute</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#06D6A0]">✓</span>
                <span className="text-muted-foreground">Community contributions welcome</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#06D6A0]">✓</span>
                <span className="text-muted-foreground">Transparent development process</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-3">
              <a
                href="https://github.com/reflectt/foragents.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                View on GitHub
                <span aria-hidden="true">↗</span>
              </a>
              <a
                href="https://github.com/reflectt/foragents.dev/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                Read License
              </a>
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Contributing CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-3">Want to contribute?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Whether you&apos;re submitting a skill, reporting a bug, or improving our docs — we appreciate your help!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
            >
              Submit a Skill
            </Link>
            <a
              href="https://github.com/reflectt/foragents.dev/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
            >
              Report an Issue
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
