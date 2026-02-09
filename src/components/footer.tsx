"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type HealthStatus = "ok" | "degraded" | "down" | "loading";

function StatusIndicator() {
  const [status, setStatus] = useState<HealthStatus>("loading");

  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await fetch("/api/health");
        const data = await response.json();
        setStatus(data.status);
      } catch {
        setStatus("down");
      }
    }

    checkHealth();
    // Refresh every 60 seconds
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    loading: { color: "bg-muted-foreground", text: "Checking..." },
    ok: { color: "bg-green", text: "All systems operational" },
    degraded: { color: "bg-yellow-500", text: "Some systems degraded" },
    down: { color: "bg-red-500", text: "Systems unavailable" },
  };

  const config = statusConfig[status];

  return (
    <a
      href="/api/health"
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      title="API Health Status"
    >
      <span className={`w-2 h-2 rounded-full ${config.color} ${status === "loading" ? "animate-pulse" : ""}`} />
      <span className="font-mono">{config.text}</span>
    </a>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/skills" className="text-muted-foreground hover:text-cyan transition-colors">
                  Skills
                </Link>
              </li>
              <li>
                <Link href="/trending" className="text-muted-foreground hover:text-cyan transition-colors">
                  Trending
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-muted-foreground hover:text-cyan transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-muted-foreground hover:text-cyan transition-colors">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-muted-foreground hover:text-cyan transition-colors">
                  Compare
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/guides" className="text-muted-foreground hover:text-cyan transition-colors">
                  Guides
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-cyan transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/newsletter" className="text-muted-foreground hover:text-cyan transition-colors">
                  Newsletter
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-muted-foreground hover:text-cyan transition-colors">
                  Changelog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-cyan transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/docs/api" className="text-muted-foreground hover:text-cyan transition-colors">
                  Docs/API
                </Link>
              </li>
              <li>
                <Link href="/status" className="text-muted-foreground hover:text-cyan transition-colors">
                  Status
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-muted-foreground hover:text-cyan transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="text-muted-foreground hover:text-cyan transition-colors">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-cyan transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-muted-foreground hover:text-cyan transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-cyan transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="text-muted-foreground hover:text-cyan transition-colors">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link href="/creators" className="text-muted-foreground hover:text-cyan transition-colors">
                  Creators
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="text-muted-foreground hover:text-cyan transition-colors">
                  Testimonials
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-cyan transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-cyan transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Brand & Status */}
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Built by</span>
                <a
                  href="https://reflectt.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aurora-text font-semibold hover:opacity-80 transition-opacity"
                >
                  Team Reflectt
                </a>
              </div>
              <StatusIndicator />
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/reflectt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-cyan transition-colors text-sm"
                title="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="https://x.com/itskai_dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-cyan transition-colors text-sm"
                title="Twitter/X"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="mailto:contact@foragents.dev"
                className="text-muted-foreground hover:text-cyan transition-colors text-sm"
                title="Email"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
