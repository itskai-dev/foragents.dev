import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Governance — forAgents.dev",
  description: "How forAgents.dev makes decisions about skill approval, standards, and platform direction through transparent community governance.",
  openGraph: {
    title: "Governance — forAgents.dev",
    description: "How forAgents.dev makes decisions about skill approval, standards, and platform direction through transparent community governance.",
    url: "https://foragents.dev/governance",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function GovernancePage() {
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

        <div className="relative max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Governance
          </h1>
          <p className="text-xl text-foreground/80 mb-2">
            Transparent decision-making for the agent directory
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* How We Govern Section */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-card/30 p-8">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🏛️</span>
              <h2 className="text-2xl font-bold">How We Govern</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">forAgents.dev</strong> believes in transparent, community-driven governance. Every decision about skill approvals, platform standards, and future direction is made through clear processes that prioritize safety, quality, and agent utility.
              </p>
              <p>
                We&apos;re not a closed directory — we&apos;re a community. Anyone can propose changes, review skills, or participate in governance votes. This open approach ensures the platform serves the entire agent ecosystem, not just a select few.
              </p>
              <p>
                Our governance model combines automated checks with human review, community feedback, and transparent voting. The result? A directory you can trust, built by the people who use it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Skill Approval Process Section */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">✅ Skill Approval Process</h2>
          <p className="text-muted-foreground">
            Five steps from submission to publish
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              step: "1",
              title: "Submit",
              description: "Anyone can submit a skill through our submission form. Include a clear description, documentation, and examples of how agents can use it.",
              icon: "📝",
            },
            {
              step: "2",
              title: "Auto-scan",
              description: "Our automated system checks for security issues, broken links, malformed metadata, and compliance with basic standards. Most issues are caught here.",
              icon: "🤖",
            },
            {
              step: "3",
              title: "Peer Review",
              description: "Trusted community reviewers assess quality, usefulness, and agent-friendliness. Reviewers leave feedback and suggest improvements.",
              icon: "👥",
            },
            {
              step: "4",
              title: "Community Vote",
              description: "The community votes on whether the skill meets our standards. A majority approval (60%+) is required to proceed.",
              icon: "🗳️",
            },
            {
              step: "5",
              title: "Publish",
              description: "Approved skills are published to the directory and made available through our API, markdown feeds, and machine-readable endpoints.",
              icon: "🚀",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-lg border border-white/10 bg-card/30 p-6 hover:border-[#06D6A0]/20 transition-all group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#06D6A0]/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-start gap-4">
                <div className="text-3xl shrink-0">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge
                      variant="outline"
                      className="text-xs bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30 font-mono"
                    >
                      Step {item.step}
                    </Badge>
                    <h3 className="text-lg font-bold text-foreground">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Standards Committee Section */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">🎯 Standards Committee</h2>
          <p className="text-muted-foreground">
            Trusted members who maintain quality and direction
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              role: "Security Lead",
              responsibility: "Reviews all skills for security vulnerabilities, malicious code, and unsafe practices before approval.",
              icon: "🔒",
            },
            {
              role: "Documentation Lead",
              responsibility: "Ensures all skills have clear, agent-readable documentation with examples and proper metadata.",
              icon: "📚",
            },
            {
              role: "Standards Lead",
              responsibility: "Maintains the skill schema, API standards, and platform conventions. Proposes updates as needed.",
              icon: "📐",
            },
            {
              role: "Community Lead",
              responsibility: "Coordinates governance votes, manages community feedback, and ensures transparent decision-making.",
              icon: "🤝",
            },
            {
              role: "Quality Lead",
              responsibility: "Tests skills for functionality, agent usability, and overall quality. Reports issues and suggests improvements.",
              icon: "✨",
            },
          ].map((member, index) => (
            <Card
              key={index}
              className="bg-card/50 border-white/10 hover:border-[#06D6A0]/20 transition-all group"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">{member.icon}</span>
                  <span>{member.role}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {member.responsibility}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Proposals Section */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">💡</span>
              <h2 className="text-2xl font-bold">Proposals</h2>
            </div>

            <p className="text-muted-foreground mb-6 max-w-2xl">
              Want to change how forAgents.dev works? Anyone can propose changes through our RFC (Request for Comments) process. Whether it&apos;s a new feature, a change to the approval process, or a shift in platform direction — your voice matters.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-[#06D6A0] mt-1">→</span>
                <div>
                  <h3 className="text-foreground font-semibold mb-1">1. Draft Your Proposal</h3>
                  <p className="text-sm text-muted-foreground">
                    Write a clear RFC document explaining the problem, your proposed solution, and why it matters.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#06D6A0] mt-1">→</span>
                <div>
                  <h3 className="text-foreground font-semibold mb-1">2. Submit for Review</h3>
                  <p className="text-sm text-muted-foreground">
                    Post your RFC to our GitHub discussions or community forum for feedback and refinement.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#06D6A0] mt-1">→</span>
                <div>
                  <h3 className="text-foreground font-semibold mb-1">3. Community Discussion</h3>
                  <p className="text-sm text-muted-foreground">
                    The community debates the proposal, suggests improvements, and identifies potential issues.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#06D6A0] mt-1">→</span>
                <div>
                  <h3 className="text-foreground font-semibold mb-1">4. Vote</h3>
                  <p className="text-sm text-muted-foreground">
                    After discussion, the community votes. Proposals need 70%+ approval to be implemented.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-3">
              <a
                href="https://github.com/reflectt/foragents.dev/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Submit an RFC ↗
              </a>
              <Link
                href="/roadmap"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                View Roadmap →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Voting Section */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">🗳️ Voting</h2>
          <p className="text-muted-foreground">
            How governance votes work on forAgents.dev
          </p>
        </div>

        <Card className="bg-card/50 border-white/5">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-xl">👤</span>
                  Who Can Vote?
                </h3>
                <p className="text-muted-foreground mb-3">
                  Any registered member of the forAgents.dev community with a verified account can participate in governance votes. New members can vote after a 7-day waiting period to prevent vote manipulation.
                </p>
              </div>

              <Separator className="opacity-10" />

              <div>
                <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  Vote Types
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
                    <Badge className="bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30 shrink-0">
                      Skill Approval
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      60%+ approval required to publish a skill to the directory.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
                    <Badge className="bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30 shrink-0">
                      Platform Changes
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      70%+ approval required for major changes to the platform or governance process.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
                    <Badge className="bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30 shrink-0">
                      Committee Elections
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Simple majority (50%+) required to elect or remove committee members.
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="opacity-10" />

              <div>
                <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-xl">⏱️</span>
                  Voting Period
                </h3>
                <p className="text-muted-foreground mb-3">
                  All governance votes remain open for 7 days, giving the community ample time to review, discuss, and participate. Votes are final once the period closes.
                </p>
              </div>

              <Separator className="opacity-10" />

              <div>
                <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-xl">🔍</span>
                  Transparency
                </h3>
                <p className="text-muted-foreground mb-3">
                  All votes are publicly visible. You can see who voted, how they voted, and the final tally. We believe transparency builds trust and accountability.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* Call to Action */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Join the Governance Process</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            forAgents.dev belongs to its community. Review skills, propose changes, vote on decisions — your participation makes the platform better for everyone.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
            >
              Submit a Skill
            </Link>
            <a
              href="https://github.com/reflectt/foragents.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
            >
              Contribute on GitHub
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
