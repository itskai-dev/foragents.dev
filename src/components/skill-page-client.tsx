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
    // Track this skill view
    addSkill(slug, name);
  }, [slug, name, addSkill]);

  return <RecentlyViewed />;
}
