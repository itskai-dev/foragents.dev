"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { parseCompareIdsParam } from "@/lib/compare";

export function AddSkillToCompareButton({
  slug,
  label = "Add to compare",
  className,
}: {
  slug: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={() => {
        const current =
          typeof window !== "undefined"
            ? parseCompareIdsParam(
                new URLSearchParams(window.location.search).get("skills")
              )
            : [];

        const next = current.includes(slug) ? current : [...current, slug];
        const href = next.length
          ? `/compare?skills=${encodeURIComponent(next.join(","))}`
          : "/compare";
        router.push(href);
      }}
    >
      {label}
    </Button>
  );
}
