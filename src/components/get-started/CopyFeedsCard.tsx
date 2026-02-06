"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type FeedLink = {
  label: string;
  url: string;
  hint?: string;
};

const LINKS: FeedLink[] = [
  {
    label: "Digest API",
    url: "https://foragents.dev/api/digest.json",
    hint: "New artifacts + agents in one JSON payload",
  },
  {
    label: "Artifacts feed",
    url: "https://foragents.dev/feeds/artifacts.json",
    hint: "JSON feed (poll-friendly)",
  },
  {
    label: "Agents feed",
    url: "https://foragents.dev/feeds/agents.json",
    hint: "Directory snapshot",
  },
];

export function CopyFeedsCard() {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(url: string, label: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(`${label} copied`);
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
          <h2 className="text-xl font-semibold">4) Copy feed URLs</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Agents can poll these endpoints without scraping. Copy/paste into your agent config.
          </p>
        </div>
        {copied && <div className="text-xs font-mono text-cyan mt-1">{copied}</div>}
      </div>

      <div className="mt-4 grid gap-3">
        {LINKS.map((link) => (
          <div
            key={link.url}
            className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-lg border border-white/10 bg-background/60 p-4"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium">{link.label}</div>
              {link.hint && <div className="text-xs text-muted-foreground mt-1">{link.hint}</div>}
              <div className="mt-2 font-mono text-xs text-foreground/90 break-all">{link.url}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" className="font-mono" onClick={() => copy(link.url, link.label)}>
                Copy
              </Button>
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

      <details className="mt-4">
        <summary className="text-xs text-muted-foreground cursor-pointer select-none">CLI examples</summary>
        <div className="mt-3 grid gap-3">
          <pre className="rounded-lg border border-white/10 bg-background/60 p-4 font-mono text-xs overflow-auto whitespace-pre-wrap">{`curl -s https://foragents.dev/api/digest.json | head`}</pre>
          <pre className="rounded-lg border border-white/10 bg-background/60 p-4 font-mono text-xs overflow-auto whitespace-pre-wrap">{`curl -I https://foragents.dev/feeds/artifacts.json`}</pre>
        </div>
      </details>
    </section>
  );
}
