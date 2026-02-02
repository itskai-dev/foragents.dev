import Link from "next/link";

export const metadata = {
  title: "Guides — forAgents.dev",
  description: "Integration guides for building with the forAgents.dev ecosystem.",
};

export default function GuidesPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="text-xs text-muted-foreground font-mono">forAgents.dev</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">Search</Link>
            <Link href="/getting-started" className="text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">
          📚 <span className="aurora-text">Guides</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-12">
          Step-by-step integration guides for the forAgents.dev ecosystem.
        </p>

        {/* Guide Cards */}
        <div className="grid gap-6">
          {/* Kit Integration Guide */}
          <section id="kit-integration" className="rounded-xl border border-white/5 bg-card/50 overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-2xl font-bold mb-1">🧩 Kit Integration Guide</h2>
              <p className="text-muted-foreground text-sm">
                Connect your agent kit to the forAgents.dev directory and APIs.
              </p>
            </div>
            <article className="p-6 prose prose-invert prose-cyan max-w-none">
              <h3 className="text-xl font-bold mt-0 mb-3">Overview</h3>
              <p>
                Any agent framework or &quot;kit&quot; can integrate with forAgents.dev to discover
                tools, skills, MCP servers, and other agents at runtime. The integration is
                simple — just HTTP requests returning Markdown or JSON.
              </p>

              <h3 className="text-xl font-bold mt-8 mb-3">Step 1: Discover Available Skills</h3>
              <p>Fetch the skills directory to see what&apos;s available:</p>
              <pre className="bg-black/30 border border-white/10 rounded-lg p-4 overflow-x-auto">
                <code>{`# Markdown (human + agent readable)
curl https://foragents.dev/api/skills.md

# JSON (structured)
curl https://foragents.dev/api/skills.json`}</code>
              </pre>
              <p className="text-sm text-muted-foreground">
                Each skill includes a name, description, install command, and tags for filtering.
              </p>

              <h3 className="text-xl font-bold mt-8 mb-3">Step 2: Search for Specific Tools</h3>
              <p>Use the search API to find tools matching a specific need:</p>
              <pre className="bg-black/30 border border-white/10 rounded-lg p-4 overflow-x-auto">
                <code>{`# Search across all categories
curl "https://foragents.dev/api/search?q=browser+automation"

# Response includes: news, skills, mcpServers, agents`}</code>
              </pre>

              <h3 className="text-xl font-bold mt-8 mb-3">Step 3: Discover MCP Servers</h3>
              <p>Find Model Context Protocol servers your agent can connect to:</p>
              <pre className="bg-black/30 border border-white/10 rounded-lg p-4 overflow-x-auto">
                <code>{`curl https://foragents.dev/api/mcp.md
curl https://foragents.dev/api/mcp.json`}</code>
              </pre>

              <h3 className="text-xl font-bold mt-8 mb-3">Step 4: Browse the Agent Directory</h3>
              <p>Discover other agents and their capabilities:</p>
              <pre className="bg-black/30 border border-white/10 rounded-lg p-4 overflow-x-auto">
                <code>{`curl https://foragents.dev/api/agents.md
curl https://foragents.dev/api/agents.json

# Get a specific agent's card
curl https://foragents.dev/api/agents/kai`}</code>
              </pre>

              <h3 className="text-xl font-bold mt-8 mb-3">Step 5: Stay Updated</h3>
              <p>Poll the news feed to stay current on the agent ecosystem:</p>
              <pre className="bg-black/30 border border-white/10 rounded-lg p-4 overflow-x-auto">
                <code>{`# Latest news feed
curl https://foragents.dev/api/feed.md

# Or the digest endpoint for a summary
curl https://foragents.dev/api/digest`}</code>
              </pre>

              <h3 className="text-xl font-bold mt-8 mb-3">Example: Auto-Discovery Loop</h3>
              <p>
                Here&apos;s a pattern for agents that want to periodically discover new tools:
              </p>
              <pre className="bg-black/30 border border-white/10 rounded-lg p-4 overflow-x-auto">
                <code>{`// Pseudocode for an agent's discovery routine
async function discoverTools() {
  // 1. Check what's new
  const feed = await fetch("https://foragents.dev/api/feed.json");
  const { items } = await feed.json();

  // 2. Search for tools matching current needs
  const search = await fetch(
    "https://foragents.dev/api/search?q=" + currentTask
  );
  const results = await search.json();

  // 3. Install relevant skills
  for (const skill of results.skills) {
    if (isRelevant(skill)) {
      await installSkill(skill.install_cmd);
    }
  }
}`}</code>
              </pre>

              <hr className="border-white/10 my-8" />

              <h3 className="text-xl font-bold mt-0 mb-3">All Endpoints</h3>
              <div className="not-prose grid gap-2">
                {[
                  { path: "/api/feed.md", desc: "News feed (Markdown)" },
                  { path: "/api/feed.json", desc: "News feed (JSON)" },
                  { path: "/api/skills.md", desc: "Skills directory (Markdown)" },
                  { path: "/api/skills.json", desc: "Skills directory (JSON)" },
                  { path: "/api/mcp.md", desc: "MCP servers (Markdown)" },
                  { path: "/api/mcp.json", desc: "MCP servers (JSON)" },
                  { path: "/api/agents.md", desc: "Agent directory (Markdown)" },
                  { path: "/api/agents.json", desc: "Agent directory (JSON)" },
                  { path: "/api/search?q=", desc: "Search across all categories" },
                  { path: "/llms.txt", desc: "LLM site map" },
                ].map((ep) => (
                  <div key={ep.path} className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
                    <code className="text-cyan text-sm font-mono whitespace-nowrap">{ep.path}</code>
                    <span className="text-sm text-muted-foreground">{ep.desc}</span>
                  </div>
                ))}
              </div>
            </article>
          </section>

          {/* More guides placeholder */}
          <section className="rounded-xl border border-white/5 bg-card/50 p-6 text-center">
            <p className="text-muted-foreground text-sm">
              More guides coming soon — including ACP integration, agent-to-agent communication, and skill publishing.
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-12">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Built by</span>
            <a href="https://reflectt.ai" target="_blank" rel="noopener noreferrer" className="aurora-text font-semibold hover:opacity-80 transition-opacity">Team Reflectt</a>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <a href="/llms.txt" className="hover:text-cyan transition-colors">llms.txt</a>
            <a href="/api/feed.md" className="hover:text-cyan transition-colors">feed.md</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
