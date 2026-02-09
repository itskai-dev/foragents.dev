#!/usr/bin/env tsx
/**
 * Generate changelog from recent GitHub PRs
 * Fetches the last 30 merged PRs and auto-categorizes them
 */

import { writeFileSync } from "fs";
import { join } from "path";

const REPO_OWNER = "reflectt";
const REPO_NAME = "foragents.dev";
const MAX_PRS = 30;

type GitHubPR = {
  number: number;
  title: string;
  merged_at: string;
  html_url: string;
  user: {
    login: string;
  };
};

type ChangelogCategory = "feature" | "fix" | "docs" | "refactor" | "test";

type GeneratedChangelogEntry = {
  date: string; // YYYY-MM-DD
  title: string;
  prNumber: number;
  prUrl: string;
  category: ChangelogCategory;
  author: string;
};

/**
 * Detect category from PR title prefix
 */
function detectCategory(title: string): ChangelogCategory {
  const lower = title.toLowerCase();
  
  if (lower.startsWith("feat:") || lower.startsWith("feature:")) return "feature";
  if (lower.startsWith("fix:")) return "fix";
  if (lower.startsWith("docs:") || lower.startsWith("doc:")) return "docs";
  if (lower.startsWith("refactor:")) return "refactor";
  if (lower.startsWith("test:") || lower.startsWith("tests:")) return "test";
  
  // Fallback heuristics
  if (lower.includes("add") || lower.includes("new")) return "feature";
  if (lower.includes("fix") || lower.includes("bug")) return "fix";
  if (lower.includes("doc")) return "docs";
  if (lower.includes("refactor")) return "refactor";
  if (lower.includes("test")) return "test";
  
  return "feature"; // default
}

/**
 * Clean up PR title by removing conventional commit prefix
 */
function cleanTitle(title: string): string {
  return title
    .replace(/^(feat|feature|fix|docs?|refactor|tests?):\s*/i, "")
    .trim();
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(isoDate: string): string {
  return isoDate.split("T")[0];
}

async function fetchRecentPRs(): Promise<GitHubPR[]> {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=closed&sort=updated&direction=desc&per_page=${MAX_PRS * 2}`;
  
  console.log(`Fetching PRs from: ${url}`);
  
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      // No auth needed for public repos
    },
  });
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
  
  const prs = (await response.json()) as GitHubPR[];
  
  // Filter to only merged PRs
  const mergedPRs = prs
    .filter((pr) => pr.merged_at !== null)
    .slice(0, MAX_PRS);
  
  return mergedPRs;
}

async function main() {
  console.log("🔍 Fetching recent merged PRs from GitHub...");
  
  const prs = await fetchRecentPRs();
  
  console.log(`✅ Found ${prs.length} merged PRs`);
  
  const entries: GeneratedChangelogEntry[] = prs.map((pr) => ({
    date: formatDate(pr.merged_at),
    title: cleanTitle(pr.title),
    prNumber: pr.number,
    prUrl: pr.html_url,
    category: detectCategory(pr.title),
    author: pr.user.login,
  }));
  
  // Sort by date descending
  entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Write to data file
  const outputPath = join(process.cwd(), "src", "data", "changelog-generated.json");
  writeFileSync(outputPath, JSON.stringify(entries, null, 2));
  
  console.log(`\n📝 Generated ${entries.length} changelog entries`);
  console.log(`📁 Written to: ${outputPath}`);
  
  // Show category breakdown
  const categoryCounts = entries.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  
  console.log("\n📊 Category breakdown:");
  Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`);
    });
  
  console.log("\n✨ Done!");
}

main().catch((error) => {
  console.error("❌ Error generating changelog:", error);
  process.exit(1);
});
