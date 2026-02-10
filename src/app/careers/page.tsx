/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Calendar, MapPin } from "lucide-react";

type JobType = "full-time" | "part-time" | "contract";
type JobLocation = "remote" | "hybrid";

type JobListing = {
  id: string;
  title: string;
  department: string;
  type: JobType;
  location: JobLocation;
  description: string;
  requirements: string[];
  postedAt: string;
  open: boolean;
};

type ApplicationFormState = {
  name: string;
  email: string;
  coverLetter: string;
  portfolioUrl: string;
};

const INITIAL_FORM_STATE: ApplicationFormState = {
  name: "",
  email: "",
  coverLetter: "",
  portfolioUrl: "",
};

const DEPARTMENT_OPTIONS = [
  "all",
  "engineering",
  "community",
  "design",
  "content",
  "operations",
] as const;

const TYPE_OPTIONS = ["all", "full-time", "part-time", "contract"] as const;

export default function CareersPage() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [departmentFilter, setDepartmentFilter] = useState<(typeof DEPARTMENT_OPTIONS)[number]>("all");
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_OPTIONS)[number]>("all");

  const [activeApplicationJobId, setActiveApplicationJobId] = useState<string | null>(null);
  const [applicationForm, setApplicationForm] = useState<ApplicationFormState>(INITIAL_FORM_STATE);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState<string | null>(null);
  const [applicationError, setApplicationError] = useState<string | null>(null);

  const selectedRole = useMemo(
    () => jobs.find((job) => job.id === activeApplicationJobId)?.title,
    [activeApplicationJobId, jobs],
  );

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams();
      if (departmentFilter !== "all") {
        query.set("department", departmentFilter);
      }
      if (typeFilter !== "all") {
        query.set("type", typeFilter);
      }

      const response = await fetch(`/api/careers${query.size > 0 ? `?${query.toString()}` : ""}`);
      if (!response.ok) {
        throw new Error("Unable to load open positions right now.");
      }

      const payload = (await response.json()) as { positions: JobListing[] };
      setJobs(payload.positions ?? []);
    } catch {
      setError("Unable to load open positions right now. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentFilter, typeFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const handleOpenApplication = (jobId: string) => {
    setApplicationError(null);
    setApplicationMessage(null);
    setApplicationForm(INITIAL_FORM_STATE);
    setActiveApplicationJobId((current) => (current === jobId ? null : jobId));
  };

  const handleSubmitApplication = async (job: JobListing) => {
    setApplicationLoading(true);
    setApplicationError(null);
    setApplicationMessage(null);

    try {
      const response = await fetch("/api/careers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: applicationForm.name,
          email: applicationForm.email,
          role: job.title,
          coverLetter: applicationForm.coverLetter,
          portfolioUrl: applicationForm.portfolioUrl || undefined,
        }),
      });

      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Failed to submit your application.");
      }

      setApplicationMessage(payload.message ?? "Application submitted successfully.");
      setApplicationForm(INITIAL_FORM_STATE);
      setActiveApplicationJobId(null);
    } catch (submitError) {
      setApplicationError(
        submitError instanceof Error ? submitError.message : "Failed to submit your application.",
      );
    } finally {
      setApplicationLoading(false);
    }
  };

  const getStatusBadgeClass = (isOpen: boolean) => {
    return isOpen
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
      : "border-rose-500/40 bg-rose-500/10 text-rose-300";
  };

  const getTypeBadgeClass = (type: JobType) => {
    if (type === "full-time") {
      return "border-blue-500/40 bg-blue-500/10 text-blue-300";
    }
    if (type === "part-time") {
      return "border-purple-500/40 bg-purple-500/10 text-purple-300";
    }
    return "border-amber-500/40 bg-amber-500/10 text-amber-300";
  };

  const jobPostingsJsonLd = jobs.map((job) => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.postedAt,
    employmentType:
      job.type === "full-time" ? "FULL_TIME" : job.type === "part-time" ? "PART_TIME" : "CONTRACTOR",
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
  }));

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingsJsonLd) }}
      />

      <section className="relative max-w-6xl mx-auto px-4 py-16 space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC]">
            Build the Future of Agent Infrastructure
          </h1>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            Join our team of builders creating the platform that powers the next generation of AI agents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-[#0f0f0f] p-4">
          <div className="space-y-2">
            <Label htmlFor="department-filter">Department</Label>
            <select
              id="department-filter"
              className="h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm"
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value as (typeof DEPARTMENT_OPTIONS)[number])}
            >
              {DEPARTMENT_OPTIONS.map((department) => (
                <option key={department} value={department}>
                  {department === "all" ? "All departments" : department}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type-filter">Job Type</Label>
            <select
              id="type-filter"
              className="h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as (typeof TYPE_OPTIONS)[number])}
            >
              {TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type === "all" ? "All job types" : type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-6 text-sm text-muted-foreground">
            Loading careers...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Open Positions</h2>
              <p className="text-sm text-muted-foreground">{jobs.length} roles found</p>
            </div>

            {jobs.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-6 text-sm text-muted-foreground">
                No positions match your current filters.
              </div>
            ) : (
              jobs.map((job) => (
                <Card key={job.id} className="border-white/10 bg-[#0f0f0f]">
                  <CardHeader className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <CardTitle>{job.title}</CardTitle>
                      <Badge variant="outline" className={getStatusBadgeClass(job.open)}>
                        {job.open ? "Open" : "Closed"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="border-cyan-500/40 bg-cyan-500/10 text-cyan-200">
                        {job.department}
                      </Badge>
                      <Badge variant="outline" className={getTypeBadgeClass(job.type)}>
                        {job.type}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        {job.type}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Posted {formatDate(job.postedAt)}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <p className="text-sm text-foreground/90 leading-relaxed">{job.description}</p>

                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-cyan-300">Requirements</h3>
                      <ul className="space-y-2">
                        {job.requirements.map((requirement) => (
                          <li key={requirement} className="text-sm text-foreground/80 flex gap-2">
                            <span className="text-cyan-300">•</span>
                            <span>{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <Button
                        type="button"
                        onClick={() => handleOpenApplication(job.id)}
                        disabled={!job.open}
                        className="bg-[#06D6A0] text-black hover:bg-[#06D6A0]/90"
                      >
                        {activeApplicationJobId === job.id ? "Close application form" : "Apply"}
                      </Button>

                      {activeApplicationJobId === job.id && job.open && (
                        <form
                          className="space-y-4 rounded-lg border border-white/10 bg-black/20 p-4"
                          onSubmit={(event) => {
                            event.preventDefault();
                            void handleSubmitApplication(job);
                          }}
                        >
                          <div className="space-y-1">
                            <Label htmlFor={`role-${job.id}`}>Role</Label>
                            <Input id={`role-${job.id}`} value={selectedRole ?? ""} readOnly disabled />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label htmlFor={`name-${job.id}`}>Name</Label>
                              <Input
                                id={`name-${job.id}`}
                                value={applicationForm.name}
                                onChange={(event) =>
                                  setApplicationForm((previous) => ({ ...previous, name: event.target.value }))
                                }
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <Label htmlFor={`email-${job.id}`}>Email</Label>
                              <Input
                                id={`email-${job.id}`}
                                type="email"
                                value={applicationForm.email}
                                onChange={(event) =>
                                  setApplicationForm((previous) => ({ ...previous, email: event.target.value }))
                                }
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor={`portfolio-${job.id}`}>Portfolio URL (optional)</Label>
                            <Input
                              id={`portfolio-${job.id}`}
                              type="url"
                              value={applicationForm.portfolioUrl}
                              onChange={(event) =>
                                setApplicationForm((previous) => ({ ...previous, portfolioUrl: event.target.value }))
                              }
                            />
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor={`cover-letter-${job.id}`}>Cover Letter</Label>
                            <Textarea
                              id={`cover-letter-${job.id}`}
                              value={applicationForm.coverLetter}
                              onChange={(event) =>
                                setApplicationForm((previous) => ({ ...previous, coverLetter: event.target.value }))
                              }
                              required
                            />
                          </div>

                          <Button type="submit" disabled={applicationLoading}>
                            {applicationLoading ? "Submitting..." : "Submit application"}
                          </Button>
                        </form>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {(applicationMessage || applicationError) && (
          <div
            className={`rounded-xl p-4 text-sm ${
              applicationError
                ? "border border-rose-500/40 bg-rose-500/10 text-rose-200"
                : "border border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            {applicationError ?? applicationMessage}
          </div>
        )}
      </section>
    </div>
  );
}
