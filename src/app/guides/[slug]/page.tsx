import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { readGuides } from "@/lib/guides";

import { GuideDetailClient } from "./guide-detail-client";

export async function generateStaticParams() {
  const guides = await readGuides();
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guides = await readGuides();
  const guide = guides.find((item) => item.slug === slug);

  if (!guide) {
    return { title: "Guide Not Found" };
  }

  const title = `${guide.title} — forAgents.dev`;
  const description = guide.description;
  const url = `https://foragents.dev/guides/${guide.slug}`;

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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guides = await readGuides();
  const exists = guides.some((item) => item.slug === slug);

  if (!exists) {
    notFound();
  }

  return <GuideDetailClient slug={slug} />;
}
