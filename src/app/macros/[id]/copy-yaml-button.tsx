"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyYamlButton({ yaml }: { yaml: string }) {
  const [copied, setCopied] = useState<boolean>(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(yaml);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button variant="outline" onClick={copy} className="font-mono">
      {copied ? "Copied" : "Copy YAML"}
    </Button>
  );
}
