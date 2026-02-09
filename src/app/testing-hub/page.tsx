import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Testing Hub — forAgents.dev",
  description: "Comprehensive testing resources for AI agents: test cases, benchmarks, CI/CD guides, and testing methodologies.",
  openGraph: {
    title: "Testing Hub — forAgents.dev",
    description: "Comprehensive testing resources for AI agents: test cases, benchmarks, CI/CD guides, and testing methodologies.",
    url: "https://foragents.dev/testing-hub",
    siteName: "forAgents.dev",
    type: "website",
  },
};

const resources = [
  {
    title: "Test Case Library",
    href: "/testing-hub/cases",
    icon: "📚",
    description: "30+ pre-built test cases covering tool reliability, context handling, error recovery, multi-turn conversations, and edge cases.",
    features: [
      "Organized by category",
      "Complete setup instructions",
      "Expected behaviors documented",
      "Common failure patterns",
    ],
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
  },
  {
    title: "Benchmark Suite",
    href: "/testing-hub/benchmarks",
    icon: "📊",
    description: "Standardized benchmarks for measuring agent capabilities: response quality, tool efficiency, context retention, and more.",
    features: [
      "Weighted scoring methodology",
      "Multiple test suites",
      "Community leaderboard concept",
      "Statistical confidence intervals",
    ],
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30",
  },
  {
    title: "CI/CD for Agents",
    href: "/testing-hub/ci-cd",
    icon: "🚀",
    description: "Production-ready CI/CD pipelines with GitHub Actions templates, deployment strategies, and monitoring best practices.",
    features: [
      "Ready-to-use templates",
      "Canary deployment guides",
      "Rollback strategies",
      "Pre-deploy validation",
    ],
    color: "from-green-500/20 to-emerald-500/20",
    borderColor: "border-green-500/30",
  },
];

const methodologies = [
  {
    title: "Unit Testing Agents",
    description: "Test individual agent behaviors and tool calls in isolation",
    icon: "🧪",
    topics: [
      "Testing tool selection logic",
      "Validating parameter generation",
      "Mocking external dependencies",
      "Snapshot testing responses",
    ],
  },
  {
    title: "Integration Testing",
    description: "Verify tool calls work correctly end-to-end",
    icon: "🔗",
    topics: [
      "Real API integration tests",
      "File system operations",
      "Database interactions",
      "Multi-tool workflows",
    ],
  },
  {
    title: "End-to-End Testing",
    description: "Test complete conversation flows from start to finish",
    icon: "💬",
    topics: [
      "Multi-turn conversations",
      "Context retention across turns",
      "Error recovery flows",
      "Task completion validation",
    ],
  },
  {
    title: "Regression Testing",
    description: "Ensure updates don&apos;t break existing behaviors",
    icon: "🔄",
    topics: [
      "Behavioral baseline comparison",
      "Automated regression detection",
      "Golden file testing",
      "Performance benchmarking",
    ],
  },
  {
    title: "A/B Testing Prompts",
    description: "Compare different prompts and configurations",
    icon: "🎯",
    topics: [
      "Prompt variant testing",
      "Statistical significance",
      "User preference analysis",
      "Cost-performance tradeoffs",
    ],
  },
  {
    title: "Stress Testing",
    description: "Test agent behavior under challenging conditions",
    icon: "⚡",
    topics: [
      "High load testing",
      "Rate limit handling",
      "Long conversation stability",
      "Memory pressure scenarios",
    ],
  },
];

const frameworks = [
  {
    name: "Jest",
    description: "Popular JavaScript testing framework with great mocking",
    url: "https://jestjs.io",
  },
  {
    name: "Vitest",
    description: "Fast unit test framework for modern JavaScript",
    url: "https://vitest.dev",
  },
  {
    name: "Playwright",
    description: "End-to-end testing for web-based agents",
    url: "https://playwright.dev",
  },
  {
    name: "LangSmith",
    description: "LLM testing and monitoring platform",
    url: "https://smith.langchain.com",
  },
  {
    name: "Promptfoo",
    description: "Open-source LLM testing framework",
    url: "https://promptfoo.dev",
  },
  {
    name: "AgentOps",
    description: "Agent monitoring and testing",
    url: "https://agentops.ai",
  },
];

export default function TestingHubPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero Section */}
      <section className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Agent Testing Hub
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/70">
              Comprehensive testing resources for AI agent developers. Build reliable, robust agents with proven testing
              methodologies, pre-built test cases, and production-ready CI/CD pipelines.
            </p>
          </div>
        </div>
      </section>

      {/* Main Resources */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">Testing Resources</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {resources.map((resource) => (
              <Link
                key={resource.href}
                href={resource.href}
                className={`group relative overflow-hidden rounded-2xl border ${resource.borderColor} bg-gradient-to-br ${resource.color} p-8 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-white/10`}
              >
                <div className="text-6xl mb-4">{resource.icon}</div>
                <h3 className="text-2xl font-bold mb-3">{resource.title}</h3>
                <p className="text-white/70 mb-6">{resource.description}</p>
                <ul className="space-y-2">
                  {resource.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-white/60">
                      <span className="text-green-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="absolute bottom-8 right-8 text-4xl opacity-20 group-hover:opacity-40 transition-opacity">
                  →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Methodologies */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Testing Methodologies</h2>
            <p className="text-white/70 max-w-3xl">
              Different types of testing serve different purposes. Here&apos;s a comprehensive overview of testing approaches
              for AI agents.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {methodologies.map((methodology) => (
              <div
                key={methodology.title}
                className="rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors"
              >
                <div className="text-4xl mb-3">{methodology.icon}</div>
                <h3 className="text-xl font-bold mb-2">{methodology.title}</h3>
                <p className="text-white/70 text-sm mb-4">{methodology.description}</p>
                <ul className="space-y-1.5">
                  {methodology.topics.map((topic, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-white/60">
                      <span className="mt-1">•</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools & Frameworks */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Testing Tools & Frameworks</h2>
            <p className="text-white/70 max-w-3xl">
              Popular tools and frameworks for testing AI agents. Each serves different use cases and testing needs.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {frameworks.map((framework) => (
              <a
                key={framework.name}
                href={framework.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1 group-hover:text-blue-400 transition-colors">
                    {framework.name}
                  </h3>
                  <p className="text-white/60 text-sm">{framework.description}</p>
                </div>
                <span className="text-white/40 group-hover:text-white/60 transition-colors">↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Testing Best Practices</h2>
            <p className="text-white/70 max-w-3xl">
              Key principles for effective agent testing
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-8">
              <h3 className="text-xl font-bold mb-4 text-green-400">✓ Do</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">•</span>
                  <span className="text-white/70">
                    <strong className="text-white">Test early and often.</strong> Integrate testing into your development
                    workflow from day one.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">•</span>
                  <span className="text-white/70">
                    <strong className="text-white">Use realistic test data.</strong> Test with data that matches production
                    scenarios.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">•</span>
                  <span className="text-white/70">
                    <strong className="text-white">Automate repetitive tests.</strong> Free up time for exploratory testing.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">•</span>
                  <span className="text-white/70">
                    <strong className="text-white">Monitor in production.</strong> Real-world behavior often differs from
                    tests.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">•</span>
                  <span className="text-white/70">
                    <strong className="text-white">Track performance over time.</strong> Catch regressions before users do.
                  </span>
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-8">
              <h3 className="text-xl font-bold mb-4 text-red-400">✗ Don&apos;t</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span className="text-white/70">
                    <strong className="text-white">Skip edge cases.</strong> Production will find them eventually.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span className="text-white/70">
                    <strong className="text-white">Test only happy paths.</strong> Error handling is equally important.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span className="text-white/70">
                    <strong className="text-white">Ignore flaky tests.</strong> They erode confidence in your test suite.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span className="text-white/70">
                    <strong className="text-white">Deploy without testing.</strong> Even &quot;small&quot; changes can have unexpected
                    impacts.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span className="text-white/70">
                    <strong className="text-white">Forget to update tests.</strong> Tests should evolve with your agent.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
