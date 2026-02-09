"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MapPin, Briefcase, Calendar, ChevronRight } from "lucide-react";
import careersData from "@/data/careers.json";

export default function CareersPage() {
  const { positions, benefits, culture } = careersData;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Get department badge color
  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      Engineering: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      Marketing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      Design: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      Community: "bg-green-500/10 text-green-400 border-green-500/20",
      Content: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    };
    return colors[department] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
  };

  const jobPostingsJsonLd = positions.map((job) => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.postedDate,
    employmentType: job.type === "Full-time" ? "FULL_TIME" : "CONTRACTOR",
    hiringOrganization: {
      "@type": "Organization",
      name: "forAgents.dev",
      sameAs: "https://foragents.dev",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
      },
    },
    applicantLocationRequirements: {
      "@type": "Country",
      name: "Worldwide",
    },
  }));

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingsJsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-8">
            <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-6">
              Build the Future of Agent Infrastructure
            </h1>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Join our team of builders creating the platform that powers the next generation of AI agents.
            </p>
          </div>

          {/* Team Photo Placeholder */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#06D6A0]/5 to-[#06D6A0]/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <div className="text-6xl">👥</div>
                  <p className="text-lg text-muted-foreground">
                    Our team building the future together
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative max-w-6xl mx-auto px-4 py-16">
        {/* Open Positions */}
        <div className="mb-20">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Open Positions</h2>
            <p className="text-lg text-muted-foreground">
              {positions.length} open {positions.length === 1 ? "role" : "roles"} • Remote-first • Competitive compensation
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {positions.map((job) => (
              <AccordionItem
                key={job.id}
                value={job.id}
                className="border border-white/10 rounded-xl bg-[#0f0f0f] overflow-hidden hover:border-[#06D6A0]/30 transition-all data-[state=open]:border-[#06D6A0]/50"
              >
                <AccordionTrigger className="px-6 py-5 hover:no-underline [&[data-state=open]]:bg-[#06D6A0]/5">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 w-full text-left">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-[#06D6A0] transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`${getDepartmentColor(job.department)} text-xs`}
                        >
                          {job.department}
                        </Badge>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Briefcase className="w-3.5 h-3.5" />
                          {job.type}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          Posted {formatDate(job.postedDate)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-90" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6 pt-4">
                    {/* Description */}
                    <div>
                      <p className="text-foreground/90 leading-relaxed">
                        {job.description}
                      </p>
                    </div>

                    {/* Responsibilities */}
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-[#06D6A0] mb-3">
                        Responsibilities
                      </h4>
                      <ul className="space-y-2">
                        {job.responsibilities.map((item, idx) => (
                          <li key={idx} className="flex gap-3 text-sm text-foreground/80">
                            <span className="text-[#06D6A0] mt-1.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Requirements */}
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-[#06D6A0] mb-3">
                        Requirements
                      </h4>
                      <ul className="space-y-2">
                        {job.requirements.map((item, idx) => (
                          <li key={idx} className="flex gap-3 text-sm text-foreground/80">
                            <span className="text-[#06D6A0] mt-1.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Nice to Haves */}
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Nice to Have
                      </h4>
                      <ul className="space-y-2">
                        {job.niceToHaves.map((item, idx) => (
                          <li key={idx} className="flex gap-3 text-sm text-muted-foreground">
                            <span className="mt-1.5">○</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Apply Button */}
                    <div className="pt-4">
                      <Button
                        asChild
                        className="w-full sm:w-auto bg-[#06D6A0] hover:bg-[#06D6A0]/90 text-black font-semibold"
                      >
                        <a
                          href={`mailto:careers@foragents.dev?subject=Application: ${job.title}`}
                          className="inline-flex items-center justify-center"
                        >
                          Apply for this position
                        </a>
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Benefits Section */}
        <div className="mb-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Benefits & Perks</h2>
            <p className="text-lg text-muted-foreground">
              We take care of our team so you can focus on building
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <Card
                key={benefit.title}
                className="bg-[#0f0f0f] border-white/10 hover:border-[#06D6A0]/30 transition-all"
              >
                <CardHeader>
                  <div className="text-4xl mb-3">{benefit.icon}</div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Culture Section */}
        <div className="mb-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{culture.title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {culture.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {culture.values.map((value) => (
              <Card
                key={value.title}
                className="bg-[#0f0f0f] border-white/10"
              >
                <CardHeader>
                  <CardTitle className="text-xl text-[#06D6A0]">
                    {value.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-16 px-6 rounded-2xl border border-white/10 bg-gradient-to-br from-[#06D6A0]/5 to-transparent">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Don&apos;t see the perfect role?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            We&apos;re always looking for talented people who share our passion for building great developer tools. Send us your resume and let&apos;s talk.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#06D6A0] hover:bg-[#06D6A0]/90 text-black font-semibold"
          >
            <a href="mailto:careers@foragents.dev">
              Get in Touch
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
