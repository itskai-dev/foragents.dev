"use client";

import Link from "next/link";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  applyUrl: string;
}

const jobs: Job[] = [
  {
    id: "senior-fullstack",
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description:
      "Build the future of agent infrastructure. Work on core platform features, API design, and developer tools that power thousands of AI agents.",
    applyUrl: "https://foragents.dev/apply/senior-fullstack",
  },
  {
    id: "devrel",
    title: "Developer Relations Engineer",
    department: "DevRel",
    location: "Remote",
    type: "Full-time",
    description:
      "Be the bridge between our platform and the developer community. Create content, speak at events, and help builders succeed with agent development.",
    applyUrl: "https://foragents.dev/apply/devrel",
  },
  {
    id: "ml-engineer",
    title: "ML Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description:
      "Push the boundaries of what agents can do. Work on model optimization, agent reasoning systems, and cutting-edge AI research applications.",
    applyUrl: "https://foragents.dev/apply/ml-engineer",
  },
  {
    id: "designer",
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    description:
      "Design intuitive experiences for agent builders. Shape the future of developer tools and create delightful interfaces for complex systems.",
    applyUrl: "https://foragents.dev/apply/designer",
  },
  {
    id: "community-manager",
    title: "Community Manager",
    department: "Community",
    location: "Remote",
    type: "Full-time",
    description:
      "Grow and nurture our community of agent developers. Organize events, moderate discussions, and help create a thriving ecosystem.",
    applyUrl: "https://foragents.dev/apply/community-manager",
  },
];

const perks = [
  {
    icon: "🌍",
    title: "Remote-first",
    description:
      "Work from anywhere in the world. We believe great talent isn&apos;t limited by geography. Async-friendly culture with flexible hours.",
  },
  {
    icon: "🔓",
    title: "Open Source",
    description:
      "Build in public. Contribute to open-source projects, share your work, and collaborate with the global developer community.",
  },
  {
    icon: "🤖",
    title: "Cutting Edge AI",
    description:
      "Work with the latest AI models and technologies. Shape the future of autonomous agents and human-AI collaboration.",
  },
  {
    icon: "💫",
    title: "Impact",
    description:
      "Build tools used by thousands of developers worldwide. Your work directly empowers the next generation of AI applications.",
  },
];

const values = [
  {
    title: "Builders First",
    description:
      "We exist to serve developers. Every decision we make prioritizes the builder experience and community needs.",
  },
  {
    title: "Move Fast, Think Deep",
    description:
      "Ship quickly, but think carefully. We balance speed with thoughtful design and long-term architectural decisions.",
  },
  {
    title: "Radically Open",
    description:
      "Default to transparency. Share our work, our thinking, and our learnings openly with the community.",
  },
  {
    title: "Human + AI",
    description:
      "We build tools that enhance human capabilities, not replace them. AI should empower people to do their best work.",
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-[#0a0a0a]/80 relative">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="text-xs text-muted-foreground font-mono">
              forAgents.dev
            </span>
          </Link>
          <MobileNav />
        </div>
      </header>

      <main id="main-content" className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Join the <span style={{ color: "#06D6A0" }}>forAgents.dev</span>{" "}
            Team
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Help us build the future of AI agent development. Work with a team
            that&apos;s passionate about empowering developers worldwide.
          </p>
        </div>

        {/* Why Join Us */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Why Join Us</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {perks.map((perk) => (
              <div
                key={perk.title}
                className="p-6 rounded-xl border border-white/10 bg-card/50 hover:border-[#06D6A0]/50 transition-all"
              >
                <div className="text-4xl mb-3">{perk.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{perk.title}</h3>
                <p className="text-muted-foreground">{perk.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Open Positions */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Open Positions</h2>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-6 rounded-xl border border-white/10 bg-card/50 hover:border-[#06D6A0]/50 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="text-xl font-semibold group-hover:text-[#06D6A0] transition-colors">
                        {job.title}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {job.location}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        {job.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {job.department}
                    </p>
                    <p className="text-muted-foreground">{job.description}</p>
                  </div>
                  <a
                    href={job.applyUrl}
                    className="shrink-0 px-6 py-2.5 rounded-lg bg-[#06D6A0]/10 text-[#06D6A0] border border-[#06D6A0]/30 hover:bg-[#06D6A0]/20 hover:border-[#06D6A0]/50 transition-all font-medium text-center"
                  >
                    Apply
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Our Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Our Values</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {values.map((value) => (
              <div
                key={value.title}
                className="p-6 rounded-xl border border-white/10 bg-card/50"
              >
                <h3 className="text-xl font-semibold mb-2 text-[#06D6A0]">
                  {value.title}
                </h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12 px-6 rounded-xl border border-white/10 bg-card/30">
          <h2 className="text-2xl font-bold mb-3">
            Don&apos;t see a perfect fit?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            We&apos;re always looking for talented people who share our passion
            for building great developer tools. Send us your resume and
            let&apos;s talk.
          </p>
          <a
            href="mailto:careers@foragents.dev"
            className="inline-block px-8 py-3 rounded-lg bg-[#06D6A0]/10 text-[#06D6A0] border border-[#06D6A0]/30 hover:bg-[#06D6A0]/20 hover:border-[#06D6A0]/50 transition-all font-medium"
          >
            Get in Touch
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}
