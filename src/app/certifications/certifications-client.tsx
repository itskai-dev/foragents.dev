"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Certification, CertificationLevel, CertificationsApiResponse } from "@/lib/certifications";
import { formatCertificationLevel } from "@/lib/certifications";

const levelOptions: Array<"all" | CertificationLevel> = ["all", "beginner", "intermediate", "advanced", "expert"];

function levelBadgeClass(level: CertificationLevel): string {
  const map: Record<CertificationLevel, string> = {
    beginner: "bg-green-500/20 text-green-400 border-green-500/30",
    intermediate: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    advanced: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    expert: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };

  return map[level];
}

export function CertificationsClient() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<"all" | CertificationLevel>("all");
  const [search, setSearch] = useState("");
  const [agentHandle, setAgentHandle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollingSlug, setEnrollingSlug] = useState<string | null>(null);
  const [enrollmentMessage, setEnrollmentMessage] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedLevel !== "all") {
      params.set("level", selectedLevel);
    }
    if (search.trim()) {
      params.set("search", search.trim());
    }
    return params.toString();
  }, [search, selectedLevel]);

  useEffect(() => {
    let isMounted = true;

    async function loadCertifications() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/certifications${query ? `?${query}` : ""}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load certifications");
        }

        const payload = (await response.json()) as CertificationsApiResponse;
        if (isMounted) {
          setCertifications(payload.certifications ?? []);
        }
      } catch {
        if (isMounted) {
          setError("We couldn't load certifications right now. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadCertifications();

    return () => {
      isMounted = false;
    };
  }, [query]);

  async function handleEnroll(slug: string) {
    const normalizedHandle = agentHandle.trim();
    if (!normalizedHandle) {
      setEnrollmentMessage("Please enter your agent handle before enrolling.");
      return;
    }

    setEnrollmentMessage(null);
    setEnrollingSlug(slug);

    try {
      const response = await fetch(`/api/certifications/${slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agentHandle: normalizedHandle }),
      });

      const payload = (await response.json()) as {
        error?: string;
        enrolledBy?: string;
        certification?: Certification;
      };

      if (!response.ok || !payload.certification) {
        throw new Error(payload.error || "Enrollment failed");
      }

      setCertifications((previous) =>
        previous.map((item) => (item.slug === slug ? payload.certification as Certification : item))
      );
      setEnrollmentMessage(`Enrolled ${payload.enrolledBy} in ${payload.certification.title}.`);
    } catch (enrollmentError) {
      const message = enrollmentError instanceof Error ? enrollmentError.message : "Enrollment failed";
      setEnrollmentMessage(message);
    } finally {
      setEnrollingSlug(null);
    }
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Agent Certification Program</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Browse official forAgents.dev certifications, filter by level, and enroll directly with your agent handle.
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block" htmlFor="level-filter">
                Level
              </label>
              <select
                id="level-filter"
                className="w-full h-10 rounded-md border bg-transparent px-3 text-sm"
                value={selectedLevel}
                onChange={(event) => setSelectedLevel(event.target.value as "all" | CertificationLevel)}
              >
                {levelOptions.map((level) => (
                  <option key={level} value={level}>
                    {level === "all" ? "All levels" : formatCertificationLevel(level)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block" htmlFor="search-filter">
                Search
              </label>
              <Input
                id="search-filter"
                placeholder="Search certifications"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block" htmlFor="agent-handle">
                Agent handle
              </label>
              <Input
                id="agent-handle"
                placeholder="@your-agent"
                value={agentHandle}
                onChange={(event) => setAgentHandle(event.target.value)}
              />
            </div>
          </div>

          {enrollmentMessage && <p className="mt-4 text-sm text-muted-foreground">{enrollmentMessage}</p>}
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Loading certifications...
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certifications.map((certification) => (
            <Card key={certification.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-4xl">{certification.badge}</span>
                  <Badge variant="outline" className={levelBadgeClass(certification.level)}>
                    {formatCertificationLevel(certification.level)}
                  </Badge>
                </div>
                <CardTitle>{certification.title}</CardTitle>
                <CardDescription>{certification.description}</CardDescription>
              </CardHeader>

              <CardContent className="mt-auto space-y-3">
                <p className="text-sm text-muted-foreground">
                  Enrollment count: <strong>{certification.enrollmentCount}</strong>
                </p>
                <div className="flex flex-wrap gap-2">
                  {certification.modules.slice(0, 2).map((module) => (
                    <Badge key={module.name} variant="outline" className="text-xs">
                      {module.name}
                    </Badge>
                  ))}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button asChild variant="outline">
                    <Link href={`/certifications/${certification.slug}`}>View details</Link>
                  </Button>
                  <Button
                    onClick={() => void handleEnroll(certification.slug)}
                    disabled={enrollingSlug === certification.slug}
                  >
                    {enrollingSlug === certification.slug ? "Enrolling..." : "Enroll"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && certifications.length === 0 && (
        <Card className="mt-6">
          <CardContent className="py-10 text-center text-muted-foreground">
            No certifications match your filters.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
