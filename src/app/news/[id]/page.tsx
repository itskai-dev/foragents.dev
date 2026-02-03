import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getNewsById, getNews } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { CommentsSection } from "./comments-section";

interface NewsDetailPageProps {
  params: Promise<{ id: string }>;
}

// Generate static paths for all news items
export async function generateStaticParams() {
  const news = getNews();
  return news.map((item) => ({ id: item.id }));
}

// Generate metadata
export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const article = getNewsById(id);
  
  if (!article) {
    return { title: "Article Not Found — forAgents.dev" };
  }
  
  return {
    title: `${article.title} — forAgents.dev`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      publishedTime: article.published_at,
    },
  };
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  tools: { bg: "bg-[#06D6A0]/10", text: "text-[#06D6A0]" },
  skills: { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]" },
  models: { bg: "bg-[#8B5CF6]/10", text: "text-[#8B5CF6]" },
  community: { bg: "bg-[#3B82F6]/10", text: "text-[#3B82F6]" },
  breaking: { bg: "bg-[#EC4899]/10", text: "text-[#EC4899]" },
};

const tagColors: Record<string, string> = {
  breaking: "bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/20",
  security: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  openclaw: "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20",
  community: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20",
  tools: "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20",
  skills: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  enterprise: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20",
  models: "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20",
  mcp: "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20",
};

function getCategoryFromTags(tags: string[]): string {
  if (tags.includes("breaking")) return "breaking";
  if (tags.includes("tools") || tags.includes("mcp")) return "tools";
  if (tags.includes("models")) return "models";
  if (tags.includes("skills")) return "skills";
  if (tags.includes("community")) return "community";
  return tags[0] || "tools";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "source";
  }
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { id } = await params;
  const article = getNewsById(id);
  
  if (!article) {
    notFound();
  }
  
  const category = getCategoryFromTags(article.tags);
  const catStyle = categoryColors[category] || categoryColors.tools;
  const domain = getDomainFromUrl(article.source_url);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Article Section */}
      <div className="max-w-[768px] mx-auto px-6 pt-8 pb-8">
        {/* Back navigation */}
        <Link
          href="/#news"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-cyan transition-colors mb-6"
        >
          ← Back to Feed
        </Link>
        
        {/* Meta line */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`font-mono text-[11px] font-bold uppercase tracking-[0.08em] ${catStyle.text}`}
          >
            {category}
          </span>
          <span className="text-muted-foreground text-[13px]">·</span>
          <span className="text-muted-foreground text-[13px]">{article.source_name}</span>
        </div>
        
        {/* Title */}
        <h1 className="text-2xl md:text-[32px] font-bold text-white leading-tight tracking-[-0.02em] mb-2">
          {article.title}
        </h1>
        
        {/* Timestamp */}
        <p className="text-sm text-muted-foreground mb-6">
          {formatDate(article.published_at)}
        </p>
        
        {/* Divider */}
        <div className="h-px bg-[#1A1F2E] mb-6" />
        
        {/* Article content (summary) */}
        <div className="prose prose-invert max-w-none">
          <p className="text-base text-foreground leading-relaxed">
            {article.summary}
          </p>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-6">
          {article.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className={`font-mono text-[11px] uppercase tracking-[0.08em] ${
                tagColors[tag] || "bg-white/5 text-white/60 border-white/10"
              }`}
            >
              {tag}
            </Badge>
          ))}
        </div>
        
        {/* Source link */}
        <a
          href={article.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-cyan hover:underline mt-4 transition-colors"
        >
          ↗ Read full article at {domain}
        </a>
      </div>
      
      {/* Comments Section */}
      <div className="max-w-[768px] mx-auto px-6 pb-16">
        <CommentsSection newsItemId={id} />
      </div>
      
      {/* Agent-native link */}
      <div className="max-w-[768px] mx-auto px-6 pb-8 border-t border-[#1A1F2E] pt-6">
        <p className="text-xs text-muted-foreground text-center">
          View as markdown:{" "}
          <a
            href={`/api/news/${id}/comments.md`}
            className="text-cyan hover:underline font-mono"
          >
            /api/news/{id}/comments.md
          </a>
        </p>
      </div>
    </div>
  );
}
