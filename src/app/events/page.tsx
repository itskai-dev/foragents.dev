import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Events — forAgents.dev",
  description: "Join upcoming community events, webinars, and meetups. Connect with the agent development community.",
  openGraph: {
    title: "Events — forAgents.dev",
    description: "Join upcoming community events, webinars, and meetups. Connect with the agent development community.",
    url: "https://foragents.dev/events",
    siteName: "forAgents.dev",
    type: "website",
  },
};

interface Event {
  id: string;
  title: string;
  description: string;
  type: "Webinar" | "Workshop" | "Meetup" | "Hackathon";
  date: string;
  time: string;
  month: string;
  day: string;
  registrationUrl?: string;
  recordingUrl?: string;
  speakers?: string[];
}

const upcomingEvents: Event[] = [
  {
    id: "1",
    title: "Building Multi-Agent Systems",
    description: "Learn how to orchestrate multiple AI agents working together on complex tasks. We&apos;ll cover communication patterns, task delegation, and conflict resolution.",
    type: "Webinar",
    date: "2026-02-15",
    time: "2:00 PM PST",
    month: "FEB",
    day: "15",
    registrationUrl: "https://foragents.dev/register/multi-agent",
    speakers: ["Dr. Sarah Chen", "Marcus Rodriguez"],
  },
  {
    id: "2",
    title: "Agent Memory & Context Management",
    description: "Deep dive into best practices for managing agent memory, context windows, and long-term state. Build agents that remember and learn.",
    type: "Workshop",
    date: "2026-02-22",
    time: "10:00 AM PST",
    month: "FEB",
    day: "22",
    registrationUrl: "https://foragents.dev/register/memory-workshop",
    speakers: ["Alex Kim", "Jordan Taylor"],
  },
  {
    id: "3",
    title: "SF Bay Area Agent Builders Meetup",
    description: "Join local agent developers for networking, demos, and lightning talks. Bring your projects and connect with the community in person!",
    type: "Meetup",
    date: "2026-03-01",
    time: "6:00 PM PST",
    month: "MAR",
    day: "01",
    registrationUrl: "https://foragents.dev/register/sf-meetup",
  },
  {
    id: "4",
    title: "Agent Automation Hackathon 2026",
    description: "48-hour virtual hackathon focused on building practical agent automation tools. Prizes, mentorship, and a chance to showcase your skills to the community.",
    type: "Hackathon",
    date: "2026-03-15",
    time: "9:00 AM PST",
    month: "MAR",
    day: "15",
    registrationUrl: "https://foragents.dev/register/hackathon-2026",
  },
];

const pastEvents: Event[] = [
  {
    id: "5",
    title: "Introduction to Agent Skills",
    description: "A comprehensive introduction to building and publishing agent skills. Covers the skill lifecycle from development to deployment.",
    type: "Webinar",
    date: "2026-01-20",
    time: "2:00 PM PST",
    month: "JAN",
    day: "20",
    recordingUrl: "https://foragents.dev/recordings/intro-skills",
    speakers: ["Casey Morgan"],
  },
  {
    id: "6",
    title: "Agent Security Best Practices",
    description: "Essential security patterns for autonomous agents. Learn how to build safe, reliable agents that handle sensitive data responsibly.",
    type: "Workshop",
    date: "2026-01-15",
    time: "11:00 AM PST",
    month: "JAN",
    day: "15",
    recordingUrl: "https://foragents.dev/recordings/security-workshop",
    speakers: ["Dr. Lin Wei", "Sam Rivera"],
  },
  {
    id: "7",
    title: "NYC Agent Developers Meetup",
    description: "Our first east coast meetup brought together 50+ agent developers for demos, networking, and great conversations about the future of AI.",
    type: "Meetup",
    date: "2026-01-10",
    time: "7:00 PM EST",
    month: "JAN",
    day: "10",
    recordingUrl: "https://foragents.dev/recordings/nyc-meetup-recap",
  },
  {
    id: "8",
    title: "State of Agent Development 2026",
    description: "Annual keynote covering the latest trends, tools, and techniques in agent development. Featuring insights from industry leaders and community builders.",
    type: "Webinar",
    date: "2026-01-05",
    time: "1:00 PM PST",
    month: "JAN",
    day: "05",
    recordingUrl: "https://foragents.dev/recordings/state-of-agents-2026",
    speakers: ["Team Reflectt", "Community Leaders"],
  },
  {
    id: "9",
    title: "Building Your First Agent",
    description: "Hands-on workshop for beginners. We built a complete agent from scratch, covering architecture, tool integration, and deployment.",
    type: "Workshop",
    date: "2025-12-20",
    time: "10:00 AM PST",
    month: "DEC",
    day: "20",
    recordingUrl: "https://foragents.dev/recordings/first-agent-workshop",
    speakers: ["Taylor Park"],
  },
];

function EventTypeIcon({ type }: { type: Event["type"] }) {
  const icons = {
    Webinar: "🎥",
    Workshop: "🛠️",
    Meetup: "🤝",
    Hackathon: "⚡",
  };
  return <span className="text-2xl">{icons[type]}</span>;
}

function EventTypeBadge({ type }: { type: Event["type"] }) {
  const colors = {
    Webinar: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    Workshop: "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30",
    Meetup: "bg-purple/10 text-purple-400 border-purple/30",
    Hackathon: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  };

  return (
    <Badge variant="outline" className={`text-xs ${colors[type]}`}>
      {type}
    </Badge>
  );
}

function EventCard({ event, isPast = false }: { event: Event; isPast?: boolean }) {
  return (
    <Card className="bg-card/50 border-white/5 hover:border-[#06D6A0]/20 transition-all group">
      <CardHeader>
        <div className="flex items-start gap-4">
          {/* Calendar Date Block */}
          <div className="flex-shrink-0 w-16 h-16 flex flex-col items-center justify-center bg-[#06D6A0]/10 border border-[#06D6A0]/30 rounded-lg">
            <div className="text-xs font-bold text-[#06D6A0] uppercase">
              {event.month}
            </div>
            <div className="text-2xl font-bold text-foreground">{event.day}</div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <CardTitle className="text-lg group-hover:text-[#06D6A0] transition-colors">
                {event.title}
              </CardTitle>
              <EventTypeBadge type={event.type} />
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <EventTypeIcon type={event.type} />
              <span>{event.time}</span>
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {event.description}
            </p>

            {event.speakers && event.speakers.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <span className="font-semibold text-foreground">Speakers:</span>
                <span>{event.speakers.join(", ")}</span>
              </div>
            )}

            {isPast ? (
              <a
                href={event.recordingUrl}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#06D6A0] hover:underline"
              >
                Watch Recording →
              </a>
            ) : (
              <a
                href={event.registrationUrl}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Register
              </a>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

export default function EventsPage() {
  const eventsJsonLd = [...upcomingEvents, ...pastEvents].map((event) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: `${event.date}T${event.time}`,
    eventAttendanceMode: event.type === "Meetup" 
      ? "https://schema.org/OfflineEventAttendanceMode"
      : "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: event.type === "Meetup"
      ? {
          "@type": "Place",
          name: event.title
        }
      : {
          "@type": "VirtualLocation",
          url: event.registrationUrl || event.recordingUrl || "https://foragents.dev/events"
        },
    organizer: {
      "@type": "Organization",
      name: "forAgents.dev",
      url: "https://foragents.dev"
    }
  }));

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventsJsonLd) }}
      />

      {/* Header */}

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        {/* Subtle aurora background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Community Events
          </h1>
          <p className="text-xl text-foreground/80 mb-2">
            Join webinars, workshops, and meetups with the agent development community
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Upcoming Events Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">📅</span>
            <h2 className="text-3xl font-bold">Upcoming Events</h2>
          </div>
          <p className="text-muted-foreground">
            Register for upcoming community events and join the conversation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Past Events Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🎬</span>
            <h2 className="text-3xl font-bold">Past Events</h2>
          </div>
          <p className="text-muted-foreground">
            Catch up on recordings from previous community events
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pastEvents.map((event) => (
            <EventCard key={event.id} event={event} isPast />
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Host an Event CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12 text-center">
            <div className="text-5xl mb-4">🎤</div>
            <h2 className="text-3xl font-bold mb-4">Host an Event</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Want to share your expertise with the community? We&apos;re always looking for speakers, workshop leaders, and event organizers. Let&apos;s build something together!
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-[#06D6A0]">✓</span>
                <span className="text-muted-foreground">Share your knowledge with 500+ developers</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-[#06D6A0]">✓</span>
                <span className="text-muted-foreground">Build your reputation in the community</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-[#06D6A0]">✓</span>
                <span className="text-muted-foreground">Get support from our team for promotion</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-bold text-base hover:brightness-110 transition-all shadow-lg shadow-[#06D6A0]/20"
              >
                Propose an Event
              </Link>
              <a
                href="https://discord.gg/foragents"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg border border-[#06D6A0]/30 text-[#06D6A0] font-semibold text-base hover:bg-[#06D6A0]/10 transition-all"
              >
                Join Discord
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
