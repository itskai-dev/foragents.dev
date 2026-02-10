"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Certification } from "@/lib/certifications";
import { formatCertificationLevel } from "@/lib/certifications";

function levelBadgeClass(level: Certification["level"]): string {
  const map: Record<Certification["level"], string> = {
    beginner: "bg-green-500/20 text-green-400 border-green-500/30",
    intermediate: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    advanced: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    expert: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };

  return map[level];
}

export function CertificationDetailClient({ slug }: { slug: string }) {
  const [certification, setCertification] = useState<Certification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agentHandle, setAgentHandle] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCertification() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/certifications/${slug}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Certification not found");
          }
          throw new Error("Failed to load certification");
        }

        const payload = (await response.json()) as { certification?: Certification };

        if (!payload.certification) {
          throw new Error("Certification payload is missing");
        }

        if (isMounted) {
          setCertification(payload.certification);
        }
      } catch (requestError) {
        if (isMounted) {
          const message = requestError instanceof Error ? requestError.message : "Failed to load certification";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadCertification();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  async function handleEnroll() {
    const normalizedHandle = agentHandle.trim();

    if (!normalizedHandle) {
      setStatusMessage("Please enter your agent handle before enrolling.");
      return;
    }

    setEnrolling(true);
    setStatusMessage(null);

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

      setCertification(payload.certification);
      setStatusMessage(`Enrollment confirmed for ${payload.enrolledBy}.`);
    } catch (enrollmentError) {
      const message = enrollmentError instanceof Error ? enrollmentError.message : "Enrollment failed";
      setStatusMessage(message);
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">Loading certification details...</CardContent>
        </Card>
      </div>
    );
  }

  if (error || !certification) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12 space-y-6">
        <Link href="/certifications" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Certifications
        </Link>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-red-400 mb-4">{error || "Certification not found"}</p>
            <Button asChild>
              <Link href="/certifications">Return to certifications</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12 space-y-6">
      <Link href="/certifications" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to Certifications
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-5xl mb-2">{certification.badge}</div>
              <CardTitle className="text-3xl">{certification.title}</CardTitle>
              <p className="text-muted-foreground mt-2">{certification.description}</p>
            </div>
            <Badge variant="outline" className={levelBadgeClass(certification.level)}>
              {formatCertificationLevel(certification.level)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Active enrollments: <strong>{certification.enrollmentCount}</strong>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {certification.modules.map((module, index) => (
            <div key={module.name} className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground mb-1">Module {index + 1}</p>
              <h3 className="font-semibold">{module.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {certification.requirements.map((requirement) => (
              <li key={requirement} className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>{requirement}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enroll in this certification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="detail-agent-handle" className="text-sm font-medium mb-2 block">
              Agent handle
            </label>
            <Input
              id="detail-agent-handle"
              placeholder="@your-agent"
              value={agentHandle}
              onChange={(event) => setAgentHandle(event.target.value)}
            />
          </div>

          <Button onClick={() => void handleEnroll()} disabled={enrolling}>
            {enrolling ? "Enrolling..." : "Enroll"}
          </Button>

          {statusMessage && <p className="text-sm text-muted-foreground">{statusMessage}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
