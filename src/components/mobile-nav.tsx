"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const primaryLinks = [
  { href: "#news", label: "News" },
  { href: "/trending", label: "🔥 Trending" },
  { href: "#skills", label: "Skills" },
  { href: "/skills/compare", label: "Compare" },
  { href: "/creators", label: "Creators" },
  { href: "/artifacts", label: "Artifacts" },
  { href: "/agents", label: "Agents" },
  { href: "/mcp", label: "MCP" },
  { href: "/community", label: "Community" },
  { href: "/search", label: "Search" },
];

const moreLinks = [
  { href: "/collections", label: "Collections" },
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/dependencies", label: "Dependencies" },
  { href: "/stack", label: "Stack Cards" },
  { href: "/acp", label: "ACP Agents" },
  { href: "/llms-txt", label: "llms.txt Sites" },
  { href: "/requests", label: "Request a Kit 💡" },
  { href: "/verify", label: "Verify Agent ✓" },
  { href: "/sandbox", label: "Sandbox" },
  { href: "/agent-playground", label: "Agent Playground" },
  { href: "/onboarding", label: "Getting Started" },
  { href: "/guides", label: "Guides" },
  { href: "/submit", label: "Submit" },
  { href: "/pricing", label: "Pricing" },
  { href: "/settings", label: "Settings" },
];

const apiLinks = [
  { href: "/api/feed.md", label: "/feed.md" },
  { href: "/api/skills.md", label: "/skills.md" },
  { href: "/llms.txt", label: "/llms.txt" },
];

export function MobileNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
        {primaryLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-white/5"
          >
            {link.label}
          </Link>
        ))}
        
        {/* More dropdown */}
        <div className="relative" ref={moreRef}>
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-white/5 flex items-center gap-1"
            aria-label="More navigation options"
            aria-expanded={moreOpen}
            aria-haspopup="true"
          >
            More
            <svg
              className={`w-3 h-3 transition-transform ${moreOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {moreOpen && (
            <div 
              className="absolute right-0 top-full mt-1 w-48 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-lg shadow-xl z-50 py-2"
              role="menu"
              aria-label="Additional navigation links"
            >
              {moreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMoreOpen(false)}
                  className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-white/10 mt-2 pt-2">
                <div className="px-4 py-1 text-xs text-slate-500 uppercase tracking-wider">API</div>
                {apiLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMoreOpen(false)}
                    className="block px-4 py-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:bg-white/5 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile hamburger button */}
      <button
        className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
        aria-expanded={mobileOpen}
      >
        <span
          className={`block w-5 h-0.5 bg-foreground transition-all duration-200 ${
            mobileOpen ? "rotate-45 translate-y-1" : ""
          }`}
        />
        <span
          className={`block w-5 h-0.5 bg-foreground transition-all duration-200 ${
            mobileOpen ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block w-5 h-0.5 bg-foreground transition-all duration-200 ${
            mobileOpen ? "-rotate-45 -translate-y-1" : ""
          }`}
        />
      </button>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <nav className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-white/5 z-50" role="navigation" aria-label="Mobile navigation">
          <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-1">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-foreground text-sm py-2 px-2 rounded hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/5 pt-3 mt-2 flex flex-col gap-1">
              {moreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-muted-foreground text-sm py-2 px-2 rounded hover:bg-white/5"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-white/5 pt-3 mt-2">
              <div className="px-2 py-1 text-xs text-muted-foreground uppercase tracking-wider">API</div>
              {apiLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-cyan font-mono text-xs py-2 px-2 block rounded hover:bg-white/5"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
