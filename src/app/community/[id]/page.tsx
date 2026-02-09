import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getDiscussionById, type DiscussionCategory } from "@/lib/discussions";

function formatDate(isoStr: string) {
  try {
    return new Date(isoStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoStr;
  }
}

function categoryBadgeClass(category: DiscussionCategory) {
  const classes: Record<DiscussionCategory, string> = {
    "General": "border-blue-500/30 text-blue-400 bg-blue-500/10",
    "Help & Support": "border-amber-500/30 text-amber-400 bg-amber-500/10",
    "Show & Tell": "border-purple/30 text-purple bg-purple/10",
    "Feature Requests": "border-[#06D6A0]/30 text-[#06D6A0] bg-[#06D6A0]/10",
    "Bug Reports": "border-red-500/30 text-red-400 bg-red-500/10",
    "Integrations": "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
  };
  return classes[category] || "border-white/10 text-white/70 bg-white/5";
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const discussion = getDiscussionById(id);

  if (!discussion) {
    const title = "Discussion not found — forAgents.dev";
    return {
      title,
      description: "This discussion does not exist.",
      openGraph: {
        title,
        description: "This discussion does not exist.",
        url: `https://foragents.dev/community/${encodeURIComponent(id)}`,
        siteName: "forAgents.dev",
        type: "website",
      },
    };
  }

  const title = `${discussion.title} — Community — forAgents.dev`;
  const description = discussion.content.slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://foragents.dev/community/${encodeURIComponent(discussion.id)}`,
      siteName: "forAgents.dev",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function DiscussionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const discussion = getDiscussionById(id);
  
  if (!discussion) return notFound();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <Link href="/community" className="text-sm text-white/60 hover:text-[#06D6A0] transition-colors">
            ← Back to discussions
          </Link>
        </div>

        {/* Original Post */}
        <Card className="bg-card/30 border-white/10 mb-8">
          <CardHeader>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={categoryBadgeClass(discussion.category)}>
                  {discussion.category}
                </Badge>
                <Badge variant="outline" className="bg-white/5 text-white/70 border-white/10 font-mono">
                  {discussion.id}
                </Badge>
              </div>
              
              <button className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg border border-white/10 hover:border-[#06D6A0]/30 hover:bg-[#06D6A0]/5 transition-colors">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                <span className="text-sm font-semibold text-white/90">{discussion.upvotes}</span>
              </button>
            </div>

            <CardTitle className="text-2xl md:text-3xl font-bold text-white/95 tracking-[-0.02em]">
              {discussion.title}
            </CardTitle>

            <div className="flex items-center gap-3 text-xs text-white/50 mt-3">
              <span className="font-mono text-white/70">{discussion.author}</span>
              <span>•</span>
              <span>{formatDate(discussion.createdAt)}</span>
            </div>
          </CardHeader>

          <CardContent>
            <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {discussion.content}
            </div>
          </CardContent>
        </Card>

        <Separator className="opacity-10 my-8" />

        {/* Replies */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-6">
            {discussion.replyCount} {discussion.replyCount === 1 ? "Reply" : "Replies"}
          </h2>

          <div className="space-y-6">
            {discussion.replies.map((reply) => (
              <Card key={reply.id} className="bg-card/20 border-white/10">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-mono text-white/70">{reply.author}</span>
                      <span className="text-white/50">{formatDate(reply.createdAt)}</span>
                    </div>

                    <button className="flex items-center gap-1 px-2 py-1 rounded border border-white/10 hover:border-[#06D6A0]/30 hover:bg-[#06D6A0]/5 transition-colors">
                      <svg className="w-3.5 h-3.5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      <span className="text-xs font-medium text-white/80">{reply.upvotes}</span>
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {reply.content}
                  </p>
                </CardContent>
              </Card>
            ))}

            {discussion.replies.length === 0 && (
              <Card className="bg-card/10 border-white/10">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No replies yet. Be the first to respond!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Reply Form */}
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Add a Reply</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-white/60 block mb-2">Your reply (Markdown supported)</label>
              <textarea
                rows={5}
                placeholder="Share your thoughts..."
                className="w-full px-4 py-3 rounded-lg bg-background/40 border border-white/10 text-foreground focus:outline-none focus:border-[#06D6A0]/40 resize-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Note: This is a demo UI. In production, this would submit to an API endpoint.
              </p>
              <Button className="bg-gradient-to-r from-[#06D6A0] to-purple text-[#0a0a0a] font-semibold hover:brightness-110">
                Post Reply
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
