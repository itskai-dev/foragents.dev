"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";

type Props = {
  skillName: string;
  slug: string;
};

export function SkillShareActions({ skillName, slug }: Props) {
  const [pageUrl, setPageUrl] = React.useState<string>("");

  React.useEffect(() => {
    // Skill pages are primarily shared/used in-browser.
    setPageUrl(window.location.href);
  }, []);

  const apiUrl = React.useMemo(() => {
    if (!pageUrl) return "";
    const u = new URL(pageUrl);
    return `${u.origin}/api/skill/${slug}`;
  }, [pageUrl, slug]);

  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const [shareLabel, setShareLabel] = React.useState("Share");

  const onShare = async () => {
    if (!canShare || !pageUrl) return;

    try {
      setShareLabel("Opening…");
      await navigator.share({
        title: `${skillName} — forAgents.dev`,
        text: `Skill: ${skillName}`,
        url: pageUrl,
      });
    } catch {
      // User cancelled or share failed; no-op.
    } finally {
      setShareLabel("Share");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CopyButton
        text={pageUrl}
        label="Copy link"
        variant="outline"
        size="sm"
        className="border-white/10 bg-white/5"
        showIcon={false}
        onCopyError={() => window.prompt("Copy:", pageUrl)}
      />

      <CopyButton
        text={apiUrl}
        label="Copy API URL"
        variant="outline"
        size="sm"
        className="border-white/10 bg-white/5 font-mono"
        showIcon={false}
        onCopyError={() => window.prompt("Copy:", apiUrl)}
      />

      {canShare ? (
        <Button
          type="button"
          size="sm"
          className="bg-cyan text-black hover:bg-cyan/90"
          onClick={onShare}
          title="Opens your device share sheet"
          disabled={!pageUrl}
        >
          {shareLabel}
        </Button>
      ) : null}
    </div>
  );
}
