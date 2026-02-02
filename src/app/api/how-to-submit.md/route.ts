import { NextResponse } from "next/server";

export async function GET() {
  const content = `# How to Submit to forAgents.dev

Welcome to the forAgents.dev submission guide! We're building the definitive directory of agent-compatible tools, and we want your contributions.

---

## What Can You Submit?

forAgents.dev accepts four types of submissions:

| Type | Description |
|------|-------------|
| **Skills** | Packaged capabilities that agents can install and use (tools, integrations, workflows) |
| **MCP Servers** | Model Context Protocol servers that expose tools and resources to AI agents |
| **llms.txt Sites** | Websites with \`llms.txt\` or \`llms-full.txt\` files for agent-readable documentation |
| **ACP Agents** | Agent Communication Protocol compatible agents that can collaborate with other agents |

---

## Submission Process

All submissions are made via **GitHub Pull Request** to our public repository.

### Step-by-Step

1. **Fork the repository**
   \`\`\`bash
   git clone https://github.com/anthropics/foragents-directory.git
   cd foragents-directory
   \`\`\`

2. **Add your entry** to the appropriate JSON file:
   - \`data/skills.json\` — for Skills
   - \`data/mcp-servers.json\` — for MCP Servers
   - \`data/llms-txt.json\` — for llms.txt sites
   - \`data/acp-agents.json\` — for ACP Agents

3. **Validate your JSON**
   \`\`\`bash
   npm run validate
   \`\`\`

4. **Create a Pull Request** with:
   - Clear title: \`[Skill] Add my-awesome-tool\` or \`[MCP] Add weather-server\`
   - Brief description of what it does
   - Link to documentation or demo (if available)

5. **Wait for review** — We'll review your submission and provide feedback if needed.

---

## Format Requirements

Each submission type has a specific JSON schema. Follow these exactly.

### Skills (\`data/skills.json\`)

\`\`\`json
{
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
}
\`\`\`

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| \`id\` | string | Unique identifier (lowercase, hyphens only) |
| \`name\` | string | Human-readable name |
| \`description\` | string | One-line description (max 160 chars) |
| \`author\` | string | GitHub username or org |
| \`repository\` | string | Public repository URL |
| \`version\` | string | Semantic version |
| \`tags\` | array | 2-5 relevant tags |
| \`install\` | object | Installation instructions |

#### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| \`license\` | string | SPDX license identifier |
| \`capabilities\` | array | What the skill can do |
| \`requirements\` | object | Auth keys, runtime requirements |
| \`documentation\` | string | Link to docs |
| \`verified\` | boolean | Set by maintainers only |

---

### MCP Servers (\`data/mcp-servers.json\`)

\`\`\`json
{
  "id": "weather-mcp",
  "name": "Weather MCP Server",
  "description": "Get current weather, forecasts, and alerts for any location",
  "author": "weather-tools",
  "repository": "https://github.com/weather-tools/weather-mcp",
  "version": "2.0.1",
  "license": "Apache-2.0",
  "tags": ["weather", "forecast", "api", "location"],
  "transport": ["stdio", "sse"],
  "install": {
    "type": "npx",
    "command": "npx @weather-tools/weather-mcp"
  },
  "tools": [
    {
      "name": "get_weather",
      "description": "Get current weather for a location"
    },
    {
      "name": "get_forecast",
      "description": "Get 7-day forecast"
    }
  ],
  "resources": [],
  "requirements": {
    "auth": ["OPENWEATHER_API_KEY"]
  },
  "documentation": "https://weather-tools.github.io/weather-mcp"
}
\`\`\`

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| \`id\` | string | Unique identifier |
| \`name\` | string | Server name |
| \`description\` | string | What the server does |
| \`author\` | string | Maintainer username |
| \`repository\` | string | Source code URL |
| \`transport\` | array | Supported transports: \`stdio\`, \`sse\`, \`websocket\` |
| \`tools\` | array | List of exposed tools with name and description |

#### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| \`resources\` | array | MCP resources exposed |
| \`prompts\` | array | MCP prompts available |
| \`install\` | object | How to run the server |
| \`requirements\` | object | API keys, dependencies |

---

### llms.txt Sites (\`data/llms-txt.json\`)

\`\`\`json
{
  "id": "stripe-docs",
  "name": "Stripe",
  "domain": "stripe.com",
  "description": "Payment processing API documentation",
  "llms_txt_url": "https://docs.stripe.com/llms.txt",
  "llms_full_url": "https://docs.stripe.com/llms-full.txt",
  "category": "fintech",
  "tags": ["payments", "api", "fintech", "billing"],
  "last_verified": "2026-01-15",
  "content_type": "api-docs"
}
\`\`\`

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| \`id\` | string | Unique identifier |
| \`name\` | string | Site/company name |
| \`domain\` | string | Primary domain |
| \`llms_txt_url\` | string | URL to llms.txt file |
| \`category\` | string | Primary category |

#### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| \`llms_full_url\` | string | URL to llms-full.txt if available |
| \`description\` | string | What the site offers |
| \`tags\` | array | Relevant tags |
| \`last_verified\` | string | Date last checked (YYYY-MM-DD) |
| \`content_type\` | string | \`api-docs\`, \`knowledge-base\`, \`product-docs\`, etc. |

---

### ACP Agents (\`data/acp-agents.json\`)

\`\`\`json
{
  "id": "code-reviewer",
  "name": "Code Review Agent",
  "description": "Automated code review with security scanning and best practices",
  "author": "devtools-inc",
  "repository": "https://github.com/devtools-inc/code-reviewer",
  "version": "1.0.0",
  "license": "MIT",
  "tags": ["code-review", "security", "devtools", "ci-cd"],
  "acp_version": "1.0",
  "endpoint": "https://api.devtools.io/acp/code-reviewer",
  "capabilities": {
    "input": ["code-diff", "pull-request", "repository"],
    "output": ["review-comments", "security-report", "suggestions"]
  },
  "authentication": {
    "type": "api-key",
    "header": "X-API-Key"
  },
  "pricing": {
    "model": "free",
    "limits": "100 reviews/month"
  },
  "documentation": "https://devtools.io/docs/code-reviewer"
}
\`\`\`

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| \`id\` | string | Unique identifier |
| \`name\` | string | Agent name |
| \`description\` | string | What the agent does |
| \`author\` | string | Creator/maintainer |
| \`acp_version\` | string | ACP protocol version supported |
| \`capabilities\` | object | Input/output capabilities |

#### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| \`endpoint\` | string | Public ACP endpoint URL |
| \`repository\` | string | Source code (if open source) |
| \`authentication\` | object | Auth requirements |
| \`pricing\` | object | Free, paid, usage limits |

---

## Review Criteria

Every submission is reviewed for quality. Here's what we look for:

### ✅ Required

- [ ] **Working installation** — We test that it actually installs and runs
- [ ] **Clear documentation** — README explains what it does and how to use it
- [ ] **Agent-compatible** — Works with AI agents, not just humans
- [ ] **Valid JSON** — Passes schema validation
- [ ] **Unique ID** — No conflicts with existing entries

### 🌟 Preferred

- [ ] **Active maintenance** — Recent commits, responsive to issues
- [ ] **Open source** — Publicly auditable code
- [ ] **Good error handling** — Graceful failures with helpful messages
- [ ] **Examples included** — Sample usage in docs
- [ ] **Semantic versioning** — Proper version numbers

### 🚫 Rejection Reasons

- Malicious or deceptive functionality
- Broken installation or runtime errors
- Duplicate of existing entry
- Incomplete or missing documentation
- Spam or low-effort submissions
- License violations

---

## Premium Submissions

**forAgents.dev Premium** members get priority treatment:

| Benefit | Free | Premium |
|---------|------|---------|
| Review time | 5-7 days | 24-48 hours |
| Feedback rounds | 1 | Unlimited |
| Featured placement | No | Yes (rotating) |
| Verified badge | Manual review | Fast-track |
| Direct support | GitHub issues | Private channel |

### How to Get Premium

1. Visit [foragents.dev/premium](https://foragents.dev/premium)
2. Subscribe via GitHub Sponsors or Stripe
3. Add \`"premium": true\` to your submission
4. Include your Premium member ID in the PR description

Premium members also get:
- Early access to new directory features
- Input on roadmap priorities
- Premium badge on all their submissions

---

## Questions?

- **GitHub Issues**: [github.com/anthropics/foragents-directory/issues](https://github.com/anthropics/foragents-directory/issues)
- **Discord**: [discord.gg/foragents](https://discord.gg/foragents)
- **Email**: submissions@foragents.dev

We review submissions weekly. Thanks for contributing to the agent ecosystem! 🚀`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
