"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { RecentlyViewed } from "@/components/recently-viewed";

interface SkillPageClientProps {
  slug: string;
  name: string;
}

export function SkillPageClient({ slug, name }: SkillPageClientProps) {
  const { addSkill } = useRecentlyViewed();

  useEffect(() => {
    // Track this skill view (local UX) + page visit (global metrics)
    addSkill(slug, name);

    void fetch("/api/track/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillSlug: slug }),
    }).catch(() => {
      // Best-effort; never block rendering.
    });
  }, [slug, name, addSkill]);

  return <RecentlyViewed />;
}
