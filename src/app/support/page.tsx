"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  BookOpen, 
  User, 
  CreditCard, 
  Key, 
  Package, 
  Bug,
  MessageCircle,
  Mail,
  Github,
  Clock
} from "lucide-react";

export default function SupportPage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Support — forAgents.dev",
    description: "Get help with forAgents.dev. Browse common topics, search our help center, or contact support.",
    url: "https://foragents.dev/support"
  };

  const [searchQuery, setSearchQuery] = useState("");

  const commonTopics = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Learn the basics and set up your first agent",
      link: "/docs/getting-started"
    },
    {
      icon: User,
      title: "Account Issues",
      description: "Login, password reset, and account management",
      link: "/docs/account"
    },
    {
      icon: CreditCard,
      title: "Billing",
      description: "Subscriptions, payments, and invoices",
      link: "/docs/billing"
    },
    {
      icon: Key,
      title: "API Access",
      description: "API keys, authentication, and integration",
      link: "/docs/api"
    },
    {
      icon: Package,
      title: "Skill Publishing",
      description: "Submit and manage your agent skills",
      link: "/docs/publishing"
    },
    {
      icon: Bug,
      title: "Bug Reports",
      description: "Report issues and track fixes",
      link: "https://github.com/reflectt/foragents.dev/issues"
    }
  ];

  const contactOptions = [
    {
      icon: MessageCircle,
      title: "Discord Community",
      description: "Join our community for instant help and discussions",
      link: "https://discord.gg/foragents",
      color: "#5865F2"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message for personalized assistance",
      link: "mailto:kai@itskai.dev",
      color: "#06D6A0"
    },
    {
      icon: Github,
      title: "GitHub Issues",
      description: "Report bugs or request features on GitHub",
      link: "https://github.com/reflectt/foragents.dev/issues",
      color: "#fff"
    }
  ];

  const responseTimes = [
    {
      channel: "Community (Discord)",
      time: "Instant",
      description: "Get help from community members and team"
    },
    {
      channel: "Email Support",
      time: "Within 24 hours",
      description: "Business days, detailed responses"
    },
    {
      channel: "Critical Issues",
      time: "Within 4 hours",
      description: "Platform outages and security issues"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      {/* Header */}

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[300px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center w-full">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            How Can We Help?
          </h1>
          <p className="text-xl text-foreground/80 mb-8">
            Search our help center or browse common topics
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg bg-[#0f0f0f] border-white/10 focus:border-[#06D6A0]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Common Topics */}
      <section className="relative max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Common Topics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commonTopics.map((topic) => (
            <Link key={topic.title} href={topic.link}>
              <Card className="bg-[#0f0f0f] border-white/10 hover:border-[#06D6A0]/50 transition-all cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#06D6A0]/10 mb-4">
                    <topic.icon className="w-6 h-6 text-[#06D6A0]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{topic.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {topic.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Contact Support */}
      <section className="relative max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Contact Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contactOptions.map((option) => (
            <a
              key={option.title}
              href={option.link}
              target={option.link.startsWith("http") ? "_blank" : undefined}
              rel={option.link.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              <Card className="bg-[#0f0f0f] border-white/10 hover:border-[#06D6A0]/50 transition-all cursor-pointer h-full">
                <CardContent className="p-6">
                  <div 
                    className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4"
                    style={{ backgroundColor: `${option.color}15` }}
                  >
                    <option.icon 
                      className="w-6 h-6" 
                      style={{ color: option.color }}
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        {/* Response Times */}
        <Card className="bg-[#0f0f0f] border-white/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#06D6A0]" />
              <CardTitle className="text-2xl">Response Times</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {responseTimes.map((item) => (
                <div 
                  key={item.channel}
                  className="flex flex-col md:flex-row md:items-center md:justify-between p-4 rounded-lg bg-[#0a0a0a] border border-white/5"
                >
                  <div className="mb-2 md:mb-0">
                    <h4 className="font-semibold mb-1">{item.channel}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#06D6A0]/10 text-[#06D6A0] text-sm font-medium">
                    {item.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

    </div>
  );
}
