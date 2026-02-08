"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  text: string;
  label?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
  onCopySuccess?: () => void;
  onCopyError?: () => void;
}

export function CopyButton({
  text,
  label,
  variant = "outline",
  size = "sm",
  className,
  showIcon = true,
  onCopySuccess,
  onCopyError,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopySuccess?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      try {
        const el = document.createElement("textarea");
        el.value = text;
        el.setAttribute("readonly", "");
        el.style.position = "fixed";
        el.style.top = "-1000px";
        el.style.left = "-1000px";
        document.body.appendChild(el);
        el.focus();
        el.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(el);
        
        if (ok) {
          setCopied(true);
          onCopySuccess?.();
          setTimeout(() => setCopied(false), 2000);
        } else {
          onCopyError?.();
        }
      } catch {
        onCopyError?.();
      }
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleCopy}
      aria-label={copied ? "Copied!" : `Copy ${label || "text"} to clipboard`}
    >
      {showIcon && (
        copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )
      )}
      {label && (
        <span className={showIcon ? "ml-2" : ""}>
          {copied ? "Copied!" : label}
        </span>
      )}
    </Button>
  );
}
