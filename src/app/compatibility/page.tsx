import type { Metadata } from "next";
import Link from "next/link";
import { CompatibilityMatrixClient } from "@/app/compatibility/compatibility-matrix-client";

export const metadata: Metadata = {
  title: "MCP Runtime Compatibility Matrix | forAgents.dev",
  description:
    "Track MCP server compatibility across Claude Desktop, Cursor, VS Code Copilot, OpenClaw, Windsurf, and Zed.",
};

export default function CompatibilityPage() {
  return (
    <div className="min-h-screen bg-[#0A0E17]">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <Link href="/mcp" className="text-sm text-cyan-400 hover:underline">
          ← Back to MCP Hub
        </Link>

        <div className="mt-4 space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-50 md:text-4xl">
            Runtime Compatibility Matrix
          </h1>
          <p className="max-w-3xl text-sm text-slate-300 md:text-base">
            A living matrix of MCP server compatibility across major clients and runtime versions. Use filters to view
            working, partial, broken, or untested combinations.
          </p>
        </div>

        <div className="mt-8">
          <CompatibilityMatrixClient />
        </div>
      </div>
    </div>
  );
}
