/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { brandKitTypes, queryBrandKit, type BrandKitType } from "@/lib/brandKit";

export const metadata: Metadata = {
  title: "Brand Kit — forAgents.dev",
  description: "Persistent brand assets and guidelines for logos, colors, fonts, and press usage.",
  openGraph: {
    title: "Brand Kit — forAgents.dev",
    description: "Persistent brand assets and guidelines for logos, colors, fonts, and press usage.",
    url: "https://foragents.dev/brand-kit",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

type SearchParams = {
  type?: string;
  search?: string;
};

function titleForType(type: BrandKitType) {
  if (type === "logo") return "Logos";
  if (type === "color") return "Colors";
  if (type === "font") return "Fonts";
  return "Guidelines";
}

export default async function BrandKitPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const selectedType = brandKitTypes.includes((params.type ?? "") as BrandKitType)
    ? ((params.type ?? "") as BrandKitType)
    : undefined;
  const search = params.search?.trim() ?? "";

  const items = await queryBrandKit({
    type: selectedType,
    search: search || undefined,
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground">
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <Badge variant="outline" className="mb-4 border-[#06D6A0]/30 text-[#06D6A0] bg-[#06D6A0]/10">
          Persistent JSON + API
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-3">forAgents.dev Brand Kit</h1>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Official downloadable assets for logos, colors, fonts, and brand guidelines.
        </p>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="flex flex-wrap gap-2 justify-center">
          <Button asChild variant={!selectedType ? "default" : "outline"} className={!selectedType ? "bg-[#06D6A0] text-black" : ""}>
            <Link href="/brand-kit">All</Link>
          </Button>
          {brandKitTypes.map((type) => (
            <Button
              key={type}
              asChild
              variant={selectedType === type ? "default" : "outline"}
              className={selectedType === type ? "bg-[#06D6A0] text-black" : ""}
            >
              <Link href={`/brand-kit?type=${type}${search ? `&search=${encodeURIComponent(search)}` : ""}`}>
                {titleForType(type)}
              </Link>
            </Button>
          ))}
        </div>

        <form action="/brand-kit" method="get" className="max-w-xl mx-auto flex gap-2">
          {selectedType ? <input type="hidden" name="type" value={selectedType} /> : null}
          <Input name="search" defaultValue={search} placeholder="Search assets..." />
          <Button type="submit" variant="outline">Search</Button>
        </form>

        <p className="text-sm text-muted-foreground text-center">
          Showing <span className="text-foreground font-medium">{items.length}</span> result{items.length === 1 ? "" : "s"}
          {selectedType ? ` in ${titleForType(selectedType)}` : ""}
          {search ? ` matching "${search}"` : ""}
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between gap-3">
                  <span>{item.name}</span>
                  <Badge variant="secondary" className="uppercase text-[10px] tracking-wide">
                    {item.type}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <p className="text-xs text-muted-foreground">Format: {item.format.toUpperCase()}</p>
                <p className="text-xs text-muted-foreground">Updated: {new Date(item.updatedAt).toLocaleString()}</p>
                <Button asChild className="bg-[#06D6A0] text-black hover:brightness-110">
                  <a href={item.url} target="_blank" rel="noreferrer">
                    Open asset
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
