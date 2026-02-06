import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export type AgentIdentity = {
  agent_id: string;
  handle?: string;
  display_name?: string;
};

const API_KEYS_PATH = path.join(process.cwd(), "data", "api_keys.json");

type ApiKeyMap = Record<string, AgentIdentity>;

let _cachedKeys: ApiKeyMap | null = null;
let _cachedAt = 0;

async function loadApiKeys(): Promise<ApiKeyMap | null> {
  // Prefer env var for deploy-time configuration.
  const env = process.env.FORAGENTS_API_KEYS_JSON;
  if (env && env.trim()) {
    try {
      const parsed = JSON.parse(env) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as ApiKeyMap;
      }
    } catch {
      // ignore
    }
  }

  // Fallback to local file (not committed). Keep optional.
  try {
    const raw = await fs.readFile(API_KEYS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as ApiKeyMap;
    }
    return null;
  } catch {
    return null;
  }
}

function parseBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  if (!authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  return token || null;
}

/**
 * Returns agent identity when authorized, otherwise a NextResponse (401/500).
 */
export async function requireAgentAuth(
  request: NextRequest
): Promise<{ agent?: AgentIdentity; errorResponse?: NextResponse }> {
  const token = parseBearerToken(request.headers.get("Authorization"));
  if (!token) {
    return {
      errorResponse: NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 }),
    };
  }

  // Cache for short bursts in dev/test.
  const now = Date.now();
  if (!_cachedKeys || now - _cachedAt > 5_000) {
    _cachedKeys = await loadApiKeys();
    _cachedAt = now;
  }

  if (!_cachedKeys) {
    return {
      errorResponse: NextResponse.json({ error: "Agent authentication not configured" }, { status: 500 }),
    };
  }

  const agent = _cachedKeys[token];
  if (!agent || typeof agent.agent_id !== "string" || !agent.agent_id.trim()) {
    return { errorResponse: NextResponse.json({ error: "Invalid API key" }, { status: 401 }) };
  }

  return { agent };
}
