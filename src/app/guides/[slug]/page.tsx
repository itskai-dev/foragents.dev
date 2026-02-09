import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import guidesData from "@/data/guides.json";
import { GuideContent } from "./guide-content";

interface Guide {
  slug: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  estimatedMinutes: number;
  content: string[];
  tags: string[];
}

const guides: Guide[] = guidesData as Guide[];

// Generate static paths for all guides
export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find((guide) => guide.slug === slug);
}

function getRelatedGuides(currentGuide: Guide): Guide[] {
  // Find guides with matching category or tags
  const related = guides
    .filter((guide) => guide.slug !== currentGuide.slug)
    .map((guide) => {
      let score = 0;
      if (guide.category === currentGuide.category) score += 3;
      if (guide.difficulty === currentGuide.difficulty) score += 1;
      const commonTags = guide.tags.filter((tag) => currentGuide.tags.includes(tag));
      score += commonTags.length;
      return { guide, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.guide);

  return related;
}

function getNavigationGuides(currentGuide: Guide): { prev: Guide | null; next: Guide | null } {
  const currentIndex = guides.findIndex((g) => g.slug === currentGuide.slug);
  return {
    prev: currentIndex > 0 ? guides[currentIndex - 1] : null,
    next: currentIndex < guides.length - 1 ? guides[currentIndex + 1] : null,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return { title: "Guide Not Found" };
  }

  const baseUrl = "https://foragents.dev";
  const url = `${baseUrl}/guides/${guide.slug}`;

  const title = `${guide.title} — forAgents.dev`;
  const description = guide.description;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "forAgents.dev",
      type: "article",
      images: [
        {
          url: `${baseUrl}/api/og`,
          width: 1200,
          height: 630,
          alt: guide.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/api/og`],
    },
  };
}

const DIFFICULTY_COLORS = {
  Beginner: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Intermediate: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Advanced: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

const CATEGORY_ICONS: Record<string, string> = {
  "Getting Started": "🚀",
  "Memory & State": "🧠",
  Autonomy: "🤖",
  Security: "🔒",
  Deployment: "🚢",
  Integration: "🔌",
};

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const relatedGuides = getRelatedGuides(guide);
  const { prev, next } = getNavigationGuides(guide);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: guide.title,
    description: guide.description,
    author: {
      "@type": "Organization",
      name: "forAgents.dev",
    },
    datePublished: "2024-01-01",
    dateModified: "2024-01-01",
    url: `https://foragents.dev/guides/${guide.slug}`,
    keywords: guide.tags.join(", "),
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
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

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-12">
          {/* Main Content */}
          <article className="max-w-3xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl">{CATEGORY_ICONS[guide.category]}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded border ${
                      DIFFICULTY_COLORS[guide.difficulty]
                    }`}
                  >
                    {guide.difficulty}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {guide.estimatedMinutes} min read
                  </span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{guide.title}</h1>
              <p className="text-xl text-gray-400 mb-4">{guide.description}</p>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-medium text-[#06D6A0]">{guide.category}</span>
                <span>•</span>
                <span>{guide.content.length} sections</span>
              </div>
            </div>

            {/* Tags */}
            {guide.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {guide.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium bg-white/5 text-gray-400 rounded-full border border-white/10"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Render Guide Content */}
            <GuideContent content={guide.content} />

            {/* Prev/Next Navigation */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prev ? (
                  <Link
                    href={`/guides/${prev.slug}`}
                    className="group flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:border-[#06D6A0]/30 hover:bg-white/[0.07] transition-all"
                  >
                    <svg
                      className="w-5 h-5 text-gray-500 group-hover:text-[#06D6A0] transition-colors flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-1">Previous</div>
                      <div className="text-sm font-semibold text-white group-hover:text-[#06D6A0] transition-colors truncate">
                        {prev.title}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div />
                )}

                {next ? (
                  <Link
                    href={`/guides/${next.slug}`}
                    className="group flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:border-[#06D6A0]/30 hover:bg-white/[0.07] transition-all"
                  >
                    <div className="flex-1 min-w-0 text-right">
                      <div className="text-xs text-gray-500 mb-1">Next</div>
                      <div className="text-sm font-semibold text-white group-hover:text-[#06D6A0] transition-colors truncate">
                        {next.title}
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-500 group-hover:text-[#06D6A0] transition-colors flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit space-y-6">
            {/* Table of Contents */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                Table of Contents
              </h3>
              <div className="space-y-2 text-sm">
                {guide.content.map((_, index) => (
                  <a
                    key={index}
                    href={`#section-${index}`}
                    className="block text-gray-400 hover:text-[#06D6A0] transition-colors"
                  >
                    Section {index + 1}
                  </a>
                ))}
              </div>
            </div>

            {/* Related Guides */}
            {relatedGuides.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                  Related Guides
                </h3>
                <div className="space-y-3">
                  {relatedGuides.map((relatedGuide) => (
                    <Link
                      key={relatedGuide.slug}
                      href={`/guides/${relatedGuide.slug}`}
                      className="block group"
                    >
                      <div className="text-sm font-medium text-white group-hover:text-[#06D6A0] transition-colors mb-1">
                        {relatedGuide.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            DIFFICULTY_COLORS[relatedGuide.difficulty]
                          }`}
                        >
                          {relatedGuide.difficulty}
                        </span>
                        <span>{relatedGuide.estimatedMinutes} min</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Back to Guides */}
            <Link
              href="/guides"
              className="block w-full px-4 py-3 text-center bg-[#06D6A0]/10 text-[#06D6A0] font-semibold rounded-lg border border-[#06D6A0]/30 hover:bg-[#06D6A0]/20 transition-all"
            >
              ← All Guides
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
