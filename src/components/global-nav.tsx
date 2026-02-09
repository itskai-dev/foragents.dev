"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/agents", label: "Agents" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/skills", label: "Skills" },
  { href: "/templates", label: "Templates" },
  { href: "/workflows", label: "Workflows" },
  { href: "/compare", label: "Compare" },
  { href: "/calculator", label: "Calculator" },
  { href: "/dependencies", label: "Dependencies" },
  { href: "/trending", label: "Trending" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/badges", label: "Badges" },
  { href: "/certifications", label: "Certifications" },
  { href: "/mcp", label: "MCP" },
  { href: "/macros", label: "Macros" },
  { href: "/integrations", label: "Integrations" },
  { href: "/requests", label: "Requests" },
  { href: "/bounties", label: "Bounties" },
  { href: "/onboarding", label: "Get Started" },
  { href: "/search", label: "Search" },
  { href: "/playground", label: "Playground" },
  { href: "/sandbox", label: "Sandbox" },
  { href: "/diagnostics", label: "Diagnostics" },
  { href: "/observability", label: "Observability" },
  { href: "/guides", label: "Docs" },
  { href: "/digest", label: "Digest" },
  { href: "/changelog", label: "Changelog" },
  { href: "/whats-new", label: "What's New" },
];

export function GlobalNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Global Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5" role="navigation" aria-label="Global navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              aria-label="forAgents.dev home"
            >
              <span className="text-xl font-bold">
                <span className="text-[#F8FAFC]">forAgents</span>
                <span className="text-[#06D6A0]">.dev</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(link.href)
                      ? "bg-[#06D6A0]/10 text-[#06D6A0]"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/auth/signin"
                className="ml-2 px-4 py-2 text-sm font-semibold bg-[#06D6A0] text-[#0a0a0a] rounded-lg hover:brightness-110 transition-all"
              >
                Sign In
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  mobileOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  mobileOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  mobileOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          
          {/* Slide-out Menu */}
          <div 
            className="md:hidden fixed top-16 right-0 bottom-0 w-64 bg-[#0a0a0a]/95 backdrop-blur-md border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col h-full p-6">
              {/* Mobile Nav Links */}
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive(link.href)
                        ? "bg-[#06D6A0]/10 text-[#06D6A0]"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Sign In Button */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full px-4 py-3 text-sm font-semibold text-center bg-[#06D6A0] text-[#0a0a0a] rounded-lg hover:brightness-110 transition-all"
                >
                  Sign In
                </Link>
              </div>

              {/* Footer Links */}
              <div className="mt-auto pt-6 border-t border-white/10">
                <div className="flex flex-col gap-2 text-xs text-slate-400">
                  <Link 
                    href="/about" 
                    onClick={() => setMobileOpen(false)}
                    className="hover:text-[#06D6A0] transition-colors"
                  >
                    About
                  </Link>
                  <Link 
                    href="/pricing" 
                    onClick={() => setMobileOpen(false)}
                    className="hover:text-[#06D6A0] transition-colors"
                  >
                    Pricing
                  </Link>
                  <Link 
                    href="/api/feed.md" 
                    onClick={() => setMobileOpen(false)}
                    className="hover:text-[#06D6A0] transition-colors font-mono"
                  >
                    API
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
