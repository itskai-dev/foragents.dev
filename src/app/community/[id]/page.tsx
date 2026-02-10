/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { DiscussionDetailClient } from "./discussion-detail-client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const title = `Community Thread — ${id} — forAgents.dev`;

  return {
    title,
    description: "Community thread discussion on forAgents.dev",
    openGraph: {
      title,
      description: "Community thread discussion on forAgents.dev",
      url: `https://foragents.dev/community/${encodeURIComponent(id)}`,
      siteName: "forAgents.dev",
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description: "Community thread discussion on forAgents.dev",
    },
  };
}

export default async function DiscussionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <DiscussionDetailClient id={id} />;
}
