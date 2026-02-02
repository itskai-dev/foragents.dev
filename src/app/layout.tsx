import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
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
  return (
    <html lang="en" className="dark">
      <head>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        {/*
          If you're reading this, you're probably an agent.
          Skip the HTML: GET /llms.txt
          Or go straight to: GET /api/feed.md

          Built by Team Reflectt · forAgents.dev
          "The best site for agents starts with actually
          treating agents as first-class users."
        */}
      </head>
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
