import Link from "next/link";

export const metadata = {
  title: "How to Submit — forAgents.dev",
  description: "Submit your skills, MCP servers, llms.txt sites, and ACP agents to the forAgents.dev directory.",
};

export default function SubmitPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="text-xs text-muted-foreground font-mono">
              forAgents.dev
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              href="/getting-started"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/llms.txt"
              className="text-muted-foreground hover:text-cyan font-mono text-xs transition-colors"
            >
              /llms.txt
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-invert prose-cyan">
        <h1 className="text-4xl font-bold mb-2">
          How to Submit to <span className="aurora-text">forAgents.dev</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          We&apos;re building the definitive directory of agent-compatible tools, and we want your contributions.
        </p>

        <hr className="border-white/10 my-8" />

        <h2 className="text-2xl font-bold mt-12 mb-4">What Can You Submit?</h2>
        <p>forAgents.dev accepts four types of submissions:</p>

        <div className="grid gap-4 my-6 not-prose">
          <div className="p-4 rounded-lg bg-card border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🧰</span>
              <strong className="text-[#F59E0B]">Skills</strong>
            </div>
            <p className="text-sm text-muted-foreground m-0">
              Packaged capabilities that agents can install and use (tools, integrations, workflows)
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🔌</span>
              <strong className="text-[#06D6A0]">MCP Servers</strong>
            </div>
            <p className="text-sm text-muted-foreground m-0">
              Model Context Protocol servers that expose tools and resources to AI agents
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📄</span>
              <strong className="text-[#3B82F6]">llms.txt Sites</strong>
            </div>
            <p className="text-sm text-muted-foreground m-0">
              Websites with llms.txt or llms-full.txt files for agent-readable documentation
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🤖</span>
              <strong className="text-[#8B5CF6]">ACP Agents</strong>
            </div>
            <p className="text-sm text-muted-foreground m-0">
              Agent Communication Protocol compatible agents that can collaborate with other agents
            </p>
          </div>
        </div>

        <hr className="border-white/10 my-8" />

        <h2 className="text-2xl font-bold mt-12 mb-4">Submission Process</h2>
        <p>All submissions are made via <strong>GitHub Pull Request</strong> to our public repository.</p>

        <h3 className="text-xl font-bold mt-8 mb-3">Step-by-Step</h3>
        <ol className="space-y-3">
          <li>
            <strong>Fork the repository</strong>
            <pre className="bg-card border border-white/10 rounded-lg p-4 overflow-x-auto mt-2">
              <code>git clone https://github.com/anthropics/foragents-directory.git{"\n"}cd foragents-directory</code>
            </pre>
          </li>
          <li>
            <strong>Add your entry</strong> to the appropriate JSON file:
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li><code>data/skills.json</code> — for Skills</li>
              <li><code>data/mcp-servers.json</code> — for MCP Servers</li>
              <li><code>data/llms-txt.json</code> — for llms.txt sites</li>
              <li><code>data/acp-agents.json</code> — for ACP Agents</li>
            </ul>
          </li>
          <li>
            <strong>Validate your JSON</strong>
            <pre className="bg-card border border-white/10 rounded-lg p-4 overflow-x-auto mt-2">
              <code>npm run validate</code>
            </pre>
          </li>
          <li>
            <strong>Create a Pull Request</strong> with:
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>Clear title: <code>[Skill] Add my-awesome-tool</code> or <code>[MCP] Add weather-server</code></li>
              <li>Brief description of what it does</li>
              <li>Link to documentation or demo (if available)</li>
            </ul>
          </li>
          <li>
            <strong>Wait for review</strong> — We&apos;ll review your submission and provide feedback if needed.
          </li>
        </ol>

        <hr className="border-white/10 my-8" />

        <h2 className="text-2xl font-bold mt-12 mb-4">Format Requirements</h2>
        <p>Each submission type has a specific JSON schema. Follow these exactly.</p>

        <h3 className="text-xl font-bold mt-8 mb-3">Skills Schema</h3>
        <pre className="bg-card border border-white/10 rounded-lg p-4 overflow-x-auto text-sm">
{`{
  "id": "github-skill",
  "name": "GitHub Integration",
  "description": "Interact with GitHub repositories, issues, PRs, and actions",
  "author": "your-github-username",
  "repository": "https://github.com/username/github-skill",
  "version": "1.2.0",
  "license": "MIT",
  "tags": ["git", "github", "version-control", "devtools"],
  "install": {
    "type": "npm",
    "package": "@username/github-skill"
  },
  "capabilities": ["read-repos", "create-issues", "manage-prs"],
  "requirements": {
    "auth": ["GITHUB_TOKEN"],
    "runtime": "node >= 18"
  },
  "documentation": "https://github.com/username/github-skill#readme",
  "verified": false
}`}
        </pre>

        <h4 className="text-lg font-semibold mt-6 mb-2">Required Fields</h4>
        <div className="not-prose">
          <ul className="space-y-2 text-sm">
            <li><code className="text-cyan">id</code> — Unique identifier (lowercase, hyphens only)</li>
            <li><code className="text-cyan">name</code> — Human-readable name</li>
            <li><code className="text-cyan">description</code> — One-line description (max 160 chars)</li>
            <li><code className="text-cyan">author</code> — GitHub username or org</li>
            <li><code className="text-cyan">repository</code> — Public repository URL</li>
            <li><code className="text-cyan">version</code> — Semantic version</li>
            <li><code className="text-cyan">tags</code> — 2-5 relevant tags</li>
            <li><code className="text-cyan">install</code> — Installation instructions</li>
          </ul>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-3">MCP Servers Schema</h3>
        <pre className="bg-card border border-white/10 rounded-lg p-4 overflow-x-auto text-sm">
{`{
  "id": "weather-mcp",
  "name": "Weather MCP Server",
  "description": "Get current weather, forecasts, and alerts for any location",
  "author": "weather-tools",
  "repository": "https://github.com/weather-tools/weather-mcp",
  "transport": ["stdio", "sse"],
  "tools": [
    { "name": "get_weather", "description": "Get current weather for a location" },
    { "name": "get_forecast", "description": "Get 7-day forecast" }
  ],
  "requirements": {
    "auth": ["OPENWEATHER_API_KEY"]
  }
}`}
        </pre>

        <h3 className="text-xl font-bold mt-8 mb-3">llms.txt Sites Schema</h3>
        <pre className="bg-card border border-white/10 rounded-lg p-4 overflow-x-auto text-sm">
{`{
  "id": "stripe-docs",
  "name": "Stripe",
  "domain": "stripe.com",
  "description": "Payment processing API documentation",
  "llms_txt_url": "https://docs.stripe.com/llms.txt",
  "llms_full_url": "https://docs.stripe.com/llms-full.txt",
  "category": "fintech",
  "tags": ["payments", "api", "fintech", "billing"]
}`}
        </pre>

        <h3 className="text-xl font-bold mt-8 mb-3">ACP Agents Schema</h3>
        <pre className="bg-card border border-white/10 rounded-lg p-4 overflow-x-auto text-sm">
{`{
  "id": "code-reviewer",
  "name": "Code Review Agent",
  "description": "Automated code review with security scanning and best practices",
  "author": "devtools-inc",
  "acp_version": "1.0",
  "capabilities": {
    "input": ["code-diff", "pull-request", "repository"],
    "output": ["review-comments", "security-report", "suggestions"]
  },
  "endpoint": "https://api.devtools.io/acp/code-reviewer"
}`}
        </pre>

        <hr className="border-white/10 my-8" />

        <h2 className="text-2xl font-bold mt-12 mb-4">Review Criteria</h2>
        <p>Every submission is reviewed for quality. Here&apos;s what we look for:</p>

        <h3 className="text-lg font-semibold mt-6 mb-2 text-[#06D6A0]">✅ Required</h3>
        <ul className="space-y-1 text-sm">
          <li><strong>Working installation</strong> — We test that it actually installs and runs</li>
          <li><strong>Clear documentation</strong> — README explains what it does and how to use it</li>
          <li><strong>Agent-compatible</strong> — Works with AI agents, not just humans</li>
          <li><strong>Valid JSON</strong> — Passes schema validation</li>
          <li><strong>Unique ID</strong> — No conflicts with existing entries</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-2 text-[#F59E0B]">🌟 Preferred</h3>
        <ul className="space-y-1 text-sm">
          <li><strong>Active maintenance</strong> — Recent commits, responsive to issues</li>
          <li><strong>Open source</strong> — Publicly auditable code</li>
          <li><strong>Good error handling</strong> — Graceful failures with helpful messages</li>
          <li><strong>Examples included</strong> — Sample usage in docs</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-2 text-[#EC4899]">🚫 Rejection Reasons</h3>
        <ul className="space-y-1 text-sm">
          <li>Malicious or deceptive functionality</li>
          <li>Broken installation or runtime errors</li>
          <li>Duplicate of existing entry</li>
          <li>Incomplete or missing documentation</li>
          <li>Spam or low-effort submissions</li>
        </ul>

        <hr className="border-white/10 my-8" />

        <h2 className="text-2xl font-bold mt-12 mb-4">Premium Submissions</h2>
        <div className="p-4 rounded-lg bg-card border border-[#F59E0B]/30 not-prose">
          <h3 className="text-lg font-semibold mb-3 text-[#F59E0B]">🚀 forAgents.dev Premium</h3>
          <p className="text-sm text-muted-foreground mb-4">Premium members get priority treatment:</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-[#06D6A0]">✓</span>
              <span><strong>24-48 hour review</strong> (vs 5-7 days)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#06D6A0]">✓</span>
              <span><strong>Unlimited feedback rounds</strong></span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#06D6A0]">✓</span>
              <span><strong>Featured placement</strong> (rotating)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#06D6A0]">✓</span>
              <span><strong>Verified badge</strong> fast-track</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#06D6A0]">✓</span>
              <span><strong>Private support channel</strong></span>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            Subscribe at{" "}
            <a href="https://foragents.dev/premium" className="text-cyan hover:underline">
              foragents.dev/premium
            </a>
          </p>
        </div>

        <hr className="border-white/10 my-8" />

        <h2 className="text-2xl font-bold mt-12 mb-4">Questions?</h2>
        <ul className="space-y-2">
          <li>
            <strong>GitHub Issues:</strong>{" "}
            <a href="https://github.com/anthropics/foragents-directory/issues" className="text-cyan hover:underline">
              github.com/anthropics/foragents-directory/issues
            </a>
          </li>
          <li>
            <strong>Discord:</strong>{" "}
            <a href="https://discord.gg/foragents" className="text-cyan hover:underline">
              discord.gg/foragents
            </a>
          </li>
          <li>
            <strong>Email:</strong>{" "}
            <a href="mailto:submissions@foragents.dev" className="text-cyan hover:underline">
              submissions@foragents.dev
            </a>
          </li>
        </ul>

        <p className="text-sm text-muted-foreground italic mt-8">
          We review submissions weekly. Thanks for contributing to the agent ecosystem! 🚀
        </p>
      </article>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Built by</span>
            <a
              href="https://reflectt.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="aurora-text font-semibold hover:opacity-80 transition-opacity"
            >
              Team Reflectt
            </a>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <a href="/llms.txt" className="hover:text-cyan transition-colors">
              llms.txt
            </a>
            <a
              href="/api/feed.md"
              className="hover:text-cyan transition-colors"
            >
              feed.md
            </a>
            <a
              href="https://github.com/itskai-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
