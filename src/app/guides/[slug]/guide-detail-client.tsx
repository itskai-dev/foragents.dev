/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { GuideContent } from "./guide-content";

type Guide = {
  title: string;
  slug: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: "getting-started" | "best-practices" | "deployment" | "security" | "performance";
  content: string;
  readCount: number;
  estimatedMinutes: number;
  author: string;
};

const DIFFICULTY_COLORS = {
  beginner: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  advanced: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

function toTitleCase(value: string) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function GuideDetailClient({ slug }: { slug: string }) {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingRead, setMarkingRead] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadGuide() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/guides/${slug}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load guide");
        }

        const payload = (await response.json()) as { guide: Guide };
        setGuide(payload.guide);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Couldn't load this guide right now.");
        }
      } finally {
        setLoading(false);
      }
    }

    void loadGuide();

    return () => controller.abort();
  }, [slug]);

  async function markAsRead() {
    if (!guide) return;

    setMarkingRead(true);
    try {
      const response = await fetch(`/api/guides/${slug}`, {
        method: "POST",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to track read");
      }

      const payload = (await response.json()) as { guide: Guide };
      setGuide(payload.guide);
    } catch {
      setError("Couldn't record read progress. Please try again.");
    } finally {
      setMarkingRead(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] py-20 text-center text-gray-400">Loading guide…</div>;
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] py-20 text-center">
        <p className="text-rose-400 mb-4">{error ?? "Guide not found."}</p>
        <Link
          href="/guides"
          className="inline-flex px-4 py-2 bg-[#06D6A0] text-black rounded-lg font-semibold"
        >
          Back to Guides
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#06D6A0] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/guides" className="hover:text-[#06D6A0] transition-colors">
              Guides
            </Link>
            <span>/</span>
            <span className="text-gray-400">{guide.title}</span>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className={`px-2.5 py-1 text-xs font-semibold rounded border ${
                DIFFICULTY_COLORS[guide.difficulty]
              }`}
            >
              {toTitleCase(guide.difficulty)}
            </span>
            <span className="text-xs text-gray-500">⏱ {guide.estimatedMinutes} min read</span>
            <span className="text-xs text-gray-500">👀 {guide.readCount} reads</span>
            <span className="text-xs text-gray-500">By {guide.author}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{guide.title}</h1>
          <p className="text-lg text-gray-400 mb-2">{guide.description}</p>
          <p className="text-sm text-gray-500">Category: {toTitleCase(guide.category)}</p>
          <p className="text-sm text-gray-500 mt-1">Here's the full guide content.</p>
        </div>

        <GuideContent markdown={guide.content} />

        <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between gap-4">
          <Link href="/guides" className="text-sm text-[#06D6A0] hover:underline">
            ← Back to all guides
          </Link>
          <button
            type="button"
            disabled={markingRead}
            onClick={markAsRead}
            className="px-4 py-2 bg-[#06D6A0] text-black font-semibold rounded-lg disabled:opacity-60"
          >
            {markingRead ? "Saving…" : "Mark as Read"}
          </button>
        </div>
      </article>
    </div>
  );
}
