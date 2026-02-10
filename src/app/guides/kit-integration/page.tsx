/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { notFound } from "next/navigation";

import { readGuides } from "@/lib/guides";

import { GuideContent } from "../[slug]/guide-content";

export const metadata = {
  title: "Kit Integration Guide — forAgents.dev",
  description:
    "How the Reflectt agent kits work together — Memory, Autonomy, Team — and how to set them up.",
};

function toTitleCase(value: string) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function KitIntegrationGuidePage() {
  const guides = await readGuides();
  const guide = guides.find((item) => item.slug === "kit-integration");

  if (!guide) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-4">
          <Link href="/guides" className="text-sm text-gray-400 hover:text-[#06D6A0] transition-colors">
            ← Back to Guides
          </Link>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{guide.title}</h1>
        <p className="text-lg text-gray-400 mb-2">{guide.description}</p>
        <div className="text-xs text-gray-500 flex flex-wrap gap-3 mb-8">
          <span>Difficulty: {toTitleCase(guide.difficulty)}</span>
          <span>Category: {toTitleCase(guide.category)}</span>
          <span>Updated: {new Date(guide.updatedAt).toLocaleDateString("en-CA")}</span>
        </div>

        <GuideContent markdown={guide.content} />
      </article>
    </div>
  );
}
