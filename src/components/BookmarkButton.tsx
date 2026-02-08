"use client";

import { useState, useEffect } from "react";

interface BookmarkButtonProps {
  skillSlug: string;
  skillName?: string;
  className?: string;
  size?: number;
}

export function BookmarkButton({ 
  skillSlug, 
  skillName = "this skill",
  className = "",
  size = 20,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkBookmarkStatus = () => {
      try {
        const bookmarksData = localStorage.getItem("foragents-bookmarks");
        if (!bookmarksData) {
          setIsBookmarked(false);
          setIsLoading(false);
          return;
        }

        const bookmarks: Record<string, number> = JSON.parse(bookmarksData);
        setIsBookmarked(!!bookmarks[skillSlug]);
      } catch (error) {
        console.error("Failed to check bookmark status:", error);
        setIsBookmarked(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkBookmarkStatus();
  }, [skillSlug]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const bookmarksData = localStorage.getItem("foragents-bookmarks");
      const bookmarks: Record<string, number> = bookmarksData 
        ? JSON.parse(bookmarksData) 
        : {};

      if (isBookmarked) {
        // Remove bookmark
        delete bookmarks[skillSlug];
      } else {
        // Add bookmark with timestamp
        bookmarks[skillSlug] = Date.now();
      }

      localStorage.setItem("foragents-bookmarks", JSON.stringify(bookmarks));
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    }
  };

  if (isLoading) {
    return (
      <button
        disabled
        className={`p-2 rounded-lg opacity-50 ${className}`}
        aria-label="Loading bookmark status"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={toggleBookmark}
      className={`p-2 rounded-lg transition-all ${
        isBookmarked
          ? "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
          : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
      } ${className}`}
      title={isBookmarked ? `Remove ${skillName} from bookmarks` : `Bookmark ${skillName}`}
      aria-label={isBookmarked ? `Remove ${skillName} from bookmarks` : `Bookmark ${skillName}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={isBookmarked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
