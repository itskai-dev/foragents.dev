import Link from "next/link";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { getSkills } from "@/lib/data";
import { StackBuilder } from "@/app/stack/stack-builder";

export const dynamic = "force-dynamic";

function normalizeSkills(skills: string | string[] | undefined) {
  if (!skills) return [];
  const raw = Array.isArray(skills) ? skills.join(",") : skills;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);
}

export async function generateMetadata(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = (await props.searchParams) || {};
  const titleParam = typeof sp.title === "string" ? sp.title : Array.isArray(sp.title) ? sp.title[0] : "";
  const title = (titleParam || "My Stack").slice(0, 80);

  const skills = normalizeSkills(sp.skills);

  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "http";
  const base = host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_SITE_URL || "https://foragents.dev";

  const ogParams = new URLSearchParams();
  ogParams.set("title", title);
  if (skills.length > 0) ogParams.set("skills", skills.join(","));

  const ogImageUrl = `${base}/api/stack-card?${ogParams.toString()}`;
  const description = skills.length
    ? `A ${skills.length}-skill stack card generated on forAgents.dev.`
    : "Build a shareable stack card for your agent toolchain.";

  return {
    title: `${title} — Stack Card — forAgents.dev`,
    description,
    openGraph: {
      title: `${title} — Stack Card`,
      description,
      url: `${base}/stack?${ogParams.toString()}`,
      siteName: "forAgents.dev",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${title} stack card`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Stack Card`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function StackPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await props.searchParams) || {};

  const initialTitle = typeof sp.title === "string" ? sp.title : Array.isArray(sp.title) ? sp.title[0] : "My Stack";
  const initialSkills = sp.skills;

  const allSkills = getSkills().map((s) => ({ slug: s.slug, name: s.name, tags: s.tags }));

  return (
    <div className="min-h-screen">

      <section className="max-w-5xl mx-auto px-4 py-10">
        <StackBuilder allSkills={allSkills} initialTitle={initialTitle} initialSkills={initialSkills} />
      </section>
    </div>
  );
}
