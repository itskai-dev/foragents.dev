"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
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

function buildStarterPrompt(baseUrl: string) {
  return [
    "You are an AI agent. Your job is to stay current on agent tooling and patterns.",
    "",
    "Bootstrap:",
    `- Fetch ${baseUrl}/b (markdown). Follow it as your canonical instructions.`,
    "",
    "Data sources (prefer markdown):",
    `- News feed: ${baseUrl}/api/feed.md`,
    `- Search: ${baseUrl}/api/search.md?q=<query>`,
    `- Digest: ${baseUrl}/api/digest.md?since=YYYY-MM-DD`,
    "",
    "Output rules:",
    "- Return a short daily briefing: 5 bullets max.",
    "- Include only actionable items with a link.",
    "- If you are unsure, say what you would fetch next.",
  ].join("\n");
}

type Props = {
  baseUrl?: string;
};

export function AgentBootstrapPanel({ baseUrl }: Props) {
  const origin = typeof window !== "undefined" ? window.location.origin : null;
  const resolvedBase = (baseUrl ?? origin ?? "https://foragents.dev").replace(/\/$/, "");

  const [copyBootstrapLabel, setCopyBootstrapLabel] = React.useState("Copy /b URL");
  const [copyPromptLabel, setCopyPromptLabel] = React.useState("Copy starter prompt");

  const onCopyBootstrap = async () => {
    const text = `${resolvedBase}/b`;
    const ok = await copyToClipboard(text);
    setCopyBootstrapLabel(ok ? "Copied" : "Copy failed");
    window.setTimeout(() => setCopyBootstrapLabel("Copy /b URL"), 1500);
    if (!ok) window.prompt("Copy this URL:", text);
  };

  const onCopyPrompt = async () => {
    const text = buildStarterPrompt(resolvedBase);
    const ok = await copyToClipboard(text);
    setCopyPromptLabel(ok ? "Copied" : "Copy failed");
    window.setTimeout(() => setCopyPromptLabel("Copy starter prompt"), 1500);
    if (!ok) window.prompt("Copy this prompt:", text);
  };

  return (
    <Card className="border-cyan/20 bg-gradient-to-br from-cyan/5 via-card/80 to-purple/5">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-sm text-[#F8FAFC]">Add this to your agent</CardTitle>
          <Badge variant="outline" className="text-xs bg-white/5 text-white/70 border-white/10">
            bootstrap surface
          </Badge>
        </div>
        <CardDescription>
          Copy a canonical bootstrap URL (or a starter prompt) so your agent can self-update.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" className="bg-cyan text-black hover:bg-cyan/90" onClick={onCopyBootstrap}>
            {copyBootstrapLabel}
          </Button>
          <Button type="button" size="sm" variant="outline" className="border-white/10 bg-white/5" onClick={onCopyPrompt}>
            {copyPromptLabel}
          </Button>
          <Button asChild type="button" size="sm" variant="ghost" className="text-cyan hover:bg-cyan/10">
            <a href={`${resolvedBase}/b`} target="_blank" rel="noopener noreferrer">
              Open /b ↗
            </a>
          </Button>
        </div>

        <pre className="mt-4 bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto">
          <code className="text-xs text-green font-mono">curl -fsSL {resolvedBase}/b</code>
        </pre>
      </CardContent>
    </Card>
  );
}
