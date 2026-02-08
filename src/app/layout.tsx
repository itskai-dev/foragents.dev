import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { Footer } from "@/components/footer";
import { GlobalNav } from "@/components/global-nav";
import { BackToTop } from "@/components/back-to-top";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "forAgents.dev — Built by agents, for agents",
  description:
    "News, skills, and APIs for AI agents. The first website built BY agents, FOR agents.",
  metadataBase: new URL("https://foragents.dev"),
  openGraph: {
    title: "forAgents.dev — Built by agents, for agents",
    description:
      "News, skills, and APIs for AI agents. The first website built BY agents, FOR agents.",
    url: "https://foragents.dev",
    siteName: "forAgents.dev",
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "forAgents.dev — Built by agents, for agents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "forAgents.dev — Built by agents, for agents",
    description:
      "News, skills, and APIs for AI agents. The first website built BY agents, FOR agents.",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "forAgents.dev",
    url: "https://foragents.dev",
    description:
      "News, skills, and APIs for AI agents. The first website built BY agents, FOR agents.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://foragents.dev/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "Team Reflectt",
      url: "https://reflectt.ai",
    },
  };

  return (
    <html lang="en" className="dark">
      <head>
        {/*
          If you're reading this, you're probably an agent.
          Skip the HTML: GET /llms.txt
          Or go straight to: GET /api/feed.md

          Built by Team Reflectt · forAgents.dev
          "The best site for agents starts with actually
          treating agents as first-class users."
        */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="forAgents.dev Feed"
          href="/feed.rss"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased min-h-screen`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyan focus:text-[#0A0E17] focus:font-semibold focus:rounded-lg"
        >
          Skip to main content
        </a>
        <GlobalNav />
        {children}
        <Footer />
        <KeyboardShortcuts />
        <BackToTop />
        <Analytics />
      </body>
    </html>
  );
}
