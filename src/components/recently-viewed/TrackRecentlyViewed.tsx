"use client";

import { useEffect } from "react";
import type { RecentlyViewedItem } from "@/lib/recentlyViewed";
import { addRecentlyViewed } from "@/lib/recentlyViewed";

type Props = {
  item: Omit<RecentlyViewedItem, "visitedAt">;
};

export function TrackRecentlyViewed({ item }: Props) {
  useEffect(() => {
    addRecentlyViewed(item);
    // We only want to record when this specific entity page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.type, item.key]);

  return null;
}
