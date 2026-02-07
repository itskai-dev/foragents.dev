"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { buildGitHubNewIssueUrl, parseGitHubRepo } from "@/lib/reportIssue";

type Props = {
  repoUrl?: string;
  issueTitle: string;
  issueBody: string;
};

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback: textarea + execCommand
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.top = "-1000px";
      el.style.left = "-1000px";
      document.body.appendChild(el);
      el.focus();
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

export function ReportIssueButton({ repoUrl, issueTitle, issueBody }: Props) {
  const repo = React.useMemo(() => parseGitHubRepo(repoUrl), [repoUrl]);

  const issueUrl = React.useMemo(() => {
    if (!repo) return null;
    return buildGitHubNewIssueUrl({ repo, title: issueTitle, body: issueBody });
  }, [repo, issueTitle, issueBody]);

  const [templateLabel, setTemplateLabel] = React.useState("Copy issue template");
  const [linkLabel, setLinkLabel] = React.useState("Copy issue link");

  const onCopyTemplate = async () => {
    const ok = await copyToClipboard(issueBody);
    setTemplateLabel(ok ? "Copied" : "Copy failed");
    window.setTimeout(() => setTemplateLabel("Copy issue template"), 1500);
    if (!ok) window.prompt("Copy the issue template:", issueBody);
  };

  const onCopyLink = async () => {
    if (!issueUrl) return;
    const ok = await copyToClipboard(issueUrl);
    setLinkLabel(ok ? "Copied" : "Copy failed");
    window.setTimeout(() => setLinkLabel("Copy issue link"), 1500);
    if (!ok) window.prompt("Copy the issue link:", issueUrl);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      {issueUrl ? (
        <Button asChild variant="outline" size="sm" className="border-white/10 bg-white/5">
          <a href={issueUrl} target="_blank" rel="noopener noreferrer">
            🐛 Report issue ↗
          </a>
        </Button>
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-white/10 bg-white/5"
        onClick={onCopyTemplate}
        title="Copy issue template (remove secrets before sharing)"
      >
        {templateLabel}
      </Button>

      {issueUrl ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-white/10 bg-white/5"
          onClick={onCopyLink}
          title="Copy a GitHub new-issue link with a prefilled title/body"
        >
          {linkLabel}
        </Button>
      ) : null}
    </div>
  );
}
