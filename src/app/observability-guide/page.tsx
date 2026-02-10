/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import { Eye, BellRing } from "lucide-react";
import {
  readObservabilityGuides,
  type ObservabilityGuideCategory,
  type ObservabilityGuideDifficulty,
} from "@/lib/observability-guides";

const categoryLabels: Record<ObservabilityGuideCategory, string> = {
  logging: "Logging",
  metrics: "Metrics",
  tracing: "Tracing",
  alerting: "Alerting",
};

const difficultyStyles: Record<ObservabilityGuideDifficulty, string> = {
  beginner: "bg-emerald-100 text-emerald-800 border-emerald-300",
  intermediate: "bg-amber-100 text-amber-800 border-amber-300",
  advanced: "bg-rose-100 text-rose-800 border-rose-300",
};

export default async function ObservabilityGuidePage() {
  const guides = await readObservabilityGuides();

  const categoryCounts = guides.reduce<Record<ObservabilityGuideCategory, number>>(
    (acc, guide) => {
      acc[guide.category] = (acc[guide.category] ?? 0) + 1;
      return acc;
    },
    {
      logging: 0,
      metrics: 0,
      tracing: 0,
      alerting: 0,
    }
  );

  const difficultyCounts = guides.reduce<Record<ObservabilityGuideDifficulty, number>>(
    (acc, guide) => {
      acc[guide.difficulty] = (acc[guide.difficulty] ?? 0) + 1;
      return acc;
    },
    {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
    }
  );

  const latestGuides = [...guides]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);

  const alertingGuides = guides.filter((guide) => guide.category === "alerting");

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <Eye className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold">Agent Observability Guide</h1>
        </div>
        <p className="text-lg text-gray-600">
          Persistent guidance for logging, metrics, tracing, and alerting so teams can monitor agent systems with
          confidence.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Coverage by Category</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {(Object.keys(categoryLabels) as ObservabilityGuideCategory[]).map((category) => (
            <div key={category} className="border border-gray-300 rounded-lg p-4 bg-white">
              <p className="font-semibold text-gray-900">{categoryLabels[category]}</p>
              <p className="text-3xl font-bold mt-2">{categoryCounts[category]}</p>
              <p className="text-sm text-gray-600">guides</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Difficulty Distribution</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {(["beginner", "intermediate", "advanced"] as ObservabilityGuideDifficulty[]).map((difficulty) => (
            <div key={difficulty} className={`border rounded-lg p-4 ${difficultyStyles[difficulty]}`}>
              <p className="text-xs uppercase font-semibold">{difficulty}</p>
              <p className="text-3xl font-bold">{difficultyCounts[difficulty]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Recently Updated Guides</h2>
        <div className="space-y-3">
          {latestGuides.map((guide) => (
            <article key={guide.id} className="border border-gray-300 rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="font-semibold">{guide.title}</h3>
                <span className={`text-xs uppercase px-2 py-1 rounded border ${difficultyStyles[guide.difficulty]}`}>
                  {guide.difficulty}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{guide.content}</p>
              <p className="text-xs text-gray-500">
                Category: {categoryLabels[guide.category]} • Updated: {new Date(guide.updatedAt).toLocaleDateString()}
              </p>
            </article>
          ))}
          {latestGuides.length === 0 && (
            <div className="border border-yellow-300 bg-yellow-50 rounded-lg p-4 text-sm text-yellow-800">
              No observability guides found in persistent storage.
            </div>
          )}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Category Deep Dives</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/observability-guide/logging" className="border border-gray-300 rounded-lg p-5 hover:border-blue-500">
            <h3 className="font-bold mb-2">📝 Logging</h3>
            <p className="text-sm text-gray-600">Structured logs, correlation IDs, and auditing patterns.</p>
          </Link>
          <Link href="/observability-guide/metrics" className="border border-gray-300 rounded-lg p-5 hover:border-blue-500">
            <h3 className="font-bold mb-2">📊 Metrics</h3>
            <p className="text-sm text-gray-600">Latency, cost, success-rate, and queue telemetry.</p>
          </Link>
          <Link href="/observability-guide/tracing" className="border border-gray-300 rounded-lg p-5 hover:border-blue-500">
            <h3 className="font-bold mb-2">🔍 Tracing</h3>
            <p className="text-sm text-gray-600">Span modeling and context propagation across agents.</p>
          </Link>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <BellRing className="w-5 h-5 text-purple-700" />
          <h2 className="text-2xl font-bold">Alerting Highlights</h2>
        </div>
        <div className="space-y-3">
          {alertingGuides.map((guide) => (
            <article key={guide.id} className="border border-purple-200 bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold mb-1">{guide.title}</h3>
              <p className="text-sm text-gray-700 mb-2">{guide.content}</p>
              <p className="text-xs text-gray-500">Tags: {guide.tags.join(", ")}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-8 border border-blue-200 bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
        Data source: <code>data/observability-guides.json</code>. API endpoint: <code>/api/observability-guide</code>.
      </div>
    </div>
  );
}
