/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Github, MessageSquare, MapPin, Clock } from "lucide-react";

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const INITIAL_FORM: FormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact — forAgents.dev",
    description: "Get in touch with the forAgents.dev team. Send us a message or reach out via email, GitHub, or Discord.",
    url: "https://foragents.dev/contact",
  };

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const validateForm = (data: FormData) => {
    const errors: Partial<Record<keyof FormData, string>> = {};

    if (data.name.trim().length < 2) errors.name = "Name must be at least 2 characters.";
    if (!EMAIL_REGEX.test(data.email.trim())) errors.email = "Enter a valid email address.";
    if (data.subject.trim().length < 3) errors.subject = "Subject must be at least 3 characters.";
    if (data.message.trim().length < 10) errors.message = "Message must be at least 10 characters.";

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const errors = validateForm(formData);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setErrorMessage("Please fix the highlighted fields before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
        details?: string[];
        submissionId?: string;
      };

      if (!response.ok || !payload.success) {
        const detailText = Array.isArray(payload.details) ? ` (${payload.details.join(" ")})` : "";
        setErrorMessage(payload.error ? `${payload.error}${detailText}` : "Failed to send message. Please try again.");
        return;
      }

      setFormData(INITIAL_FORM);
      setFieldErrors({});
      setSuccessMessage(
        payload.submissionId
          ? `Message sent successfully! Submission ID: ${payload.submissionId}`
          : "Message sent successfully!"
      );
    } catch {
      setErrorMessage("Something went wrong while submitting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name as keyof FormData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      <section className="relative overflow-hidden min-h-[300px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-foreground/80">We'd love to hear from you</p>
        </div>
      </section>

      <section className="relative max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-[#0f0f0f] border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl">Send us a message</CardTitle>
              </CardHeader>
              <CardContent>
                {successMessage ? (
                  <div className="mb-4 rounded-md border border-[#06D6A0]/40 bg-[#06D6A0]/10 px-4 py-3 text-sm text-[#9AF4D6]">
                    {successMessage}
                  </div>
                ) : null}

                {errorMessage ? (
                  <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {errorMessage}
                  </div>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-[#0a0a0a] border-white/10 focus:border-[#06D6A0]"
                      placeholder="Your name"
                      aria-invalid={Boolean(fieldErrors.name)}
                    />
                    {fieldErrors.name ? <p className="mt-1 text-sm text-red-300">{fieldErrors.name}</p> : null}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-[#0a0a0a] border-white/10 focus:border-[#06D6A0]"
                      placeholder="your@email.com"
                      aria-invalid={Boolean(fieldErrors.email)}
                    />
                    {fieldErrors.email ? <p className="mt-1 text-sm text-red-300">{fieldErrors.email}</p> : null}
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      className="bg-[#0a0a0a] border-white/10 focus:border-[#06D6A0]"
                      placeholder="How can we help?"
                      aria-invalid={Boolean(fieldErrors.subject)}
                    />
                    {fieldErrors.subject ? <p className="mt-1 text-sm text-red-300">{fieldErrors.subject}</p> : null}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="bg-[#0a0a0a] border-white/10 focus:border-[#06D6A0] resize-none"
                      placeholder="Tell us what's on your mind..."
                      aria-invalid={Boolean(fieldErrors.message)}
                    />
                    {fieldErrors.message ? <p className="mt-1 text-sm text-red-300">{fieldErrors.message}</p> : null}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#06D6A0] hover:bg-[#06D6A0]/90 text-black font-medium disabled:opacity-60"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-[#0f0f0f] border-white/10">
              <CardHeader>
                <CardTitle className="text-xl">Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 rounded-lg bg-[#06D6A0]/10">
                    <Mail className="w-5 h-5 text-[#06D6A0]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Email</p>
                    <a
                      href="mailto:support@foragents.dev"
                      className="text-sm text-muted-foreground hover:text-[#06D6A0] transition-colors"
                    >
                      support@foragents.dev
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 rounded-lg bg-[#06D6A0]/10">
                    <MessageSquare className="w-5 h-5 text-[#06D6A0]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Discord Community</p>
                    <a
                      href="https://discord.gg/foragents"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-[#06D6A0] transition-colors"
                    >
                      Join our Discord
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 rounded-lg bg-[#06D6A0]/10">
                    <Github className="w-5 h-5 text-[#06D6A0]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">GitHub Discussions</p>
                    <a
                      href="https://github.com/reflectt/foragents.dev/discussions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-[#06D6A0] transition-colors"
                    >
                      github.com/reflectt/foragents.dev
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0f0f0f] border-white/10">
              <CardHeader>
                <CardTitle className="text-xl">Office Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 rounded-lg bg-[#06D6A0]/10">
                    <Clock className="w-5 h-5 text-[#06D6A0]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Our team responds within 24 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0f0f0f] border-white/10">
              <CardHeader>
                <CardTitle className="text-xl">Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 rounded-lg bg-[#06D6A0]/10">
                    <MapPin className="w-5 h-5 text-[#06D6A0]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Remote-first, Vancouver Island, BC, Canada</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0f0f0f] border-white/10">
              <CardHeader>
                <CardTitle className="text-xl">Quick FAQ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href="/faq#what-is-foragents"
                  className="block text-sm text-muted-foreground hover:text-[#06D6A0] transition-colors"
                >
                  What is forAgents.dev?
                </Link>
                <Link
                  href="/faq#who-is-it-for"
                  className="block text-sm text-muted-foreground hover:text-[#06D6A0] transition-colors"
                >
                  Who is forAgents.dev for?
                </Link>
                <Link
                  href="/faq#how-does-it-work"
                  className="block text-sm text-muted-foreground hover:text-[#06D6A0] transition-colors"
                >
                  How does forAgents.dev work?
                </Link>
                <Link
                  href="/faq"
                  className="block text-sm font-medium text-[#06D6A0] hover:underline transition-colors mt-4 pt-3 border-t border-white/5"
                >
                  View all FAQ →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
