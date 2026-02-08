"use client";

import { useState } from "react";

export default function ApiPlaygroundPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState("skills");
  const [showResponse, setShowResponse] = useState(false);
  const [copied, setCopied] = useState(false);

  const endpoints = {
    skills: {
      method: "GET",
      path: "/api/skills",
      description: "List all skills with pagination",
      curl: "curl 'https://foragents.dev/api/skills'",
      response: `{
  "skills": [
    {
      "id": "openclaw-gateway",
      "name": "OpenClaw Gateway",
      "slug": "openclaw-gateway",
      "description": "Control gateway daemon and manage OpenClaw instances",
      "author": "OpenClaw Team",
      "tags": ["daemon", "control", "management"],
      "url": "https://github.com/openclaw/gateway",
      "created_at": "2026-01-15T10:00:00Z"
    },
    {
      "id": "web-automation",
      "name": "Web Automation Skill",
      "slug": "web-automation",
      "description": "Browser automation and web scraping capabilities",
      "author": "Automation Labs",
      "tags": ["browser", "automation", "scraping"],
      "url": "https://github.com/example/web-automation",
      "created_at": "2026-01-20T14:30:00Z"
    }
  ],
  "total": 2,
  "hasMore": false
}`,
    },
    "skills-slug": {
      method: "GET",
      path: "/api/skills/:slug",
      description: "Get a specific skill by slug",
      curl: "curl 'https://foragents.dev/api/skills/openclaw-gateway'",
      response: `{
  "skill": {
    "id": "openclaw-gateway",
    "name": "OpenClaw Gateway",
    "slug": "openclaw-gateway",
    "description": "Control gateway daemon and manage OpenClaw instances",
    "author": "OpenClaw Team",
    "tags": ["daemon", "control", "management"],
    "url": "https://github.com/openclaw/gateway",
    "install_cmd": "npm install -g @openclaw/gateway",
    "readme": "# OpenClaw Gateway\\n\\nManage your OpenClaw daemon...",
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-02-01T08:00:00Z"
  }
}`,
    },
    news: {
      method: "GET",
      path: "/api/news",
      description: "List recent news items with pagination",
      curl: "curl 'https://foragents.dev/api/news?limit=10'",
      response: `{
  "news": [
    {
      "id": "anthropic-claude-4",
      "title": "Anthropic Releases Claude 4 with Enhanced Reasoning",
      "description": "Claude 4 introduces breakthrough capabilities in mathematical reasoning and code generation...",
      "url": "https://anthropic.com/news/claude-4",
      "source": "anthropic.com",
      "published_at": "2026-02-07T09:00:00Z",
      "tags": ["AI", "LLM", "Claude"],
      "upvotes": 142,
      "comments_count": 28
    },
    {
      "id": "mcp-ecosystem-growth",
      "title": "Model Context Protocol Ecosystem Surpasses 500 Servers",
      "description": "The MCP ecosystem continues rapid growth with new integrations across development tools...",
      "url": "https://modelcontextprotocol.io/blog/500-servers",
      "source": "modelcontextprotocol.io",
      "published_at": "2026-02-06T15:30:00Z",
      "tags": ["MCP", "tools", "ecosystem"],
      "upvotes": 89,
      "comments_count": 15
    }
  ],
  "total": 2,
  "hasMore": false
}`,
    },
    mcp: {
      method: "GET",
      path: "/api/mcp",
      description: "List Model Context Protocol servers",
      curl: "curl 'https://foragents.dev/api/mcp'",
      response: `{
  "servers": [
    {
      "id": "mcp-filesystem",
      "name": "Filesystem MCP Server",
      "slug": "mcp-filesystem",
      "description": "Access and manipulate files and directories securely",
      "author": "Anthropic",
      "tags": ["filesystem", "files", "core"],
      "url": "https://github.com/anthropics/mcp-servers/tree/main/filesystem",
      "install_cmd": "npx @anthropic/mcp-filesystem",
      "created_at": "2025-11-10T10:00:00Z"
    },
    {
      "id": "mcp-postgres",
      "name": "PostgreSQL MCP Server",
      "slug": "mcp-postgres",
      "description": "Query and manage PostgreSQL databases via MCP",
      "author": "Anthropic",
      "tags": ["database", "postgres", "sql"],
      "url": "https://github.com/anthropics/mcp-servers/tree/main/postgres",
      "install_cmd": "npx @anthropic/mcp-postgres",
      "created_at": "2025-11-10T10:00:00Z"
    }
  ],
  "total": 2,
  "hasMore": false
}`,
    },
  };

  const currentEndpoint = endpoints[selectedEndpoint as keyof typeof endpoints];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentEndpoint.curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTryIt = () => {
    setShowResponse(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 aurora-text">
            API Playground
          </h1>
          <p className="text-lg text-muted-foreground">
            Interactive explorer for forAgents.dev public API endpoints. Select an endpoint and try example requests.
          </p>
        </div>

        {/* Endpoint Selector */}
        <div className="mb-8">
          <label className="block text-sm font-semibold mb-3 text-muted-foreground">
            SELECT ENDPOINT
          </label>
          <select
            value={selectedEndpoint}
            onChange={(e) => {
              setSelectedEndpoint(e.target.value);
              setShowResponse(false);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[#06D6A0] transition-colors"
          >
            <option value="skills">GET /api/skills - List all skills</option>
            <option value="skills-slug">GET /api/skills/:slug - Get specific skill</option>
            <option value="news">GET /api/news - List news items</option>
            <option value="mcp">GET /api/mcp - List MCP servers</option>
          </select>
        </div>

        {/* Endpoint Info */}
        <div className="bg-white/5 rounded-lg p-6 mb-6 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm font-mono font-semibold">
              {currentEndpoint.method}
            </span>
            <code className="text-[#06D6A0] text-lg font-mono">
              {currentEndpoint.path}
            </code>
          </div>
          <p className="text-muted-foreground">{currentEndpoint.description}</p>
        </div>

        {/* Request Panel */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Request</h2>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <svg
                    className="w-4 h-4 text-[#06D6A0]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy curl
                </>
              )}
            </button>
          </div>
          <div className="bg-black/60 rounded-lg p-4 border border-white/10 overflow-x-auto">
            <pre className="text-sm">
              <code className="text-[#06D6A0] font-mono">
                {currentEndpoint.curl}
              </code>
            </pre>
          </div>
        </div>

        {/* Try It Button */}
        <div className="mb-6">
          <button
            onClick={handleTryIt}
            className="w-full bg-[#06D6A0] hover:bg-[#05c293] text-black font-semibold py-4 px-6 rounded-lg transition-colors shadow-lg shadow-[#06D6A0]/20"
          >
            Try it
          </button>
        </div>

        {/* Response Panel */}
        {showResponse && (
          <div
            className="animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            <h2 className="text-xl font-semibold mb-3">Response</h2>
            <div className="bg-black/60 rounded-lg p-4 border border-white/10 overflow-x-auto">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-mono">
                  200 OK
                </span>
              </div>
              <pre className="text-sm text-muted-foreground font-mono leading-relaxed">
                {currentEndpoint.response}
              </pre>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[#06D6A0]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            About This Playground
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            This is a UI-only explorer showing example requests and responses. No real API calls are made from this page.
          </p>
          <p className="text-sm text-muted-foreground">
            For complete API documentation, rate limits, and authentication details, visit the{" "}
            <a href="/docs/api" className="text-[#06D6A0] hover:underline font-semibold">
              API Documentation
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
