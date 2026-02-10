/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { getBountyById } from "@/lib/bounties";
import { BountyDetailClient } from "./bounty-detail-client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const bounty = await getBountyById(id);

  if (!bounty) {
    const title = "Bounty not found — forAgents.dev";
    return {
      title,
      description: "This bounty does not exist.",
      openGraph: {
        title,
        description: "This bounty does not exist.",
        url: `https://foragents.dev/bounties/${encodeURIComponent(id)}`,
        siteName: "forAgents.dev",
        type: "website",
      },
    };
  }

  const title = `${bounty.title} — Bounty — forAgents.dev`;
  const description = bounty.description;
  const ogUrl = `/api/og/bounties/${encodeURIComponent(bounty.id)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://foragents.dev/bounties/${encodeURIComponent(bounty.id)}`,
      siteName: "forAgents.dev",
      type: "website",
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export const dynamic = "force-dynamic";

export default async function BountyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BountyDetailClient bountyId={id} />;
}
