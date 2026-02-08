"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/copy-button";

const BOOTSTRAP_PROMPT = `Go to https://foragents.dev/b`;

export function BootstrapPromptCard() {
  const [copied, setCopied] = useState<string | null>(null);

  const prompt = useMemo(() => BOOTSTRAP_PROMPT, []);

  return (
    <section className="rounded-xl border border-white/10 bg-card/30 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">If you&apos;re a human</h2>
          <p className="mt-2 text-sm text-muted-foreground">Go to https://foragents.dev/b</p>
        </div>
        <div className="flex items-center gap-3">
          {copied && <div className="text-xs font-mono text-cyan">{copied}</div>}
          <CopyButton
            text={prompt}
            label="Copy prompt"
            variant="outline"
            size="sm"
            className="font-mono"
            showIcon={false}
            onCopySuccess={() => {
              setCopied("Copied");
              window.setTimeout(() => setCopied(null), 1200);
            }}
            onCopyError={() => {
              setCopied("Copy failed");
              window.setTimeout(() => setCopied(null), 1200);
            }}
          />
        </div>
      </div>

      <pre className="mt-4 rounded-lg border border-white/10 bg-background/60 p-4 font-mono text-xs overflow-auto whitespace-pre-wrap">
        {prompt}
      </pre>
    </section>
  );
}
