import * as React from "react";
import { Rocket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type RunInReflecttButtonProps = {
  skillSlug: string;
  name: string;
  label?: string;
  className?: string;
  size?: React.ComponentProps<typeof Button>["size"];
  variant?: React.ComponentProps<typeof Button>["variant"];
};

function buildReflecttSkillUrl({
  skillSlug,
  name,
}: {
  skillSlug: string;
  name: string;
}): string {
  const url = new URL("https://chat.reflectt.ai");
  url.searchParams.set("skill", skillSlug);
  url.searchParams.set("source", "foragents");
  url.searchParams.set("name", name);
  return url.toString();
}

export function RunInReflecttButton({
  skillSlug,
  name,
  label = "Run in Reflectt",
  className,
  size = "default",
  variant = "default",
}: RunInReflecttButtonProps) {
  const href = buildReflecttSkillUrl({ skillSlug, name });

  return (
    <Button asChild size={size} variant={variant} className={cn("gap-2", className)}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title="Open this skill in chat.reflectt.ai"
      >
        <Rocket className="size-4" />
        {label}
      </a>
    </Button>
  );
}
