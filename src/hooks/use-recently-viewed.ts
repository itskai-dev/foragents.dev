"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "recentlyViewedSkills";
const MAX_ITEMS = 5;

export interface RecentlyViewedSkill {
  slug: string;
  name: string;
  viewedAt: number;
}

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedSkill[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentlyViewedSkill[];
        setRecentlyViewed(parsed);
      }
    } catch (error) {
      console.error("Failed to load recently viewed skills:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Add a skill to recently viewed
  const addSkill = (slug: string, name: string) => {
    try {
      setRecentlyViewed((prev) => {
        // Remove if already exists
        const filtered = prev.filter((skill) => skill.slug !== slug);
        
        // Add to front
        const updated = [
          { slug, name, viewedAt: Date.now() },
          ...filtered,
        ].slice(0, MAX_ITEMS);

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        
        return updated;
      });
    } catch (error) {
      console.error("Failed to add skill to recently viewed:", error);
    }
  };

  // Clear all history
  const clearHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecentlyViewed([]);
    } catch (error) {
      console.error("Failed to clear recently viewed history:", error);
    }
  };

  return {
    recentlyViewed,
    addSkill,
    clearHistory,
    isLoaded,
  };
}
