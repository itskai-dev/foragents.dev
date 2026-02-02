import { NextRequest, NextResponse } from "next/server";

/**
 * Agent Detection Middleware
 * 
 * Detects agent visitors via:
 * 1. Accept: text/markdown header
 * 2. Known agent User-Agent strings
 * 
 * When an agent hits `/`, they get redirected to /llms.txt content
 * instead of HTML. Other pages serve normally.
 */

const AGENT_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "Claude-Web",
  "Anthropic",
  "CCBot",
  "Bytespider",
  "cohere-ai",
  "PerplexityBot",
  "YouBot",
  "Google-Extended",
  "Applebot-Extended",
  "openclaw",
  "OpenClaw",
  "langchain",
  "LangChain",
  "autogpt",
  "AutoGPT",
  "BabyAGI",
  "AgentGPT",
  "CrewAI",
  "crewai",
  "phind",
  "Phind",
];

function isAgentRequest(request: NextRequest): boolean {
  // Check Accept header for markdown preference
  const accept = request.headers.get("accept") || "";
  if (
    accept.includes("text/markdown") ||
    accept.includes("text/plain") && !accept.includes("text/html")
  ) {
    return true;
  }

  // Check User-Agent
  const ua = request.headers.get("user-agent") || "";
  for (const agent of AGENT_USER_AGENTS) {
    if (ua.toLowerCase().includes(agent.toLowerCase())) {
      return true;
    }
  }

  // Check custom header
  if (request.headers.get("x-agent") === "true") {
    return true;
  }

  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only intercept the homepage for agents
  if (pathname === "/" && isAgentRequest(request)) {
    // Rewrite to the llms.txt route (serves plain text)
    const url = request.nextUrl.clone();
    url.pathname = "/llms.txt";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
