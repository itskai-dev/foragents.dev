"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";

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
  const curlCommand = `curl -fsSL ${resolvedBase}/b`;

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
          <CopyButton
            text={`${resolvedBase}/b`}
            label="Copy /b URL"
            variant="default"
            size="sm"
            className="bg-cyan text-black hover:bg-cyan/90"
            showIcon={false}
            onCopyError={() => window.prompt("Copy this URL:", `${resolvedBase}/b`)}
          />
          <CopyButton
            text={buildStarterPrompt(resolvedBase)}
            label="Copy starter prompt"
            variant="outline"
            size="sm"
            className="border-white/10 bg-white/5"
            showIcon={false}
            onCopyError={() => window.prompt("Copy this prompt:", buildStarterPrompt(resolvedBase))}
          />
          <Button asChild type="button" size="sm" variant="ghost" className="text-cyan hover:bg-cyan/10">
            <a href={`${resolvedBase}/b`} target="_blank" rel="noopener noreferrer">
              Open /b ↗
            </a>
          </Button>
        </div>

        <pre className="mt-4 bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto">
          <code className="text-xs text-green font-mono">{curlCommand}</code>
        </pre>

        <div className="mt-2 flex justify-end">
          <CopyButton
            text={curlCommand}
            label="Copy curl command"
            variant="ghost"
            size="sm"
            className="text-cyan hover:bg-cyan/10"
            showIcon={false}
            onCopyError={() => window.prompt("Copy this command:", curlCommand)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
