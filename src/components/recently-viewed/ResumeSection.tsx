"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { clearRecentlyViewed, getRecentlyViewed, type RecentlyViewedItem } from "@/lib/recentlyViewed";

function labelForType(type: RecentlyViewedItem["type"]) {
  if (type === "agent") return "Agent";
  if (type === "artifact") return "Artifact";
  return type;
}

export function ResumeSection() {
  const [items, setItems] = useState<RecentlyViewedItem[]>(() => {
    // Avoid effects that only exist to set state on mount.
    // This runs only on the client; the component is `use client`.
    try {
      return getRecentlyViewed().slice(0, 8);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const onUpdate = () => setItems(getRecentlyViewed().slice(0, 8));

    window.addEventListener("recentlyViewedUpdated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("recentlyViewedUpdated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const hasItems = items.length > 0;

  const rows = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        typeLabel: labelForType(item.type),
      })),
    [items],
  );

  if (!hasItems) return null;

  return (
    <section className="max-w-5xl mx-auto px-4 py-6">
      <Card className="bg-card/50 border-white/5">
        <div className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="text-lg font-semibold">⏯ Resume</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Recently viewed (stored locally in your browser)
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearRecentlyViewed();
                setItems([]);
              }}
              className="shrink-0"
            >
              Clear
            </Button>
          </div>

          <div className="grid gap-2">
            {rows.map((item) => (
              <Link
                key={`${item.type}:${item.key}`}
                href={item.href}
                className="flex items-center justify-between gap-3 rounded-md border border-white/5 px-3 py-2 hover:border-cyan/20 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground font-mono">
                    {item.typeLabel}
                  </div>
                  <div className="text-sm font-medium truncate">{item.title}</div>
                </div>
                <span className="text-xs text-cyan">Open →</span>
              </Link>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
}
