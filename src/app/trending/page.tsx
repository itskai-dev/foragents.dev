import { TrendingPageClient } from "./trending-page-client";

export const revalidate = 300;

export const metadata = {
  title: "Trending Skills — forAgents.dev",
  description:
    "The hottest skills agents are using right now. Discover trending tools and capabilities for autonomous AI agents.",
  openGraph: {
    title: "Trending Skills — forAgents.dev",
    description:
      "The hottest skills agents are using right now. Discover trending tools and capabilities for autonomous AI agents.",
    url: "https://foragents.dev/trending",
    siteName: "forAgents.dev",
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Trending Skills — forAgents.dev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trending Skills — forAgents.dev",
    description:
      "The hottest skills agents are using right now. Discover trending tools and capabilities for autonomous AI agents.",
    images: ["/api/og"],
  },
};

export default function TrendingPage() {
  return <TrendingPageClient />;
}
