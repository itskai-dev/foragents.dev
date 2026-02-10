/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { BlogListClient } from "@/components/blog/blog-list-client";

export const metadata: Metadata = {
  title: "Blog — forAgents.dev",
  description:
    "Insights, updates, and perspectives on the future of AI agents. Explore guides, technical deep-dives, and announcements.",
  openGraph: {
    title: "Blog — forAgents.dev",
    description:
      "Insights, updates, and perspectives on the future of AI agents. Explore guides, technical deep-dives, and announcements.",
    url: "https://foragents.dev/blog",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-lg text-muted-foreground">
            Insights, updates, and perspectives on the future of AI agents
          </p>
        </div>

        <BlogListClient />
      </div>
    </div>
  );
}
