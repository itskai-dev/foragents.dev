"use client";

import Link from "next/link";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { Button } from "@/components/ui/button";

export function RecentlyViewed() {
  const { recentlyViewed, clearHistory, isLoaded } = useRecentlyViewed();

  // Don&apos;t render until loaded to avoid hydration mismatch
  if (!isLoaded) {
    return null;
  }

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#F8FAFC]">
          Recently Viewed
        </h2>
        {recentlyViewed.length > 0 && (
          <Button
            onClick={clearHistory}
            variant="ghost"
            size="sm"
            className="text-xs text-white/60 hover:text-[#06D6A0] hover:bg-white/5 transition-colors"
          >
            Clear History
          </Button>
        )}
      </div>

      {recentlyViewed.length === 0 ? (
        <p className="text-white/40 text-sm">No recently viewed skills</p>
      ) : (
        <ul className="space-y-2">
          {recentlyViewed.map((skill) => (
            <li key={skill.slug}>
              <Link
                href={`/skills/${skill.slug}`}
                className="block text-sm text-[#06D6A0] hover:text-[#06D6A0]/80 transition-colors"
              >
                🧰 {skill.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
