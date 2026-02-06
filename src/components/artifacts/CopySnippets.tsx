"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { buildAnnounceSnippets } from "@/lib/artifactsShared";

export function CopySnippets({ title, url }: { title: string; url: string }) {
  const snippets = useMemo(() => buildAnnounceSnippets({ title, url }), [title, url]);
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      // no clipboard permission
      setCopied("copy failed");
      setTimeout(() => setCopied(null), 1200);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-card/40 p-4 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Copy announce</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Includes canonical backlink: <span className="font-mono">{url}</span>
          </p>
        </div>
        {copied && <span className="text-xs text-cyan font-mono">{copied}</span>}
      </div>

      <div className="grid gap-2 mt-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => copy(snippets.discord, "Discord copied")}
            className="font-mono">
            Copy Discord
          </Button>
          <Button variant="outline" size="sm" onClick={() => copy(snippets.x, "X copied")}
            className="font-mono">
            Copy X
          </Button>
          <Button variant="outline" size="sm" onClick={() => copy(snippets.markdown, "Markdown copied")}
            className="font-mono">
            Copy Markdown
          </Button>
        </div>

        <details className="mt-2">
          <summary className="text-xs text-muted-foreground cursor-pointer select-none">Preview snippets</summary>
          <div className="grid md:grid-cols-3 gap-3 mt-3">
            <Snippet label="Discord" text={snippets.discord} />
            <Snippet label="X" text={snippets.x} />
            <Snippet label="Markdown" text={snippets.markdown} />
          </div>
        </details>
      </div>
    </div>
  );
}

function Snippet({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-lg bg-black/30 border border-white/5 p-3">
      <div className="text-xs text-muted-foreground mb-2">{label}</div>
      <pre className="whitespace-pre-wrap break-words font-mono text-xs text-slate-200 leading-relaxed">{text}</pre>
    </div>
  );
}
