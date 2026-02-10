"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/toast-context";

type SkillInstallCtaProps = {
  slug: string;
  initialInstalls?: number;
};

export function SkillInstallCta({ slug, initialInstalls = 0 }: SkillInstallCtaProps) {
  const [installs, setInstalls] = React.useState(initialInstalls);
  const [isInstalling, setIsInstalling] = React.useState(false);
  const [installedInSession, setInstalledInSession] = React.useState(false);
  const { addToast } = useToast();

  const onInstall = React.useCallback(async () => {
    if (isInstalling) return;

    setIsInstalling(true);

    try {
      const response = await fetch(`/api/skills/${encodeURIComponent(slug)}/install`, {
        method: "POST",
      });

      const data = (await response.json()) as { slug?: string; installs?: number; error?: string };

      if (response.ok) {
        const nextCount = typeof data.installs === "number" ? data.installs : installs;
        setInstalls(nextCount);
        setInstalledInSession(true);
        addToast("success", "Added to your stack ✓");
        return;
      }

      if (response.status === 429) {
        const currentCount = typeof data.installs === "number" ? data.installs : installs;
        setInstalls(currentCount);
        addToast("info", "Install already counted for your IP in the last hour");
        return;
      }

      addToast("error", data.error ?? "Failed to track install");
    } catch {
      addToast("error", "Failed to track install");
    } finally {
      setIsInstalling(false);
    }
  }, [addToast, installs, isInstalling, slug]);

  const label = installs === 1 ? "install" : "installs";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge className="bg-cyan/15 text-cyan border border-cyan/30 font-medium">
        {installs.toLocaleString()} {label}
      </Badge>
      <Button
        type="button"
        size="sm"
        variant={installedInSession ? "secondary" : "default"}
        className={installedInSession ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30" : "bg-cyan text-background hover:bg-cyan/90"}
        onClick={onInstall}
        disabled={isInstalling}
      >
        {isInstalling ? "Adding…" : installedInSession ? "Added" : "Add to Stack"}
      </Button>
    </div>
  );
}
