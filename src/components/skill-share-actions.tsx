"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
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
      return ok;
    } catch {
      return false;
    }
  }
}

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

  const canShare = typeof navigator !== "undefined" && Boolean((navigator as any).share);

  const [copyLinkLabel, setCopyLinkLabel] = React.useState("Copy link");
  const [copyApiLabel, setCopyApiLabel] = React.useState("Copy API URL");
  const [shareLabel, setShareLabel] = React.useState("Share");

  const onCopy = async (text: string, setLabel: (v: string) => void, defaultLabel: string) => {
    if (!text) return;
    const ok = await copyToClipboard(text);
    setLabel(ok ? "Copied" : "Copy failed");
    window.setTimeout(() => setLabel(defaultLabel), 1500);
    if (!ok) window.prompt("Copy:", text);
  };

  const onShare = async () => {
    if (!canShare || !pageUrl) return;

    try {
      setShareLabel("Opening…");
      await (navigator as any).share({
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
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="border-white/10 bg-white/5"
        onClick={() => onCopy(pageUrl, setCopyLinkLabel, "Copy link")}
        title="Copies this skill page URL"
        disabled={!pageUrl}
      >
        {copyLinkLabel}
      </Button>

      <Button
        type="button"
        size="sm"
        variant="outline"
        className="border-white/10 bg-white/5 font-mono"
        onClick={() => onCopy(apiUrl, setCopyApiLabel, "Copy API URL")}
        title="Copies the JSON API URL for this skill"
        disabled={!apiUrl}
      >
        {copyApiLabel}
      </Button>

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
