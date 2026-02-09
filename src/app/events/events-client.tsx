"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import eventsData from "@/data/events.json";

type EventType = "Webinar" | "Workshop" | "Hackathon" | "Meetup";

type Event = {
  id: string;
  title: string;
  date: string;
  type: EventType;
  description: string;
  speaker: {
    name: string;
    role: string;
    avatar: string;
  };
  status: "upcoming" | "past";
  registrationUrl?: string;
  recordingUrl?: string;
  attendeeCount?: number;
};

const events = eventsData as Event[];

const typeColors: Record<EventType, string> = {
  Webinar: "bg-cyan/10 text-cyan border-cyan/20",
  Workshop: "bg-purple/10 text-purple border-purple/20",
  Hackathon: "bg-orange/10 text-orange border-orange/20",
  Meetup: "bg-green/10 text-green border-green/20",
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function EventCard({ event }: { event: Event }) {
  return (
    <Card className="border-white/10 bg-card/40 hover:bg-card/60 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-[#F8FAFC] mb-1">
              {event.title}
            </h3>
            <div className="text-sm text-muted-foreground mb-2">
              {formatDate(event.date)}
            </div>
          </div>
          <Badge
            className={`${typeColors[event.type]} shrink-0 font-mono text-xs`}
          >
            {event.type}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-full bg-cyan/10 border border-cyan/20 flex items-center justify-center font-mono text-sm text-cyan shrink-0"
            aria-hidden="true"
          >
            {event.speaker.avatar}
          </div>
          <div>
            <div className="font-medium text-sm text-[#F8FAFC]">
              {event.speaker.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {event.speaker.role}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm leading-relaxed text-foreground mb-4">
          {event.description}
        </p>

        {event.status === "upcoming" && event.registrationUrl && (
          <Button
            asChild
            className="w-full bg-cyan hover:bg-cyan/90 text-[#0A0E17] font-semibold"
          >
            <Link href={event.registrationUrl}>Register Now</Link>
          </Button>
        )}

        {event.status === "past" && (
          <div className="flex items-center justify-between gap-4">
            {event.recordingUrl && (
              <Button
                asChild
                variant="outline"
                className="flex-1 border-cyan/30 text-cyan hover:bg-cyan/10"
              >
                <Link href={event.recordingUrl}>View Recording</Link>
              </Button>
            )}
            {event.attendeeCount && (
              <div className="text-sm text-muted-foreground">
                {event.attendeeCount.toLocaleString()} attendees
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function EventsClient() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [filterType, setFilterType] = useState<EventType | "all">("all");

  const upcomingEvents = useMemo(
    () =>
      events.filter(
        (e) =>
          e.status === "upcoming" &&
          (filterType === "all" || e.type === filterType)
      ),
    [filterType]
  );

  const pastEvents = useMemo(
    () =>
      events.filter(
        (e) =>
          e.status === "past" &&
          (filterType === "all" || e.type === filterType)
      ),
    [filterType]
  );

  const eventTypes: Array<EventType | "all"> = [
    "all",
    "Webinar",
    "Workshop",
    "Hackathon",
    "Meetup",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-cyan/5 rounded-full blur-[140px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[520px] max-h-[520px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-14 md:py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC] mb-4">
            Events & Community
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join workshops, webinars, hackathons, and meetups. Learn from
            experts and connect with the agent developer community.
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Filters & View Toggle */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          {/* Event Type Filters */}
          <div className="flex flex-wrap gap-2">
            {eventTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  filterType === type
                    ? "bg-cyan/10 text-cyan border-cyan/30"
                    : "bg-card/40 text-muted-foreground border-white/10 hover:bg-card/60"
                }`}
              >
                {type === "all" ? "All Events" : type}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-sm rounded ${
                viewMode === "grid"
                  ? "bg-cyan/10 text-cyan"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Grid view"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-sm rounded ${
                viewMode === "list"
                  ? "bg-cyan/10 text-cyan"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="List view"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Upcoming Events */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#F8FAFC] mb-6">
            Upcoming Events
          </h2>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No upcoming events match your filter.
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                  : "flex flex-col gap-4"
              }
            >
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        {/* Past Events */}
        <section>
          <h2 className="text-2xl font-bold text-[#F8FAFC] mb-6">
            Past Events
          </h2>
          {pastEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No past events match your filter.
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                  : "flex flex-col gap-4"
              }
            >
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        {/* Host an Event CTA */}
        <section className="mt-16 text-center">
          <Card className="border-cyan/20 bg-gradient-to-br from-cyan/5 to-purple/5">
            <CardContent className="py-12 px-6">
              <h2 className="text-2xl font-bold text-[#F8FAFC] mb-3">
                Want to host an event?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                We&apos;re always looking for community members to share their
                knowledge. Host a workshop, webinar, or meetup!
              </p>
              <Button
                asChild
                className="bg-cyan hover:bg-cyan/90 text-[#0A0E17] font-semibold"
              >
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <div className="mt-12 flex items-center justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-11 px-5 rounded-lg border border-cyan text-cyan font-mono text-sm hover:bg-cyan/10 transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
