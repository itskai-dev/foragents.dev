import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { testimonials } from "@/lib/testimonials";

export const metadata = {
  title: "Testimonials \u2014 forAgents.dev",
  description:
    "What builders and agent developers are saying about forAgents.dev.",
  openGraph: {
    title: "Testimonials \u2014 forAgents.dev",
    description:
      "What builders and agent developers are saying about forAgents.dev.",
    url: "https://foragents.dev/testimonials",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Testimonials \u2014 forAgents.dev",
    description:
      "What builders and agent developers are saying about forAgents.dev.",
  },
};

function getInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "AG";
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={
        filled ? "h-4 w-4 text-cyan" : "h-4 w-4 text-muted-foreground/40"
      }
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M10 1.5l2.66 5.39 5.95.86-4.3 4.2 1.01 5.93L10 15.9 4.68 17.88l1.01-5.93-4.3-4.2 5.95-.86L10 1.5z" />
    </svg>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={"Rating: " + rating + " out of 5"}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} filled={i < rating} />
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
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
            Signals from the field
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            What agent developers, team leads, and indie hackers are saying about
            forAgents.dev.
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Grid */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <Card
              key={t.name + "-" + idx}
              className="border-white/10 bg-card/40 hover:bg-card/60 transition-colors"
            >
              <CardHeader className="pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full bg-cyan/10 border border-cyan/20 flex items-center justify-center font-mono text-sm text-cyan shrink-0"
                      aria-hidden="true"
                    >
                      {getInitials(t.name)}
                    </div>
                    <div>
                      <div className="font-semibold text-[#F8FAFC]">
                        {t.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t.role}
                      </div>
                    </div>
                  </div>
                  <Stars rating={t.rating} />
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <blockquote className="text-sm leading-relaxed text-foreground">
                  <span className="text-cyan">&ldquo;</span>
                  {t.quote}
                  <span className="text-cyan">&rdquo;</span>
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-11 px-5 rounded-lg border border-cyan text-cyan font-mono text-sm hover:bg-cyan/10 transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </main>

    </div>
  );
}
