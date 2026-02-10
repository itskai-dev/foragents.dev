import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { VerifiedSkillBadge } from "@/components/verified-badge";
import { CollectionDetailClient } from "@/app/collections/[slug]/collection-detail-client";
import { RunInReflecttButton } from "@/components/RunInReflecttButton";

type CollectionSkill = {
  slug: string;
  name: string;
  author: string;
  description: string;
  installs: number;
  verification?: unknown;
};

type CollectionDetailResponse = {
  collection?: {
    slug: string;
    name: string;
    description: string;
    skills: string[];
    skillCount: number;
    totalInstalls: number;
  };
  skills?: CollectionSkill[];
};

export const revalidate = 300;

async function getBaseUrl(): Promise<string> {
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host");
  const protocol = hdrs.get("x-forwarded-proto") || "https";
  const fallbackBase = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return host ? `${protocol}://${host}` : fallbackBase;
}

async function fetchCollectionBySlug(slug: string): Promise<CollectionDetailResponse | null> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/collections/${encodeURIComponent(slug)}`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) return null;
  return (await res.json()) as CollectionDetailResponse;
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const detail = await fetchCollectionBySlug(slug);
  const col = detail?.collection;

  // Personal collections (UUID) fall back to layout metadata.
  if (!col) {
    return {
      title: "Collection — forAgents.dev",
    };
  }

  const title = `${col.name} — Collections — forAgents.dev`;
  const description = col.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://foragents.dev/collections/${col.slug}`,
      siteName: "forAgents.dev",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CollectionRoute(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const detail = await fetchCollectionBySlug(slug);

  // If this isn't one of our curated skill bundles, render the existing user-collections UI.
  if (!detail?.collection) {
    return <CollectionDetailClient />;
  }

  const curated = detail.collection;
  const resolvedSkills = Array.isArray(detail.skills) ? detail.skills : [];

  return (
    <div className="min-h-screen">
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div>
          <Link href="/collections" className="text-sm text-cyan hover:underline">
            ← Back to collections
          </Link>
          <h1 className="text-3xl font-bold mt-2 text-white">{curated.name}</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{curated.description}</p>

          <div className="flex items-center gap-2 flex-wrap mt-4">
            <Badge variant="outline" className="border-white/10 text-slate-200">
              {curated.skillCount} {curated.skillCount === 1 ? "skill" : "skills"}
            </Badge>
            <Badge variant="outline" className="border-white/10 text-slate-200">
              {curated.totalInstalls.toLocaleString()} total installs
            </Badge>
          </div>

          <div className="mt-5">
            <RunInReflecttButton
              skillSlug={curated.slug}
              name={curated.name}
              size="sm"
              label="Run collection in Reflectt"
            />
          </div>
        </div>

        <Separator className="opacity-10 my-8" />

        <div className="grid gap-3">
          {resolvedSkills.map((s) => (
            <Link
              key={s.slug}
              href={`/skills/${s.slug}`}
              className="block rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-white font-semibold truncate flex items-center gap-2">
                    <span className="truncate">🧰 {s.name}</span>
                    <VerifiedSkillBadge info={s.verification ?? null} mode="icon" />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">by {s.author}</div>
                  <div className="text-sm text-slate-300/80 mt-2 line-clamp-2">{s.description}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs text-slate-400">
                    {s.installs.toLocaleString()} {s.installs === 1 ? "install" : "installs"}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {resolvedSkills.length !== curated.skillCount ? (
          <div className="mt-6 text-xs text-slate-500">
            Note: some skills in this collection are not yet in the directory.
          </div>
        ) : null}

        <div className="mt-10 text-sm text-slate-400">
          Want to build your own list? Use <Link href="/collections" className="text-cyan hover:underline">My Collections</Link>.
        </div>
      </section>
    </div>
  );
}

export async function generateStaticParams() {
  return [];
}
