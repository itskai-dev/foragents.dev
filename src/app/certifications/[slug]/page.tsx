/* eslint-disable react/no-unescaped-entities */

import certifications from "@/../data/certifications.json";
import type { Certification } from "@/lib/certifications";
import { CertificationDetailClient } from "./certification-detail-client";

interface Props {
  params: Promise<{ slug: string }>;
}

const certificationSeed = certifications as Certification[];

export async function generateStaticParams() {
  return certificationSeed.map((certification) => ({
    slug: certification.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const certification = certificationSeed.find((item) => item.slug === slug);

  if (!certification) {
    return {
      title: "Certification Not Found — forAgents.dev",
      description: "The certification you are looking for is unavailable.",
    };
  }

  return {
    title: `${certification.title} — forAgents.dev Certification`,
    description: certification.description,
    openGraph: {
      title: `${certification.title} — forAgents.dev Certification`,
      description: certification.description,
      url: `https://foragents.dev/certifications/${slug}`,
      siteName: "forAgents.dev",
      type: "website",
    },
  };
}

export default async function CertificationDetailPage({ params }: Props) {
  const { slug } = await params;

  return <CertificationDetailClient slug={slug} />;
}
