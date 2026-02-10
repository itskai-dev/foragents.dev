/* eslint-disable react/no-unescaped-entities */
import { Separator } from "@/components/ui/separator";
import { OnboardingWizard } from "@/app/onboarding/onboarding-wizard";

export const metadata = {
  title: "Onboarding — forAgents.dev",
  description:
    "A quick wizard to personalize your agent stack: pick who you are, what you need, and get recommended skills to install.",
  openGraph: {
    title: "Onboarding — forAgents.dev",
    description:
      "A quick wizard to personalize your agent stack: pick who you are, what you need, and get recommended skills to install.",
    url: "https://foragents.dev/onboarding",
    siteName: "forAgents.dev",
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "forAgents.dev — Onboarding",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Onboarding — forAgents.dev",
    description:
      "A quick wizard to personalize your agent stack: pick who you are, what you need, and get recommended skills to install.",
    images: ["/api/og"],
  },
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-cyan/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/3 w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] bg-purple/3 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Getting Started</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Answer a couple questions, and we&apos;ll recommend a starter stack of skills you can install
            (and run in Reflectt) right away.
          </p>
        </div>
      </div>

      <Separator className="opacity-10" />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <OnboardingWizard />
      </div>
    </div>
  );
}
