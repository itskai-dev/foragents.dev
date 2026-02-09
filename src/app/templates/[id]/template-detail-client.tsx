"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function TemplateDetailClient({ config }: { config: Record<string, unknown> }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const configText = JSON.stringify(config, null, 2);
    navigator.clipboard.writeText(configText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#F8FAFC]">⚙️ Configuration</h2>
        <Button onClick={handleCopy} size="sm" className="bg-cyan hover:bg-cyan/90">
          {copied ? "✓ Copied!" : "📋 Copy Config"}
        </Button>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#0a0a0a]/60 p-4 overflow-x-auto">
        <pre className="text-sm text-foreground/90 font-mono">
          <code>{JSON.stringify(config, null, 2)}</code>
        </pre>
      </div>
    </section>
  );
}
