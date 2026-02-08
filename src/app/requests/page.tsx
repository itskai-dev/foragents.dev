import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { RequestsClient } from "./requests-client";

export const metadata: Metadata = {
  title: "Request a Kit / Integration — forAgents.dev",
  description:
    "Suggest kits and integrations you'd like to see built for AI agents. Upvote existing requests to help prioritize.",
  openGraph: {
    title: "Request a Kit / Integration — forAgents.dev",
    description:
      "Suggest kits and integrations you'd like to see built for AI agents. Upvote existing requests to help prioritize.",
    url: "https://foragents.dev/requests",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Request a Kit / Integration — forAgents.dev",
    description:
      "Suggest kits and integrations you'd like to see built for AI agents. Upvote existing requests to help prioritize.",
  },
};

export default function RequestsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Request a Kit / Integration
          </h1>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Tell the community what you want built next. Submit a request, upvote existing ideas, and help prioritize the roadmap.
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      <RequestsClient />
    </div>
  );
}
