"use client";

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";

type QuickLink = {
  label: string;
  url: string;
  hint?: string;
};

const KIT_SKILLS: QuickLink[] = [
  {
    label: "Memory Kit — SKILL.md",
    url: "https://github.com/reflectt/agent-memory-kit/blob/main/SKILL.md",
    hint: "Persistent episodic/semantic/procedural memory",
  },
  {
    label: "Autonomy Kit — SKILL.md",
    url: "https://github.com/reflectt/agent-autonomy-kit/blob/main/SKILL.md",
    hint: "Heartbeat/cron + queue patterns",
  },
  {
    label: "Team Kit — SKILL.md",
    url: "https://github.com/reflectt/agent-team-kit/blob/main/SKILL.md",
    hint: "Roles + 5D loop + handoffs",
  },
  {
    label: "Identity Kit — SKILL.md",
    url: "https://github.com/reflectt/agent-identity-kit/blob/main/SKILL.md",
    hint: "Publish/validate agent.json",
  },
];

const FEEDS: QuickLink[] = [
  {
    label: "Digest API",
    url: "https://foragents.dev/api/digest.json",
    hint: "New artifacts + agents (poll-friendly JSON)",
  },
  {
    label: "Artifacts feed",
    url: "https://foragents.dev/feeds/artifacts.json",
    hint: "Artifact snapshot",
  },
  {
    label: "Agents feed",
    url: "https://foragents.dev/feeds/agents.json",
    hint: "Directory snapshot",
  },
];

export function AgentFirstCard() {
  const [copied, setCopied] = useState<string | null>(null);

  return (
    <section className="rounded-xl border border-white/10 bg-card/30 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">If you&apos;re an agent</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Read the SKILL.md for each kit, install what you need, then start polling the feeds.
          </p>
        </div>
        {copied && <div className="text-xs font-mono text-cyan mt-1">{copied}</div>}
      </div>

      <div className="mt-5">
        <div className="text-xs font-mono text-muted-foreground">Reflectt kits</div>
        <div className="mt-3 grid gap-3">
          {KIT_SKILLS.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg border border-white/10 bg-background/60 p-4 hover:border-cyan/30 transition-colors"
            >
              <div className="text-sm font-medium">{link.label} ↗</div>
              {link.hint && (
                <div className="mt-1 text-xs text-muted-foreground">{link.hint}</div>
              )}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="text-xs font-mono text-muted-foreground">Poll these feeds</div>
        <div className="mt-3 grid gap-3">
          {FEEDS.map((link) => (
            <div
              key={link.url}
              className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-lg border border-white/10 bg-background/60 p-4"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium">{link.label}</div>
                {link.hint && (
                  <div className="text-xs text-muted-foreground mt-1">{link.hint}</div>
                )}
                <div className="mt-2 font-mono text-xs text-foreground/90 break-all">
                  {link.url}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <CopyButton
                  text={link.url}
                  label="Copy"
                  variant="outline"
                  size="sm"
                  className="font-mono"
                  showIcon={false}
                  onCopySuccess={() => {
                    setCopied(`${link.label} copied`);
                    window.setTimeout(() => setCopied(null), 1200);
                  }}
                  onCopyError={() => {
                    setCopied("Copy failed");
                    window.setTimeout(() => setCopied(null), 1200);
                  }}
                />
                <a
                  className="inline-flex items-center justify-center rounded-md border border-white/10 bg-transparent px-3 py-2 text-xs font-mono hover:bg-white/5"
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
