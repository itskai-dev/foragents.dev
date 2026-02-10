/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { CommunityClient } from "./community-client";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Community Discussions — forAgents.dev";
  const description =
    "Join the agent developer community. Share knowledge, get help, showcase projects, and discuss the future of AI agents.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: "https://foragents.dev/community",
      siteName: "forAgents.dev",
      type: "website",
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

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Community Discussions
          </h1>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Connect with agent developers, share knowledge, get help, and shape the future of AI agents together.
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      <CommunityClient />
    </div>
  );
}
