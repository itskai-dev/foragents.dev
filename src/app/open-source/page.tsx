import Link from "next/link";

export const metadata = {
  title: "Open Source — forAgents.dev",
  description: "forAgents.dev is open source. Explore our repos, contribute to the community, and help shape the future of agent development.",
  openGraph: {
    title: "Open Source — forAgents.dev",
    description: "forAgents.dev is open source. Explore our repos, contribute to the community, and help shape the future of agent development.",
    url: "https://foragents.dev/open-source",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function OpenSourcePage() {
  const repos = [
    {
      name: "foragents.dev",
      description: "The agent-native directory. Machine-readable endpoints, clean markdown feeds, and tools built for autonomous AI.",
      language: "TypeScript",
      stars: "1.2k",
      link: "https://github.com/reflectt/foragents.dev",
    },
    {
      name: "agent-team-kit",
      description: "Multi-agent coordination framework. Build agent teams that work together, share context, and solve complex problems.",
      language: "TypeScript",
      stars: "856",
      link: "https://github.com/reflectt/agent-team-kit",
    },
    {
      name: "openclaw",
      description: "Open source agent runtime. Desktop + mobile coordination, browser control, and skill execution for AI agents.",
      language: "TypeScript",
      stars: "2.4k",
      link: "https://github.com/reflectt/openclaw",
    },
    {
      name: "skills-registry",
      description: "Community-contributed agent skills. Browse, fork, and submit reusable capabilities for AI agents.",
      language: "Markdown",
      stars: "423",
      link: "https://github.com/reflectt/skills-registry",
    },
    {
      name: "agent-protocol",
      description: "Standardized communication protocol for multi-agent systems. JSON-based messaging with async support.",
      language: "TypeScript",
      stars: "691",
      link: "https://github.com/reflectt/agent-protocol",
    },
    {
      name: "llms-txt",
      description: "Machine-readable documentation format. Let agents discover your API without scraping HTML.",
      language: "Markdown",
      stars: "1.8k",
      link: "https://github.com/reflectt/llms-txt",
    },
  ];

  const contributionSteps = [
    {
      step: "1",
      title: "Fork",
      description: "Fork the repository you want to contribute to. This creates your own copy where you can make changes.",
      icon: "🍴",
    },
    {
      step: "2",
      title: "Branch",
      description: "Create a new branch for your feature or fix. Keep it focused and give it a descriptive name.",
      icon: "🌿",
    },
    {
      step: "3",
      title: "PR",
      description: "Submit a pull request with your changes. Include a clear description of what you&apos;ve built and why.",
      icon: "📬",
    },
    {
      step: "4",
      title: "Review",
      description: "Work with maintainers during code review. We&apos;re here to help polish your contribution.",
      icon: "👀",
    },
  ];

  const contributors = [
    { emoji: "🤖", name: "Agent Alpha" },
    { emoji: "🦾", name: "Bot Builder" },
    { emoji: "⚡", name: "Speed Coder" },
    { emoji: "🎨", name: "Design Agent" },
    { emoji: "🔧", name: "Fix Master" },
    { emoji: "📚", name: "Doc Writer" },
    { emoji: "🚀", name: "Ship Fast" },
    { emoji: "💡", name: "Idea Generator" },
    { emoji: "🔍", name: "Bug Hunter" },
    { emoji: "🌟", name: "Star Contributor" },
    { emoji: "🛠️", name: "Tool Builder" },
    { emoji: "🎯", name: "Goal Setter" },
  ];

  const languageColors: Record<string, string> = {
    TypeScript: "bg-[#3178c6]/20 text-[#3178c6] border-[#3178c6]/30",
    Markdown: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    Python: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    JavaScript: "bg-[#f7df1e]/20 text-[#f7df1e] border-[#f7df1e]/30",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Mobile Nav */}

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#06D6A0]/10 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-[#06D6A0] to-white bg-clip-text text-transparent">
              Open Source at forAgents.dev
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
              Built by the community, for the community. Join us in shaping the future of AI agent development.
            </p>
          </div>
        </div>
      </section>

      {/* Our Commitment */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Commitment</h2>
          <p className="text-gray-400 max-w-3xl mx-auto text-base sm:text-lg">
            We believe open source is the foundation of trustworthy AI. Every line of code, every API endpoint, every tool we build is transparent, auditable, and free for anyone to use, modify, and improve.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 hover:border-[#06D6A0]/50 transition-colors">
            <div className="text-4xl mb-4">🔓</div>
            <h3 className="text-xl font-semibold mb-3 text-[#06D6A0]">Transparency First</h3>
            <p className="text-gray-400">
              No black boxes. See exactly how our tools work, from API routes to agent coordination logic.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 hover:border-[#06D6A0]/50 transition-colors">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-3 text-[#06D6A0]">Community Built</h3>
            <p className="text-gray-400">
              Contributions from developers worldwide make our platform better every day. Your code matters.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 hover:border-[#06D6A0]/50 transition-colors">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-3 text-[#06D6A0]">Innovation Velocity</h3>
            <p className="text-gray-400">
              Open collaboration accelerates progress. Hundreds of minds building together move faster than one.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Repos */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 border-t border-white/10">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Featured Repositories</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Explore our open source projects. Fork them, contribute to them, build on top of them.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {repos.map((repo) => (
            <div
              key={repo.name}
              className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-[#06D6A0]/50 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-white group-hover:text-[#06D6A0] transition-colors">
                  {repo.name}
                </h3>
                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                  <span>⭐</span>
                  <span>{repo.stars}</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                {repo.description}
              </p>
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium border ${
                    languageColors[repo.language] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
                  }`}
                >
                  {repo.language}
                </span>
                <a
                  href={repo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#06D6A0] hover:underline inline-flex items-center gap-1"
                >
                  View on GitHub
                  <span className="text-xs">↗</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How to Contribute */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 border-t border-white/10">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How to Contribute</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            New to open source? We&apos;ve got you covered. Follow these four simple steps.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {contributionSteps.map((step) => (
            <div
              key={step.step}
              className="relative bg-white/5 border border-white/10 rounded-lg p-6 hover:border-[#06D6A0]/50 transition-colors"
            >
              <div className="absolute top-4 right-4 text-6xl font-bold text-white/5">
                {step.step}
              </div>
              <div className="relative">
                <div className="text-5xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-[#06D6A0]">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <a
            href="https://github.com/reflectt/foragents.dev/blob/main/CONTRIBUTING.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#06D6A0] hover:underline"
          >
            Read our full contribution guide
            <span className="text-sm">→</span>
          </a>
        </div>
      </section>

      {/* Contributors */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 border-t border-white/10">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Contributors</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Thank you to all the amazing people who make forAgents.dev possible. {contributors.length}+ contributors and growing!
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {contributors.map((contributor, index) => (
            <div
              key={index}
              className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 text-3xl sm:text-4xl bg-white/5 border border-white/10 rounded-full hover:border-[#06D6A0]/50 hover:scale-110 transition-all cursor-pointer"
              title={contributor.name}
            >
              {contributor.emoji}
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-4">
            Want to see your name here?
          </p>
          <a
            href="https://github.com/reflectt/foragents.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#06D6A0] hover:bg-[#05c794] text-black font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Start Contributing Today
          </a>
        </div>
      </section>

      {/* License */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 border-t border-white/10">
        <div className="bg-gradient-to-br from-[#06D6A0]/10 to-transparent border border-[#06D6A0]/30 rounded-lg p-8 sm:p-12 text-center">
          <div className="text-5xl mb-4">📜</div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">MIT License</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-6">
            forAgents.dev is licensed under the MIT License. You&apos;re free to use, modify, distribute, and build commercial products on top of our code. No strings attached.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/reflectt/foragents.dev/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#06D6A0] text-[#06D6A0] hover:bg-[#06D6A0]/10 transition-colors"
            >
              Read the License
              <span className="text-sm">↗</span>
            </a>
            <a
              href="https://opensource.org/licenses/MIT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-[#06D6A0] transition-colors"
            >
              Learn more about MIT License →
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
