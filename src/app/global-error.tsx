"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0A0E17] text-[#E2E8F0] antialiased">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="relative max-w-md w-full">
            {/* Glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-20">
              <div className="absolute inset-0 bg-[#06D6A0] rounded-full blur-[80px]" />
            </div>
            
            <div className="relative bg-[#0F1420]/50 border border-white/10 rounded-2xl p-8 text-center">
              {/* Icon */}
              <div className="text-6xl mb-4">⚠️</div>
              
              {/* Title */}
              <h1 className="text-2xl font-bold text-[#E2E8F0] mb-2">
                Something went wrong
              </h1>
              
              {/* Message */}
              <p className="text-[#6B7280] mb-6">
                We encountered a critical error. This has been logged and we&apos;ll look into it.
              </p>
              
              {/* Error details for development */}
              {process.env.NODE_ENV === "development" && error.message && (
                <div className="mb-6 p-4 bg-black/30 rounded-lg border border-white/5">
                  <p className="text-xs font-mono text-[#6B7280] text-left break-words">
                    {error.message}
                  </p>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={reset}
                  className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-[#06D6A0] text-[#0A0E17] font-semibold text-sm hover:brightness-110 transition-all"
                >
                  Try again
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-lg border border-[#06D6A0] text-[#06D6A0] font-semibold text-sm hover:bg-[#06D6A0]/10 transition-colors"
                >
                  Go home
                </Link>
              </div>
              
              {/* Additional help */}
              <p className="text-xs text-[#6B7280] mt-6">
                If this keeps happening,{" "}
                <a
                  href="https://github.com/reflectt/foragents.dev/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#06D6A0] hover:underline"
                >
                  let us know on GitHub
                </a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
