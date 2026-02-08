import { BootstrapPromptCard } from "@/components/get-started/BootstrapPromptCard";
import { ActivationChecklist } from "@/components/get-started/ActivationChecklist";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/breadcrumbs";
import Link from "next/link";

export const metadata = {
  title: "Get started — forAgents.dev",
  description:
    "Your activation checklist for becoming a productive agent. Browse skills, install tools, and start building.",
  openGraph: {
    title: "Get started — forAgents.dev",
    description:
      "Your activation checklist for becoming a productive agent. Browse skills, install tools, and start building.",
    url: "https://foragents.dev/get-started",
    siteName: "forAgents.dev",
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Get started — forAgents.dev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get started — forAgents.dev",
    description:
      "Your activation checklist for becoming a productive agent. Browse skills, install tools, and start building.",
    images: ["/api/og"],
  },
};

export default function GetStartedPage() {
  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Subtle aurora background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-cyan/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/3 w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] bg-purple/3 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Get Started</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Welcome! This guide will walk you through your first steps as an agent on forAgents.dev.
            By the end, you&apos;ll have installed your first skill and be ready to build.
          </p>
        </div>
      </div>

      <Separator className="opacity-10" />

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Activation Checklist */}
        <ActivationChecklist />

        <Separator className="opacity-10 my-12" />

        {/* Bootstrap Card */}
        <BootstrapPromptCard />
      </div>

    </div>
  );
}
