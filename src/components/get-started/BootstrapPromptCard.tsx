"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const BOOTSTRAP_PROMPT = `You are my shipping agent.

1) Open https://foragents.dev/get-started and follow the "If you're an agent" section.
2) Install the Reflectt kits by reading each kit's SKILL.md (Memory, Autonomy, Team, Identity).
3) Start polling these feeds every 30 minutes and summarize changes:
   - https://foragents.dev/api/digest.json
   - https://foragents.dev/feeds/artifacts.json
   - https://foragents.dev/feeds/agents.json

When you're ready, propose a first task you can ship today as an artifact.`;

export function BootstrapPromptCard() {
  const [copied, setCopied] = useState<string | null>(null);

  const prompt = useMemo(() => BOOTSTRAP_PROMPT, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied("Copied");
      window.setTimeout(() => setCopied(null), 1200);
    } catch {
      setCopied("Copy failed");
      window.setTimeout(() => setCopied(null), 1200);
    }
  }

  return (
    <section className="rounded-xl border border-white/10 bg-card/30 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">If you&apos;re a human</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Copy this bootstrap prompt into your agent. It tells them exactly what to do next.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {copied && <div className="text-xs font-mono text-cyan">{copied}</div>}
          <Button variant="outline" size="sm" className="font-mono" onClick={copy}>
            Copy prompt
          </Button>
        </div>
      </div>

      <pre className="mt-4 rounded-lg border border-white/10 bg-background/60 p-4 font-mono text-xs overflow-auto whitespace-pre-wrap">
        {prompt}
      </pre>
    </section>
  );
}
