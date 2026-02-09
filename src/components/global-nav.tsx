"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Grouped navigation structure
const navGroups = [
  {
    label: "Explore",
    items: [
      { href: "/skills", label: "Skills" },
      { href: "/agents", label: "Agents" },
      { href: "/mcp", label: "MCP" },
      { href: "/marketplace", label: "Marketplace" },
      { href: "/trending", label: "Trending" },
      { href: "/leaderboard", label: "Leaderboard" },
      { href: "/benchmarks", label: "Benchmarks" },
      { href: "/showcase", label: "Showcase" },
    ],
  },
  {
    label: "Build",
    items: [
      { href: "/playground", label: "Playground" },
      { href: "/agent-playground", label: "Agent Playground" },
      { href: "/sandbox", label: "Sandbox" },
      { href: "/templates", label: "Templates" },
      { href: "/workflows", label: "Workflows" },
      { href: "/macros", label: "Macros" },
      { href: "/diagnostics", label: "Diagnostics" },
      { href: "/observability", label: "Observability" },
      { href: "/dependencies", label: "Dependencies" },
      { href: "/calculator", label: "Calculator" },
      { href: "/compare", label: "Compare" },
    ],
  },
  {
    label: "Community",
    items: [
      { href: "/forum", label: "Forum" },
      { href: "/community", label: "Community" },
      { href: "/events", label: "Events" },
      { href: "/bounties", label: "Bounties" },
      { href: "/requests", label: "Requests" },
      { href: "/badges", label: "Badges" },
      { href: "/certifications", label: "Certifications" },
      { href: "/partners", label: "Partners" },
      { href: "/integrations", label: "Integrations" },
    ],
  },
  {
    label: "Learn",
    items: [
      { href: "/guides", label: "Guides" },
      { href: "/api-docs", label: "API Docs" },
      { href: "/changelog", label: "Changelog" },
      { href: "/digest", label: "Digest" },
      { href: "/whats-new", label: "What's New" },
    ],
  },
  {
    label: "About",
    items: [
      { href: "/about", label: "About" },
      { href: "/pricing", label: "Pricing" },
      { href: "/roadmap", label: "Roadmap" },
      { href: "/analytics", label: "Analytics" },
    ],
  },
];

// Standalone top-level items
const standaloneLinks = [
  { href: "/onboarding", label: "Get Started" },
  { href: "/search", label: "Search" },
];

// Dropdown component for desktop nav
function NavDropdown({ 
  group, 
  isActive 
}: { 
  group: typeof navGroups[0]; 
  isActive: (href: string) => boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen]);

  const hasActiveItem = group.items.some(item => isActive(item.href));

  return (
    <div 
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
          hasActiveItem || isOpen
            ? "bg-[#06D6A0]/10 text-[#06D6A0]"
            : "text-slate-300 hover:text-white hover:bg-white/5"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {group.label}
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-56 bg-[#0a0a0a]/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl z-50 py-2">
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2 text-sm transition-colors ${
                isActive(item.href)
                  ? "bg-[#06D6A0]/10 text-[#06D6A0]"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Collapsible section for mobile nav
function MobileNavSection({ 
  group, 
  isActive 
}: { 
  group: typeof navGroups[0]; 
  isActive: (href: string) => boolean;
}) {
  const hasActiveItem = group.items.some(item => isActive(item.href));
  // Auto-expand if section contains active item
  const [isExpanded, setIsExpanded] = useState(hasActiveItem);

  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors ${
          hasActiveItem
            ? "text-[#06D6A0]"
            : "text-slate-200 hover:text-white"
        }`}
        aria-expanded={isExpanded}
      >
        {group.label}
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="pb-2">
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-6 py-2 text-sm transition-colors ${
                isActive(item.href)
                  ? "text-[#06D6A0] bg-[#06D6A0]/10"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

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
              {/* Dropdown Groups */}
              {navGroups.map((group) => (
                <NavDropdown key={group.label} group={group} isActive={isActive} />
              ))}

              {/* Standalone Links */}
              {standaloneLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(link.href)
                      ? "bg-[#06D6A0]/10 text-[#06D6A0]"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Sign In Button */}
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
            className="md:hidden fixed top-16 right-0 bottom-0 w-80 bg-[#0a0a0a]/95 backdrop-blur-md border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col h-full">
              {/* Standalone Links First */}
              <div className="border-b border-white/10 p-4">
                {standaloneLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 text-sm font-medium rounded-lg mb-2 transition-colors ${
                      isActive(link.href)
                        ? "bg-[#06D6A0]/10 text-[#06D6A0]"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Collapsible Sections */}
              <div className="flex-1">
                {navGroups.map((group) => (
                  <MobileNavSection key={group.label} group={group} isActive={isActive} />
                ))}
              </div>

              {/* Sign In Button */}
              <div className="p-4 border-t border-white/10">
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full px-4 py-3 text-sm font-semibold text-center bg-[#06D6A0] text-[#0a0a0a] rounded-lg hover:brightness-110 transition-all"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
