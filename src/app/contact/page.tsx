"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Github, MessageSquare, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact — forAgents.dev",
    description: "Get in touch with the forAgents.dev team. Send us a message or reach out via email, GitHub, or Discord.",
    url: "https://foragents.dev/contact"
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitted(false);
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />


      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[300px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-foreground/80">
            We&apos;d love to hear from you
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-[#0f0f0f] border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl">Send us a message</CardTitle>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#06D6A0]/10 mb-4">
                      <svg
                        className="w-8 h-8 text-[#06D6A0]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Message sent!</h3>
                    <p className="text-muted-foreground">
                      Thank you for reaching out. We&apos;ll get back to you soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium mb-2"
                      >
                        Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-[#0a0a0a] border-white/10 focus:border-[#06D6A0]"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-2"
                      >
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="bg-[#0a0a0a] border-white/10 focus:border-[#06D6A0]"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium mb-2"
                      >
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-md focus:border-[#06D6A0] focus:outline-none focus:ring-1 focus:ring-[#06D6A0]"
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General</option>
                        <option value="support">Support</option>
                        <option value="partnership">Partnership</option>
                        <option value="enterprise">Enterprise</option>
                        <option value="bug-report">Bug Report</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium mb-2"
                      >
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        className="bg-[#0a0a0a] border-white/10 focus:border-[#06D6A0] resize-none"
                        placeholder="Tell us what&apos;s on your mind..."
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#06D6A0] hover:bg-[#06D6A0]/90 text-black font-medium"
                    >
                      Send Message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Info Side Panel */}
          <div className="space-y-6">
            {/* Contact Info Card */}
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

            {/* Office Hours Card */}
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
                    <p className="text-sm text-muted-foreground">
                      Our team responds within 24 hours
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
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
                    <p className="text-sm text-muted-foreground">
                      Remote-first, Vancouver Island, BC, Canada
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Quick Links Card */}
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
