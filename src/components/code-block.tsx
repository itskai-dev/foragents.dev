"use client";

import { CopyButton } from "@/components/copy-button";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  return (
    <div className={`relative group ${className || ""}`}>
      <div className="bg-black/40 rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm">
          <code>{code}</code>
        </pre>
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton
          text={code}
          variant="ghost"
          size="sm"
          className="bg-black/60 hover:bg-black/80 border border-white/10"
        />
      </div>
    </div>
  );
}
