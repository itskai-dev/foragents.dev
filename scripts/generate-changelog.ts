#!/usr/bin/env tsx

import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const REPO = "reflectt/foragents.dev";
const LIMIT = 50;

type GhPr = {
  number: number;
  title: string;
  mergedAt: string;
  labels: Array<{ name?: string }>;
  author: { login?: string | null } | null;
};

type ChangelogCategory = "feature" | "bugfix" | "docs";

type ChangelogEntry = {
  id: string;
  title: string;
  category: ChangelogCategory;
  date: string;
  prNumber: number;
  prUrl: string;
  description: string;
};

function categoryFromTitle(title: string): ChangelogCategory {
  const lower = title.toLowerCase().trim();

  if (lower.startsWith("feat:")) return "feature";
  if (lower.startsWith("fix:")) return "bugfix";
  if (lower.startsWith("docs:")) return "docs";

  return "feature";
}

function cleanTitle(title: string): string {
  return title.replace(/^(feat|fix|docs):\s*/i, "").trim();
}

function toDate(iso: string): string {
  return iso.split("T")[0] || iso;
}

function buildDescription(pr: GhPr): string {
  const author = pr.author?.login ? `@${pr.author.login}` : "the team";
  return `Merged PR #${pr.number} by ${author}.`;
}

function fetchMergedPrs(): GhPr[] {
  const command = [
    "gh pr list",
    `--repo ${REPO}`,
    "--state merged",
    `--limit ${LIMIT}`,
    "--json number,title,mergedAt,labels,author",
  ].join(" ");

  const output = execSync(command, { encoding: "utf8" });
  const prs = JSON.parse(output) as unknown;

  if (!Array.isArray(prs)) {
    throw new Error("Unexpected GH output: expected an array of PRs");
  }

  return prs as GhPr[];
}

function main() {
  console.log(`Fetching merged PRs from ${REPO}...`);

  const prs = fetchMergedPrs();

  const entries: ChangelogEntry[] = prs
    .filter((pr) => Boolean(pr.mergedAt))
    .map((pr) => ({
      id: `pr-${pr.number}`,
      title: cleanTitle(pr.title),
      category: categoryFromTitle(pr.title),
      date: toDate(pr.mergedAt),
      prNumber: pr.number,
      prUrl: `https://github.com/${REPO}/pull/${pr.number}`,
      description: buildDescription(pr),
    }))
    .sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const outputPath = join(process.cwd(), "data", "changelog.json");
  writeFileSync(outputPath, `${JSON.stringify(entries, null, 2)}\n`, "utf8");

  console.log(`Generated ${entries.length} changelog entries -> ${outputPath}`);
}

try {
  main();
} catch (error) {
  console.error("Failed to generate changelog:", error);
  process.exit(1);
}
