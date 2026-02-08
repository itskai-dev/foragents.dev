"use client";

import { CopyButton } from "@/components/copy-button";

interface InstallCopyButtonProps {
  text: string;
}

export function InstallCopyButton({ text }: InstallCopyButtonProps) {
  return (
    <CopyButton
      text={text}
      label="📋"
      variant="ghost"
      size="sm"
      className="absolute top-2 right-2 text-[10px] font-mono text-muted-foreground hover:text-cyan transition-colors opacity-0 group-hover/cmd:opacity-100 h-auto p-1"
      showIcon={false}
    />
  );
}
