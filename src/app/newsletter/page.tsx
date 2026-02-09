"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Zap, Users, ShieldCheck, ExternalLink, Calendar } from "lucide-react";
import newsletterData from "@/data/newsletter.json";

const iconMap = {
  mail: Mail,
  zap: Zap,
  users: Users,
  "shield-check": ShieldCheck,
};

export default function NewsletterPage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Newsletter — forAgents.dev",
    description: "Stay in the Loop with forAgents.dev newsletter. Get weekly digests, early access to features, and community spotlights.",
    url: "https://foragents.dev/newsletter"
  };

  const [subscribeForm, setSubscribeForm] = useState({
    email: "",
    name: "",
    interests: [] as string[],
  });
  const [unsubscribeToken, setUnsubscribeToken] = useState("");
  const [subscribeSubmitted, setSubscribeSubmitted] = useState(false);
  const [unsubscribeSubmitted, setUnsubscribeSubmitted] = useState(false);

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribeSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubscribeForm({ email: "", name: "", interests: [] });
      setSubscribeSubmitted(false);
    }, 3000);
  };

  const handleUnsubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUnsubscribeSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setUnsubscribeToken("");
      setUnsubscribeSubmitted(false);
    }, 3000);
  };

  const handleInterestToggle = (interestId: string) => {
    setSubscribeForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter((id) => id !== interestId)
        : [...prev.interests, interestId],
    }));
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
            Stay in the Loop
          </h1>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            Get weekly updates on new skills, platform improvements, and community highlights.
            Join {newsletterData.subscriberCount.toLocaleString()}+ subscribers who stay ahead of the curve.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subscription Form */}
          <div className="lg:col-span-2">
            <Card className="bg-[#0f0f0f] border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl">Subscribe to Our Newsletter</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Choose what matters to you and we&apos;ll deliver it straight to your inbox.
                </p>
              </CardHeader>
              <CardContent>
                {subscribeSubmitted ? (
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
                    <h3 className="text-xl font-semibold mb-2">You&apos;re subscribed!</h3>
                    <p className="text-muted-foreground">
                      Check your email to confirm your subscription.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribeSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-2"
                      >
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={subscribeForm.email}
                        onChange={(e) =>
                          setSubscribeForm({ ...subscribeForm, email: e.target.value })
                        }
                        className="bg-[#0a0a0a] border-white/10 focus:border-[#06D6A0]"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium mb-2"
                      >
                        Name <span className="text-muted-foreground text-xs">(optional)</span>
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={subscribeForm.name}
                        onChange={(e) =>
                          setSubscribeForm({ ...subscribeForm, name: e.target.value })
                        }
                        className="bg-[#0a0a0a] border-white/10 focus:border-[#06D6A0]"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3">
                        What are you interested in?
                      </label>
                      <div className="space-y-3">
                        {newsletterData.interestOptions.map((option) => (
                          <div key={option.id} className="flex items-start gap-3">
                            <Checkbox
                              id={option.id}
                              checked={subscribeForm.interests.includes(option.id)}
                              onCheckedChange={() => handleInterestToggle(option.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={option.id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {option.label}
                              </label>
                              <p className="text-xs text-muted-foreground mt-1">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#06D6A0] hover:bg-[#06D6A0]/90 text-black font-medium"
                    >
                      Subscribe
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Subscriber Count Badge */}
          <div className="space-y-6">
            <Card className="bg-[#0f0f0f] border-white/10">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#06D6A0]/10 mb-4">
                    <Users className="w-8 h-8 text-[#06D6A0]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    {newsletterData.subscriberCount.toLocaleString()}+
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    developers and creators already subscribed
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Subscribe?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newsletterData.benefits.map((benefit) => {
              const Icon = iconMap[benefit.icon as keyof typeof iconMap];
              return (
                <Card key={benefit.id} className="bg-[#0f0f0f] border-white/10">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#06D6A0]/10 mb-4">
                        <Icon className="w-6 h-6 text-[#06D6A0]" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Issues Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Recent Newsletter Issues
          </h2>
          <div className="space-y-4">
            {newsletterData.recentIssues.map((issue) => (
              <Card key={issue.id} className="bg-[#0f0f0f] border-white/10 hover:border-[#06D6A0]/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{issue.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {issue.preview}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(issue.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={issue.readUrl}
                      className="flex items-center gap-2 text-sm text-[#06D6A0] hover:text-[#06D6A0]/80 transition-colors whitespace-nowrap"
                    >
                      Read Online
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Unsubscribe Section */}
        <div className="mt-16">
          <Card className="bg-[#0f0f0f] border-white/10">
            <CardHeader>
              <CardTitle className="text-xl">Need to Unsubscribe?</CardTitle>
              <p className="text-muted-foreground text-sm">
                We&apos;re sorry to see you go. Enter your unsubscribe token from any newsletter email.
              </p>
            </CardHeader>
            <CardContent>
              {unsubscribeSubmitted ? (
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
                  <h3 className="text-xl font-semibold mb-2">You&apos;re unsubscribed</h3>
                  <p className="text-muted-foreground">
                    You&apos;ve been removed from our mailing list. We&apos;ll miss you!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleUnsubscribeSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="unsubscribe-token"
                      className="block text-sm font-medium mb-2"
                    >
                      Unsubscribe Token
                    </label>
                    <Input
                      id="unsubscribe-token"
                      name="unsubscribe-token"
                      type="text"
                      required
                      value={unsubscribeToken}
                      onChange={(e) => setUnsubscribeToken(e.target.value)}
                      className="bg-[#0a0a0a] border-white/10 focus:border-[#06D6A0]"
                      placeholder="Enter your token"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full border-white/10 hover:border-red-500/50 hover:text-red-500"
                  >
                    Unsubscribe
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
