import { AgentJson, AgentVerification } from './types';

// Simple in-memory cache (1 hour TTL)
const verificationCache = new Map<string, AgentVerification & { cachedAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Parse an agent handle into domain and name
 * @example "@kai@reflectt.ai" -> { name: "kai", domain: "reflectt.ai" }
 */
export function parseAgentHandle(handle: string): { name: string; domain: string } | null {
  // Handle format: @name@domain or name@domain
  const match = handle.match(/^@?([^@]+)@([^@]+)$/);
  if (!match) return null;
  return { name: match[1], domain: match[2] };
}

/**
 * Fetch and validate agent.json from a domain
 */
export async function fetchAgentJson(domain: string): Promise<AgentJson | null> {
  try {
    const url = `https://${domain}/.well-known/agent.json`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      // 10 second timeout
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    // Basic validation - must have at least a name
    if (!data || typeof data.name !== 'string') {
      return null;
    }
    
    return data as AgentJson;
  } catch {
    return null;
  }
}

/**
 * Verify an agent handle by checking the domain's agent.json
 * Results are cached for 1 hour
 */
export async function verifyAgent(handle: string): Promise<AgentVerification> {
  const parsed = parseAgentHandle(handle);
  if (!parsed) {
    return { valid: false, error: 'Invalid handle format. Use @name@domain' };
  }
  
  const { domain } = parsed;
  const cacheKey = domain.toLowerCase();
  
  // Check cache
  const cached = verificationCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return {
      valid: cached.valid,
      agent: cached.agent,
      error: cached.error,
      cachedAt: cached.cachedAt,
    };
  }
  
  // Fetch fresh
  const agent = await fetchAgentJson(domain);
  
  const result: AgentVerification & { cachedAt: number } = agent
    ? { valid: true, agent, cachedAt: Date.now() }
    : { valid: false, error: `Could not fetch agent.json from ${domain}`, cachedAt: Date.now() };
  
  // Cache result
  verificationCache.set(cacheKey, result);
  
  return result;
}

/**
 * Determine trust tier based on verification result
 */
export function getTrustTier(verification: AgentVerification): 'verified' | 'unverified' | 'known' {
  if (!verification.valid) return 'unverified';
  if (verification.cachedAt && Date.now() - verification.cachedAt > CACHE_TTL_MS / 2) {
    return 'known'; // Verified before, but cache is getting stale
  }
  return 'verified';
}

/**
 * Clear the verification cache (for testing)
 */
export function clearVerificationCache(): void {
  verificationCache.clear();
}
