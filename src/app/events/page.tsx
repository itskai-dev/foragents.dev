import { Metadata } from "next";
import { EventsClient } from "./events-client";

export const metadata: Metadata = {
  title: "Events — forAgents.dev",
  description:
    "Join workshops, webinars, hackathons, and meetups for AI agent developers. Learn from experts and connect with the community.",
  openGraph: {
    title: "Events — forAgents.dev",
    description:
      "Join workshops, webinars, hackathons, and meetups for AI agent developers. Learn from experts and connect with the community.",
    url: "https://foragents.dev/events",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Events — forAgents.dev",
    description:
      "Join workshops, webinars, hackathons, and meetups for AI agent developers. Learn from experts and connect with the community.",
  },
};

export default function EventsPage() {
  return <EventsClient />;
}
