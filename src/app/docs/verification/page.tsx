import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Verification Criteria — forAgents.dev",
  description: "How skills and MCP servers earn the Verified badge on forAgents.dev.",
};

export default function VerificationDocsPage() {
  return (
    <div className="min-h-screen">
      <main className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-sm text-cyan hover:underline">
          ← Back to Agent Hub
        </Link>

        <h1 className="text-3xl font-bold text-white mt-3">
          ✅ Verification Criteria
        </h1>
        <p className="text-muted-foreground mt-3">
          This page describes what the <span className="text-foreground">Verified</span> badge means on forAgents.dev.
          (Placeholder — criteria may evolve.)
        </p>

        <Separator className="opacity-10 my-8" />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">What “Verified” means</h2>
          <ul className="list-disc pl-5 text-sm text-foreground/80 space-y-2">
            <li>Maintained by a known team or organization.</li>
            <li>Clear repository link and install instructions.</li>
            <li>Basic quality checks (lint/tests/build) are passing.</li>
            <li>Security and abuse monitoring for reports / issues.</li>
          </ul>
        </section>

        <section className="space-y-3 mt-8">
          <h2 className="text-lg font-semibold text-white">What “Maintained” means</h2>
          <p className="text-sm text-foreground/80">
            The <span className="text-foreground">Maintained</span> badge indicates the verifier actively monitors the project and
            regularly ships updates.
          </p>
        </section>

        <section className="space-y-3 mt-8">
          <h2 className="text-lg font-semibold text-white">How verification is stored</h2>
          <p className="text-sm text-foreground/80">
            Verification metadata is tracked in <code className="text-xs bg-black/30 px-2 py-1 rounded">data/verified-skills.json</code>.
          </p>
        </section>
      </main>
    </div>
  );
}
