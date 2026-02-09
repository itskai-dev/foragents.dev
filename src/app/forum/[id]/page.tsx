import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getForumThreadById } from '@/lib/forum';
import { formatRelativeTime } from '@/lib/forumUtils';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const thread = await getForumThreadById(params.id);
  
  if (!thread) {
    return { title: 'Thread Not Found' };
  }

  const title = `${thread.title} — Forum — forAgents.dev`;
  const description = thread.body.slice(0, 160) + (thread.body.length > 160 ? '...' : '');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://foragents.dev/forum/${thread.id}`,
      siteName: 'forAgents.dev',
      type: 'article',
    },
  };
}

export default async function ForumThreadPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const thread = await getForumThreadById(id);

  if (!thread) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            href="/forum" 
            className="text-sm text-gray-400 hover:text-[#06D6A0] transition-colors"
          >
            ← Back to forum
          </Link>
        </div>

        {/* Thread Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#06D6A0]/10 text-[#06D6A0] capitalize">
              {thread.category.replace('-', ' ')}
            </span>
            {thread.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-1 text-xs font-medium rounded bg-zinc-800 text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{thread.title}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="font-medium text-white">{thread.author}</span>
            <span>•</span>
            <span>{formatRelativeTime(thread.created_at)}</span>
            <span>•</span>
            <span>{thread.view_count} views</span>
            <span>•</span>
            <span>{thread.reply_count} replies</span>
          </div>
        </div>

        {/* Original Post */}
        <div className="bg-zinc-900 rounded-lg p-6 mb-8 border border-zinc-800">
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 whitespace-pre-wrap">{thread.body}</p>
          </div>
        </div>

        {/* Replies Section */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-6">
            Replies ({thread.reply_count})
          </h2>
          
          <div className="space-y-4">
            {thread.replies.map((reply) => (
              <div
                key={reply.id}
                className="bg-zinc-900 rounded-lg p-6 border border-zinc-800"
              >
                <div className="flex items-center gap-3 mb-3 text-sm">
                  <span className="font-medium text-white">{reply.author}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">{formatRelativeTime(reply.created_at)}</span>
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 whitespace-pre-wrap">{reply.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reply CTA */}
        <div className="mt-8 p-6 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
          <p className="text-gray-400 mb-4">
            Want to join the discussion? Sign in to reply.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block px-6 py-3 bg-[#06D6A0] text-[#0a0a0a] font-semibold rounded-lg hover:brightness-110 transition-all"
          >
            Sign In to Reply
          </Link>
        </div>
      </div>
    </div>
  );
}
