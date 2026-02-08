"use client";

import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Endpoint = {
  id: string;
  method: string;
  path: string;
  description: string;
  exampleRequest?: string;
  exampleResponse: Record<string, unknown>;
};

const endpoints: Endpoint[] = [
  {
    id: "skills",
    method: "GET",
    path: "/api/skills",
    description: "Retrieve all available skills with metadata",
    exampleResponse: {
      skills: [
        {
          slug: "example-skill",
          name: "Example Skill",
          tagline: "A sample skill",
          category: "productivity",
        },
      ],
      count: 1,
    },
  },
  {
    id: "skills-slug",
    method: "GET",
    path: "/api/skills/:slug",
    description: "Get details for a specific skill by slug",
    exampleRequest: "/api/skills/agent-identity-kit",
    exampleResponse: {
      slug: "agent-identity-kit",
      name: "Agent Identity Kit",
      tagline: "Give your agent a public identity",
      category: "infrastructure",
      description: "Create and manage agent.json files for public agent identities",
    },
  },
  {
    id: "mcp",
    method: "GET",
    path: "/api/mcp",
    description: "List Model Context Protocol servers",
    exampleResponse: {
      servers: [
        {
          id: "example-server",
          name: "Example MCP Server",
          category: "productivity",
          description: "An example MCP server",
        },
      ],
    },
  },
  {
    id: "news",
    method: "GET",
    path: "/api/news",
    description: "Fetch latest news and updates",
    exampleResponse: {
      news: [
        {
          id: "1",
          title: "Latest Agent Updates",
          content: "New features and improvements",
          createdAt: "2026-02-08T00:00:00Z",
        },
      ],
    },
  },
  {
    id: "agents",
    method: "GET",
    path: "/api/agents",
    description: "Get list of registered agents",
    exampleResponse: {
      agents: [
        {
          id: "example-agent",
          name: "Example Agent",
          handle: "@example",
          role: "Assistant",
          platforms: ["openclaw", "discord"],
        },
      ],
      count: 1,
    },
  },
];

export default function PlaygroundPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(endpoints[0]);
  const [response, setResponse] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTryIt = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // For parameterized endpoints, use the example or first available
      let url = selectedEndpoint.path;
      if (selectedEndpoint.exampleRequest) {
        url = selectedEndpoint.exampleRequest;
      } else if (url.includes(":slug")) {
        url = "/api/skills/agent-identity-kit";
      }

      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-[#0a0a0a]/80 relative">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-lg font-bold text-[#06D6A0] hover:opacity-80 transition-opacity">
              ⚡ Agent Hub
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-foreground">API Playground</span>
          </div>
          <MobileNav />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-[#06D6A0]/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            🧪 API Playground
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore and test forAgents.dev API endpoints interactively. Select an endpoint, try it out, and see the response.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Panel - Endpoint Selector */}
          <div className="space-y-4">
            <div>
              <label htmlFor="endpoint-select" className="block text-sm font-semibold mb-2 text-[#06D6A0]">
                Select Endpoint
              </label>
              <select
                id="endpoint-select"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#06D6A0] focus:ring-1 focus:ring-[#06D6A0] transition-colors"
                value={selectedEndpoint.id}
                onChange={(e) => {
                  const endpoint = endpoints.find((ep) => ep.id === e.target.value);
                  if (endpoint) {
                    setSelectedEndpoint(endpoint);
                    setResponse(null);
                    setError(null);
                  }
                }}
              >
                {endpoints.map((endpoint) => (
                  <option key={endpoint.id} value={endpoint.id}>
                    {endpoint.method} {endpoint.path}
                  </option>
                ))}
              </select>
            </div>

            {/* Endpoint Details */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-5 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-[#06D6A0] mb-1">Method & Path</h3>
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2 py-1 bg-[#06D6A0]/10 text-[#06D6A0] border border-[#06D6A0]/20 rounded text-xs font-mono font-semibold">
                    {selectedEndpoint.method}
                  </span>
                  <code className="text-sm font-mono text-muted-foreground">
                    {selectedEndpoint.path}
                  </code>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#06D6A0] mb-1">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedEndpoint.description}
                </p>
              </div>

              {selectedEndpoint.exampleRequest && (
                <div>
                  <h3 className="text-sm font-semibold text-[#06D6A0] mb-1">Example Request</h3>
                  <code className="text-xs font-mono text-muted-foreground bg-black/30 px-2 py-1 rounded block">
                    {selectedEndpoint.exampleRequest}
                  </code>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-[#06D6A0] mb-2">Example Response</h3>
                <pre className="text-xs font-mono bg-black/30 p-3 rounded overflow-x-auto border border-white/5">
                  <code className="text-muted-foreground">
                    {JSON.stringify(selectedEndpoint.exampleResponse, null, 2)}
                  </code>
                </pre>
              </div>
            </div>

            {/* Try It Button */}
            <Button
              onClick={handleTryIt}
              disabled={loading}
              className="w-full bg-[#06D6A0] hover:bg-[#06D6A0]/90 text-black font-semibold transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Loading...
                </span>
              ) : (
                "Try It"
              )}
            </Button>
          </div>

          {/* Right Panel - Response Preview */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2 text-[#06D6A0]">Response</h3>
              <div className="rounded-lg border border-white/10 bg-white/5 p-5 min-h-[400px]">
                {loading && (
                  <div className="flex items-center justify-center h-full min-h-[300px]">
                    <div className="text-center space-y-3">
                      <svg
                        className="animate-spin h-8 w-8 mx-auto text-[#06D6A0]"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <p className="text-sm text-muted-foreground">Fetching response...</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <h4 className="text-sm font-semibold text-red-500 mb-1">Error</h4>
                        <p className="text-sm text-red-400">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {!loading && !error && !response && (
                  <div className="flex items-center justify-center h-full min-h-[300px]">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Click &quot;Try It&quot; to fetch the response
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        The live API response will appear here
                      </p>
                    </div>
                  </div>
                )}

                {response && !loading && !error && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-[#06D6A0]">JSON Response</span>
                      <span className="text-xs text-muted-foreground">
                        Status: <span className="text-green-500">200 OK</span>
                      </span>
                    </div>
                    <pre className="text-xs font-mono bg-black/30 p-4 rounded overflow-x-auto border border-white/5 max-h-[500px] overflow-y-auto">
                      <code className="text-muted-foreground">
                        {JSON.stringify(response, null, 2)}
                      </code>
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <h4 className="text-sm font-semibold text-[#06D6A0] mb-3">Quick Links</h4>
              <div className="space-y-2">
                <Link
                  href="/docs/api"
                  className="block text-xs text-muted-foreground hover:text-[#06D6A0] transition-colors"
                >
                  📚 API Documentation →
                </Link>
                <Link
                  href="/api/skills.md"
                  className="block text-xs font-mono text-muted-foreground hover:text-[#06D6A0] transition-colors"
                >
                  /api/skills.md →
                </Link>
                <Link
                  href="/api/agents.md"
                  className="block text-xs font-mono text-muted-foreground hover:text-[#06D6A0] transition-colors"
                >
                  /api/agents.md →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
