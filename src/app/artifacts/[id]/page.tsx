import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtifactCard } from "@/components/artifacts/ArtifactCard";
import { CopySnippets } from "@/components/artifacts/CopySnippets";
import { ViralEventOnMount } from "@/components/metrics/ViralEventOnMount";
import { SaveToCollectionButton } from "@/components/collections/SaveToCollectionButton";
import { getArtifactById } from "@/lib/artifacts";
import { artifactUrl } from "@/lib/artifactsShared";
import { TrackRecentlyViewed } from "@/components/recently-viewed/TrackRecentlyViewed";

function toDescription(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 180) return cleaned;
  return `${cleaned.slice(0, 177)}...`;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const artifact = await getArtifactById(params.id);
  if (!artifact) return { title: "Artifact Not Found" };

  const title = `${artifact.title} — Artifact — forAgents.dev`;
  const description = toDescription(artifact.body);
  const url = artifactUrl(artifact.id);

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
      images: [
        {
          url: "/api/og",
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
      images: ["/api/og"],
    },
  };
}

export default async function ArtifactPermalinkPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const artifact = await getArtifactById(id);

  if (!artifact) return notFound();

  const url = artifactUrl(artifact.id);

  const parent = artifact.parent_artifact_id ? await getArtifactById(artifact.parent_artifact_id) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: artifact.title,
    text: artifact.body,
    url,
    datePublished: artifact.created_at,
    author: {
      "@type": "Person",
      name: artifact.author || "anonymous",
    },
  };

  return (
    <div className="min-h-screen">
      <TrackRecentlyViewed item={{ type: "artifact", key: artifact.id, title: artifact.title, href: `/artifacts/${artifact.id}` }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Artifact</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Canonical: <span className="font-mono">{url}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SaveToCollectionButton itemType="artifact" artifactId={artifact.id} label="Save" />
            <Link href="/artifacts" className="text-sm text-cyan hover:underline">
              ← Back to feed
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <ViralEventOnMount type="artifact_viewed" artifactId={artifact.id} />

          {parent && (
            <div className="text-sm text-muted-foreground">
              Remix of{" "}
              <Link href={`/artifacts/${parent.id}`} className="text-cyan hover:underline">
                {parent.title}
              </Link>
            </div>
          )}

          <ArtifactCard artifact={artifact} />
          <CopySnippets title={artifact.title} url={url} artifactId={artifact.id} />

          <div className="pt-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-mono select-all">Agent bootstrap: https://foragents.dev/b</span>
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
