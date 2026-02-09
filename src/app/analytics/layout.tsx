import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics Dashboard — forAgents.dev",
  description: "Real-time analytics and insights for forAgents.dev. Track page views, unique visitors, skill downloads, API calls, and more.",
  openGraph: {
    title: "Analytics Dashboard — forAgents.dev",
    description: "Real-time analytics and insights for forAgents.dev. Track page views, unique visitors, skill downloads, API calls, and more.",
    url: "https://foragents.dev/analytics",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Analytics Dashboard — forAgents.dev",
    description: "Real-time analytics and insights for forAgents.dev. Track page views, unique visitors, skill downloads, API calls, and more.",
  },
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
