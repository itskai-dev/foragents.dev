/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import { Shield, AlertTriangle } from "lucide-react";
import { readSecurityGuides, type SecurityGuideSeverity } from "@/lib/security-guides";

const categoryLabels: Record<string, string> = {
  injection: "Prompt Injection",
  network: "Network Security",
  secrets: "Secrets Management",
  general: "General Security",
};

const severityStyles: Record<SecurityGuideSeverity, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  low: "bg-blue-100 text-blue-800 border-blue-300",
};

export default async function SecurityGuidePage() {
  const guides = await readSecurityGuides();

  const categoryCounts = guides.reduce<Record<string, number>>((acc, guide) => {
    acc[guide.category] = (acc[guide.category] ?? 0) + 1;
    return acc;
  }, {});

  const severityCounts = guides.reduce<Record<string, number>>((acc, guide) => {
    acc[guide.severity] = (acc[guide.severity] ?? 0) + 1;
    return acc;
  }, {});

  const topGuides = [...guides]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold">Agent Security Hardening</h1>
        </div>
        <p className="text-lg text-gray-600">
          Persistent, queryable security guidance for agent builders across injection defense, network protection,
          and secrets management.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Security Guide Overview</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {Object.entries(categoryLabels).map(([category, label]) => (
            <div key={category} className="border border-gray-300 rounded-lg p-4 bg-white">
              <h3 className="font-semibold text-gray-900">{label}</h3>
              <p className="text-3xl font-bold mt-2">{categoryCounts[category] ?? 0}</p>
              <p className="text-sm text-gray-600">guides</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Severity Distribution</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {(["critical", "high", "medium", "low"] as SecurityGuideSeverity[]).map((severity) => (
            <div key={severity} className={`border rounded-lg p-4 ${severityStyles[severity]}`}>
              <p className="text-xs uppercase font-semibold">{severity}</p>
              <p className="text-3xl font-bold">{severityCounts[severity] ?? 0}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Most Recently Updated Guides</h2>
        <div className="space-y-3">
          {topGuides.map((guide) => (
            <div key={guide.id} className="border border-gray-300 rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="font-semibold">{guide.title}</h3>
                <span className={`text-xs uppercase px-2 py-1 rounded border ${severityStyles[guide.severity]}`}>
                  {guide.severity}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{guide.content}</p>
              <p className="text-xs text-gray-500">
                Category: {categoryLabels[guide.category]} • Updated: {new Date(guide.updatedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
          {topGuides.length === 0 && (
            <div className="border border-yellow-300 bg-yellow-50 rounded-lg p-4 text-sm text-yellow-800">
              No security guides found in persistent storage.
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Category Deep Dives</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/security-guide/injection" className="border border-gray-300 rounded-lg p-5 hover:border-blue-500">
            <h3 className="font-bold mb-2">🛡️ Prompt Injection Defense</h3>
            <p className="text-sm text-gray-600">Filter to injection guides and hardening patterns.</p>
          </Link>
          <Link href="/security-guide/network" className="border border-gray-300 rounded-lg p-5 hover:border-blue-500">
            <h3 className="font-bold mb-2">🌐 Network Security</h3>
            <p className="text-sm text-gray-600">Filter to network-specific threats and controls.</p>
          </Link>
          <Link href="/security-guide/secrets" className="border border-gray-300 rounded-lg p-5 hover:border-blue-500">
            <h3 className="font-bold mb-2">🔐 Secrets Management</h3>
            <p className="text-sm text-gray-600">Filter to secret handling, rotation, and audit guidance.</p>
          </Link>
        </div>
      </section>

      <div className="mt-8 border border-blue-200 bg-blue-50 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 mt-0.5 text-blue-700" />
        <p className="text-sm text-blue-800">
          Data source: <code>data/security-guides.json</code>. API endpoint supports filtering and creation at
          <code> /api/security-guide</code>.
        </p>
      </div>
    </div>
  );
}
