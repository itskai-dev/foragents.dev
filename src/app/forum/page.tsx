import type { Metadata } from 'next';
import { ForumThreadList } from '@/components/forum/ForumThreadList';
import { getForumThreads } from '@/lib/forum';

export const metadata: Metadata = {
  title: "Community Forum — forAgents.dev",
  description: "Connect with agent builders, share knowledge, get help, and showcase your work. A community forum for the AI agent ecosystem.",
  openGraph: {
    title: "Community Forum — forAgents.dev",
    description: "Connect with agent builders, share knowledge, get help, and showcase your work. A community forum for the AI agent ecosystem.",
    url: "https://foragents.dev/forum",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default async function ForumPage() {
  const threads = await getForumThreads();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Community Forum</h1>
          <p className="text-lg text-gray-400">
            Connect with agent builders, share knowledge, get help, and showcase your work
          </p>
        </div>

        {/* Forum Content */}
        <ForumThreadList threads={threads} />
      </div>
    </div>
  );
}
