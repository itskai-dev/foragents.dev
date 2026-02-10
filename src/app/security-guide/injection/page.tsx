/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import { Shield } from "lucide-react";
import { readSecurityGuides, type SecurityGuideSeverity } from "@/lib/security-guides";

const severityStyles: Record<SecurityGuideSeverity, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  low: "bg-blue-100 text-blue-800 border-blue-300",
};

export default async function PromptInjectionPage() {
  const guides = (await readSecurityGuides()).filter((guide) => guide.category === "injection");

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Link href="/security-guide" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Security Guide
      </Link>

      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-10 h-10 text-red-600" />
        <h1 className="text-4xl font-bold">Prompt Injection Defense</h1>
      </div>
      <p className="text-lg text-gray-600 mb-8">
        Category-filtered view of persistent guidance entries for prompt injection, goal hijacking, and output
        exfiltration risks.
      </p>

      <div className="space-y-4">
        {guides.map((guide) => (
          <article key={guide.id} className="border border-gray-300 rounded-lg p-5 bg-white">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h2 className="text-xl font-semibold">{guide.title}</h2>
              <span className={`text-xs uppercase px-2 py-1 rounded border ${severityStyles[guide.severity]}`}>
                {guide.severity}
              </span>
            </div>
            <p className="text-gray-700 mb-3">{guide.content}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {guide.tags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 border border-gray-300 rounded px-2 py-1 text-gray-700">
                  #{tag}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500">Updated: {new Date(guide.updatedAt).toLocaleString()}</p>
          </article>
        ))}
      </div>

      {guides.length === 0 && (
        <div className="mt-6 border border-yellow-300 bg-yellow-50 rounded-lg p-4 text-yellow-800 text-sm">
          No injection guides found.
        </div>
      )}
    </div>
  );
}
