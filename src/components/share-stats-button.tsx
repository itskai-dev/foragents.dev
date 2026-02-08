"use client";

import { useState } from "react";

export function ShareStatsButton({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://foragents.dev/creators/${encodeURIComponent(username)}/stats`;
  
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  
  return (
    <button
      onClick={handleShare}
      className="px-4 py-2 bg-cyan/10 hover:bg-cyan/20 text-cyan border border-cyan/30 rounded-lg transition-all text-sm font-medium"
    >
      {copied ? "✓ Copied!" : "📊 Share your stats"}
    </button>
  );
}
