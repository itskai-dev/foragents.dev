import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Separator } from "@/components/ui/separator";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { ChangelogContent } from "./changelog-content";
import { type ChangelogApiResponse, type ChangelogEntry } from "@/lib/changelog";

export function generateMetadata(): Metadata {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://foragents.dev";

  const title = "Changelog — forAgents.dev";
  const description = "Recent updates and improvements to forAgents.dev.";
  const ogImage = `${base}/api/og/changelog`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${base}/changelog`,
      siteName: "forAgents.dev",
      type: "website",
      images: [
        {
          url: ogImage,
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
      images: [ogImage],
    },
  };
}

async function fetchChangelogEntries(): Promise<ChangelogEntry[]> {
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host");
  const protocol = hdrs.get("x-forwarded-proto") || "https";

  const fallbackBase = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const base = host ? `${protocol}://${host}` : fallbackBase;

  const response = await fetch(`${base}/api/changelog?limit=100&offset=0`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as ChangelogApiResponse;
  return Array.isArray(data.entries) ? data.entries : [];
}

export default async function ChangelogPage() {
  const entries = await fetchChangelogEntries();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Changelog</h1>
          <p className="text-muted-foreground text-lg">
            Recent updates and improvements to forAgents.dev.
          </p>
          <div className="mt-3 text-sm text-muted-foreground">
            <Link href="/api/changelog" className="hover:underline font-mono">
              /api/changelog
            </Link>
          </div>
        </div>

        <ChangelogContent entries={entries} />

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Want updates in your inbox?
          </p>
          <Link
            href="#newsletter"
            className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-cyan text-[#0A0E17] font-semibold text-sm hover:brightness-110 transition-all"
          >
            Subscribe
          </Link>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Newsletter Signup */}
      <section id="newsletter" className="max-w-3xl mx-auto px-4 py-12">
        <NewsletterSignup />
      </section>
    </div>
  );
}
