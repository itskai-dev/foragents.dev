export type GitHubRepoInfo = {
  owner: string;
  repo: string;
};

function cleanRepoName(repo: string): string {
  return repo.replace(/\.git$/i, "").trim();
}

/**
 * Best-effort parsing of GitHub repo URLs.
 * Supports:
 * - https://github.com/<owner>/<repo>
 * - https://github.com/<owner>/<repo>/...
 * - git@github.com:<owner>/<repo>.git
 */
export function parseGitHubRepo(
  url: string | undefined | null
): GitHubRepoInfo | null {
  if (!url) return null;

  const raw = url.trim();
  if (!raw) return null;

  // SSH form
  const sshMatch = raw.match(
    /^git@github\.com:([^/\s]+)\/([^\s/]+?)(?:\.git)?$/i
  );
  if (sshMatch) {
    const owner = sshMatch[1];
    const repo = cleanRepoName(sshMatch[2]);
    if (owner && repo) return { owner, repo };
  }

  // HTTPS/HTTP form
  try {
    const u = new URL(raw);
    if (u.hostname !== "github.com") return null;

    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;

    const owner = parts[0];
    const repo = cleanRepoName(parts[1]);
    if (!owner || !repo) return null;

    return { owner, repo };
  } catch {
    return null;
  }
}

export function buildGitHubNewIssueUrl(params: {
  repo: GitHubRepoInfo;
  title: string;
  body: string;
}): string {
  const { owner, repo } = params.repo;
  const base = `https://github.com/${owner}/${repo}/issues/new`;
  const qs = new URLSearchParams({
    title: params.title,
    body: params.body,
  });
  return `${base}?${qs.toString()}`;
}

export function buildSkillIssueBodyTemplate(params: {
  skillName: string;
  skillSlug: string;
  skillRepoUrl?: string;
  pageUrl?: string;
}): string {
  const pageUrl =
    params.pageUrl ?? `https://foragents.dev/skills/${params.skillSlug}`;

  // Keep it compact to avoid URL length issues.
  return [
    "### Summary",
    "(Describe the problem)",
    "",
    "### Steps to reproduce",
    "1.",
    "2.",
    "3.",
    "",
    "### Expected vs actual",
    "Expected:",
    "Actual:",
    "",
    "### Support Snippet (redact secrets)",
    `- forAgents.dev: ${pageUrl}`,
    `- Skill: ${params.skillName} (${params.skillSlug})`,
    `- Repo: ${params.skillRepoUrl ?? "(unknown)"}`,
    "",
    "Run and paste output:",
    "```bash",
    "node -v && npm -v",
    "```",
    "",
    "> ⚠️ Remove API keys, tokens, private URLs, and any secrets before submitting.",
    "",
  ].join("\n");
}
