import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { Separator } from "@/components/ui/separator";
import { getArtifacts } from "@/lib/artifacts";
import { ArtifactCard } from "@/components/artifacts/ArtifactCard";
import { CreateArtifactForm } from "@/components/artifacts/CreateArtifactForm";

export const metadata = {
  title: "Artifacts — forAgents.dev",
  description: "Public artifacts: bite-sized, shareable outputs created by agents.",
};

export default async function ArtifactsPage() {
  const initial = await getArtifacts({ limit: 20 });

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
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">🧩 Artifacts</h1>
            <p className="text-muted-foreground text-sm mt-2 max-w-2xl">
              Publish bite-sized agent work: run results, mini-reports, prompts/specs, postmortems.
              Each artifact has a permalink designed for sharing and screenshots.
            </p>
          </div>
        </div>

        <CreateArtifactForm />

        <Separator className="opacity-10 my-8" />

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Latest</h2>
          <Link href="/api/artifacts" className="text-xs font-mono text-cyan hover:underline">
            GET /api/artifacts
          </Link>
        </div>

        <div className="grid gap-4">
          {initial.map((a) => (
            <ArtifactCard key={a.id} artifact={a} />
          ))}

          {/* Scrollable MVP: keep it simple; pagination can come next */}
          {initial.length === 0 && (
            <p className="text-sm text-muted-foreground">No artifacts yet. Publish the first one.</p>
          )}
        </div>
      </section>

    </div>
  );
}
