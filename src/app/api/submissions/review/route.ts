import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, rateLimitResponse, readTextWithLimit } from "@/lib/requestLimits";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireCronAuth } from "@/lib/server/cron-auth";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { safeFetch } from "@/lib/server/ssrf";
import { getSkills, getMcpServers, getAgents, getLlmsTxtEntries } from "@/lib/data";

// Types
type Submission = {
  id: string;
  type: "skill" | "mcp" | "agent" | "llms-txt";
  name: string;
  description: string;
  url: string;
  author: string;
  tags: string[];
  status: "pending" | "approved" | "rejected";
};

type ReviewResult = {
  id: string;
  name: string;
  action: "approved" | "rejected" | "held";
  reason: string;
};

// Spam patterns to check against
const SPAM_PATTERNS = [
  /\b(buy|cheap|discount|free money|click here|act now|limited time)\b/i,
  /\b(casino|poker|gambling|lottery)\b/i,
  /\b(viagra|cialis|pharmacy|pills)\b/i,
  /(http[s]?:\/\/[^\s]+){3,}/i, // Multiple URLs in description
  /(.)\1{5,}/i, // Repeated characters (aaaaaaaa)
  /\$\d+[,.]?\d*\s*(off|discount|free)/i,
];

// Gibberish name detection (simple heuristics)
function isGibberishName(name: string): boolean {
  // Too short
  if (name.length < 3) return true;

  // All consonants, no vowels (likely gibberish)
  const vowelRatio = (name.match(/[aeiou]/gi) || []).length / name.length;
  if (vowelRatio < 0.1 && name.length > 5) return true;

  // Too many consecutive consonants
  if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(name)) return true;

  // Random-looking string (too many numbers mixed with letters)
  const numRatio = (name.match(/\d/g) || []).length / name.length;
  if (numRatio > 0.5 && name.length > 4) return true;

  return false;
}

function isSpammyDescription(description: string): boolean {
  return SPAM_PATTERNS.some((pattern) => pattern.test(description));
}

// Check if URL already exists in directory
function isDuplicateUrl(url: string, type: string): boolean {
  const normalizedUrl = url.toLowerCase().replace(/\/+$/, "");

  // Check existing directory entries
  const skills = getSkills();
  const mcpServers = getMcpServers();
  const agents = getAgents();
  const llmsTxtEntries = getLlmsTxtEntries();

  // Check skills
  for (const skill of skills) {
    if (skill.repo_url.toLowerCase().replace(/\/+$/, "") === normalizedUrl) {
      return true;
    }
  }

  // Check MCP servers
  for (const server of mcpServers) {
    const serverUrl = server.url.toLowerCase().replace(/\/+$/, "");
    const serverGithub = server.github.toLowerCase().replace(/\/+$/, "");
    if (serverUrl === normalizedUrl || serverGithub === normalizedUrl) {
      return true;
    }
  }

  // Check agents
  for (const agent of agents) {
    const agentJson = agent.links.agentJson?.toLowerCase().replace(/\/+$/, "");
    const agentGithub = agent.links.github?.toLowerCase().replace(/\/+$/, "");
    const agentWebsite = agent.links.website?.toLowerCase().replace(/\/+$/, "");
    if (agentJson === normalizedUrl || agentGithub === normalizedUrl || agentWebsite === normalizedUrl) {
      return true;
    }
  }

  // Check llms.txt entries
  for (const entry of llmsTxtEntries) {
    if (entry.url.toLowerCase().replace(/\/+$/, "") === normalizedUrl) {
      return true;
    }
  }

  return false;
}

// Check URL validity with a HEAD request
async function checkUrlValidity(url: string): Promise<{ valid: boolean; status?: number; error?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await safeFetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": "forAgents.dev URL Checker/1.0",
      },
      redirect: "manual",
    });

    clearTimeout(timeout);

    // Accept 2xx and 3xx as valid
    if (response.ok || (response.status >= 300 && response.status < 400)) {
      return { valid: true, status: response.status };
    }

    // Some servers don't support HEAD, try GET
    if (response.status === 405) {
      const getResponse = await safeFetch(url, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "User-Agent": "forAgents.dev URL Checker/1.0",
        },
        redirect: "manual",
      });
      return { valid: getResponse.ok, status: getResponse.status };
    }

    return { valid: false, status: response.status };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { valid: false, error: errorMessage };
  }
}

// Review a single submission
async function reviewSubmission(submission: Submission, existingApprovedUrls: Set<string>): Promise<ReviewResult> {
  const issues: string[] = [];
  let shouldReject = false;
  let shouldHold = false;

  // Check 1: Name quality
  if (isGibberishName(submission.name)) {
    issues.push("Name appears to be gibberish or invalid");
    shouldReject = true;
  }

  // Check 2: Description length and quality
  if (submission.description.length < 20) {
    issues.push(`Description too short (${submission.description.length} chars, minimum 20)`);
    shouldReject = true;
  } else if (submission.description.length < 50) {
    issues.push(`Description is short (${submission.description.length} chars, recommend 50+)`);
    shouldHold = true;
  }

  if (isSpammyDescription(submission.description)) {
    issues.push("Description contains spam-like content");
    shouldReject = true;
  }

  // Check 3: Duplicate URL
  const normalizedUrl = submission.url.toLowerCase().replace(/\/+$/, "");
  if (isDuplicateUrl(submission.url, submission.type)) {
    issues.push("URL already exists in directory");
    shouldReject = true;
  } else if (existingApprovedUrls.has(normalizedUrl)) {
    issues.push("URL already approved in another pending submission");
    shouldReject = true;
  }

  // Check 4: URL validity
  const urlCheck = await checkUrlValidity(submission.url);
  if (!urlCheck.valid) {
    if (urlCheck.status === 404) {
      issues.push(`URL returns 404 Not Found`);
      shouldReject = true;
    } else if (urlCheck.status) {
      issues.push(`URL returns HTTP ${urlCheck.status}`);
      shouldHold = true; // Might be temporary
    } else {
      issues.push(`URL unreachable: ${urlCheck.error}`);
      shouldHold = true; // Might be temporary
    }
  }

  // Determine action
  if (shouldReject) {
    return {
      id: submission.id,
      name: submission.name,
      action: "rejected",
      reason: issues.join("; "),
    };
  }

  if (shouldHold || issues.length > 0) {
    return {
      id: submission.id,
      name: submission.name,
      action: "held",
      reason: issues.length > 0 ? issues.join("; ") : "Uncertain - manual review recommended",
    };
  }

  // All checks passed
  return {
    id: submission.id,
    name: submission.name,
    action: "approved",
    reason: "All automated checks passed",
  };
}

// Apply review decision to database
async function applyReviewDecision(supabase: SupabaseClient, result: ReviewResult): Promise<boolean> {
  if (!supabase) return false;

  if (result.action === "held") {
    // Don't modify held submissions
    return true;
  }

  const updateData: Record<string, unknown> = {
    status: result.action,
  };

  if (result.action === "approved") {
    updateData.approved_at = new Date().toISOString();
  } else if (result.action === "rejected") {
    updateData.rejected_at = new Date().toISOString();
    updateData.rejection_reason = result.reason;
  }

  const { error } = await supabase.from("submissions").update(updateData).eq("id", result.id);

  if (error) {
    console.error(`Failed to update submission ${result.id}:`, error);
    return false;
  }

  return true;
}

// Main handler
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`submissions:review:${ip}`, { windowMs: 60_000, max: 10 });
  if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

  // This endpoint doesn't require a request body, but still cap it to avoid abuse.
  // (Reading consumes the stream, so do this only once.)
  try {
    await readTextWithLimit(request, 1_000);
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = typeof (err as any)?.status === "number" ? (err as any).status : 400;
    if (status === 413) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }
    // If it's invalid/empty, ignore.
  }

  const auth = requireCronAuth(request);
  if (!auth.authorized) return auth.response;

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  // Fetch pending submissions
  const { data: pendingSubmissions, error: fetchError } = await supabase
    .from("submissions")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (fetchError) {
    console.error("Failed to fetch submissions:", fetchError);
    return NextResponse.json({ error: "Failed to fetch pending submissions" }, { status: 500 });
  }

  if (!pendingSubmissions || pendingSubmissions.length === 0) {
    return NextResponse.json({
      success: true,
      message: "No pending submissions to review",
      summary: {
        total: 0,
        approved: 0,
        rejected: 0,
        held: 0,
      },
      results: [],
    });
  }

  // Track approved URLs to catch duplicates within the batch
  const approvedUrlsInBatch = new Set<string>();
  const results: ReviewResult[] = [];

  // Review each submission
  for (const submission of pendingSubmissions) {
    const mapped: Submission = {
      id: submission.id,
      type: submission.type,
      name: submission.name,
      description: submission.description,
      url: submission.url,
      author: submission.author,
      tags: submission.tags || [],
      status: submission.status,
    };

    const result = await reviewSubmission(mapped, approvedUrlsInBatch);
    results.push(result);

    // Apply decision
    const applied = await applyReviewDecision(supabase, result);
    if (!applied) {
      result.reason += " (failed to apply)";
    }

    // Track approved URLs
    if (result.action === "approved") {
      approvedUrlsInBatch.add(mapped.url.toLowerCase().replace(/\/+$/, ""));
    }
  }

  // Summary
  const summary = {
    total: results.length,
    approved: results.filter((r) => r.action === "approved").length,
    rejected: results.filter((r) => r.action === "rejected").length,
    held: results.filter((r) => r.action === "held").length,
  };

  return NextResponse.json({
    success: true,
    message: "Automated review completed",
    summary,
    results,
  });
}
