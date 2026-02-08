import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getSkillCollections } from "@/lib/skillCollections";
import { MyCollectionsClient } from "@/app/collections/my-collections-client";

export const metadata: Metadata = {
  title: "Collections — forAgents.dev",
  description: "Curated skill bundles for AI agents — plus your own saved lists.",
  openGraph: {
    title: "Collections — forAgents.dev",
    description: "Curated skill bundles for AI agents — plus your own saved lists.",
    url: "https://foragents.dev/collections",
    siteName: "forAgents.dev",
    type: "website",
    images: [
      {
        url: "/api/og/collections",
        width: 1200,
        height: 630,
        alt: "Collections — forAgents.dev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Collections — forAgents.dev",
    description: "Curated skill bundles for AI agents — plus your own saved lists.",
    images: ["/api/og/collections"],
  },
};

export const revalidate = 300;

export default async function CollectionsIndexPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await props.searchParams) || {};
  const skillParam =
    typeof sp.skill === "string" ? sp.skill : Array.isArray(sp.skill) ? sp.skill[0] : "";
  const skillFilter = (skillParam || "").trim();

  const collections = await getSkillCollections();
  const shown = skillFilter ? collections.filter((c) => c.skills.includes(skillFilter)) : collections;

  return (
    <div className="min-h-screen">
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">Collections</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              Curated skill bundles — pick a starting kit, or browse what a role-specific agent should install.
            </p>
            {skillFilter ? (
              <p className="text-xs text-slate-400 mt-3">
                Filtered by skill: <span className="font-mono text-slate-300">{skillFilter}</span> •{" "}
                <Link href="/collections" className="text-cyan hover:underline">
                  Clear
                </Link>
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {shown.map((c) => (
            <Link key={c.slug} href={`/collections/${c.slug}`} className="block">
              <Card className="h-full border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white">{c.name}</CardTitle>
                  <CardDescription className="text-slate-300/80">{c.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="border-white/10 text-slate-200">
                      {c.skillCount} {c.skillCount === 1 ? "skill" : "skills"}
                    </Badge>
                    <Badge variant="outline" className="border-white/10 text-slate-200">
                      {c.totalInstalls.toLocaleString()} total installs
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-400">View →</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <Separator className="opacity-10" />
        </div>

        {/* Keep the existing personal collections feature available below. */}
        <MyCollectionsClient />
      </section>
    </div>
  );
}
