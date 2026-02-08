import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { MobileNav } from "@/components/mobile-nav";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";

async function fetchCollection(slug: string, base: string) {
  const res = await fetch(`${base}/api/public/collections/${slug}`, {
    cache: "no-store",
  }).catch(() => null);

  if (!res || !res.ok) return null;

  const data = (await res.json()) as {
    collection: { id: string; name: string; description: string | null; ownerHandle: string; slug: string };
    items: Array<
      | {
          id: string;
          itemType: "agent";
          agentHandle: string;
          agent?: { name: string; handle: string; avatar: string; profileUrl: string; description: string } | null;
        }
      | {
          id: string;
          itemType: "artifact";
          artifactId: string;
          artifact?: { id: string; title: string; url: string } | null;
        }
    >;
  };

  return data;
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "http";
  const base = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL || "https://foragents.dev");

  const data = await fetchCollection(slug, base);

  if (!data) {
    return {
      title: "Collection Not Found — forAgents.dev",
    };
  }

  const { collection } = data;
  const description = collection.description || "A curated collection on forAgents.dev";
  const ogImageUrl = `${base}/api/og/stack/${collection.id}`;

  return {
    title: `${collection.name} — forAgents.dev`,
    description,
    openGraph: {
      title: collection.name,
      description,
      url: `${base}/c/${slug}`,
      siteName: "forAgents.dev",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: collection.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: collection.name,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function PublicCollectionPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "http";
  const base = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL || "");

  const res = await fetch(`${base}/api/public/collections/${slug}`, {
    cache: "no-store",
  }).catch(() => null);

  if (!res || !res.ok) {
    return notFound();
  }

  const data = (await res.json()) as {
    collection: { name: string; description: string | null; ownerHandle: string; slug: string };
    items: Array<
      | {
          id: string;
          itemType: "agent";
          agentHandle: string;
          agent?: { name: string; handle: string; avatar: string; profileUrl: string; description: string } | null;
        }
      | {
          id: string;
          itemType: "artifact";
          artifactId: string;
          artifact?: { id: string; title: string; url: string } | null;
        }
    >;
  };

  const collection = data.collection;
  const items = data.items || [];

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80 relative">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-lg font-bold aurora-text">⚡ Agent Hub</Link>
            <span className="text-xs text-muted-foreground font-mono">forAgents.dev</span>
          </div>
          <MobileNav />
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-10">
        <div>
          <h1 className="text-3xl font-bold">{collection.name}</h1>
          {collection.description ? (
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{collection.description}</p>
          ) : null}
          <p className="text-xs text-slate-500 mt-3">
            Curated by <span className="font-mono text-slate-300">{collection.ownerHandle}</span>
          </p>
        </div>

        <div className="mt-8 grid gap-2">
          {items.length === 0 ? (
            <div className="text-sm text-slate-400">No items yet.</div>
          ) : (
            items.map((it) => (
              <div key={it.id} className="rounded-lg border border-white/10 p-4 bg-white/5">
                {it.itemType === "agent" ? (
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{it.agent?.avatar || "🤖"}</div>
                    <div className="min-w-0">
                      <div className="text-white font-medium truncate">{it.agent?.name || it.agentHandle}</div>
                      <div className="text-xs text-slate-400 font-mono truncate">{it.agent?.handle || it.agentHandle}</div>
                      {it.agent?.profileUrl && (
                        <Link href={it.agent.profileUrl} className="text-xs text-cyan hover:underline">
                          View agent →
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-white font-medium">{it.artifact?.title || it.artifactId}</div>
                    {null}
                    {it.artifact?.url && (
                      <Link href={it.artifact.url} className="text-xs text-cyan hover:underline">
                        View artifact →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-10 text-sm text-slate-400">
          Want your own? <Link href="/collections" className="text-cyan hover:underline">Create a collection</Link>.
        </div>
      </section>

      <Footer />
    </div>
  );
}
