/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import { Network } from "lucide-react";
import { readObservabilityGuides, type ObservabilityGuideDifficulty } from "@/lib/observability-guides";

const difficultyStyles: Record<ObservabilityGuideDifficulty, string> = {
  beginner: "bg-emerald-100 text-emerald-800 border-emerald-300",
  intermediate: "bg-amber-100 text-amber-800 border-amber-300",
  advanced: "bg-rose-100 text-rose-800 border-rose-300",
};

export default async function TracingGuidePage() {
  const guides = (await readObservabilityGuides()).filter((guide) => guide.category === "tracing");

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Link href="/observability-guide" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Observability Guide
      </Link>

      <div className="flex items-center gap-3 mb-4">
        <Network className="w-10 h-10 text-purple-600" />
        <h1 className="text-4xl font-bold">Tracing Across Agent Workflows</h1>
      </div>
      <p className="text-lg text-gray-600 mb-8">
        Persistent, category-filtered guidance for root spans, context propagation, and multi-agent trace continuity.
      </p>

      <div className="space-y-4">
        {guides.map((guide) => (
          <article key={guide.id} className="border border-gray-300 rounded-lg p-5 bg-white">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h2 className="text-xl font-semibold">{guide.title}</h2>
              <span className={`text-xs uppercase px-2 py-1 rounded border ${difficultyStyles[guide.difficulty]}`}>
                {guide.difficulty}
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
          No tracing guides found.
        </div>
      )}
    </div>
  );
}
