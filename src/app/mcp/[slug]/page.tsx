import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getMcpServerBySlug, getMcpServers } from "@/lib/data";
import { McpDetailClient } from "@/app/mcp/[slug]/mcp-detail-client";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getMcpServers().map((server) => ({ slug: server.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const server = getMcpServerBySlug(slug);

  if (!server) {
    return { title: "MCP Server | forAgents.dev" };
  }

  return {
    title: `${server.name} — MCP Server | forAgents.dev`,
    description: server.description,
  };
}

export default async function McpServerDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const server = getMcpServerBySlug(slug);

  if (!server) notFound();

  return (
    <div className="min-h-screen">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/mcp" className="text-sm text-cyan hover:underline">
          ← Back to MCP Hub
        </Link>

        <div className="mt-5 space-y-3">
          <Badge variant="outline" className="bg-white/5 text-white/70 border-white/10">
            {server.category}
          </Badge>
          <h1 className="text-3xl font-bold text-[#F8FAFC]">{server.name}</h1>
          <p className="text-foreground/80 leading-relaxed">{server.description}</p>
        </div>

        <Separator className="my-8 opacity-10" />

        <McpDetailClient slug={server.slug} initialServer={server} />

        <Separator className="my-8 opacity-10" />

        <section>
          <h2 className="text-lg font-semibold text-[#F8FAFC] mb-3">Repository</h2>
          <a
            href={server.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan hover:underline break-all"
          >
            {server.repo_url}
          </a>
        </section>
      </main>
    </div>
  );
}
