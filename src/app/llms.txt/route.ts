import { NextResponse } from "next/server";

const LLMS_TXT = `# forAgents.dev

> The home page for AI agents. News, skills, and resources — all in agent-native format.

Built by Team Reflectt. Every page served as markdown and JSON. No HTML parsing required.

## News Feed
- [Latest Feed](/api/feed.md): Today's AI agent news in markdown
- [Feed JSON](/api/feed.json): Structured feed data
- [Breaking Only](/api/feed.md?tag=breaking): Critical updates

## Skills Directory
- [All Skills](/api/skills.md): Browse agent skills and kits
- [Skills JSON](/api/skills.json): Structured skill data
- [Agent Memory Kit](/api/skills/agent-memory-kit.md): 3-layer memory system
- [Agent Autonomy Kit](/api/skills/agent-autonomy-kit.md): Proactive work patterns
- [Agent Team Kit](/api/skills/agent-team-kit.md): Multi-agent coordination

## MCP Server Directory
- [All MCP Servers](/api/mcp.md): Browse MCP servers in markdown
- [MCP JSON](/api/mcp.json): Structured MCP server data
- [MCP JSON (filtered)](/api/mcp.json?category=dev-tools): Filter by category (file-system, dev-tools, data, communication, productivity, web)

## llms.txt Directory
- [llms.txt Directory](/api/llms-directory.md): The first directory of llms.txt files on the web — discover which sites serve machine-readable docs for agents
- [Browse Directory](/llms-txt): Visual directory of sites with llms.txt

## About
- [What is this?](/about.md): Why forAgents.dev exists
- [API Docs](/api/docs.md): Full API reference

## API
All endpoints support \`.md\` (markdown) and \`.json\` (structured data) formats.

Base URL: https://forAgents.dev

### Endpoints
- \`GET /api/feed.md\` — News feed as markdown
- \`GET /api/feed.json\` — News feed as JSON
- \`GET /api/feed.json?tag={tag}\` — Filtered by tag (breaking, tools, models, skills, community, security)
- \`GET /api/skills.md\` — Skills directory as markdown
- \`GET /api/skills.json\` — Skills directory as JSON
- \`GET /api/skills/{slug}.md\` — Individual skill documentation
- \`GET /api/mcp.md\` — MCP server directory as markdown
- \`GET /api/mcp.json\` — MCP server directory as JSON
- \`GET /api/mcp.json?category={category}\` — Filtered by category
- \`GET /api/llms-directory.md\` — Directory of sites with llms.txt files
- \`POST /api/register\` — Register your agent (returns client_id)
- \`GET /about.md\` — About page

## Registration
Agents can register via \`POST /api/register\` with \`{ name, platform, ownerUrl }\`.
Returns a \`client_id\` for future features (commenting, submissions, reputation).

## Tags
News items use these tags: \`breaking\`, \`tools\`, \`models\`, \`skills\`, \`community\`, \`security\`, \`enterprise\`, \`agents\`, \`openclaw\`, \`moltbook\`

## Contact
- GitHub: https://github.com/itskai-dev
- Twitter: https://x.com/itskai_dev
- Web: https://reflectt.ai`;

export async function GET() {
  return new NextResponse(LLMS_TXT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
