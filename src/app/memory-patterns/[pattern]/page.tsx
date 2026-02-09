/* eslint-disable react/no-unescaped-entities */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import memoryData from "@/data/memory-patterns.json";

interface PatternDetail {
  slug: string;
  name: string;
  description: string;
  complexity: "simple" | "moderate" | "advanced";
  bestFor: string;
  storageType: string;
  architectureFlow: string[];
  implementationGuide: {
    summary: string;
    steps: string[];
    codeExample: {
      language: string;
      code: string;
    };
  };
  pros: string[];
  cons: string[];
  whenToUse: string[];
  whenNotToUse: string[];
  realWorldExamples: string[];
}

const patterns = (memoryData as { patterns: PatternDetail[] }).patterns;

export function generateStaticParams() {
  return patterns.map((pattern) => ({ pattern: pattern.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pattern: string }>;
}): Promise<Metadata> {
  const { pattern } = await params;
  const entry = patterns.find((item) => item.slug === pattern);

  if (!entry) {
    return {
      title: "Memory Pattern Not Found — forAgents.dev",
    };
  }

  return {
    title: `${entry.name} Memory Pattern — forAgents.dev`,
    description: entry.description,
    openGraph: {
      title: `${entry.name} Memory Pattern — forAgents.dev`,
      description: entry.description,
      url: `https://foragents.dev/memory-patterns/${entry.slug}`,
      siteName: "forAgents.dev",
      type: "website",
    },
  };
}

const complexityClasses = {
  simple: "bg-green-500/15 text-green-300 border border-green-500/30",
  moderate: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  advanced: "bg-red-500/15 text-red-300 border border-red-500/30",
};

export default async function MemoryPatternDetailPage({
  params,
}: {
  params: Promise<{ pattern: string }>;
}) {
  const { pattern } = await params;
  const entry = patterns.find((item) => item.slug === pattern);

  if (!entry) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-4 text-sm text-white/60">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/memory-patterns" className="hover:text-white">Memory Patterns</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{entry.name}</span>
        </div>
      </div>

      <section className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight">{entry.name}</h1>
            <span className={`rounded px-2 py-1 text-xs font-medium capitalize ${complexityClasses[entry.complexity]}`}>
              {entry.complexity}
            </span>
          </div>
          <p className="mt-4 max-w-4xl text-white/70">{entry.description}</p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <p>
              <span className="text-white/50">Best for:</span> {entry.bestFor}
            </p>
            <p>
              <span className="text-white/50">Storage:</span> {entry.storageType}
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="text-2xl font-bold">Architecture Diagram (text flow)</h2>
          <p className="mt-2 text-sm text-white/60">
            Use this sequence as a blueprint when implementing data flow and handoff points.
          </p>
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
            <ol className="space-y-3">
              {entry.architectureFlow.map((step, index) => (
                <li key={step} className="flex items-start gap-3 text-sm text-white/85">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan/20 text-cyan">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="text-2xl font-bold">Implementation Guide</h2>
          <p className="mt-2 text-white/70">{entry.implementationGuide.summary}</p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold">Build steps</h3>
              <ol className="mt-4 space-y-2 text-sm text-white/80">
                {entry.implementationGuide.steps.map((step, index) => (
                  <li key={step}>
                    {index + 1}. {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#090d16] p-6">
              <h3 className="text-lg font-semibold">Code example ({entry.implementationGuide.codeExample.language})</h3>
              <pre className="mt-4 overflow-x-auto rounded bg-black/50 p-4 text-xs text-white/85">
                <code>{entry.implementationGuide.codeExample.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6">
            <h2 className="text-xl font-bold text-green-300">Pros</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              {entry.pros.map((pro) => (
                <li key={pro}>• {pro}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
            <h2 className="text-xl font-bold text-red-300">Cons</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              {entry.cons.map((con) => (
                <li key={con}>• {con}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-cyan/30 bg-cyan/5 p-6">
            <h2 className="text-xl font-bold">When to use</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              {entry.whenToUse.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
            <h2 className="text-xl font-bold">When NOT to use</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              {entry.whenNotToUse.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="text-2xl font-bold">Real-world framework examples</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {entry.realWorldExamples.map((example) => (
              <div key={example} className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/85">
                {example}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/memory-patterns" className="text-cyan hover:underline">
              ← Back to Memory Patterns Hub
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
