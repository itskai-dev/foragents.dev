"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function KeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // Check if user has seen the hint before
    const hasSeenHint = localStorage.getItem("keyboard-shortcuts-hint-seen");
    
    if (!hasSeenHint) {
      // Show hint after a short delay
      const timer = setTimeout(() => {
        setShowHint(true);
        localStorage.setItem("keyboard-shortcuts-hint-seen", "true");
        
        // Auto-hide after 4 seconds
        setTimeout(() => setShowHint(false), 4000);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+K (Windows/Linux) or Cmd+K (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        
        // If we&apos;re already on the search page, focus the input
        if (pathname === "/search") {
          const searchInput = document.querySelector<HTMLInputElement>(
            'input[type="text"][placeholder*="Search"]'
          );
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
        } else {
          // Navigate to search page
          router.push("/search");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, pathname]);

  return (
    <>
      {showHint && (
        <div
          className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500"
          role="status"
          aria-live="polite"
        >
          <div className="bg-card border border-cyan/20 rounded-lg px-4 py-3 shadow-lg shadow-cyan/10 max-w-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⌨️</span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Keyboard shortcut enabled!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Press{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono text-xs">
                    {typeof navigator !== "undefined" &&
                    navigator.platform.toLowerCase().includes("mac")
                      ? "⌘"
                      : "Ctrl"}
                    +K
                  </kbd>{" "}
                  to search
                </p>
              </div>
              <button
                onClick={() => setShowHint(false)}
                className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close hint"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
