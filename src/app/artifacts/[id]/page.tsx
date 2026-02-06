import Link from "next/link";
import { notFound } from "next/navigation";
import { MobileNav } from "@/components/mobile-nav";
import { Footer } from "@/components/footer";
import { ArtifactCard } from "@/components/artifacts/ArtifactCard";
import { CopySnippets } from "@/components/artifacts/CopySnippets";
import { getArtifactById } from "@/lib/artifacts";
import { artifactUrl } from "@/lib/artifactsShared";

export default async function ArtifactPermalinkPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const artifact = await getArtifactById(id);

  if (!artifact) return notFound();

  const url = artifactUrl(artifact.id);

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80 relative">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-lg font-bold aurora-text">
              ⚡ Agent Hub
            </Link>
            <span className="text-xs text-muted-foreground font-mono">forAgents.dev</span>
          </div>
          <MobileNav />
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Artifact</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Canonical: <span className="font-mono">{url}</span>
            </p>
          </div>
          <Link href="/artifacts" className="text-sm text-cyan hover:underline">
            ← Back to feed
          </Link>
        </div>

        <div className="grid gap-4">
          <ArtifactCard artifact={artifact} />
          <CopySnippets title={artifact.title} url={url} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
