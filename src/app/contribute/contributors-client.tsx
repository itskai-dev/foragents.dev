/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ContributorRole = "maintainer" | "reviewer" | "contributor" | "tester" | "documentation";

type Contributor = {
  id: string;
  name: string;
  handle: string;
  role: ContributorRole;
  avatar: string;
  contributions: number;
  skills: string[];
  joinedAt: string;
  bio: string;
};

type ContributorsResponse = {
  contributors: Contributor[];
  total: number;
};

type FormState = {
  name: string;
  handle: string;
  roleInterest: ContributorRole;
  skills: string;
  bio: string;
};

const ROLE_OPTIONS: Array<{ label: string; value: ContributorRole }> = [
  { label: "Maintainer", value: "maintainer" },
  { label: "Reviewer", value: "reviewer" },
  { label: "Contributor", value: "contributor" },
  { label: "Tester", value: "tester" },
  { label: "Documentation", value: "documentation" },
];

const initialForm: FormState = {
  name: "",
  handle: "",
  roleInterest: "contributor",
  skills: "",
  bio: "",
};

function roleLabel(role: ContributorRole) {
  return ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role;
}

export function ContributorsClient() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState("");

  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (roleFilter !== "all") {
      params.set("role", roleFilter);
    }

    if (searchFilter.trim()) {
      params.set("search", searchFilter.trim());
    }

    return params.toString();
  }, [roleFilter, searchFilter]);

  useEffect(() => {
    let active = true;

    async function loadContributors() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch(`/api/contributors${queryString ? `?${queryString}` : ""}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load contributors.");
        }

        const payload = (await response.json()) as ContributorsResponse;

        if (active) {
          setContributors(payload.contributors ?? []);
        }
      } catch {
        if (active) {
          setLoadError("Couldn't load contributors right now. Please try again in a moment.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadContributors();

    return () => {
      active = false;
    };
  }, [queryString]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);
    setSubmitError(null);

    try {
      const response = await fetch("/api/contributors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          handle: form.handle,
          roleInterest: form.roleInterest,
          skills: form.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
          bio: form.bio,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string; details?: string };
        throw new Error(payload.details ?? payload.error ?? "Failed to submit application.");
      }

      setForm(initialForm);
      setSubmitMessage("Application submitted! We'll review it and follow up soon.");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Couldn't submit your application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-12">
      <section className="text-center space-y-4">
        <Badge variant="outline" className="border-[#06D6A0]/40 bg-[#06D6A0]/10 text-[#06D6A0]">
          Contributor Directory
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC]">
          Contribute to forAgents.dev
        </h1>
        <p className="mx-auto max-w-3xl text-foreground/70">
          Explore active contributors, find your role, and submit an application to join the builder network.
        </p>
      </section>

      <section className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search contributors</Label>
            <Input
              id="search"
              placeholder="Search by name, handle, skill, or bio"
              value={searchFilter}
              onChange={(event) => setSearchFilter(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-filter">Role filter</Label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger id="role-filter">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-10 text-center text-foreground/70">
              Loading contributors…
            </CardContent>
          </Card>
        ) : loadError ? (
          <Card className="bg-red-500/10 border-red-400/30">
            <CardContent className="py-10 text-center text-red-200">{loadError}</CardContent>
          </Card>
        ) : contributors.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-10 text-center text-foreground/70">
              No contributors found for this filter.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contributors.map((contributor) => (
              <Card key={contributor.id} className="bg-white/5 border-white/10">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Image
                      src={contributor.avatar}
                      alt={contributor.name}
                      width={56}
                      height={56}
                      className="rounded-full border border-white/20"
                    />
                    <div>
                      <CardTitle className="text-[#F8FAFC]">{contributor.name}</CardTitle>
                      <CardDescription>{contributor.handle}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="outline" className="border-[#06D6A0]/30 bg-[#06D6A0]/10 text-[#06D6A0]">
                      {roleLabel(contributor.role)}
                    </Badge>
                    <p className="text-sm text-foreground/70">
                      <span className="font-semibold text-[#F8FAFC]">{contributor.contributions}</span> contributions
                    </p>
                  </div>

                  <p className="text-sm text-foreground/70">{contributor.bio}</p>

                  <div className="flex flex-wrap gap-2">
                    {contributor.skills.map((skill) => (
                      <Badge key={`${contributor.id}-${skill}`} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl text-[#F8FAFC]">Join as Contributor</CardTitle>
            <CardDescription>
              Tell us what you'd like to work on and the skills you want to bring to the project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Jane Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="handle">Handle</Label>
                  <Input
                    id="handle"
                    value={form.handle}
                    onChange={(event) => setForm((prev) => ({ ...prev, handle: event.target.value }))}
                    placeholder="@janedoe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role-interest">Role interest</Label>
                <Select
                  value={form.roleInterest}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, roleInterest: value as ContributorRole }))}
                >
                  <SelectTrigger id="role-interest">
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  value={form.skills}
                  onChange={(event) => setForm((prev) => ({ ...prev, skills: event.target.value }))}
                  placeholder="typescript, docs, testing"
                  required
                />
                <p className="text-xs text-foreground/60">Comma-separated skills.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
                  placeholder="Share your experience and why you'd like to contribute"
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                {isSubmitting ? "Submitting..." : "Submit application"}
              </Button>

              {submitMessage && <p className="text-sm text-green-400">{submitMessage}</p>}
              {submitError && <p className="text-sm text-red-300">{submitError}</p>}
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
